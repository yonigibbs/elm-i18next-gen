"use strict"

const {expect} = require("chai")
const path = require("path")
const {moduleNameFromPath, pathFromModuleName} = require("../src/elm-utils")

describe("elm-utils", () => {
    describe("moduleNameFromPath", () => {
        it("handles file with no directory", () =>
            expect(moduleNameFromPath("MyModule.elm")).to.equal("MyModule"))

        it("handles file with one directory", () =>
            expect(moduleNameFromPath(path.join("Parent", "MyModule.elm"))).to.equal("Parent.MyModule"))

        it("handles file with two directories", () =>
            expect(moduleNameFromPath(path.join("Parent1", "Parent2", "MyModule.elm"))).to.equal("Parent1.Parent2.MyModule"))

        it("handles file with no extension", () =>
            expect(moduleNameFromPath("MyModule")).to.equal("MyModule"))

        it("handles path with leading/trailing slashes", () =>
            expect(moduleNameFromPath(path.sep + "MyModule" + path.sep)).to.equal("MyModule"))
    })

    describe("pathFromModuleName", () => {
        it("handles top-level module", () => {
            expect(pathFromModuleName("MyModule")).to.equal("MyModule.elm")
        })

        it("handles nested module", () => {
            expect(pathFromModuleName("Parent.MyModule")).to.equal(path.join("Parent", "MyModule.elm"))
        })

        it("handles sub nested module", () => {
            expect(pathFromModuleName("Parent1.Parent2.MyModule")).to.equal(path.join("Parent1", "Parent2", "MyModule.elm"))
        })
    })
})
