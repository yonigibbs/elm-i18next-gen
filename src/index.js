"use strict"

// The entry point to the CLI. See commandLineOptions below for details of command line arguments.
// Validates the arguments then calls the function exported from "./code-gen" which executes the whole code generation process.

const fs = require("fs-extra")
const commandLineArgs = require("command-line-args")
const {EOL} = require("os")
const executeCodeGeneration = require("./code-gen")
const UserError = require("./user-error")
const JsonError = require("./json-error")

/**
 * Reports a user-facing error by outputting the supplied message to the console in red, then exits the process with an
 * exit code of 1 (failure).
 */
const exitWithUserError = msg => {
    console.log("\x1b[31m%s\x1b[0m", msg)
    process.exit(1)
}

/** Definition of all the available command line arguments. */
const commandLineOptions = [
    {
        name: "source",
        alias: "s",
        type: String,
        required: true,
        description: "The source file containing the JSON which contains the translations."
    },
    {
        name: "target",
        alias: "t",
        type: String,
        required: true,
        description: "The folder in which the source files are to be generated. Can be absolute or relative to current folder."
    },
    {
        name: "overwrite",
        alias: "o",
        type: Boolean,
        description: "Ensures that if the any of the target files exist, they will be overwritten. If this argument isn't supplied and any of the target files exist, the process will abort."
    },
    {
        name: "watch",
        alias: "w",
        type: Boolean,
        description: "Watches the source file for changes and regenerates the code whenever it does."
    }
]

/** Ensures the args are valid: throws UserError if they're not */
const getArgs = () => {

    const parseArgs = () => {
        try {
            // Passing in object literal with extra properties, which isn't allowed in TypeScript, so IntelliJ warns here.
            // We do actually want this, so ignore.
            // noinspection JSCheckFunctionSignatures
            return commandLineArgs(commandLineOptions)
        } catch (err) {
            throw new UserError(`Invalid arguments supplied: ${err.message}`)
        }
    }

    const args = parseArgs()

    const missingArgs = commandLineOptions.filter(arg => arg.required && !args[arg.name])
    if (missingArgs.length > 0) {
        const isSingle = missingArgs.length === 1
        const errorMessage = `The following argument${isSingle ? " is" : "s are"} missing:

${missingArgs.map(arg => `* ${arg.name}: ${arg.description}`).join(EOL)}

Please try again, supplying ${isSingle ? "this argument" : "these arguments"}.`
        throw new UserError(errorMessage)
    }

    return args
}

try {
    const args = getArgs()

    const generate = () => executeCodeGeneration(args.source, args.target, args.watch || args.overwrite)

    if (args.watch) {
        const writeResult = (msg = `Code generated at ${args.target}`, isSuccess = true) => {
            console.clear()
            // See here for colours: https://stackoverflow.com/a/41407246/10326373
            console.log(`\x1b[3${isSuccess ? "2" : "1"}m%s\x1b[0m`, `${new Date().toLocaleTimeString()} -- ${msg}`)
        }

        // The first time just call this and, if it fails with some argument indicating there was a problem with the
        // parameters or the setup (i.e. anything that's _not_ a JsonError, and therefore not easily fixable by the user)
        // rethrow the exception and don't start watching (as a failure means there could be something so wrong we can't
        // watch till we rerun with new args).
        try {
            writeResult(generate())
        } catch (err) {
            if (err instanceof JsonError)
                writeResult(err.message, false)
            else
                // noinspection ExceptionCaughtLocallyJS
                throw err
        }

        // If we got here we ran once successfully, so now watch for file changes. From now, any errors are trapped and
        // reported.
        fs.watch(args.source, {}, eventType => {
            if (eventType === "change") {
                try {
                    writeResult(generate())
                } catch (err) {
                    writeResult(err.message, false)
                }
            }
        })

    } else {
        generate()
        console.log("\x1b[32m%s\x1b[0m", `Code generated at ${args.target}\n`)
    }
} catch (err) {
    if (err instanceof UserError) {
        // Known error type indicating some problem in the input from the user (e.g. cmd-line mistake or error in the input
        // JSON): inform the user of the message in red text.
        exitWithUserError(err.message)
    } else {
        // Unexpected error: just throw (full stack trace will be shown in console).
        throw err
    }
}
