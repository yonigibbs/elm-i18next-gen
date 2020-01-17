# Code Generation for [elm-i18next](https://package.elm-lang.org/packages/ChristophP/elm-i18next/latest)

[![Actions Status](https://github.com/yonigibbs/elm-i18next-code-gen/workflows/Node%20CI/badge.svg)](https://github.com/yonigibbs/elm-i18next-code-gen/actions)

## Overview
TODO

## Usage
TODO

## TODO
* Sanitise file/function/parameter names:
  * Capitalisation.
  * Check what elm-i18next does with non-standard parameters (e.g. spaces, non-standard chars, etc).
* Handle duplicates (functions and modules).
* Validation of supplied target folder:
  * Valid path, not a file, etc.
  * Take in arg for what to do if target folder already exists (and isn't empty)?
* Allow parameter delimiter to be configured (currently hard-coded to `Curly`).
* Handle translations with fallbacks.
* Allow to work with older versions of Node (which didn't have recursive folder creation).
* Handle errors at top level? Or just let exceptions bubble up (and be displayed on the console)?
* TODOs in the code.
* Consider moving to TypeScript?

## Maintaining
### Note for IntelliJ users
When first opening the project, you might see some warnings about unresolved variables in node-specific code:

![Unresolved Node variables](docs/images/unresolved-node-variables.png)

To get round this go to **Settings --> Languages & Frameworks --> Node.js and NPM** and tick the
**Coding assistance for Node.js** checkbox:

![Coding assistance for Node.js](docs/images/node-coding-assistance.png)

Then, when prompted, select the `elm-i18next-code-gen` module:

![Node coding assistance module selection](docs/images/node-coding-assistance-select-module.png)
