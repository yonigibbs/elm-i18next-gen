"use strict"

const path = require("path")

// TODO: is this only ever used in tests?  If so move to test folder.
exports.moduleNameFromPath = filePath => {
    const {dir, name} = path.parse(filePath)
    return dir
        ? dir.split(path.sep).filter(s => s).join(".") + "." + name
        : name
}