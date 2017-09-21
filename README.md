# Toggle Popup

Toggles between window-mode and popup mode in Chrome


# Install

Currently it's not in Chrome extensions store, so install with dev mode

## Install bundled version
 
1. Open extensions page in Settings
2. Set "developer mode"
3. Drag __ext.crx__ into window

# Development

Project uses [Typescript](https://www.typescriptlang.org/) as language, and [fusebox](http://fuse-box.org/) as bundler

## How to enter dev mode

1. `npm install`
2. `npm run build:watch`

## Bundle files

`npm run build`

## Install dev version

1. Open extensions page in Settings
2. Set "developer mode"
3. Click on "Load unpacked extension"
4. Point to __ext__ directory
