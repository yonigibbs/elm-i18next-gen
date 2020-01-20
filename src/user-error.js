"use strict"

/**
 * Error used to indicate that some input from the user (e.g. cmd-line arguments or JSON file contents) are invalid.
 */
module.exports = class UserError extends Error {
    // Code below taken from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error
    constructor(...params) {
        // Pass remaining arguments (including vendor specific ones) to parent constructor
        super(...params)

        // Maintains proper stack trace for where our error was thrown (only available on V8)
        if (Error.captureStackTrace)
            Error.captureStackTrace(this, UserError)

        this.name = "UserError"
        this.date = new Date()
    }
}
