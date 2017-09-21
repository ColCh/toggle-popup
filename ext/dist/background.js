(function(FuseBox){FuseBox.$fuse$=FuseBox;
FuseBox.pkg("default", {}, function(___scope___){
___scope___.file("background.js", function(exports, require, module, __filename, __dirname){

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const popup_1 = require("./popup");
const youtube_popup_1 = require("./youtube-popup");
chrome.contextMenus.create({
    title: "Toggle PopUp",
});
function main(info, tab) {
    return __awaiter(this, void 0, void 0, function* () {
        const isYoutube = youtube_popup_1.default.isYoutube(tab);
        let popup;
        if (isYoutube) {
            popup = new youtube_popup_1.default(tab);
        }
        else {
            popup = new popup_1.default(tab);
        }
        const isInPopupMode = yield popup.isInPopUpMode();
        if (isInPopupMode) {
            yield popup.toWindow();
        }
        else {
            yield popup.toPopup();
        }
    });
}
const handleClick = (info, tab) => {
    main(info, tab).catch((reason) => {
        // tslint:disable-next-line:no-console
        console.error("There was en error running toggle-popup", reason);
    });
};
chrome.contextMenus.onClicked.addListener(handleClick);
//# sourceMappingURL=background.js.map
});
___scope___.file("popup.js", function(exports, require, module, __filename, __dirname){

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class Popup {
    constructor(tab) {
        this.tab = tab;
    }
    isInPopUpMode() {
        return new Promise((res) => {
            chrome.windows.getCurrent((window) => {
                const isPopup = window.type === Popup.windowTypes.popup;
                res(isPopup);
            });
        });
    }
    executeFunction(func, args) {
        return new Promise((res) => {
            const code = `; 'use strict'; var res = (${func.toString()}).apply(null, ${JSON.stringify(args)}); res;`;
            chrome.tabs.executeScript(this.tab.id, {
                code,
            }, (results) => {
                res(results ? results[0] : undefined);
            });
        });
    }
    updateProperties(properties) {
        return new Promise((res) => {
            chrome.tabs.update(this.tab.id, properties, () => {
                res();
            });
        });
    }
    toPopup(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const window = yield this.createWindow(Object.assign({}, options, { type: Popup.windowTypes.popup }));
            yield this.focusWindow(window.id);
            yield this.saveWindowContext();
            return window;
        });
    }
    toWindow(options = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const window = yield this.createWindow(Object.assign({}, options, { type: Popup.windowTypes.normal }));
            const data = yield this.restoreWindowContext();
            try {
                yield this.moveTabToWindow(data);
            }
            catch (e) {
                // ignore if we can't move tab back to original window
            }
            return window;
        });
    }
    focusWindow(windowId) {
        return __awaiter(this, void 0, void 0, function* () {
            return new Promise((res) => {
                chrome.windows.update(windowId, {
                    drawAttention: true,
                    focused: true,
                }, () => {
                    res();
                });
            });
        });
    }
    createWindow(options) {
        return new Promise((res) => {
            chrome.windows.create(Object.assign({}, options, { incognito: this.tab.incognito, tabId: this.tab.id }), (window) => {
                res(window);
            });
        });
    }
    moveTabToWindow(moveProperties) {
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
    saveWindowContext() {
        return __awaiter(this, void 0, void 0, function* () {
            const data = {
                index: this.tab.index,
                windowId: this.tab.windowId,
            };
            const { dataKey } = Popup;
            /**
             * Executes as eval'ed string in the context of youtube page
             */
            // tslint:disable:no-shadowed-variable
            yield this.executeFunction((dataKey, data) => {
                document.body.dataset[dataKey] = JSON.stringify(data);
            }, [dataKey, data]);
            // tslint:enable:no-shadowed-variable
        });
    }
    restoreWindowContext() {
        return __awaiter(this, void 0, void 0, function* () {
            const { dataKey } = Popup;
            /**
             * Executes as eval'ed string in the context of youtube page
             */
            // tslint:disable:no-shadowed-variable
            return yield this.executeFunction((dataKey) => {
                const dataStr = document.body.dataset[dataKey];
                delete document.body.dataset[dataKey];
                return JSON.parse(dataStr);
            }, [dataKey]);
            // tslint:enable:no-shadowed-variable
        });
    }
}
Popup.dataKey = "toggle_popup_window";
Popup.windowTypes = {
    normal: "normal",
    popup: "popup",
};
exports.default = Popup;
//# sourceMappingURL=popup.js.map
});
___scope___.file("youtube-popup.js", function(exports, require, module, __filename, __dirname){

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const popup_1 = require("./popup");
class YoutubePopup extends popup_1.default {
    constructor(tab) {
        super(tab);
    }
    static isYoutube(tab) {
        return /youtube\.com/.test(tab.url);
    }
    static getPopupPosition() {
        const { width, height } = YoutubePopup.popupDimensions;
        return {
            height,
            left: screen.availWidth - width,
            top: 0,
            width,
        };
    }
    toPopup(options = {}) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const youtubeOptions = Object.assign({}, options, YoutubePopup.getPopupPosition());
            const window = yield _super("toPopup").call(this, youtubeOptions);
            const { stylesToInject, activeClassName, styleElementId } = YoutubePopup;
            /**
             * Executes as eval'ed string in the context of youtube page
             */
            // tslint:disable:no-shadowed-variable
            yield this.executeFunction((stylesToInject, activeClassName, styleElementId) => {
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
        });
    }
    toWindow(options = {}) {
        const _super = name => super[name];
        return __awaiter(this, void 0, void 0, function* () {
            const window = yield _super("toWindow").call(this, options);
            const { activeClassName, styleElementId } = YoutubePopup;
            /**
             * Executes as eval'ed string in the context of youtube page
             */
            // tslint:disable:no-shadowed-variable
            yield this.executeFunction((activeClassName, styleElementId) => {
                document.body.classList.remove(activeClassName);
                const style = document.getElementById(styleElementId);
                style.innerHTML = "";
                style.parentNode.removeChild(style);
            }, [activeClassName, styleElementId]);
            // tslint:enable:no-shadowed-variable
            yield this.updateProperties({
                selected: true,
            });
            return window;
        });
    }
}
/**
 * from youtube style file
 */
YoutubePopup.popupDimensions = {
    height: 260,
    width: 426,
};
// language=CSS
YoutubePopup.stylesToInject = `
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
YoutubePopup.styleElementId = "toggle-popup-styles-element";
YoutubePopup.activeClassName = "toggle-popup--active";
exports.default = YoutubePopup;
//# sourceMappingURL=youtube-popup.js.map
});
});
FuseBox.target = "browser@es5"

FuseBox.import("default/background.js");
FuseBox.main("default/background.js");
})
(function(e){function r(e){var r=e.charCodeAt(0),n=e.charCodeAt(1);if((d||58!==n)&&(r>=97&&r<=122||64===r)){if(64===r){var t=e.split("/"),i=t.splice(2,t.length).join("/");return[t[0]+"/"+t[1],i||void 0]}var o=e.indexOf("/");if(o===-1)return[e];var a=e.substring(0,o),u=e.substring(o+1);return[a,u]}}function n(e){return e.substring(0,e.lastIndexOf("/"))||"./"}function t(){for(var e=[],r=0;r<arguments.length;r++)e[r]=arguments[r];for(var n=[],t=0,i=arguments.length;t<i;t++)n=n.concat(arguments[t].split("/"));for(var o=[],t=0,i=n.length;t<i;t++){var a=n[t];a&&"."!==a&&(".."===a?o.pop():o.push(a))}return""===n[0]&&o.unshift(""),o.join("/")||(o.length?"/":".")}function i(e){var r=e.match(/\.(\w{1,})$/);return r&&r[1]?e:e+".js"}function o(e){if(d){var r,n=document,t=n.getElementsByTagName("head")[0];/\.css$/.test(e)?(r=n.createElement("link"),r.rel="stylesheet",r.type="text/css",r.href=e):(r=n.createElement("script"),r.type="text/javascript",r.src=e,r.async=!0),t.insertBefore(r,t.firstChild)}}function a(e,r){for(var n in e)e.hasOwnProperty(n)&&r(n,e[n])}function u(e){return{server:require(e)}}function f(e,n){var o=n.path||"./",a=n.pkg||"default",f=r(e);if(f&&(o="./",a=f[0],n.v&&n.v[a]&&(a=a+"@"+n.v[a]),e=f[1]),e)if(126===e.charCodeAt(0))e=e.slice(2,e.length),o="./";else if(!d&&(47===e.charCodeAt(0)||58===e.charCodeAt(1)))return u(e);var s=m[a];if(!s){if(d&&"electron"!==h.target)throw"Package not found "+a;return u(a+(e?"/"+e:""))}e=e?e:"./"+s.s.entry;var l,c=t(o,e),v=i(c),p=s.f[v];return!p&&v.indexOf("*")>-1&&(l=v),p||l||(v=t(c,"/","index.js"),p=s.f[v],p||(v=c+".js",p=s.f[v]),p||(p=s.f[c+".jsx"]),p||(v=c+"/index.jsx",p=s.f[v])),{file:p,wildcard:l,pkgName:a,versions:s.v,filePath:c,validPath:v}}function s(e,r,n){if(void 0===n&&(n={}),!d)return r(/\.(js|json)$/.test(e)?v.require(e):"");if(n&&n.ajaxed===e)return console.error(e,"does not provide a module");var i=new XMLHttpRequest;i.onreadystatechange=function(){if(4==i.readyState)if(200==i.status){var n=i.getResponseHeader("Content-Type"),o=i.responseText;/json/.test(n)?o="module.exports = "+o:/javascript/.test(n)||(o="module.exports = "+JSON.stringify(o));var a=t("./",e);h.dynamic(a,o),r(h.import(e,{ajaxed:e}))}else console.error(e,"not found on request"),r(void 0)},i.open("GET",e,!0),i.send()}function l(e,r){var n=g[e];if(n)for(var t in n){var i=n[t].apply(null,r);if(i===!1)return!1}}function c(e,r){if(void 0===r&&(r={}),58===e.charCodeAt(4)||58===e.charCodeAt(5))return o(e);var t=f(e,r);if(t.server)return t.server;var i=t.file;if(t.wildcard){var a=new RegExp(t.wildcard.replace(/\*/g,"@").replace(/[.?*+^$[\]\\(){}|-]/g,"\\$&").replace(/@@/g,".*").replace(/@/g,"[a-z0-9$_-]+"),"i"),u=m[t.pkgName];if(u){var p={};for(var g in u.f)a.test(g)&&(p[g]=c(t.pkgName+"/"+g));return p}}if(!i){var h="function"==typeof r,x=l("async",[e,r]);if(x===!1)return;return s(e,function(e){return h?r(e):null},r)}var _=t.pkgName;if(i.locals&&i.locals.module)return i.locals.module.exports;var w=i.locals={},y=n(t.validPath);w.exports={},w.module={exports:w.exports},w.require=function(e,r){return c(e,{pkg:_,path:y,v:t.versions})},d||!v.require.main?w.require.main={filename:"./",paths:[]}:w.require.main=v.require.main;var j=[w.module.exports,w.require,w.module,t.validPath,y,_];return l("before-import",j),i.fn.apply(0,j),l("after-import",j),w.module.exports}if(e.FuseBox)return e.FuseBox;var d="undefined"!=typeof window&&window.navigator,v=d?window:global;d&&(v.global=window),e=d&&"undefined"==typeof __fbx__dnm__?e:module.exports;var p=d?window.__fsbx__=window.__fsbx__||{}:v.$fsbx=v.$fsbx||{};d||(v.require=require);var m=p.p=p.p||{},g=p.e=p.e||{},h=function(){function r(){}return r.global=function(e,r){return void 0===r?v[e]:void(v[e]=r)},r.import=function(e,r){return c(e,r)},r.on=function(e,r){g[e]=g[e]||[],g[e].push(r)},r.exists=function(e){try{var r=f(e,{});return void 0!==r.file}catch(e){return!1}},r.remove=function(e){var r=f(e,{}),n=m[r.pkgName];n&&n.f[r.validPath]&&delete n.f[r.validPath]},r.main=function(e){return this.mainFile=e,r.import(e,{})},r.expose=function(r){var n=function(n){var t=r[n].alias,i=c(r[n].pkg);"*"===t?a(i,function(r,n){return e[r]=n}):"object"==typeof t?a(t,function(r,n){return e[n]=i[r]}):e[t]=i};for(var t in r)n(t)},r.dynamic=function(r,n,t){this.pkg(t&&t.pkg||"default",{},function(t){t.file(r,function(r,t,i,o,a){var u=new Function("__fbx__dnm__","exports","require","module","__filename","__dirname","__root__",n);u(!0,r,t,i,o,a,e)})})},r.flush=function(e){var r=m.default;for(var n in r.f)e&&!e(n)||delete r.f[n].locals},r.pkg=function(e,r,n){if(m[e])return n(m[e].s);var t=m[e]={};return t.f={},t.v=r,t.s={file:function(e,r){return t.f[e]={fn:r}}},n(t.s)},r.addPlugin=function(e){this.plugins.push(e)},r.packages=m,r.isBrowser=d,r.isServer=!d,r.plugins=[],r}();return d||(v.FuseBox=h),e.FuseBox=h}(this))
//# sourceMappingURL=background.js.map