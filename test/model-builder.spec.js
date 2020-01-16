"use strict"

const {expect} = require("chai")
const build = require("../src/model-builder")

describe("model-builder", () => {
    it("handles single file with one resources (no params)", () => {
        expect(build({"hello": "Hello"})).to.deep.equal({
            Translations: {hello: []}
        })
    })

    it("handles single file with one resource (one param)", () => {
        expect(build({"hello": "Hello {{name}}"})).to.deep.equal({
            Translations: {hello: ["name"]}
        })
    })

    it("handles single file with one resources (three params)", () => {
        expect(build({"hello": "Hello {{firstname}} {{middlename}} {{lastname}}!"})).to.deep.equal({
            Translations: {hello: ["firstname", "middlename", "lastname"]}
        })
    })

    it("ignores parameters with spaces", () => {
        expect(build({"hello": "Hello {{first name}}!"})).to.deep.equal({
            Translations: {hello: []}
        })
    })
})