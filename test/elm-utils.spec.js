"use strict"

const {expect} = require("chai")
const {moduleNameFromPath} = require("../src/elm-utils")

describe("elm-utils", () => {
    describe("moduleNameFromPath", () => {
        it("handles file with no directory", () => {
            expect(moduleNameFromPath("MyModule.elm")).to.equal("MyModule")
        })

        it("handles file with one directory", () => {
            expect(moduleNameFromPath("Parent/MyModule.elm")).to.equal("Parent.MyModule")
        })

        it("handles file with two directories", () => {
            expect(moduleNameFromPath("Parent1/Parent2/MyModule.elm")).to.equal("Parent1.Parent2.MyModule")
        })

        // TODO: more tests, e.g. what about invalid files, files with no extensions, leading/trailing slashes, etc.

        // TODO: tests for pathFromModuleName
    })
})
