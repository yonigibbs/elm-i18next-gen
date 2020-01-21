"use strict"

const {expect, assert} = require("chai")
const build = require("../src/model-builder")
const JsonError = require("../src/json-error")

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

    it("capitalises first letter of module names", () => {
        expect(build({
            test: "",
            nested: {
                test: "",
                subNested: {
                    test: "test"
                }
            }
        })).to.deep.equal({
            Translations: {test: []},
            "Translations.Nested": {test: []},
            "Translations.Nested.SubNested": {test: []}
        })
    })

    it("trims white space around module names", () => {
        expect(build({
            "  nested  ": {
                test: "",
                "   sub  nested   ": {
                    test: "",
                }
            }
        })).to.deep.equal({
            "Translations.Nested": {
                test: []
            },
            "Translations.Nested.SubNested": {
                test: []
            }
        })
    })

    it("removes white space in module names", () => {
        expect(build({"  Nested  Sub    Module  ": {test: ""}})).to.deep.equal({"Translations.NestedSubModule": {test: []}})
    })

    it("capitalises separate words in module names", () => {
        expect(build({"  nested  sub   module  ": {test: ""}})).to.deep.equal({"Translations.NestedSubModule": {test: []}})
    })

    it("ensures module name starts with alphabetic character", () => {
        assert.throws(
            () => build({"1xx": {test: ""}}),
            JsonError,
            "The supplied JSON file has a problem in it: 1xx is not a valid name for an Elm module. Please specify a name that starts with a letter."
        )
    })

    it("ensures module name starts with alphabetic character (trimmed)", () => {
        assert.throws(
            () => build({"  1xx   ": {test: ""}}),
            JsonError,
            "The supplied JSON file has a problem in it: 1xx is not a valid name for an Elm module. Please specify a name that starts with a letter."
        )
    })

})