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

    it("empties target folder if overwriting", () => {
        fs.mkdirpSync(path.join(targetFolder, "some-folder"))
        executeCodeGeneration(sourceFile, targetFolder, true)
        expect(getAllFilesContent(targetFolder)).to.deep.equal(sampleFileContent)
    })
})

/** An object containing the files with the Elm code expected to be generated for the sample JSON file. */
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