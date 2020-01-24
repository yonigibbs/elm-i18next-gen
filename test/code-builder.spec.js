"use strict"

const {expect} = require("chai")
const generateCode = require("../src/code-builder")
const {buildFileStart, pathFromModuleName} = require("../src/elm-utils")

describe("code-builder", () => {
    it("handles single file with one resource (no params)", () => test(
        {Translations: [{elmName: "hello", jsonName: "hello", parameters: []}]},
        {
            ["Translations"]: [`hello : Translations -> String
hello translations =
    t translations "hello"`]
        }))

    it("handles single file with one resource (one param)", () => test(
        {Translations: [{elmName: "hello", jsonName: "hello", parameters: [{elmName: "name", jsonName: "name"}]}]},
        {
            ["Translations"]: [`hello : Translations -> String -> String
hello translations name =
    tr translations Curly "hello" [ ( "name", name ) ]`]
        }))

    it("handles single file with one resource (three params)", () => test(
        {
            Translations: [{
                elmName: "hello", jsonName: "hello", parameters: [
                    {elmName: "firstname", jsonName: "firstname"},
                    {elmName: "middlename", jsonName: "middlename"},
                    {elmName: "lastname", jsonName: "lastname"}
                ]
            }]
        },
        {
            ["Translations"]: [`hello : Translations -> String -> String -> String -> String
hello translations firstname middlename lastname =
    tr translations Curly "hello" [ ( "firstname", firstname ), ( "middlename", middlename ), ( "lastname", lastname ) ]`]
        }))
})

// Note that below we use "\n" rather than require("os").EOL because multiline string literals have "\n" in them even on
// Windows. So to keep this consistent, just use "\n". If this becomes a problem we can swap from using multiline string
// literals to single line ones and build multiline strings using EOL.

const test = (model, expectedFiles) => {
    const actualFiles = generateCode(model)
    const expectedFilesBuilt = Object.keys(expectedFiles).reduce(
        (acc, module) => ({
            ...acc,
            [pathFromModuleName(module)]: buildFileStart(module) + elmFunctionsArrayToString(expectedFiles[module]) + "\n"
        }), {})
    expect(actualFiles).to.deep.equal(expectedFilesBuilt)
}

const elmFunctionsArrayToString = elmFunctions =>
    elmFunctions.reduce(
        (module, fn) => module + "\n\n" + fn,
        "")
