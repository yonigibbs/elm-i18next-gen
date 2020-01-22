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

        // TODO: check what happens if file path exists, but is a folder rather than a file.

        // Before writing this content out read the existing content: if nothing's changed, don't write the content out
        // to avoid unnecessary changes in git, file dates, etc.
        if (!fs.existsSync(fullFilePath) || fs.readFileSync(fullFilePath) !== files[filename])
            fs.writeFileSync(fullFilePath, files[filename])
    })
}