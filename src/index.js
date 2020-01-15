"use strict"

const fs = require("fs")
const path = require("path")
const write = require("./writer")
const build = require("./model-builder")
const getFileManager = require("./file-manager")

// TODO: delete this
const dir = "/tmp/i18n"
if (fs.existsSync(dir))
    fs.rmdirSync(dir)
fs.mkdirSync(dir)

const source = JSON.parse(fs.readFileSync(path.resolve(__dirname, "../test/resources/sample1.json")))

write(build(source), getFileManager())

console.log("hello")

//generateCode("source", "writer")