interface IPopupContextData {
    windowId: number;
    index: number;
}

class Popup {
    public static dataKey = "toggle_popup_window";

    public static windowTypes = {
        normal: "normal",
        popup: "popup",
    };

    public static executeFunction(tab: chrome.tabs.Tab, func: any, args: any) {
        return new Promise((res) => {
            const code = `; 'use strict'; var res = (${func.toString()}).apply(null, ${JSON.stringify(args)}); res;`;
            chrome.tabs.executeScript(tab.id, {
                code,
            }, (results: [any]) => {
                res(results ? results[0] : undefined);
            });
        });
    }

    public tab: chrome.tabs.Tab;

    constructor(tab: chrome.tabs.Tab) {
        this.tab = tab;
    }

    public isInPopUpMode() {
        return new Promise((res) => {
            chrome.windows.getCurrent((window: chrome.windows.Window) => {
                const isPopup = window.type === Popup.windowTypes.popup;
                res(isPopup);
            });
        });
    }

    public async executeFunction(func: any, args: any) {
        return Popup.executeFunction(this.tab, func, args);
    }

    public updateProperties(properties: chrome.tabs.UpdateProperties) {
        return new Promise((res) => {
            chrome.tabs.update(this.tab.id, properties, () => {
                res();
            });
        });
    }

    public async toPopup(options: chrome.windows.CreateData = {}): Promise<chrome.windows.Window> {
        const window = await this.createWindow({
            ...options,
            type: Popup.windowTypes.popup,
        });

        await this.focusWindow(window.id);

        await this.saveWindowContext();

        return window;
    }

    public async toWindow(options: chrome.windows.CreateData = {}): Promise<chrome.windows.Window> {
        const window = await this.createWindow({
            ...options,
            type: Popup.windowTypes.normal,
        });

        const data = await this.restoreWindowContext();

        try {
            await this.moveTabToWindow(data);
        } catch (e) {
            // ignore if we can't move tab back to original window
        }

        return window;
    }

    private async focusWindow(windowId: number) {
        return new Promise((res) => {
            chrome.windows.update(windowId, {
                drawAttention: true,
                focused: true,
            }, () => {
                res();
            });
        });
    }

    private createWindow(options: chrome.windows.CreateData): Promise<chrome.windows.Window> {
        return new Promise((res) => {
            chrome.windows.create({
                ...options,
                incognito: this.tab.incognito,
                tabId: this.tab.id,
            }, (window) => {
                res(window);
            });
        });
    }

    private moveTabToWindow(moveProperties: chrome.tabs.MoveProperties) {
        return new Promise((res, rej) => {
            chrome.windows.get(moveProperties.windowId, (window) => {
                if (!window || chrome.runtime.lastError) {
                    rej(new ReferenceError(`Non-existing window with id <${moveProperties.windowId}>. Message:
                        ${chrome.runtime.lastError.message}`));
                    return;
                }
                chrome.tabs.move(this.tab.id, moveProperties, () => {
                    res();
                });
            });
        });
    }

    private async saveWindowContext() {
        const data = {
            index: this.tab.index,
            windowId: this.tab.windowId,
        } as IPopupContextData;

        const { dataKey } = Popup;

        /**
         * Executes as eval'ed string in the context of youtube page
         */
        // tslint:disable:no-shadowed-variable
        await this.executeFunction((
            dataKey: string,
            data: object,
        ) => {
            document.body.dataset[dataKey] = JSON.stringify(data);
        }, [dataKey, data]);
        // tslint:enable:no-shadowed-variable
    }

    private async restoreWindowContext(): Promise<IPopupContextData> {
        const { dataKey } = Popup;

        /**
         * Executes as eval'ed string in the context of youtube page
         */
        // tslint:disable:no-shadowed-variable
        return await this.executeFunction((
            dataKey: string,
        ) => {
            const dataStr = document.body.dataset[dataKey];
            delete document.body.dataset[dataKey];

            return JSON.parse(dataStr);
        }, [dataKey]) as IPopupContextData;
        // tslint:enable:no-shadowed-variable
    }
}

export default Popup;
