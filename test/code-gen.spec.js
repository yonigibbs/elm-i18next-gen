"use strict"

const {expect} = require("chai")
const {EOL} = require("os")
const generateCode = require("../src/code-gen")
const {pathFromModuleName} = require("../src/elm-utils")

describe("code-gen", () => {
    it("should handle single file with one resources (no params)", () => test(
        {Translations: {hello: "Hello"}},
        {
            ["Translations"]: [`hello : Translations -> String
hello translations =
    t translations "hello"`]
        }))
})

const test = (model, expectedFiles) => {
    const actualFiles = generateCode(model)
    const expectedFilesBuilt = Object.keys(expectedFiles).reduce(
        (acc, module) => ({
            ...acc,
            [pathFromModuleName(module)]: getFileStart(module) + elmFunctionsArrayToString(expectedFiles[module]) + EOL
        }), {})
    expect(actualFiles).to.deep.equal(expectedFilesBuilt)
}

const elmFunctionsArrayToString = elmFunctions => elmFunctions.reduce(
    (module, fn) => module === "" ? fn : module + EOL + EOL + EOL + fn, "")

const getFileStart = moduleName => `module ${moduleName} exposing (..)

import I18Next exposing (Translations, t, tr)


`
