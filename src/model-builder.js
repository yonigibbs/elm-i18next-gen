"use strict"

/** The name of the default top-level module. */
const topLevelModule = "Translations"

/** Adds a function with the given name and parameters to the passed in module. Returns a clone of the passed in module,
 * with the new function added. */
const addFunction = (module, functionName, params) => ({...module, [functionName]: params})

/** The regular expression that finds parameters in a translated text. */
const paramRegex = /{{(\S+?)}}/gm

/** Parses the parameters from the passed in text and returns an array containing the parameter  names. */
const parseParams = translationText => {
    let match
    const params = []
    while ((match = paramRegex.exec(translationText)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === paramRegex.lastIndex)
            paramRegex.lastIndex++

        if (match.length === 2)
            params.push(match[1])
    }
    return params
}

/**
 * Returns a model containing the data from the passed in source (which is the source JSON file, as an object). The
 * returned model contains one property per module (the name of the property is the name of the module, e.g. "Translation".
 * The value of the property is itself an object containing one property per function (the property name matching the
 * function name). The property's value is an array containing the parameter names for that function.
 *
 * For example, given this source:
 *
 * ```
 *     {
 *       hello: "Hello",
 *       helloWithParams: "Hello {{firstname}} {{middlename}} {{lastname}}!",
 *       greetings: {
 *         goodDay: "Good Day.",
 *         greetName: "Hi {{name}}"
 *       }
 *     }
 * ```
 *
 * This returned model is as follows:
 *
 * ```
 *     {
 *       Translations: {
 *           hello: [],
 *           helloWithParams: ["firstname", "middlename", "lastname"]
 *       }
 *       "Translations.Greetings": {
 *         goodDay: [],
 *         greetName: ["name"]
 *       }
 * ```
 *
 * Function and module names are sanitised. Any duplicate translations in a given module will cause an error to be thrown
 * as this is invalid in the source JSON file.
 */
module.exports = source => Object.keys(source).reduce(
    (model, translationId) => {
        const module = model[topLevelModule] || {}
        return {...model, [topLevelModule]: addFunction(module, translationId, parseParams(source[translationId]))}
    }, {})