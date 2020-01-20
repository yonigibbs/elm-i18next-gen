# Code Generation for [elm-i18next](https://package.elm-lang.org/packages/ChristophP/elm-i18next/latest)

[![Actions Status](https://github.com/yonigibbs/elm-i18next-code-gen/workflows/Node%20CI/badge.svg)](https://github.com/yonigibbs/elm-i18next-code-gen/actions)

## Overview
This tool generates code which can be added to an Elm project to allow it handle internationalization in a typesafe
manner. The code it generates uses the [elm-i18next](https://package.elm-lang.org/packages/ChristophP/elm-i18next/latest)
package to read text values from a source JSON object.

## Motivation
In Elm there are various approaches to solve the problem of internationalization, including
[elm-i18n](https://github.com/iosphere/elm-i18n), [i18n-to-elm](https://github.com/dragonwasrobot/i18n-to-elm),
[elm-i18n-module-generator](https://github.com/ChristophP/elm-i18n-module-generator) and
[elm-i18next](https://github.com/ChristophP/elm-i18next). Each of these takes a different approach, and each is suited
to slightly different use cases. For a recent project, I chose to use *elm-i18next* for various reasons:
* I didn't want to build a separate version of the app for each language.
* I didn't want to pass the user's language around the model.
* I didn't want to download the translations for every language to the user, when they only ever use one.
* I didn't want to have to rebuild and redeploy the client code every time translations for a new language were added.

*elm-i18next* ticks all the boxes above. The one thing I wanted that the package didn't give me is compile-time checking
of my code against the source JSON object. For example, the JSON object could contain this translation:

    {
      "greetName": "Hi {{name}}"
    }

The Elm code to call this would look as follows:

    tr model.translations Curly "greetName" [ ( "name", "Peter" ) ]

However the following Elm code would also compile:

    tr model.translations Curly "gretName" [ ( "nam", "Peter" ) ]

There are two typos there, neither of which would be caught at compile time, leading to problems (though not exceptions:
this is Elm after all :relaxed:) when the page is rendered.

To solve this problem, the tool in this repo takes in a JSON file containing the translations which the system uses, and
generates a function for each string value. That function itself simply calls the _i18next_ package. The code in the
application itself then calls those generated functions rather than using the _i18next_ package directly.

Using the example above, the generated code for it would look as follows:

    greetName : Translations -> String -> String
    greetName translations name =
        tr translations Curly "greetName" [ ( "name", name ) ]

The application code would then have the following:

    greetName model.translations "Peter"

Now if a developer types `gretName` the code won't compile. And as the placeholder `name` is now baked into the generated
code, there isn't an opportunity for any mistakes there. Similarly if a new placeholder is added in the text: the
generated function will now require two parameters instead of one so the update to the calling code will be spotted at
compile time.

An important distinction to make here is that the generated code does not contain the actual translated value (e.g.
`"Hi {{name}}"`). These values are still read from the source JSON object at runtime. This means that as new languages
are added, or as string values are updated, the code doesn't have to change (unless of course the translation IDs change,
or placeholders are changed). 

## Usage
TODO

## TODO
* Sanitise module/file/function/parameter names:
  * Capitalisation.
  * Invalid characters.
* When overwriting target folder, don't clear it all out: overwrite existing files, and delete existing ones that are no
longer generated (i.e. delete text resources).
* Revisit error handling/reporting: need custom error type for user-facing problems in JSON (as opposed to unexpected errors)?
* Add command-line-usage (i.e. handle `--help`): see https://github.com/75lb/command-line-usage
* Handle empty modules (no translations, maybe just nested submodules) - poss already done - needs tests
* Handle duplicates (functions and modules).
* Validation of supplied target folder:
  * Valid path, not a file, etc.
  * Take in arg for what to do if target folder already exists (and isn't empty)?
* Allow parameter delimiter to be configured (currently hard-coded to `Curly`).
* Handle translations with fallbacks.
* Allow to work with older versions of Node (which didn't have recursive folder creation).
* Handle errors at top level? Or just let exceptions bubble up (and be displayed on the console)?
* TODOs in the code.
* Publish as NPM package?
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
