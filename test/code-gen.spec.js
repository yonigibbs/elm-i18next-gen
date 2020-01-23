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

        const createNestedFolderStructure = parent => {
            const childFolder = path.join(parent, "child")
            const grandchildFolder = path.join(childFolder, "grandchild")
            fs.mkdirpSync(grandchildFolder, {recursive: true})
            fs.writeFileSync(path.join(childFolder, "file1.txt"), "Test")
            fs.writeFileSync(path.join(grandchildFolder, "file2.txt"), "Test")
        }

        const translationsFolder = path.join(targetFolder, "Translations")
        const greetingsFolder = path.join(translationsFolder, "Greetings")
        const furtherGreetingsFolder = path.join(greetingsFolder, "FurtherGreetings")
        fs.mkdirpSync(furtherGreetingsFolder)

        // Create some files which should be overwritten
        fs.writeFileSync(path.join(targetFolder, "Translations.elm"), "Test")
        fs.writeFileSync(path.join(translationsFolder, "Greetings.elm"), "Test")
        fs.writeFileSync(path.join(greetingsFolder, "FurtherGreetings.elm"), "Test")

        // Create a file and folder at the top level and make sure they aren't touched
        fs.mkdirpSync(path.join(targetFolder, "SomethingElse"))
        fs.writeFileSync(path.join(targetFolder, "SomethingElse.elm"), "Test")

        // Create a folder (with children) under "Translations" which SHOULD be deleted as it's not in the new set of files.
        createNestedFolderStructure(translationsFolder)

        // Create a folder (with children) under "Translations/Greetings" which SHOULD be deleted as it's not in the new set of files.
        createNestedFolderStructure(greetingsFolder)

        executeCodeGeneration( path.join(__dirname, "resources/nested-modules.json"), targetFolder, true)
        expect(getAllFilesContent(targetFolder)).to.deep.equal({...nestedModulesFileContent, ["SomethingElse.elm"]: "Test"})

        // Also make sure the folders are exactly as we'd expect (i.e. all folders we expected to delete have been deleted).
        const ensureFolder = (folder, expectedSubfolders) =>
            expect(fs.readdirSync(folder)
                .filter(child => fs.lstatSync(path.join(folder, child)).isDirectory()))
                .to.have.members(expectedSubfolders)

        ensureFolder(targetFolder, ["Translations", "SomethingElse"])
        ensureFolder(translationsFolder, ["Greetings"])
        ensureFolder(greetingsFolder, [])
    })
})

/**
 * An object containing the files with the Elm code expected to be generated for the sample JSON file.
 */
const sampleFileContent = {
    // Top level module
    "Translations.elm": `-- Do not manually edit this file, it was auto-generated by yonigibbs/elm-i18next-code-gen
-- https://github.com/yonigibbs/elm-i18next-code-gen


module Translations exposing (..)

import I18Next exposing (Translations, t, tr, Delims(..))


hello : Translations -> String
hello translations =
    t translations "hello"


helloWithParams : Translations -> String -> String -> String -> String
helloWithParams translations firstname middlename lastname =
    tr translations Curly "helloWithParams" [ ( "firstname", firstname ), ( "middlename", middlename ), ( "lastname", lastname ) ]
`,

    // Nested module
    "Translations/Greetings.elm": `-- Do not manually edit this file, it was auto-generated by yonigibbs/elm-i18next-code-gen
-- https://github.com/yonigibbs/elm-i18next-code-gen


module Translations.Greetings exposing (..)

import I18Next exposing (Translations, t, tr, Delims(..))


goodDay : Translations -> String
goodDay translations =
    t translations "greetings.goodDay"


greetName : Translations -> String -> String
greetName translations name =
    tr translations Curly "greetings.greetName" [ ( "name", name ) ]
`
}

/**
 * An object containing the files with the Elm code expected to be generated for the empty-modules JSON file.
 */
const emptyModulesFileContent = {
    "Translations/ModuleWithSubmodulesOnly/Greetings.elm": `-- Do not manually edit this file, it was auto-generated by yonigibbs/elm-i18next-code-gen
-- https://github.com/yonigibbs/elm-i18next-code-gen


module Translations.ModuleWithSubmodulesOnly.Greetings exposing (..)

import I18Next exposing (Translations, t, tr, Delims(..))


goodDay : Translations -> String
goodDay translations =
    t translations "moduleWithSubmodulesOnly.greetings.goodDay"
`
}

/**
 * An object containing the files with the Elm code expected to be generated for the nested-modules JSON file.
 */
const nestedModulesFileContent = {
    // Top level module
    "Translations.elm": `-- Do not manually edit this file, it was auto-generated by yonigibbs/elm-i18next-code-gen
-- https://github.com/yonigibbs/elm-i18next-code-gen


module Translations exposing (..)

import I18Next exposing (Translations, t, tr, Delims(..))


hello : Translations -> String
hello translations =
    t translations "hello"
`,

    // First level nested child
    "Translations/Greetings.elm": `-- Do not manually edit this file, it was auto-generated by yonigibbs/elm-i18next-code-gen
-- https://github.com/yonigibbs/elm-i18next-code-gen


module Translations.Greetings exposing (..)

import I18Next exposing (Translations, t, tr, Delims(..))


goodDay : Translations -> String
goodDay translations =
    t translations "greetings.goodDay"
`,

    // Second level nested child
    "Translations/Greetings/FurtherGreetings.elm": `-- Do not manually edit this file, it was auto-generated by yonigibbs/elm-i18next-code-gen
-- https://github.com/yonigibbs/elm-i18next-code-gen


module Translations.Greetings.FurtherGreetings exposing (..)

import I18Next exposing (Translations, t, tr, Delims(..))


anotherGreeting : Translations -> String
anotherGreeting translations =
    t translations "greetings.furtherGreetings.anotherGreeting"
`
}
