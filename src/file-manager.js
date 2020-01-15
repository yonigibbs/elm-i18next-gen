"use strict"

const fs = require("fs")
const path = require("path")

// TODO: add unit tests (create temp dir to work in?)

function getWriteFn(stream) {
    return content => {
        stream.write(content)
        return getWriteFn(stream)
    }
}

const getFileManager = rootPath => ({
    createFile: filename => {
        const stream = fs.createWriteStream(path.resolve(rootPath, filename))
        return getFileWriter(rootPath, stream)
    }
})

const getFileWriter = (rootPath, stream) => ({
    write: content => {
        stream.write(content)
        return getFileWriter(rootPath, stream)
    },
    close: () => {
        stream.end()
        return getFileManager(rootPath)
    }
})

module.exports = getFileManager