"use strict"

const {expect} = require("chai")
const buildCode = require("../src/code-builder")
const {buildFileStart, pathFromModuleName} = require("../src/elm-utils")

describe("code-builder", () => {
    it("handles single file with one resource (no params)", () => test(
        {Translations: [{elmName: "hello", jsonName: "hello", type: "default", parameters: []}]},
        {
            ["Translations"]: [`hello : Translations -> String
hello translations =
    t translations "hello"`]
        }))

    it("handles single file with one resource (one param)", () => test(
        {
            Translations: [{
                elmName: "hello",
                jsonName: "hello",
                type: "default",
                parameters: [{elmName: "name", jsonName: "name"}]
            }]
        },
        {
            ["Translations"]: [`hello : Translations -> String -> String
hello translations name =
    tr translations Curly "hello" [ ( "name", name ) ]`]
        }))

    it("handles single file with one resource (three params)", () => test(
        {
            Translations: [{
                elmName: "hello", jsonName: "hello", type: "default", parameters: [
                    {elmName: "firstname", jsonName: "firstname"},
                    {elmName: "middlename", jsonName: "middlename"},
                    {elmName: "lastname", jsonName: "lastname"}
                ]
            }]
        },
        {
            ["Translations"]: [`hello : Translations -> String -> String -> String -> String
hello translations firstname middlename lastname =
    tr translations Curly "hello" [ ( "firstname", firstname ), ( "middlename", middlename ), ( "lastname", lastname ) ]`]
        }))

    it("uses fallback languages if specified", () => test(
        {
            Translations: [
                {elmName: "hello", jsonName: "hello", type: "default", parameters: []},
                {
                    elmName: "helloWithName",
                    jsonName: "helloWithName",
                    type: "default",
                    parameters: [{elmName: "name", jsonName: "name"}]
                }
            ]
        },
        {
            ["Translations"]: [
                `hello : List Translations -> String
hello translations =
    tf translations "hello"`,

                `helloWithName : List Translations -> String -> String
helloWithName translations name =
    trf translations Curly "helloWithName" [ ( "name", name ) ]`]
        }, true))

    describe("translation types", () => {
        it("handles custom function type with no parameters", () => test(
            {Translations: [{elmName: "hello", jsonName: "hello", type: "custom", parameters: []}]},
            {
                ["Translations"]: [`hello : Translations -> (String -> a) -> List a
hello translations nonPlaceholderLift =
    customTr translations Curly nonPlaceholderLift "hello" []`]
            }, false, "custom"))

        it("handles custom function type with one parameter", () => test(
            {
                Translations: [{
                    elmName: "hello", jsonName: "hello", type: "custom", parameters: [
                        {elmName: "name", jsonName: "name"}
                    ]
                }]
            },
            {
                ["Translations"]: [`hello : Translations -> (String -> a) -> a -> List a
hello translations nonPlaceholderLift name =
    customTr translations Curly nonPlaceholderLift "hello" [ ( "name", name ) ]`]
            }, false, "custom"))

        it("handles custom function type with multiple parameters", () => test(
            {
                Translations: [{
                    elmName: "hello", jsonName: "hello", type: "custom", parameters: [
                        {elmName: "firstName", jsonName: "firstName"},
                        {elmName: "lastName", jsonName: "lastName"}
                    ]
                }]
            },
            {
                ["Translations"]: [`hello : Translations -> (String -> a) -> a -> a -> List a
hello translations nonPlaceholderLift firstName lastName =
    customTr translations Curly nonPlaceholderLift "hello" [ ( "firstName", firstName ), ( "lastName", lastName ) ]`]
            }, false, "custom"))

        it("handles both function types together", () => test(
            {
                Translations: [{
                    elmName: "hello", jsonName: "hello", type: "default", parameters: [
                        {elmName: "firstName", jsonName: "firstName"},
                        {elmName: "lastName", jsonName: "lastName"}
                    ]
                }, {
                    elmName: "helloCustom", jsonName: "hello", type: "custom", parameters: [
                        {elmName: "firstName", jsonName: "firstName"},
                        {elmName: "lastName", jsonName: "lastName"}
                    ]
                }]
            },
            {
                ["Translations"]: [
                    `hello : Translations -> String -> String -> String
hello translations firstName lastName =
    tr translations Curly "hello" [ ( "firstName", firstName ), ( "lastName", lastName ) ]`,
                    `helloCustom : Translations -> (String -> a) -> a -> a -> List a
helloCustom translations nonPlaceholderLift firstName lastName =
    customTr translations Curly nonPlaceholderLift "hello" [ ( "firstName", firstName ), ( "lastName", lastName ) ]`
                ]
            }, false, "both"))

        it("handles both function types together with fallback language", () => test(
            {
                Translations: [{
                    elmName: "hello", jsonName: "hello", type: "default", parameters: [
                        {elmName: "firstName", jsonName: "firstName"},
                        {elmName: "lastName", jsonName: "lastName"}
                    ]
                }, {
                    elmName: "helloCustom", jsonName: "hello", type: "custom", parameters: [
                        {elmName: "firstName", jsonName: "firstName"},
                        {elmName: "lastName", jsonName: "lastName"}
                    ]
                }]
            },
            {
                ["Translations"]: [
                    `hello : List Translations -> String -> String -> String
hello translations firstName lastName =
    trf translations Curly "hello" [ ( "firstName", firstName ), ( "lastName", lastName ) ]`,
                    `helloCustom : List Translations -> (String -> a) -> a -> a -> List a
helloCustom translations nonPlaceholderLift firstName lastName =
    customTrf translations Curly nonPlaceholderLift "hello" [ ( "firstName", firstName ), ( "lastName", lastName ) ]`
                ]
            }, true, "both"))
    })
})

// Note that below we use "\n" rather than require("os").EOL because multiline string literals have "\n" in them even on
// Windows. So to keep this consistent, just use "\n". If this becomes a problem we can swap from using multiline string
// literals to single line ones and build multiline strings using EOL.

const test = (model, expectedFiles, useFallbackLanguages = false, translationType = "default") => {
    const actualFiles = buildCode(model, useFallbackLanguages, translationType)
    const expectedFilesBuilt = Object.keys(expectedFiles).reduce(
        (acc, module) => ({
            ...acc,
            [pathFromModuleName(module)]: buildFileStart(module, useFallbackLanguages, translationType) + elmFunctionsArrayToString(expectedFiles[module])
        }), {})
    expect(actualFiles).to.deep.equal(expectedFilesBuilt)
}

const elmFunctionsArrayToString = elmFunctions =>
    elmFunctions.reduce(
        (module, fn) => module + "\n\n" + fn + "\n",
        "")
