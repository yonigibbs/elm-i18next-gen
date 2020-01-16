"use strict"

const topLevelModule = "Translations"

const addFunction = (module, functionName, params) => ({...module, [functionName]: params})

const paramRegex = /{{(\S+?)}}/gm

const parseParams = translationText => {
    let match
    const params = []
    while ((match = paramRegex.exec(translationText)) !== null) {
        // This is necessary to avoid infinite loops with zero-width matches
        if (match.index === paramRegex.lastIndex)
            paramRegex.lastIndex++

        if (match.length === 2)
            params.push(match[1])
    }
    return params
}

// TODO: Check for right type of source
module.exports = source => Object.keys(source).reduce(
    (model, translationId) => {
        const module = model[topLevelModule] || {}
        // TODO: make fn name safe
        // TODO: check what elm018next does with strange params (e.g. ones with spaces or unusual chars)
        // TODO: handle duplicates
        // TODO: correct capitalisation
        // TODO: allow parameter delimiter to be configured (currently hard-coded to Curly)
        return {...model, [topLevelModule]: addFunction(module, translationId, parseParams(source[translationId]))}
    }, {})