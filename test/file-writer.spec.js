"use strict"

const fs = require("fs-extra")
const os = require("os")
const path = require("path")
const {expect, assert} = require("chai")
const writeFiles = require("../src/file-writer")
const {getAllFilesContent} = require("./test-utils")
const UserError = require("../src/user-error")

const rootPath = path.join(os.tmpdir(), "i18n-unit-test/file-writer")

describe("file-writer", () => {

    beforeEach(() => fs.emptyDirSync(rootPath))

    it("writes single file", () => test({"test.txt": "test"}))

    it("writes multiple files", () => test({
        "test1.txt": "test1",
        "test2.txt": "test2",
        "test3.txt": "test3"
    }))

    it("creates subfolders", () => test({
        [path.join("parent1", "test1.txt")]: "test1",
        [path.join("parent1", "test2.txt")]: "test2",
        [path.join("parent2", "parent3", "test3.txt")]: "test3"
    }))

    it("overwrites existing file", () => {
        fs.writeFileSync(path.join(rootPath, "test.txt"), "org content")
        test({"test.txt": "new content"})
    })

    it("errors if target file exists as folder", () => {
        fs.mkdirpSync(path.join(rootPath, "test1.txt"))
        assert.throws(
            () => writeFiles(rootPath, {"test1.txt": "test"}),
            UserError,
            `Tried to write to file but couldn't because it exists as a folder: '${path.join(rootPath, "test1.txt")}'`
        )
    })
})

const test = (files) => {
    writeFiles(rootPath, files)
    return expect(getAllFilesContent(rootPath)).to.deep.equal(files)
}
