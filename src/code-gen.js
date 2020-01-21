"use strict"

const fs = require("fs-extra")
const path = require("path")
const build = require("./model-builder")
const generateCode = require("./code-builder")
const writeFiles = require("./file-writer")
const UserError = require("./user-error")

/**
 * Deletes all items from the passed in `parentFolder` which aren't in the passed in `generatedFiles`.
 *
 * @param pathRelativeToRoot The path of the passed in `parentFolder` relative to the root folder where the generated
 * folders will go.
 */
const deleteRemovedItems = (parentFolder, generatedFiles, pathRelativeToRoot) => {
    fs.readdirSync(parentFolder).forEach(child => {
        const fullChildPath = path.join(parentFolder, child)
        if (fs.lstatSync(fullChildPath).isDirectory()) {
            // Child is a directory: check if there are any files that are in it and, if not, delete the whole directory.

            // Define the path that any generated file would start with if it's to be considered under this directory.
            const generatedFilePrefix = pathRelativeToRoot + path.sep + child + path.sep
            if (Object.keys(generatedFiles).some(fileName => fileName.startsWith(generatedFilePrefix)))
                // There are some files we need to generate in this folder: keep it, but check inside it in case it has
                // further children which should be deleted.
                deleteRemovedItems(fullChildPath, generatedFiles, child)
            else
                fs.rmdirSync(fullChildPath, {recursive: true})
        } else {
            // Child is a file: check if this file is found in the passed in list of generated files.
            const childFilePathRelativeToRoot = pathRelativeToRoot + path.sep + child
            if (!Object.keys(generatedFiles).some(fileName => fileName === childFilePathRelativeToRoot))
                // Can delete this file: it's not been generated.
                fs.unlinkSync(fullChildPath)
        }
    })
}

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
    if (!fs.existsSync(resolvedTargetFolder))
        // Path doesn't exist: create it
        fs.mkdirpSync(resolvedTargetFolder)
    else if (!fs.lstatSync(resolvedTargetFolder).isDirectory())
        throw new UserError(`The supplied target folder is not a directory: ${resolvedTargetFolder}`)
    else if (fs.readdirSync(resolvedTargetFolder).length > 0 && !overwrite)
        // Target folder exists and has contents and overwrite flag isn't set.
        throw new UserError(`Specified target folder is not empty: ${resolvedTargetFolder}`)

    const source = JSON.parse(fs.readFileSync(resolvedSourceFile, "utf8"))
    const files = generateCode(build(source))

    if (overwrite) {
        const submodulesFolders = path.join(resolvedTargetFolder, "Translations")
        if (fs.existsSync(submodulesFolders))
            // Delete any files/folders which exist in the file system and which are no longer in the generated files,
            // but only in child folders.
            deleteRemovedItems(submodulesFolders, files, "Translations")
    }

    writeFiles(resolvedTargetFolder, files)
}