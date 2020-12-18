"use strict"

const fs = require("fs-extra")
const path = require("path")
const buildModel = require("./model-builder")
const buildCode = require("./code-builder")
const writeFiles = require("./file-writer")
const UserError = require("./user-error")
const JsonError = require("./json-error")
const {translationTypes} = require("./translation-type-utils")

/**
 * Deletes all items from the passed in `parentFolder` which aren't in the passed in `generatedFiles`.
 *
 * @param pathRelativeToRoot The path of the passed in `parentFolder` relative to the root folder where the generated
 * folders will go.
 */
const deleteRemovedItems = (parentFolder, generatedFiles, pathRelativeToRoot) => {
    // First check if there are any generated items in this folder: if not, we can simply delete it.
    if (Object.keys(generatedFiles).some(fileName => fileName.startsWith(pathRelativeToRoot + path.sep))) {
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
                    fs.removeSync(fullChildPath)
            } else {
                // Child is a file: check if this file is found in the passed in list of generated files.
                const childFilePathRelativeToRoot = pathRelativeToRoot + path.sep + child
                if (!Object.keys(generatedFiles).some(fileName => fileName === childFilePathRelativeToRoot))
                    // Can delete this file: it's not been generated.
                    fs.unlinkSync(fullChildPath)
            }
        })
    } else
        // Nothing in this folder: delete it.
        fs.removeSync(parentFolder)
}

/** Parses the passed in JSON file and returns its content. Errors in parsing are reported in a JsonError */
const readSourceFile = filename => {
    try {
        return JSON.parse(fs.readFileSync(filename, "utf8"))
    } catch (err) {
        throw new JsonError(`file could not be parsed: ${err.message}`)
    }
}

/**
 * Decides whether the code generation process can proceed with the passed in target folder, in terms of overwriting it.
 * The process will generate a file called `Translations.elm` in this folder, and possibly create a `Translations` subfolder
 * with some files in it. This function will return `true` if there is no `Translations.elm` and the `Translations` folder
 * doesn't exist or is empty.
 */
const canOverwrite = targetFolder => {
    const translationsFile = path.join(targetFolder, "Translations.elm")
    const translationsFolder = path.join(targetFolder, "Translations")
    return !fs.existsSync(translationsFile) &&
        (!fs.existsSync(translationsFolder) || (
            fs.lstatSync(translationsFolder).isDirectory() && fs.readdirSync(translationsFolder).length === 0
        ))
}

/**
 * The main entry point for the whole code generation process. Reads the supplied sourceFile, builds up a model representing
 * the data in it, builds the code for this, and finally writes that code to the file system as the supplied targetFolder.
 */
module.exports = (
    sourceFile, targetFolder, overwrite = false, useFallbackLanguages = false, translationType = translationTypes.default
) => {
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
    else if (!overwrite && !canOverwrite(resolvedTargetFolder))
        // Target folder exists and has contents and overwrite flag isn't set.
        throw new UserError(`Translations already exist in specified target: ${resolvedTargetFolder}. Try again with the 'overwrite' flag?`)

    const source = readSourceFile(resolvedSourceFile)
    const model = buildModel(source, translationType)
    const files = buildCode(model, useFallbackLanguages, translationType)

    if (overwrite) {
        const submodulesFolder = path.join(resolvedTargetFolder, "Translations")
        if (fs.existsSync(submodulesFolder))
            // Delete any files/folders which exist in the file system and which are no longer in the generated files,
            // but only in child folders.
            deleteRemovedItems(submodulesFolder, files, "Translations")
    }

    writeFiles(resolvedTargetFolder, files)
}
