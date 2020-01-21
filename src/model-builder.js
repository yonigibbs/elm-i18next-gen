"use strict"

const JsonError = require("./json-error")

/** Returns a copy of the passed in string with the first letter capitalised/decapitalised, based on the `caps` param. */
const caseFirstLetter = (s, caps) => {
    const firstChar = s.charAt(0)
    const casedFirstChar = caps?firstChar.toUpperCase():firstChar.toLowerCase()
    return casedFirstChar + s.slice(1)
}

/** The regular expression used to find illegal Elm characters (i.e. characters that aren't letters, numbers or underscores. */
const illegalCharRegex = /[^\w]+/gi

/** Returns a copy of the passed in string, with illegal chars (or a contiguous set of them) replaced by an underscore. */
const removeIllegalChars = s => s.replace(illegalCharRegex, "_")

/**
 * Returns a sanitised version of the passed in string. Trims it, removes white space, replaces illegal characters with
 * underscore, and capitalises the first letter of each words (potentially treating the first word differently based on
 * the `casing` argument).
 *
 * If first character is not a letter an exception is thrown (functions, modules, parameters) all need the first character
 * to be a letter.
 *
 * @param casing "pascal" or "camel".
 */
const sanitise = (unsanitised, casing) => {
    const trimmed = unsanitised.trim()
    const firstChar = trimmed.charAt(0)
    if (!firstChar)
        throw new JsonError("an entry with no ID was found.")
    if (!firstChar.match(/[a-z]/i))
        throw new JsonError(`'${trimmed}' is not a valid name for an Elm module/function/parameter. The first character must be a letter.`)

    return unsanitised
        .split(/\s+/) // Split by white space
        .map(word => word.trim()) // Trim each value
        .filter(word => word) // Remove empty entries
        .map((word, index) => {
            // Capitalise first letter of each word - first word treated a bit differently if using camel casing
            const caps = index > 0 || casing === "pascal"
            return caseFirstLetter(word, caps)
        })
        .map(removeIllegalChars)
        .join("")
}

const sanitiseModuleName = unsanitised => sanitise(unsanitised, "pascal")
const sanitiseFunctionName = unsanitised => sanitise(unsanitised, "camel")
const sanitiseParameterName = unsanitised => sanitise(unsanitised, "camel")

/** The regular expression that finds parameters in a translated text. */
const paramRegex = /{{(.+?)}}/g

/** Parses the parameters from the passed in text and returns an array containing the parameters. */
const parseParams = translationText => {
    let match
    const params = []
    while ((match = paramRegex.exec(translationText)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === paramRegex.lastIndex)
            paramRegex.lastIndex++

        if (match.length === 2) {
            if (match[1].trim().length> 0)
                params.push({elmName: sanitiseParameterName(match[1]), jsonName: match[1]})
        }
    }
    // TODO: what about same placeholder used multiple times in same string?
    return params
}

/**
 * See documentation on default export below. Does what it says, but allowing the accumulated model and module name to be
 * passed in, so this function can call itself recursively.
 */
const buildModel = (source, initialModel, moduleName, moduleJsonPath) => Object.keys(source).reduce(
    // TODO: trap error and wrap/throw to add information about which key caused the problem.
    (accModel, sourcePropKey) => {
        const sourcePropValue = source[sourcePropKey]
        const jsonName = moduleJsonPath ? `${moduleJsonPath}.${sourcePropKey}` : sourcePropKey
        if (typeof sourcePropValue === "string") {
            // Just a string: add a property to the current module in the current model.
            const module = accModel[moduleName] || []
            const fn = {
                elmName: sanitiseFunctionName(sourcePropKey),
                jsonName,
                parameters: parseParams(sourcePropValue)
            }
            return {...accModel, [moduleName]: [...module, fn]}
        } else {
            // This key in the source groups together a bunch of children: create a new module for these.
            return buildModel(sourcePropValue, accModel, `${moduleName}.${sanitiseModuleName(sourcePropKey)}`, jsonName)
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
 *         { elmName: "hello", jsonName: "hello", parameters: []},
 *         { elmName: "helloWithParams", jsonName: "helloWithParams", parameters: [
 *           {elmName: "firstName", jsonName: "first name"},
 *           {elmName: "middleName", jsonName: "middle name"},
 *           {elmName: "lastName", jsonName: "last name"},
 *         ]}
 *       ]
 *       "Translations.Greetings": [
 *         { elmName: "goodDay", jsonName: "greetings.good day", parameters: []},
 *         { elmName: "greetName", jsonName: "greetings.greet name", parameters: [
 *           {elmName: "name", jsonName: "name"}
 *         ]}
 *       ]
 *     }
 * ```
 *
 * Function, module and parameters names are sanitised. Any duplicate modules or translations in the source JSON will
 * cause an error to be thrown as this is invalid.
 */
module.exports = source => buildModel(source, {}, "Translations", "")