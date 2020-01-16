"use strict"

const topLevelModule = "Translations"

const addFunction = (module, functionName, params) => ({...module, [functionName]: params})

// TODO: Check for right type of source
module.exports = source => Object.keys(source).reduce(
    (model, translationId) => {
        const module = model[topLevelModule] || {}
        // TODO: make fn name safe
        // TODO: add params
        // TODO: Handle duplicates
        // TODO: Correct capitalisation
        return {...model, [topLevelModule]: addFunction(module, translationId, {})}
    }, {})