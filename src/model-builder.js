"use strict"

const topLevelModule = "Translations"

const addModule = (model, name) => ({...model, [name]: {}})

const addFunction = (module, name, params) => ({...module, [name]: params})

// TODO: Check for right type of source
module.exports = (source) => Object.keys(source).reduce(
    (model, translationId) => {
        const module = model[topLevelModule]
        return module
            ? addModule(model, topLevelModule)
            // TODO: make fn name safe
            // TODO: add params
            // TODO: Handle duplicates
            // TODO: Correct capitalisation
            : {...model, [topLevelModule]: addFunction(module, translationId, {})}
    }, {})