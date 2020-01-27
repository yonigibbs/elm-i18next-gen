"use strict"

const {buildFileStart, pathFromModuleName} = require("./elm-utils")

/**
 * Builds up the text of a function with the passed in name, containing the passed in parameters, if any.
 */
const buildFunction = (fn, useFallbackLanguages) => {
    const translationsParamType = useFallbackLanguages ? "List Translations" : "Translations"
    const fallbackSuffix = useFallbackLanguages ? "f" : ""

    return fn.parameters.length
        ? `

${fn.elmName} : ${translationsParamType} -> ${fn.parameters.map(() => "String -> ").join("")}String
${fn.elmName} translations ${fn.parameters.map(p => p.elmName + " ").join("")}=
    tr${fallbackSuffix} translations Curly "${fn.jsonName}" [ ${fn.parameters.map(p => `( "${p.jsonName}", ${p.elmName} )`).join(", ")} ]
`
        : `

${fn.elmName} : ${translationsParamType} -> String
${fn.elmName} translations =
    t${fallbackSuffix} translations "${fn.jsonName}"
`
}

/**
 * Builds up the code for the passed in model (see "./model-builder"). Returns an object containing one property per
 * file (i.e. Elm module). The name of the property is the name of the file (e.g. "Translations.elm" or
 * "Translations/Greetings.elm") and its value is the full text of the file.
 */
module.exports = (model, useFallbackLanguages = false) =>
    // Loop round the model's keys, which are the Elm modules...
    Object.keys(model).reduce((files, moduleName) => {
        // model[moduleName] is an array of functions: loop round these and build up this file's content...
        const fileContent = model[moduleName].reduce(
            (fileContent, fn) => fileContent + buildFunction(fn, useFallbackLanguages),
            buildFileStart(moduleName, useFallbackLanguages)
        )
        // Return a clone of the passed in "files" (the reduce function's accumulator), adding the content of this module
        // as a new property whose key is the file name, and whose value is that file's code content (as a string).
        const filename = pathFromModuleName(moduleName)
        return {...files, [filename]: fileContent}
    }, {})
