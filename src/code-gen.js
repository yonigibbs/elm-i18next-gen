"use strict"

const {pathFromModuleName} = require("./elm-utils")

const buildFileStart = moduleName => `module ${moduleName} exposing (..)

import I18Next exposing (Translations, t, tr)
`

const buildFunction = (functionName, parameters) => `

${functionName} : Translations -> String
${functionName} translations =
    t translations "${functionName}"
`

module.exports = model =>
    // Loop round the model's keys, which are the Elm modules...
    Object.keys(model).reduce((files, moduleName) => {
        // Loop round this module's keys, which are the function names, and build up this file's content...
        const fileContent = Object.keys(model[moduleName]).reduce(
            (fileContent, functionName) => fileContent + buildFunction(functionName),
            buildFileStart(moduleName)
        )
        // Return a clone of the passed in "files" (the reduce function's accumulator), adding the content of this module
        // as a new property whose key is the file name, and whose value is that file's code content (as a string).
        const filename = pathFromModuleName(moduleName)
        return {...files, [filename]: fileContent}
    }, {})