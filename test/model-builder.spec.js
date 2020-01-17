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

    it("handles single submodule (no params)", () => {
        expect(build({
            hello: "Hello",
            greetings: {
                goodDay: "Good Day."
            }
        })).to.deep.equal({
            Translations: {
                hello: []
            }, "Translations.Greetings": {
                goodDay: []
            }
        })
    })

    it("handles multiple submodules (with and without params)", () => {
        expect(build({
            hello: "Hello",
            helloWithParams: "Hello {{firstname}} {{middlename}} {{lastname}}!",
            greetings: {
                goodDay: "Good Day.",
                welcome: "Hi {{name}}. Welcome to {{place}}.",
                subNested: {
                    sn1: "SN1",
                    subSubNested: {
                        ssn1: "SSN1",
                        ssn2: "SSN2 {{ssnp1}} {{ssnp2}}",
                    },
                    sn2: "SN2 {{snp1}} {{snp2}}"
                },
            },
            greetings2: {
                goodDay2: "Good Day.",
                welcome2: "Hi {{name2}}. Welcome to {{place2}}."
            }
        })).to.deep.equal({
            Translations: {
                hello: [],
                helloWithParams: ["firstname", "middlename", "lastname"]
            }, "Translations.Greetings": {
                goodDay: [],
                welcome: ["name", "place"]
            }, "Translations.Greetings2": {
                goodDay2: [],
                welcome2: ["name2", "place2"]
            }, "Translations.Greetings.SubNested": {
                sn1: [],
                sn2: ["snp1", "snp2"]
            }, "Translations.Greetings.SubNested.SubSubNested": {
                ssn1: [],
                ssn2: ["ssnp1", "ssnp2"]
            }
        })
    })
})