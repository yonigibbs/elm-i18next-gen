"use strict"

const path = require("path")

const moduleNameFromPath = filePath => {
    const {dir, name} = path.parse(filePath)
    return dir
        ? dir.split(path.sep).filter(s => !!s).join(".") + "." + name
        : name
}

const pathFromModuleName = moduleName => moduleName.replace(".", path.sep) + ".elm"

module.exports = {
    moduleNameFromPath,
    pathFromModuleName
}