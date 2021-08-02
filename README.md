# LSLint for VSCode

## Information

Wrapper for [LSLint](https://github.com/FixedBit/lslint/); LSL being a scripting language for the virtual world of [Second Life](https://secondlife.com).

If you are looking for a way to write LSL scripts from VSCode then this extension should help you a lot!

I have updated the LSLint executable to the current LSL calls as of July 2021. [Check it out here](https://github.com/FixedBit/lslint/)

## Required Extra Installs

* **You must download and install the LSLint executable yourself as this extension is just a wrapper for it!**
  * Visit the [LSLint releases page](https://github.com/FixedBit/lslint/releases/) to download it for your system.
  * You must add the folder containing LSLint to your path. This will depend on your operating system and instructions for that will be on your [favorite search engine](https://bfy.tw/RJg8).
* **You will need an external extension for LSL Syntax Highlighting or else the extension will not activate!**
    * I use [VSCode LSL](https://marketplace.visualstudio.com/items?itemName=vrtlabs.vscode-lsl).
## Origins

I am not a professional TypeScript/NodeJS programmer and this is the first thing I have ever written in it. Any contributions or fixes are always welcome as Pull Requests.

I decided to work on this because much of the tools for external editors had not been updated in a while and the [extension](https://github.com/AdamMcCurdy/lslint-vscode) I used as inspiration did not work anymore.

There are a lot of upsides to working on your LSL files in VSCode as you always have a backup should you need.

The [Firestorm Preprocessor](https://wiki.firestormviewer.org/fs_preprocessor) is a very helpful to me and since LSLint has support for it. Enable or disable those features in the settings should you wish to use it.

The code is commented, sometimes too much, just incase it helps someone understand what is going on. It was tested on Windows and Linux (WSL2) but should work the same on macOS.

## Contact Info

You can reach out to me any time in Second Life through my avatar name [Coal Edge](https://my.secondlife.com/coal.edge), my email [jason@fixedbit.com](mailto:jason@fixedbit.com) or [GitHub](https://github.com/FixedBit/).

## Known Issues

None at this time.

## Release Notes

I suggest reading the [Change Log](https://github.com/FixedBit/lslint-for-vscode/blob/main/CHANGELOG.md) for release information and changes.

## Making changes and modifications / License

* Published Open Source under [GPL v3](https://github.com/FixedBit/lslint-for-vscode/blob/main/LICENSE.md)

I am open to suggestions, GitHub Issues and Pull Requests or anything else that you may want to contribute.

For more information on VSCode Extensions check out these links:

* [VSC Extension Quickstart](https://github.com/FixedBit/lslint-for-vscode/blob/main/vsc-extension-quickstart.md)
* [Your First Extension](https://code.visualstudio.com/api/get-started/your-first-extension)
