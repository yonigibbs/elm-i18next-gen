"use strict"

const fs = require("fs")
const path = require("path")
const build = require("./model-builder")
const generateCode = require("./code-gen")
const writeFiles = require("./file-writer")

module.exports = (sourceFile, targetFolder) => {
    const resolvedSourceFile = path.resolve(sourceFile)
    if (!fs.existsSync(resolvedSourceFile))
        return {isError: true, msg: `The supplied source file does not exist: ${resolvedSourceFile}`}
    else if (fs.lstatSync(resolvedSourceFile).isDirectory())
        return {isError: true, msg: `The supplied source is a directory, not a file: ${resolvedSourceFile}`}
    else {
        const source = JSON.parse(fs.readFileSync(resolvedSourceFile, "utf8"))
        writeFiles(path.resolve(targetFolder), generateCode(build(source)))
        return {isError: false, msg: `Code generated at ${targetFolder}`}
    }

    // TODO: handle checking the supplied target folder.
    // TODO: take in arg for what to do if target folder exists?
}