"use strict"

const fs = require("fs-extra")
const path = require("path")
const {buildFileStart} = require("../src/elm-utils")

/**
 * Gets all files under the passed in path, recursively. Returns an array of the files, each one's value being its path
 * relative to the passed in path.
 */
const getAllFiles = parent => {
    const children = fs.readdirSync(parent)

    // flatMap only available in Node 12+, so for earlier versions define our own.
    if (!children.flatMap)
        children.flatMap = fn => children.map(fn).reduce((acc, cur) => acc.concat(cur), [])

    return children
        .flatMap(child => {
            const fullChildPath = path.join(parent, child)
            return fs.lstatSync(fullChildPath).isDirectory()
                ? getAllFiles(fullChildPath).map(subChild => path.join(child, subChild))
                : child
        })
}

module.exports = {
    /**
     * Gets an object containing a property for each file under the passed in path (recursive), where the property's name
     * is the name of that file relative to the passed in path, and its value is the content of that file.
     */
    getAllFilesContent: parent =>
        getAllFiles(parent).reduce(
            (acc, cur) => ({...acc, [cur]: fs.readFileSync(path.join(parent, cur), "utf8")}),
            {}
        ),

    /**
     * An object containing the files with the Elm code expected to be generated for the sample JSON file.
     */
    expectedSampleFileContent: {
        // Top level module
        "Translations.elm": `${buildFileStart("Translations")}

hello : Translations -> String
hello translations =
    t translations "hello"


helloWithParams : Translations -> String -> String -> String -> String
helloWithParams translations firstname middlename lastname =
    tr translations Curly "helloWithParams" [ ( "firstname", firstname ), ( "middlename", middlename ), ( "lastname", lastname ) ]
`,

        // Nested module
        [`${path.join("Translations", "Greetings.elm")}`]: `${buildFileStart("Translations.Greetings")}

goodDay : Translations -> String
goodDay translations =
    t translations "greetings.goodDay"


greetName : Translations -> String -> String
greetName translations name =
    tr translations Curly "greetings.greetName" [ ( "name", name ) ]
`
    },

    /**
     * An object containing the files with the Elm code expected to be generated for the empty-modules JSON file.
     */
    expectedEmptyModulesFileContent: {
        [`${path.join("Translations", "ModuleWithSubmodulesOnly", "Greetings.elm")}`]: `${buildFileStart("Translations.ModuleWithSubmodulesOnly.Greetings")}

goodDay : Translations -> String
goodDay translations =
    t translations "moduleWithSubmodulesOnly.greetings.goodDay"
`
    },

    /**
     * An object containing the files with the Elm code expected to be generated for the nested-modules JSON file.
     */
    expectedNestedModulesFileContent: {
        // Top level module
        "Translations.elm": `${buildFileStart("Translations")}

hello : Translations -> String
hello translations =
    t translations "hello"
`,

        // First level nested child
        [`${path.join("Translations", "Greetings.elm")}`]: `${buildFileStart("Translations.Greetings")}

goodDay : Translations -> String
goodDay translations =
    t translations "greetings.goodDay"
`,

        // Second level nested child
        [`${path.join("Translations", "Greetings", "FurtherGreetings.elm")}`]: `${buildFileStart("Translations.Greetings.FurtherGreetings")}

anotherGreeting : Translations -> String
anotherGreeting translations =
    t translations "greetings.furtherGreetings.anotherGreeting"
`
    }
}