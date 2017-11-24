import Popup from "./popup";

class VideoPopup extends Popup {
    public static popupDimensions = {
        height: 300,
        width: 470,
    };

    public static async isVideoPopup(tab: chrome.tabs.Tab) {
        return await Popup.executeFunction(tab, () => {
            return document.querySelectorAll("video") ? 1 : 0;
        }, []);
    }

    public static getPopupPosition() {
        const { width, height } = VideoPopup.popupDimensions;

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
        const window = await super.toPopup({
            ...options,
            ...VideoPopup.getPopupPosition(),
        });
        return window;
    }

    public async toWindow(options: chrome.windows.CreateData = {}): Promise<chrome.windows.Window> {
        const window = await super.toWindow(options);
        return window;
    }
}

export default VideoPopup;
