"use strict"

const {expect} = require("chai")
const build = require("../src/model-builder")

describe("model-builder", () => {
    it("should handle single file with one resources (no params)", () => {
        expect(build({"hello": "Hello"})).to.deep.equal({
            Translations: {
                hello: {}
            }
        })
    })
})