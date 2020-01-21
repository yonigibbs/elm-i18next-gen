"use strict"

const {expect, assert} = require("chai")
const build = require("../src/model-builder")
const JsonError = require("../src/json-error")

describe("model-builder", () => {

    describe("basic model building", () => {
        it("handles single file with one resources (no params)", () => {
            expect(build({"hello": "Hello"})).to.deep.equal({
                Translations: [{elmName: "hello", jsonName: "hello", parameters: []}]
            })
        })

        it("handles single file with one resource (one param)", () => {
            expect(build({"hello": "Hello {{name}}"})).to.deep.equal({
                Translations: [{elmName: "hello", jsonName: "hello", parameters: [{elmName: "name", jsonName: "name"}]}]
            })
        })

        it("handles single file with one resources (three params)", () => {
            expect(build({"hello": "Hello {{firstname}} {{middlename}} {{lastname}}!"})).to.deep.equal({
                Translations: [{
                    elmName: "hello", jsonName: "hello", parameters: [
                        {elmName: "firstname", jsonName: "firstname"},
                        {elmName: "middlename", jsonName: "middlename"},
                        {elmName: "lastname", jsonName: "lastname"},
                    ]
                }]
            })
        })

        it("handles single submodule (no params)", () => {
            expect(build({
                hello: "Hello",
                greetings: {
                    goodDay: "Good day."
                }
            })).to.deep.equal({
                Translations: [{
                    elmName: "hello", jsonName: "hello", parameters: []
                }], "Translations.Greetings": [{
                    elmName: "goodDay", jsonName: "greetings.goodDay", parameters: []
                }]
            })
        })

        it("handles multiple submodules (with and without params)", () => {
            expect(build({
                hello: "Hello",
                helloWithParams: "Hello {{firstname}} {{middlename}} {{lastname}}!",
                greetings: {
                    goodDay: "Good day.",
                    welcome: "Hi {{name}}. Welcome to {{place}}.",
                    subNested: {
                        sn1: "SN1",
                        subSubNested: {
                            ssn1: "SSN1",
                            ssn2: "SSN2 {{ssnp1}} {{ssnp2}}",
                        },
                        sn2: "SN2 {{snp1}} {{snp2}}"
                    }
                },
                greetings2: {
                    goodDay2: "Good day.",
                    welcome2: "Hi {{name2}}. Welcome to {{place2}}."
                }
            })).to.deep.equal({
                Translations: [
                    {
                        elmName: "hello", jsonName: "hello", parameters: []
                    },
                    {
                        elmName: "helloWithParams", jsonName: "helloWithParams", parameters: [
                            {elmName: "firstname", jsonName: "firstname"},
                            {elmName: "middlename", jsonName: "middlename"},
                            {elmName: "lastname", jsonName: "lastname"}
                        ]
                    }
                ], "Translations.Greetings": [
                    {
                        elmName: "goodDay", jsonName: "greetings.goodDay", parameters: []
                    },
                    {
                        elmName: "welcome", jsonName: "greetings.welcome", parameters: [
                            {elmName: "name", jsonName: "name"},
                            {elmName: "place", jsonName: "place"}
                        ]
                    }
                ], "Translations.Greetings2": [
                    {
                        elmName: "goodDay2", jsonName: "greetings2.goodDay2", parameters: []
                    },
                    {
                        elmName: "welcome2", jsonName: "greetings2.welcome2", parameters: [
                            {elmName: "name2", jsonName: "name2"},
                            {elmName: "place2", jsonName: "place2"}
                        ]
                    }
                ], "Translations.Greetings.SubNested": [
                    {
                        elmName: "sn1", jsonName: "greetings.subNested.sn1", parameters: []
                    },
                    {
                        elmName: "sn2", jsonName: "greetings.subNested.sn2", parameters: [
                            {elmName: "snp1", jsonName: "snp1"},
                            {elmName: "snp2", jsonName: "snp2"}
                        ]
                    }
                ], "Translations.Greetings.SubNested.SubSubNested": [
                    {
                        elmName: "ssn1", jsonName: "greetings.subNested.subSubNested.ssn1", parameters: []
                    },
                    {
                        elmName: "ssn2", jsonName: "greetings.subNested.subSubNested.ssn2", parameters: [
                            {elmName: "ssnp1", jsonName: "ssnp1"},
                            {elmName: "ssnp2", jsonName: "ssnp2"}
                        ]
                    }
                ]
            })
        })
    })

    describe("sanitisation", () => {
        describe("capitalisation", () => {
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
                    Translations: [{elmName: "test", jsonName: "test", parameters: []}],
                    "Translations.Nested": [{elmName: "test", jsonName: "nested.test", parameters: []}],
                    "Translations.Nested.SubNested": [{
                        elmName: "test",
                        jsonName: "nested.subNested.test",
                        parameters: []
                    }]
                })
            })

            it("decapitalises first letter of function names", () => {
                expect(build({
                    TestSomeValue: "",
                    nested: {
                        TestSomeOtherValue: "",
                        subNested: {
                            TestYetAnotherValue: "test"
                        }
                    }
                })).to.deep.equal({
                    Translations: [{elmName: "testSomeValue", jsonName: "TestSomeValue", parameters: []}],
                    "Translations.Nested": [{
                        elmName: "testSomeOtherValue",
                        jsonName: "nested.TestSomeOtherValue",
                        parameters: []
                    }],
                    "Translations.Nested.SubNested": [{
                        elmName: "testYetAnotherValue",
                        jsonName: "nested.subNested.TestYetAnotherValue",
                        parameters: []
                    }]
                })
            })

            it("decapitalises first letter of parameter names", () => {
                expect(build({
                    testSomeValue: "some {{P1Abc}} {{P2Def}} value",
                    nested: {
                        testSomeOtherValue: "some {{P3Abc}} {{P4Def}} value",
                        subNested: {
                            testYetAnotherValue: "some {{P5Abc}} {{P6Def}} value"
                        }
                    }
                })).to.deep.equal({
                    Translations: [{
                        elmName: "testSomeValue", jsonName: "testSomeValue", parameters: [
                            {elmName: "p1Abc", jsonName: "P1Abc"},
                            {elmName: "p2Def", jsonName: "P2Def"}
                        ]
                    }],
                    "Translations.Nested": [{
                        elmName: "testSomeOtherValue",
                        jsonName: "nested.testSomeOtherValue",
                        parameters: [
                            {elmName: "p3Abc", jsonName: "P3Abc"},
                            {elmName: "p4Def", jsonName: "P4Def"}
                        ]
                    }],
                    "Translations.Nested.SubNested": [{
                        elmName: "testYetAnotherValue",
                        jsonName: "nested.subNested.testYetAnotherValue",
                        parameters: [
                            {elmName: "p5Abc", jsonName: "P5Abc"},
                            {elmName: "p6Def", jsonName: "P6Def"}
                        ]
                    }]
                })
            })

            it("joins words and pascal cases module names", () => {
                expect(build({
                    test: "",
                    "nested module": {
                        test: "",
                        "sub nested module": {
                            test: "test"
                        }
                    }
                })).to.deep.equal({
                    Translations: [{elmName: "test", jsonName: "test", parameters: []}],
                    "Translations.NestedModule": [{elmName: "test", jsonName: "nested module.test", parameters: []}],
                    "Translations.NestedModule.SubNestedModule": [{
                        elmName: "test",
                        jsonName: "nested module.sub nested module.test",
                        parameters: []
                    }]
                })
            })

            it("joins words and camel cases function names", () => {
                expect(build({
                    "test some value": "",
                    nested: {
                        "test some other value": "",
                        subNested: {
                            "test yet another value": "test"
                        }
                    }
                })).to.deep.equal({
                    Translations: [{elmName: "testSomeValue", jsonName: "test some value", parameters: []}],
                    "Translations.Nested": [{
                        elmName: "testSomeOtherValue",
                        jsonName: "nested.test some other value",
                        parameters: []
                    }],
                    "Translations.Nested.SubNested": [{
                        elmName: "testYetAnotherValue",
                        jsonName: "nested.subNested.test yet another value",
                        parameters: []
                    }]
                })
            })

            it("joins words and camel cases parameter names", () => {
                expect(build({
                    testSomeValue: "some {{P1 abc def}} {{P2 abc def}} value",
                    nested: {
                        testSomeOtherValue: "some {{P3 abc def}} {{P4 abc def}} value",
                        subNested: {
                            testYetAnotherValue: "some {{P5 abc def}} {{P6 abc def}} value"
                        }
                    }
                })).to.deep.equal({
                    Translations: [{
                        elmName: "testSomeValue", jsonName: "testSomeValue", parameters: [
                            {elmName: "p1AbcDef", jsonName: "P1 abc def"},
                            {elmName: "p2AbcDef", jsonName: "P2 abc def"}
                        ]
                    }],
                    "Translations.Nested": [{
                        elmName: "testSomeOtherValue", jsonName: "nested.testSomeOtherValue", parameters: [
                            {elmName: "p3AbcDef", jsonName: "P3 abc def"},
                            {elmName: "p4AbcDef", jsonName: "P4 abc def"}
                        ]
                    }],
                    "Translations.Nested.SubNested": [
                        {
                            elmName: "testYetAnotherValue",
                            jsonName: "nested.subNested.testYetAnotherValue",
                            parameters: [
                                {elmName: "p5AbcDef", jsonName: "P5 abc def"},
                                {elmName: "p6AbcDef", jsonName: "P6 abc def"}
                            ]
                        }]
                })
            })
        })

        describe("white space handling", () => {
            it("trims white space around module names", () => {
                expect(build({
                    "  nested  ": {
                        test: "",
                        "  subNested  ": {
                            test: "",
                        }
                    }
                })).to.deep.equal({
                    "Translations.Nested": [{elmName: "test", jsonName: "  nested  .test", parameters: []}],
                    "Translations.Nested.SubNested": [{
                        elmName: "test",
                        jsonName: "  nested  .  subNested  .test",
                        parameters: []
                    }],
                })
            })

            it("trims white space around function names", () => {
                expect(build({
                    nested: {
                        "  test  ": "",
                        subNested: {
                            "\ttest\t": "",
                        }
                    }
                })).to.deep.equal({
                    "Translations.Nested": [{elmName: "test", jsonName: "nested.  test  ", parameters: []}],
                    "Translations.Nested.SubNested": [{
                        elmName: "test",
                        jsonName: "nested.subNested.\ttest\t",
                        parameters: []
                    }]
                })
            })

            it("trims white space around parameter names", () => {
                expect(build({
                    nested: {
                        test: "some {{  p1  }} value",
                        subNested: {
                            test: "some {{  p2  }} value",
                        }
                    }
                })).to.deep.equal({
                    "Translations.Nested": [{
                        elmName: "test", jsonName: "nested.test", parameters: [
                            {elmName: "p1", jsonName: "  p1  "}
                        ]
                    }],
                    "Translations.Nested.SubNested": [{
                        elmName: "test", jsonName: "nested.subNested.test", parameters: [
                            {elmName: "p2", jsonName: "  p2  "}
                        ]
                    }]
                })
            })

            it("removes white space in module names", () => {
                expect(build({"  Nested  Sub    Module  ": {test: ""}})).to.deep.equal({
                    "Translations.NestedSubModule": [{
                        elmName: "test", jsonName: "  Nested  Sub    Module  .test", parameters: []
                    }]
                })
            })

            it("ignores parameters with just white space", () => {
                expect(build({"key": "some {{   \t   }} value"})).to.deep.equal({
                    Translations: [{elmName: "key", jsonName: "key", parameters: []}]
                })
            })
        })

        describe("error handling", () => {
            it("throws error if module name starts with number", () => {
                assert.throws(
                    () => build({"1xx": {test: ""}}),
                    JsonError,
                    "The supplied JSON file has a problem in it: '1xx' is not a valid name for an Elm module/function/parameter. The first character must be a letter."
                )
            })

            it("throws error if module name starts with non-alphanumeric character", () => {
                assert.throws(
                    () => build({"%xx": {test: ""}}),
                    JsonError,
                    "The supplied JSON file has a problem in it: '%xx' is not a valid name for an Elm module/function/parameter. The first character must be a letter."
                )
            })

            it("ensures module name starts with alphabetic character (trimmed)", () => {
                assert.throws(
                    () => build({"  1xx   ": {test: ""}}),
                    JsonError,
                    "The supplied JSON file has a problem in it: '1xx' is not a valid name for an Elm module/function/parameter. The first character must be a letter."
                )
            })
        })
    })
})