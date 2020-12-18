"use strict"

const JsonError = require("./json-error")
const {translationTypes, getCustomFunctionName} = require("./translation-type-utils")

/** Returns a copy of the passed in string with the first letter capitalised/decapitalised, based on the `caps` param. */
const caseFirstLetter = (s, caps) => {
    const firstChar = s.charAt(0)
    const casedFirstChar = caps ? firstChar.toUpperCase() : firstChar.toLowerCase()
    return casedFirstChar + s.slice(1)
}

/**
 * Returns a sanitised version of the passed in string. Trims it, removes white space and illegal characters, and
 * capitalises the first letter of each words (potentially treating the first word differently based on  the `type`
 * argument).
 *
 * If first character is a number then it is prefixed with `t` or `T` (based on `type`).
 *
 * If all illegal characters have been removed and the value left is blank, an error is thrown.
 *
 * @param type "module", "function", or "parameter".
 */
const sanitise = (unsanitised, type) => {
    const trimmed = unsanitised.trim()
    if (!trimmed)
        throw new JsonError(`a ${type} with no ID was found.`)

    const sanitised = unsanitised
        .split(/[^a-z0-9]+/gi) // Split by illegal characters (i.e. any one or more chars that aren't numbers or letters)
        .map(word => word.trim()) // Trim each value
        .filter(word => word) // Remove empty entries
        .map((word, index) => {
            // Capitalise first letter of each word - first word treated a bit differently if using camel casing
            const caps = index > 0 || type === "module"
            return caseFirstLetter(word, caps)
        })
        .join("")

    if (!sanitised)
        throw new JsonError(`'${unsanitised}' is not a valid ${type} name.`)

    if (sanitised.charAt(0).match(/[0-9]/)) {
        const prefix = type === "module" ? "T" : "t"
        return prefix + sanitised
    }
    return sanitised
}

const sanitiseModuleName = unsanitised => sanitise(unsanitised, "module")
const sanitiseFunctionName = unsanitised => sanitise(unsanitised, "function")
const sanitiseParameterName = unsanitised => sanitise(unsanitised, "parameter")

/** The regular expression that finds parameters in a translated text. */
const paramRegex = /{{(.*?)}}/g

/** Parses the parameters from the passed in text and returns an array containing the parameters. */
const parseParams = translationText => {
    let match
    const params = []
    while ((match = paramRegex.exec(translationText)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === paramRegex.lastIndex)
            paramRegex.lastIndex++

        if (match.length === 2) {
            if (match[1].trim().length > 0) {
                const elmName = sanitiseParameterName(match[1])
                // Add this parameter only if it doesn't exist already. (We're assuming here that one `elmName` will always
                // have the same `jsonName`, which might not be true, but really that's a problem with the source JSON.
                if (!params.some(p => p.elmName === elmName))
                    params.push({elmName, jsonName: match[1]})
            }
        }
    }

    return params
}

/**
 * See documentation on default export below. Does what it says, but allowing the accumulated model and module name to be
 * passed in, so this function can call itself recursively.
 */
const buildModel = (source, translationType, initialModel, moduleName, moduleJsonPath) => Object.keys(source).reduce(
    (accModel, sourcePropKey) => {
        const jsonName = moduleJsonPath ? `${moduleJsonPath}.${sourcePropKey}` : sourcePropKey
        try {
            const sourcePropValue = source[sourcePropKey]
            if (typeof sourcePropValue === "string") {
                // Just a string: add a property to the current module in the current model.
                const module = accModel[moduleName] || []
                const functionName = sanitiseFunctionName(sourcePropKey)
                const functions = []
                const fn = {
                    elmName: functionName,
                    jsonName,
                    parameters: parseParams(sourcePropValue)
                }
                switch (translationType) {
                    case translationTypes.custom:
                        // Only generating the custom function
                        functions.push({...fn, type: translationTypes.custom})
                        break

                    case translationTypes.both:
                        // We are going to generate two copies of this function - one with the supplied name, and one with a
                        // suffix of `Custom`
                        functions.push({...fn, type: translationTypes.default})
                        functions.push({...fn, elmName: getCustomFunctionName(functionName), type: translationTypes.custom})
                        break

                    default:
                        // Only generating the default function
                        functions.push({...fn, type: translationTypes.default})
                        break
                }

                functions.forEach(fn => {
                    if (module.some(existingFn => existingFn.elmName === fn.elmName))
                        throw new JsonError(`duplicate function found: '${fn.elmName}' (in module '${moduleName}').`)
                })

                return {...accModel, [moduleName]: [...module, ...functions]}
            } else {
                // This key in the source groups together a bunch of children: create a new module for these.
                const childModuleName = `${moduleName}.${sanitiseModuleName(sourcePropKey)}`
                if (accModel[childModuleName])
                    throw new JsonError(`duplicate module found: '${childModuleName}'.`)
                return buildModel(sourcePropValue, translationType, accModel, childModuleName, jsonName)
            }
        } catch (err) {
            if (err instanceof JsonError)
                // Already one of our errors: just rethrow
                throw err
            else
                // Something went wrong: report it, but include the details of where this occurred in the JSON so the
                // user has a better chance of fixing the problem.
                throw new JsonError(`Error processing entry at '${jsonName}': ${err.message}`)
        }
    }, initialModel)

/**
 * Returns a model containing the data from the passed in source (which is the source JSON file, as an object).
 *
 * The model has one property per **module**. The name of the property is the name of the module (e.g. "Translations" or
 * "Translations.Greetings").
 *
 * Each property in the model (which represents a module) has a value which is an array of the functions to put in this
 * module. Each entry in this array (i.e. each **function**) has three properties:
 * * `elmName`: the name of this function in the Elm code.
 * * `jsonName`: the name of this function in the source JSON object.
 * * `type`: "default" or "custom" indicating whether this is to be generated to use the default translation functions
 *   (`t`/`tr`/`tf`/`trf`) or the custom ones (`customTr`/`customTrf`)
 * * `parameters`: the parameters this function expects.
 * The `elmName` is a sanitised version of the `jsonName`, and in a nested structure contains only the last entry, not
 * the full path.
 *
 * For example, take the following structure:
 *
 * ```
 *     {
 *       ...,
 *       greetings: {
 *         "good day": "Good day."
 *       }
 *     }
 * ```
 *
 * Here the function for the "good day" entry would have an `elmName` of "goodDay" and a `jsonName` of "greetings.good day"
 *
 * The `parameters` value for each function is an array containing one entry per parameter. Each such **parameter** value
 * has the following properties:
 * * `elmName`: the name of this parameter in the Elm code.
 * * `jsonName`: the name of this parameter in the source JSON object
 * Typically these would be the same, but because of sanitisation they might be different (e.g. it might be "Param 1" in
 * the JSON but "param1" in the generated Elm code.
 *
 * For example, given this source:
 *
 * ```
 *     {
 *       hello: "Hello",
 *       helloWithParams: "Hello {{first name}} {{middle name}} {{last name}}!",
 *       greetings: {
 *         "good day": "Good day.",
 *         "greet name": "Hi {{name}}"
 *       }
 *     }
 * ```
 *
 * This returned model is as follows:
 *
 * ```
 *     {
 *       Translations: [
 *         { elmName: "hello", jsonName: "hello", type: "default", parameters: []},
 *         { elmName: "helloWithParams", jsonName: "helloWithParams", type: "default", parameters: [
 *           {elmName: "firstName", jsonName: "first name"},
 *           {elmName: "middleName", jsonName: "middle name"},
 *           {elmName: "lastName", jsonName: "last name"},
 *         ]}
 *       ]
 *       "Translations.Greetings": [
 *         { elmName: "goodDay", jsonName: "greetings.good day", type: "default", parameters: []},
 *         { elmName: "greetName", jsonName: "greetings.greet name", type: "default", parameters: [
 *           {elmName: "name", jsonName: "name"}
 *         ]}
 *       ]
 *     }
 * ```
 *
 * Function, module and parameters names are sanitised. Any duplicate modules or translations in the source JSON will
 * cause an error to be thrown as this is invalid.
 */
module.exports = (source, translationType = translationTypes.default) =>
    buildModel(source, translationType, {}, "Translations", "")
