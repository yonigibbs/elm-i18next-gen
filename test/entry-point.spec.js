"use strict"

const {expect} = require("chai")
const os = require("os")
const path = require("path")
const {clearOutFolder} = require("./test-utils")
const executeCodeGeneration = require("../src/code-gen")
const {getAllFilesContent} = require("./test-utils")

const rootPath = path.join(os.tmpDir(), "i18n-unit-test/index")

describe("entry-point", () => {

    beforeEach(() => clearOutFolder(rootPath))

    it("generates sample file", () => {
        executeCodeGeneration(path.join(__dirname, "resources/sample1.json"), rootPath)
        expect(getAllFilesContent(rootPath)).to.deep.equal({
            "Translations.elm" : `module Translations exposing (..)

import I18Next exposing (Translations, t, tr, Curly)


hello : Translations -> String
hello translations =
    t translations "hello"


helloWithParams : Translations -> String -> String -> String -> String
helloWithParams translations firstname middlename lastname =
    tr translations Curly "helloWithParams" [ ( "firstname", firstname ), ( "middlename", middlename ), ( "lastname", lastname ) ]


greetings : Translations -> String
greetings translations =
    t translations "greetings"
`
        })
    })
})