"use strict"

const UserError = require("./user-error")

/**
 * Error used to indicate that the supplied JSON file had a problem with it.
 */
module.exports = class JsonError extends UserError {
    constructor(message) {
        super(`The supplied JSON file has a problem in it: ${message}`)
        this.name = "JsonError"
    }
}
