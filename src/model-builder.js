"use strict"

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

const sourcePropKeyToModuleName = key => key.charAt(0).toUpperCase() + key.slice(1)

/**
 * See documentation on default export below. Does what it says, but allowing the accumulated model and module name to be
 * passed in, so this function can call itself recursively.
 */
const buildModel = (source, initialModel, moduleName) => Object.keys(source).reduce(
    (accModel, sourcePropKey) => {
        const sourcePropValue = source[sourcePropKey]
        if (typeof sourcePropValue === "string") {
            // Just a string: add a property to the current module in the current model.
            const module = accModel[moduleName] || {}
            return {...accModel, [moduleName]: {...module, [sourcePropKey]: parseParams(sourcePropValue)}}
        } else {
            // This key in the source groups together a bunch of children: create a new module for these.
            return buildModel(sourcePropValue, accModel, `${moduleName}.${sourcePropKeyToModuleName(sourcePropKey)}`)
        }
    }, initialModel)

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
 *         hello: [],
 *         helloWithParams: ["firstname", "middlename", "lastname"]
 *       }
 *       "Translations.Greetings": {
 *         goodDay: [],
 *         greetName: ["name"]
 *       }
 *     }
 * ```
 *
 * Function and module names are sanitised. Any duplicate translations in a given module will cause an error to be thrown
 * as this is invalid in the source JSON file.
 */
module.exports = source => buildModel(source, {}, "Translations")