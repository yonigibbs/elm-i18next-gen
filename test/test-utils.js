"use strict"

const fs = require("fs")
const path = require("path")

const clearOutFolder = folderPath => {
    if (fs.existsSync(folderPath))
        fs.rmdirSync(folderPath, {recursive: true})
    fs.mkdirSync(folderPath, {recursive: true})
}

const getAllFiles = parent =>
    fs.readdirSync(parent)
        .flatMap(child => {
            const fullChildPath = path.join(parent, child)
            return fs.lstatSync(fullChildPath).isDirectory()
                ? getAllFiles(fullChildPath).map(subChild => path.join(child, subChild))
                : child
        })

const getAllFilesContent = parent =>
    getAllFiles(parent).reduce(
        (acc, cur) => ({...acc, [cur]: fs.readFileSync(path.join(parent, cur), "utf8")}),
        {}
    )

module.exports = {
    clearOutFolder,
    getAllFiles,
    getAllFilesContent
}