"use strict"

const fs = require("fs-extra")
const path = require("path")

/**
 * Gets all files under the passed in path, recursively. Returns an array of the files, each one's value being its path
 * relative to the passed in path.
 */
const getAllFiles = parent =>
    fs.readdirSync(parent)
        .flatMap(child => {
            const fullChildPath = path.join(parent, child)
            return fs.lstatSync(fullChildPath).isDirectory()
                ? getAllFiles(fullChildPath).map(subChild => path.join(child, subChild))
                : child
        })

/**
 * Gets an object containing a property for each file under the passed in path (recursive), where the property's name
 * is the name of that file relative to the passed in path, and its value is the content of that file.
 */
const getAllFilesContent = parent =>
    getAllFiles(parent).reduce(
        (acc, cur) => ({...acc, [cur]: fs.readFileSync(path.join(parent, cur), "utf8")}),
        {}
    )

module.exports = {
    getAllFiles,
    getAllFilesContent
}