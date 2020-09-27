# Translate it

This extension is a text/comment translator powered by **Google Translate**.

## Features

- You can translate selected texts from `Source Language` to `Target Language`
    - Automatically detect `Source Language` and `Target Language`
        - `Automatic Target Language` is your prefer display language of VSCode
        - You can also change `Target Language` in the **Extension Settings**
- Comments only translated in selected programming codes
    - Supports more than 30 programming languages
    - See below a [demo](#usage)
- Display **Hover Message** with translated text
    - See below a [demo](#usage)
- And history logging in the **Output Channel**
    - See below a [demo](#history-logging)

## Installation

To install this extension go to `View->Extensions` and search for `Translate it`. Next click Install and then Reload.

## Usage

To use the extension go to the Command Palette (`Cmd+Shift+P` on macOS or `Ctrl+Shift+P` on Windows) and launch `Translate it` command.
> You can use keyboard shortcut `Shift+Alt+T`.

> And you can remove text decorations, if you execute `Translate it` command again with empty selection.

![Demo 1](./images/readme/demo1.gif)

Or select `Translate it` from context menu (`Right-click` on editor).
> It's available when you select some text (single or multi select).

![Demo 2](./images/readme/demo2.png)

## History Logging

You can find the histories of translation in the **Output Channel**

![Demo 3](./images/readme/demo3.png)

## Settings

Table of contributed settings (prefix "translateIt."):

| Name                     | Default       | Description                                                                                            |
| ------------------------ | ------------- | ------------------------------------------------------------------------------------------------------ |
| hoverDisplay             | `true`        | Display hover with translated result                                                                   |
| hoverDisplayHeader       | `true`        | Display hover with header area : `Source Language → Target Language`                                  |
| hoverMultiLineFormatting | `true`        | Display hover with Multi-Line Formatting                                                               |
| targetLanguage           | `"Automatic"` | Target language ([list the supported](https://cloud.google.com/translate/docs/languages)) translate to |

## Issues

If you find any problems using this extension or you want to propose new features to it, feel free to open an issue on [Github](https://github.com/phoihos/translate-it/issues).

## Release Notes

Detailed Release Notes are available [here](https://github.com/phoihos/translate-it/blob/master/CHANGELOG.md) or above **Changelog** tab.
