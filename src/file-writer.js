"use strict"

const fs = require("fs-extra")
const path = require("path")
const UserError = require("./user-error")

/**
 * Writes the content of the passed in files (see "./code-builder") to the file system at the passed in folder path.
 * Also responsible for deleted items
 */
module.exports = (rootPath, files) => {
    Object.keys(files).forEach(filename => {
        const fullFilePath = path.join(rootPath, filename)
        const dirname = path.dirname(fullFilePath)
        fs.ensureDirSync(dirname)

        const exists = fs.existsSync(fullFilePath)

        if (exists && fs.lstatSync(fullFilePath).isDirectory())
            // Exists, but is a folder: throw an error
            throw new UserError(`Tried to write to file but couldn't because it exists as a folder: '${fullFilePath}'`)

        // Before writing this content out read the existing content: if nothing's changed, don't write the content out
        // to avoid unnecessary changes in git, file dates, etc.
        if (!exists || fs.readFileSync(fullFilePath) !== files[filename])
            fs.writeFileSync(fullFilePath, files[filename])
    })
}