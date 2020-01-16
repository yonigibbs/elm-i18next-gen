"use strict"

const {expect} = require("chai")
const path = require("path")
const {clearOutFolder} = require("./test-utils")
const executeCodeGeneration = require("../src/entry-point")
const {getAllFilesContent} = require("./test-utils")

const rootPath = "/tmp/i18n-unit-test/index"

describe("entry-point", () => {

    beforeEach(() => clearOutFolder(rootPath))

    it("generates sample file", () => {
        executeCodeGeneration(path.join(__dirname, "resources/sample1.json"), rootPath)
        expect(getAllFilesContent(rootPath)).to.deep.equal({
            "Translations.elm" : `module Translations exposing (..)

import I18Next exposing (Translations, t, tr)


hello : Translations -> String
hello translations =
    t translations "hello"


greetings : Translations -> String
greetings translations =
    t translations "greetings"
`
        })
    })
})