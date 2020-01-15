"use strict"

const expect = require("chai").expect
const write = require("../src/writer")
const eol = require("os").EOL
const moduleNameFromPath = require("../src/elm-utils").moduleNameFromPath

describe("write", () => {
    it("should handle single file with one resources (no params)", () => test(
        {Translations: {hello: "Hello"}},
        {
            ["Translations.elm"]: [`hello : Translations -> String
hello translations =
    t translations "hello"`]
        }))
})

const test = (model, expectedFiles) => {
    const {files} = write(model, getMockFileManager({}))
    const expectedFilesText = Object.keys(expectedFiles).reduce(
        (acc, filename) => ({
            ...acc,
            [filename]: getFileStart(moduleNameFromPath(filename)) + elmFunctionsArrayToString(expectedFiles[filename]) + eol
        }), {})
    expect(files).to.deep.equal(expectedFilesText)
}

const elmFunctionsArrayToString = elmFunctions => elmFunctions.reduce(
    (module, fn) => module === "" ? fn : module + eol + eol + eol + fn, "")

const getFileStart = moduleName => `module ${moduleName} exposing (..)

import I18Next exposing (Translations, t, tr)


`

const hasFile = (files, filename) => !!files[filename] || files[filename] === ""

const getWriteFn = (files, filename) => content => {
    if (hasFile(files, filename))
        return getFileWriter({...files, [filename]: files[filename] + content}, filename)
    else
        throw Error(`file ${filename} not found`)
}

const getCloseFn = (files, filename) => {
    if (hasFile(files, filename)) return () => getMockFileManager(files)
    throw Error(`file ${filename} not found`)
}

const getFileWriter = (files, filename) => ({
    write: getWriteFn(files, filename),
    close: getCloseFn(files, filename)
})

const getMockFileManager = files => ({
    createFile: filename => {
        if (hasFile(files, filename)) throw Error(`file ${filename} already exists`)
        return getFileWriter({...files, [filename]: ""}, filename)
    },

    files
})
