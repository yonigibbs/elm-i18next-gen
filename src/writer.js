"use strict"

const buildFileStart = moduleName => `module ${moduleName} exposing (..)

import I18Next exposing (Translations, t, tr)
`

const buildFunction = (functionName, parameters) => `

${functionName} : Translations -> String
${functionName} translations =
    t translations "${functionName}"
`

module.exports = (model, fileManager) =>
    Object.keys(model).reduce(
        (mgr, moduleName) =>
            Object.keys(model[moduleName]).reduce(
                (writer, functionName) => writer.write(buildFunction(functionName)),
                mgr.createFile(`${moduleName}.elm`).write(buildFileStart(moduleName))
            ).close(),
        fileManager)