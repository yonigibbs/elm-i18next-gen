"use strict"

const {getCustomFunctionName, translationTypes} = require("./translation-type-utils")
const {buildFileStart, pathFromModuleName} = require("./elm-utils")

/**
 * Builds up the text of a function which uses the default translation functions (t/tr/tf/trf) with the passed in name,
 * containing the passed in parameters, if any.
 */
const buildDefaultFunction = (fn, useFallbackLanguages) => {
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
 * Builds up the text of a function which uses the custom translation functions (customTr/customTrf) with the passed in
 * name, containing the passed in parameters, if any.
 */
const buildCustomFunction = (fn, useFallbackLanguages, useCustomName) => {
    const functionName = useCustomName ? getCustomFunctionName(fn.elmName) : fn.elmName
    const translationsParamType = useFallbackLanguages ? "List Translations" : "Translations"
    const fallbackSuffix = useFallbackLanguages ? "f" : ""
    const parameters = fn.parameters.length
        ? `[ ${fn.parameters.map(p => `( "${p.jsonName}", ${p.elmName} )`).join(", ")} ]`
        : "[]"

    return `

${functionName} : ${translationsParamType} -> (String -> a) -> ${fn.parameters.map(() => "a -> ").join("")}List a
${functionName} translations nonPlaceholderLift ${fn.parameters.map(p => p.elmName + " ").join("")}=
    customTr${fallbackSuffix} translations Curly nonPlaceholderLift "${fn.jsonName}" ${parameters}
`
}

/**
 * Builds up the code for the passed in model (see "./model-builder"). Returns an object containing one property per
 * file (i.e. Elm module). The name of the property is the name of the file (e.g. "Translations.elm" or
 * "Translations/Greetings.elm") and its value is the full text of the file.
 */
module.exports = (model, useFallbackLanguages = false, translationType = translationTypes.default) =>
    // Loop round the model's keys, which are the Elm modules...
    Object.keys(model).reduce((files, moduleName) => {
        // model[moduleName] is an array of functions: loop round these and build up this file's content...
        const fileContent = model[moduleName].reduce(
            (fileContent, fn) => {
                const builder = fn.type === translationTypes.custom ? buildCustomFunction : buildDefaultFunction
                return fileContent + builder(fn, useFallbackLanguages)
            },
            buildFileStart(moduleName, useFallbackLanguages, translationType)
        )
        // Return a clone of the passed in "files" (the reduce function's accumulator), adding the content of this module
        // as a new property whose key is the file name, and whose value is that file's code content (as a string).
        const filename = pathFromModuleName(moduleName)
        return {...files, [filename]: fileContent}
    }, {})
