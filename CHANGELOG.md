# Change Log for "LSLint for VS Code"

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [1.0.2] - 2021-08-02
- Fixed a problem with vsce not packaging the actual extension file.
- Added a check to see if lslint is installed and if not pop up a message.

## [1.0.1] - 2021-07-28
### Added
- Check if lslint is on our path and display message if not found.
- Remove stray command trigger from package.json.
- Fixed command label for linting to better match other extensions.
- Fixed License link in README.
- Fixed License notation in package.json.
- Fixed version numbers in CHANGELOG.
- Added my lslint executable repo and releases page to README.
- Added webpack as a bundler to help with size.
- Cleaned up the main extension.ts in general.
- Fixed a bug where an error on line 1 was not displayed.
- Added bugs link to package.json.

## [1.0.0] - 2021-07-20
### Added
- First version inspired by [LSLinter VScode](https://github.com/AdamMcCurdy/lslint-vscode) and parts used with permission.
- Added options that allow usage with Firestorm Preprocessor Includes/Switch/LazyList.
- Added support for calling by command, on save or realtime linting.
- Added as many settings options as I could think of that would be useful for someone writing LSL in VS Code to work with LSLint.
- Commented the heck out of the thing so someone could get started modifying it should they wish.