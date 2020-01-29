"use strict"

// The entry point to the CLI. See below for details of command line arguments.
// Validates the arguments then calls the function exported from "./code-gen" which executes the whole process.

const fs = require("fs-extra")
const program = require("commander")
const executeCodeGeneration = require("./code-gen")
const UserError = require("./user-error")
const JsonError = require("./json-error")

program
    .version(require("../package.json").version)
    .requiredOption("-s, --source <source>", "The source file containing the JSON which contains the translations.")
    .requiredOption("-t, --target <target>",
        "The folder in which the source files are to be generated. Can be absolute or relative to current folder.")
    .option("-o, --overwrite",
        "Ensures that if the any of the target files exist, they will be overwritten. If this argument isn't supplied and any of the target files exist, the process will abort.")
    .option("-w, --watch", "Watches the source file for changes and regenerates the code whenever it does.")
    .option("-f, --fallback", "Generates functions which receive a list of fallback languages.")

program.parse(process.argv)

try {
    const generate = () => executeCodeGeneration(
        program.source, program.target, program.watch || program.overwrite, program.fallback)

    if (program.watch) {
        const writeResult = (msg = `Code generated at ${program.target}`, isSuccess = true) => {
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
        fs.watch(program.source, {}, eventType => {
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
        console.log("\x1b[32m%s\x1b[0m", `Code generated at ${program.target}\n`)
    }
} catch (err) {
    if (err instanceof UserError) {
        // Known error type indicating some problem in the input from the user (e.g. cmd-line mistake or error in the input
        // JSON): inform the user of the message in red text.
        console.log("\x1b[31m%s\x1b[0m", err.message)
        process.exit(1)
    } else {
        // Unexpected error: just throw (full stack trace will be shown in console).
        throw err
    }
}
