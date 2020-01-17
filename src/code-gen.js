"use strict"

const fs = require("fs")
const path = require("path")
const build = require("./model-builder")
const generateCode = require("./code-builder")
const writeFiles = require("./file-writer")

/**
 * The main entry point for the whole code-generation process. Reads the supplied sourceFile, builds up a model representing
 * the data in it, builds the code for this, and finally writes that code to the file system as the supplied targetFolder.
 *
 * Returns an object containing two properties:
 * * `isError`: boolean defining whether the operation succeeded or was not executed for some reason (e.g. invalid inputs).
 * * `msg`: an explanatory message
 *
 * Note that `isError` is used only for invalid inputs to this function. All other problems are handled simply by throwing
 * an exception.
 */
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
}