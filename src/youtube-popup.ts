import Popup from "./popup";

class YoutubePopup extends Popup {
    /**
     * from youtube style file
     */
    public static popupDimensions = {
        height: 260,
        width: 426,
    };

    // language=CSS
    public static stylesToInject = `
        .toggle-popup--active #masthead-positioner {
          display: none !important;
        }
        .toggle-popup--active #masthead-positioner-height-offset {
          display: none !important;
        }
        .toggle-popup--active {
          overflow-x: hidden !important;
        }
        .toggle-popup--active #player {
          top: 0 !important;
        }
    `;

    public static styleElementId = "toggle-popup-styles-element";

    public static activeClassName = "toggle-popup--active";

    public static isYoutube(tab: chrome.tabs.Tab) {
        return /youtube\.com/.test(tab.url);
    }

    public static getPopupPosition() {
        const { width, height } = YoutubePopup.popupDimensions;

        return {
            height,
            left: screen.availWidth - width,
            top: 0,
            width,
        };
    }

    constructor(tab: chrome.tabs.Tab) {
        super(tab);
    }

    public async toPopup(options: chrome.windows.CreateData = {}): Promise<chrome.windows.Window> {

        const youtubeOptions = {
            ...options,
            ...YoutubePopup.getPopupPosition(),
        };
        const window = await super.toPopup(youtubeOptions);

        const { stylesToInject, activeClassName, styleElementId } = YoutubePopup;

        /**
         * Executes as eval'ed string in the context of youtube page
         */
        // tslint:disable:no-shadowed-variable
        await this.executeFunction((
            stylesToInject: string,
            activeClassName: string,
            styleElementId: string,
        ) => {
            document.body.classList.add(activeClassName);

            const style = document.createElement("style");
            style.type = "text/css";
            const styleText = document.createTextNode(stylesToInject);
            style.appendChild(styleText);
            style.id = styleElementId;
            document.head.appendChild(style);

            // scroll up to video
            setTimeout(() => {
                scrollTo(0, 0);
            }, 1);
        }, [stylesToInject, activeClassName, styleElementId]);
        // tslint:enable:no-shadowed-variable

        return window;
    }

    public async toWindow(options: chrome.windows.CreateData = {}): Promise<chrome.windows.Window> {
        const window = await super.toWindow(options);
        const { activeClassName, styleElementId } = YoutubePopup;

        /**
         * Executes as eval'ed string in the context of youtube page
         */
        // tslint:disable:no-shadowed-variable
        await this.executeFunction((
            activeClassName: string,
            styleElementId: string,
        ) => {

            document.body.classList.remove(activeClassName);

            const style = document.getElementById(styleElementId);
            style.innerHTML = "";
            style.parentNode.removeChild(style);
        }, [activeClassName, styleElementId]);
        // tslint:enable:no-shadowed-variable

        await this.updateProperties({
            selected: true,
        });

        return window;
    }
}

export default YoutubePopup;
