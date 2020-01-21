"use strict"

const {expect, assert} = require("chai")
const os = require("os")
const fs = require("fs-extra")
const path = require("path")
const executeCodeGeneration = require("../src/code-gen")
const {getAllFilesContent} = require("./test-utils")
const UserError = require("../src/user-error")

const sourceFile = path.join(__dirname, "resources/sample1.json")
const targetFolder = path.join(os.tmpDir(), "i18n-unit-test/code-gen")

describe("code-gen", () => {

    beforeEach(() => fs.emptyDirSync(targetFolder))

    it("generates sample file", () => {
        executeCodeGeneration(sourceFile, targetFolder)
        expect(getAllFilesContent(targetFolder)).to.deep.equal(sampleFileContent)
    })

    it("ignores empty modules", () => {
        executeCodeGeneration(path.join(__dirname, "resources/empty-modules.json"), targetFolder)
        expect(getAllFilesContent(targetFolder)).to.deep.equal(emptyModulesFileContent)
    })

    it("rejects missing source file", () => {
        const sourceFile = path.join(__dirname, "resources/missing-file.json")
        assert.throws(
            () => executeCodeGeneration(sourceFile, targetFolder),
            UserError,
            `The supplied source file does not exist: ${sourceFile}`)
    })

    it("rejects source file if it's a folder", () => {
        const sourceFile = path.join(targetFolder, "the-folder")
        fs.mkdirSync(sourceFile)
        assert.throws(
            () => executeCodeGeneration(sourceFile, targetFolder),
            UserError,
            `The supplied source file is not a file: ${sourceFile}`)
    })

    it("creates folder structure file", () => {
        const customTargetFolder = path.join(targetFolder, "some", "extra", "folder")
        executeCodeGeneration(sourceFile, customTargetFolder)
        expect(getAllFilesContent(customTargetFolder)).to.deep.equal(sampleFileContent)
    })

    it("rejects target folder if it's a file", () => {
        const fileThatShouldBeFolder = path.join(targetFolder, "file")
        fs.writeFileSync(fileThatShouldBeFolder, "Test")
        assert.throws(
            () => executeCodeGeneration(sourceFile, fileThatShouldBeFolder),
            UserError,
            `The supplied target folder is not a directory: ${fileThatShouldBeFolder}`)
    })

    it("rejects target folder if it's empty and not overwriting", () => {
        fs.mkdirpSync(path.join(targetFolder, "some-folder"))
        assert.throws(
            () => executeCodeGeneration(sourceFile, targetFolder),
            UserError,
            `Specified target folder is not empty: ${targetFolder}`)
    })

    it("overwrites target folder if overwriting", () => {
        // Create a folder (with children) which should be deleted as it's not in the new set of files.
        const deletedFolder = path.join(targetFolder, "folder-which-should-be-deleted")
        const deletedSubfolder = path.join(deletedFolder, "subfolder")
        fs.mkdirpSync(deletedSubfolder, {recursive: true})
        fs.writeFileSync(path.join(deletedFolder, "file1.txt"), "Test")
        fs.writeFileSync(path.join(deletedSubfolder, "file2.txt"), "Test")

        // Create a folderwhich should NOT be delete as there are files in the new set of files which will go in this
        // folder. But create a further subfolder and file under it which WILL be deleted.
        fs.writeFileSync(path.join(targetFolder, "Translations.elm"), "Test")
        const submoduleFolder = path.join(targetFolder, "Translations")
        fs.mkdirpSync(submoduleFolder)
        fs.writeFileSync(path.join(submoduleFolder, "Greetings.elm"), "Test")
        fs.writeFileSync(path.join(submoduleFolder, "should-be-deleted.txt-1"), "Test")
        fs.writeFileSync(path.join(submoduleFolder, "should-be-deleted.txt-2"), "Test")
        const deleteSubmoduleFolder = path.join(submoduleFolder, "should-be-deleted")
        fs.mkdirpSync(deleteSubmoduleFolder)
        fs.writeFileSync(path.join(deleteSubmoduleFolder, "should-be-deleted.txt-3"), "Test")
        fs.writeFileSync(path.join(deleteSubmoduleFolder, "should-be-deleted.txt-4"), "Test")

        executeCodeGeneration(sourceFile, targetFolder, true)
        expect(getAllFilesContent(targetFolder)).to.deep.equal(sampleFileContent)

        // Also make sure the folders are exactly as we'd expect, i.e. there's only a Translations folder, which no other
        // subfolders anywhere, as they should all have been deleted.
        expect(fs.readdirSync(targetFolder)
            .filter(f => fs.lstatSync(path.join(targetFolder, f)).isDirectory()))
            .to.deep.equal(["Translations"])
        expect(fs.readdirSync(submoduleFolder)
            .filter(f => fs.lstatSync(path.join(submoduleFolder, f)).isDirectory()))
            .to.be.empty
    })
})

/**
 * An object containing the files with the Elm code expected to be generated for the sample JSON file.
 */
const sampleFileContent = {
    // Top level module
    "Translations.elm": `module Translations exposing (..)

import I18Next exposing (Translations, t, tr, Curly)


hello : Translations -> String
hello translations =
    t translations "hello"


helloWithParams : Translations -> String -> String -> String -> String
helloWithParams translations firstname middlename lastname =
    tr translations Curly "helloWithParams" [ ( "firstname", firstname ), ( "middlename", middlename ), ( "lastname", lastname ) ]
`,

    // Nested module
    "Translations/Greetings.elm": `module Translations.Greetings exposing (..)

import I18Next exposing (Translations, t, tr, Curly)


goodDay : Translations -> String
goodDay translations =
    t translations "goodDay"


greetName : Translations -> String -> String
greetName translations name =
    tr translations Curly "greetName" [ ( "name", name ) ]
`
}

/**
 * An object containing the files with the Elm code expected to be generated for the empty-modules JSON file.
 */
const emptyModulesFileContent = {
    // Top level module
    "Translations/ModuleWithSubmodulesOnly/Greetings.elm": `module Translations.ModuleWithSubmodulesOnly.Greetings exposing (..)

import I18Next exposing (Translations, t, tr, Curly)


goodDay : Translations -> String
goodDay translations =
    t translations "goodDay"
`
}
