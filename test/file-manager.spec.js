"use strict"

const fs = require("fs")
const expect = require("chai").expect
const getFileManager = require("../src/file-manager")

describe("file-manager", () => {
    const rootPath = "/tmp/i18n-unit-test/file-manager"

    beforeEach(() => {
        if (fs.existsSync(rootPath))
            fs.rmdirSync(rootPath, {recursive: true})
        fs.mkdirSync(rootPath, {recursive: true})
    })

    it("writes single file with single line", () => {
        getFileManager(rootPath).createFile("test1.txt").write("test").close()
    })
})


