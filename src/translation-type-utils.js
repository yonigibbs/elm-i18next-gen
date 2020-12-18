"use strict"

/**
 * The three possible values for the `translationType` argument.
 */
const translationTypes = {
    default: "default",
    custom: "custom",
    both: "both"
}

/**
 * Gets a boolean indicating whether the supplied translation type means that functions using the default translation
 * functions (`t`/`tr`/'tf'/'trf') should be generated.
 */
const includesDefault = translationType =>
    translationType === translationTypes.default || translationType === translationTypes.both

/**
 * Gets a boolean indicating whether the supplied translation type means that functions using the custom translation
 * functions (`customTr`/`customTrf`) should be generated.
 */
const includesCustom = translationType =>
    translationType === translationTypes.custom || translationType === translationTypes.both

/**
 * Gets the name to use for the functions which use the custom translation functions (`customTr`/`customTrf`), when it
 * needs to be distinguished from the normal functions. Suffixes `Custom` to the supplied function name.
 */
const getCustomFunctionName = functionName => `${functionName}Custom`

module.exports = {translationTypes, includesDefault, includesCustom, getCustomFunctionName}
