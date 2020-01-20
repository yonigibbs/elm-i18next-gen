"use strict"

const fs = require("fs-extra")
const path = require("path")

/**
 * Writes the content of the passed in files (see "./code-builder") to the file system at the passed in folder path.
 */
module.exports = (rootPath, files) => {
    Object.keys(files).forEach(filename => {
        const fullFilePath = path.join(rootPath, filename)
        const dirname = path.dirname(fullFilePath)
        fs.ensureDirSync(dirname)
        fs.writeFileSync(fullFilePath, files[filename])
    })
}