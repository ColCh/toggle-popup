import Popup from "./popup";
import VideoPopup from "./video-popup";
import YoutubePopup from "./youtube-popup";

chrome.contextMenus.create({
    title: "Toggle PopUp",
});

async function main(info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) {
    const isVideo = await VideoPopup.isVideoPopup(tab);
    const isYoutube = await YoutubePopup.isYoutube(tab);

    let popup;

    if (isYoutube) {
        popup = new YoutubePopup(tab);
    } else if (isVideo) {
        popup = new VideoPopup(tab);
    } else {
        popup = new Popup(tab);
    }

    const isInPopupMode = await popup.isInPopUpMode();

    if (isInPopupMode) {
        await popup.toWindow();
    } else {
        await popup.toPopup();
    }
}

const handleClick = (info: chrome.contextMenus.OnClickData, tab: chrome.tabs.Tab) => {
    main(info, tab).catch((reason) => {
        // tslint:disable-next-line:no-console
        console.error("There was en error running toggle-popup", reason);
    });
};

chrome.contextMenus.onClicked.addListener(handleClick);
