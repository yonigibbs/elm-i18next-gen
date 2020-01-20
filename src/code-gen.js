"use strict"

const fs = require("fs-extra")
const path = require("path")
const build = require("./model-builder")
const generateCode = require("./code-builder")
const writeFiles = require("./file-writer")
const UserError = require("./user-error")

/**
 * The main entry point for the whole code-generation process. Reads the supplied sourceFile, builds up a model representing
 * the data in it, builds the code for this, and finally writes that code to the file system as the supplied targetFolder.
 */
module.exports = (sourceFile, targetFolder, overwrite = false) => {
    const resolvedSourceFile = path.resolve(sourceFile)
    if (!fs.existsSync(resolvedSourceFile))
        throw new UserError(`The supplied source file does not exist: ${resolvedSourceFile}`)
    if (!fs.lstatSync(resolvedSourceFile).isFile())
        throw new UserError(`The supplied source file is not a file: ${resolvedSourceFile}`)

    const resolvedTargetFolder = path.resolve(targetFolder)
    if(!fs.existsSync(resolvedTargetFolder))
        // Path doesn't exist: create it
        fs.mkdirpSync(resolvedTargetFolder)
    else if (!fs.lstatSync(resolvedTargetFolder).isDirectory())
        throw new UserError(`The supplied target folder is not a directory: ${resolvedTargetFolder}`)
    else if (fs.readdirSync(resolvedTargetFolder).length > 0) {
        // Target folder exists and has contents
        if (overwrite)
            fs.emptyDirSync(resolvedTargetFolder)
        else
            throw new UserError(`Specified target folder is not empty: ${resolvedTargetFolder}`)
    }

    const source = JSON.parse(fs.readFileSync(resolvedSourceFile, "utf8"))
    writeFiles(resolvedTargetFolder, generateCode(build(source)))
}