"use strict"

const fs = require("fs")
const path = require("path")

module.exports = (rootPath, files) => {
    Object.keys(files).forEach(filename => {
        const fullFilePath = path.join(rootPath, filename)
        const dirname = path.dirname(fullFilePath)
        // TODO: handle case where this exists, but is a file.
        if (!fs.existsSync(dirname))
            fs.mkdirSync(dirname, {recursive: true})
        fs.writeFileSync(fullFilePath, files[filename])
    })
}