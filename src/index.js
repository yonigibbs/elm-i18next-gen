"use strict"

// The entry point to the CLI. Expects two parameters:
// 1. The source file containing the JSON which has the text resource values. Can be absolute or relative to current folder.
// 2. The target path (the folder in which the source files are to be generated). Can be absolute or relative to current folder.
// Validates that two arguments are received and, if so, proceeds to call the function exported from "./code-gen" which
// executes the whole process of code generation.

const executeCodeGeneration = require("./code-gen")

const exitWithError = msg => {
    console.log("\x1b[31m%s\x1b[0m", msg)
    process.exit(1)
}

const args = process.argv.slice(2)

if (args.length === 2) {
    const [sourceFile, targetFolder] = args
    const result = executeCodeGeneration(sourceFile, targetFolder)
    if (result.isError)
        exitWithError(result.msg)
    else
        console.log("\x1b[32m%s\x1b[0m", result.msg)
} else {
    exitWithError(`I need two arguments to proceed:

1. The source file containing the JSON which has the text resource values.
2. The target path (the folder in which the source files are to be generated).

Please try again, supplying these arguments.`)
}

// Export this function so it can be unit tested
module.exports = executeCodeGeneration
