"use strict"

const path = require("path")

/**
 * Returns the name of the Elm module to use for a file at the supplied path. e.g. for `"Translations/Greetings.elm"` the
 * returned value is `"Translations.Greetings"`.
 */
const moduleNameFromPath = filePath => {
    const {dir, name} = path.parse(filePath)
    return dir
        ? dir.split(path.sep).filter(s => !!s).join(".") + "." + name
        : name
}

/**
 * Returns the path to use for a file containing the code for the passed in module. e.g. for `"Translations.Greetings"` the
 * returned value is `"Translations/Greetings.elm"`.
 */
const pathFromModuleName = moduleName => moduleName.replace(".", path.sep) + ".elm"

module.exports = {
    moduleNameFromPath,
    pathFromModuleName
}