"use strict"

const {pathFromModuleName} = require("./elm-utils")

/**
 * Builds up the start of the code for a module with the passed in name.
 */
const buildFileStart = moduleName => `module ${moduleName} exposing (..)

import I18Next exposing (Translations, t, tr, Curly)
`

/**
 * Builds up the text of a function with the passed in name, containing the passed in parameters, if any.
 */
const buildFunction = (functionName, parameters) =>
    parameters && parameters.length > 0
        ? `

${functionName} : Translations -> ${parameters.map(() => "String -> ").join("")}String
${functionName} translations ${parameters.map(p => p + " ").join("")}=
    tr translations Curly "${functionName}" [ ${parameters.map(p => `( "${p}", ${p} )`).join(", ")} ]
`
        : `

${functionName} : Translations -> String
${functionName} translations =
    t translations "${functionName}"
`

/**
 * Builds up the code for the passed in model (see "./model-builder"). Returns an object containing one property per
 * file (i.e. Elm module). The name of the property is the name of the file (e.g. "Translations.elm" or
 * "Translations/Greetings.elm") and its value is the full text of the file.
 */
module.exports = model =>
    // Loop round the model's keys, which are the Elm modules...
    Object.keys(model).reduce((files, moduleName) => {
        // Loop round this module's keys, which are the function names, and build up this file's content...
        const fileContent = Object.keys(model[moduleName]).reduce(
            (fileContent, functionName) => fileContent + buildFunction(functionName, model[moduleName][functionName]),
            buildFileStart(moduleName)
        )
        // Return a clone of the passed in "files" (the reduce function's accumulator), adding the content of this module
        // as a new property whose key is the file name, and whose value is that file's code content (as a string).
        const filename = pathFromModuleName(moduleName)
        return {...files, [filename]: fileContent}
    }, {})