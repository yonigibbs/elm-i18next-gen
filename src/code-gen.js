/*
TODO:
* Check for right type of source
* Handle duplicates
* Handle strings in the source which invalid as function/file/module names
* Correct capitalisation
 */

const buildFileStart = moduleName => `module ${moduleName} exposing (..)

import I18Next exposing (Translations, t, tr)
`

const buildFunction = (functionName, parameters) => `

${functionName} : Translations -> String
${functionName} translations =
    t translations "${functionName}"
`

const topLevelFileName = "Translations"

module.exports = (source, writer) => Object.keys(source).reduce(
    (acc, key) => {
        return !!acc.files[topLevelFileName]
            ? acc.write(topLevelFileName, buildFunction(key))
            : acc.write(topLevelFileName, buildFileStart(topLevelFileName))
                .write(topLevelFileName, buildFunction(key))
    },
    writer
)
