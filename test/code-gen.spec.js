const describe = require("mocha").describe
const it = require("mocha").it
const expect = require("chai").expect
const eol = require("os").EOL
const generateCode = require("../src/code-gen")

function getMockWriter(files) {
    const write = (fileName, content) => {
        const newContent = !!files[fileName] ? files[fileName] + content : content
        const newFiles = {...files, [fileName]: newContent}
        return getMockWriter(newFiles)
    }
    return {write, files}
}

const getFileStart = moduleName => `module ${moduleName} exposing (..)

import I18Next exposing (Translations, t, tr)


`

const elmFunctionsArrayToString = elmFunctions => elmFunctions.reduce(
    (module, fn) => module === "" ? fn : module + eol + eol + eol + fn, "")

const test = (source, expected) => {
    const writer = generateCode(source, getMockWriter({}))
    const expectedFiles = Object.keys(expected).reduce(
        (acc, module) => (
            {...acc, [module]: getFileStart(module) + elmFunctionsArrayToString(expected[module]) + eol}
        ), {})
    expect(writer.files).to.deep.equal(expectedFiles)
}

describe("code-generator", () => {
    it("should handle single file with one resources (no params)", () => {
        test({"hello": "Hello"}, {
            Translations: [`hello : Translations -> String
hello translations =
    t translations "hello"`]
        })
    })

    it("should handle single file with multiple resources (no params)", () => {
        test({"res1": "Resource 1", "res2": "Resource 2", "res3": "Resource 3"}, {
            Translations: [`res1 : Translations -> String
res1 translations =
    t translations "res1"`,

                `res2 : Translations -> String
res2 translations =
    t translations "res2"`,

                `res3 : Translations -> String
res3 translations =
    t translations "res3"`]
        })
    })
})
