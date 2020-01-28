# Contributing to `elm-i18next-gen`
All issues, PRs, suggestions welcome. Feel free to log issues here, or find me on the Elm Slack.


## Overview of Code
The main entry point is at `index.js`. This parses the command line arguments using
[Commander.js](https://github.com/tj/commander.js/), then executes the code generation process. This process is defined
in `code-gen.js` (the function exported from this module). The process has the following steps:
1. Read the source JSON file.
2. Build an in-memory model of the source, defining the modules/functions/parameters that should be created. Here is
where all validation and sanitisation of the source occurs. This is defined in `model-builder.js`.
3. Build the actual Elm code for the model created above. This is defined in `code-builder.js`.
4. Write the generated Elm code to disk. This is defined in `file-writer.js`.


## Tests
There is a test file for every module (with the same name as the module, with `.spec` added). For most modules this
contains low-level unit tests focused purely on what that module does. In some cases, however, the module under test is
a higher-level component (e.g. `index.js` and `code-gen.js`) so the tests here are higher-level, acting more like
integration tests, ensuring various other modules all interoperate correctly.

There are also some integration tests that run the whole process and validate its output using
[elm-format](https://www.npmjs.com/package/elm-format) and [elm-test](https://www.npmjs.com/package/elm-test). These are
defined in `package.json` in these scripts: `generate-sample-translations`, `elm-format-validate`, and `elm-test-validate`.
The purpose of these tests is to make sure that the generated Elm code is properly formatted and works as expected. 


### Note for IntelliJ users
When first opening the project, you might see some warnings about unresolved variables in node-specific code:

![Unresolved Node variables](docs/images/unresolved-node-variables.png)

To get round this go to **Settings --> Languages & Frameworks --> Node.js and NPM** and tick the
**Coding assistance for Node.js** checkbox:

![Coding assistance for Node.js](docs/images/node-coding-assistance.png)

Then, when prompted, select the `elm-i18next-gen` module:

![Node coding assistance module selection](docs/images/node-coding-assistance-select-module.png)
