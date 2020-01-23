"use strict"

const fs = require("fs-extra")
const os = require("os")
const path = require("path")
const {expect} = require("chai")
const writeFiles = require("../src/file-writer")
const {getAllFilesContent} = require("./test-utils")

const rootPath = path.join(os.tmpdir(), "i18n-unit-test/file-writer")

describe("file-writer", () => {

    beforeEach(() => fs.emptyDirSync(rootPath))

    it("writes single file with single line", () => test({"test1.txt": "test"}))

    // TODO: more tests
})

const test = files => {
    writeFiles(rootPath, files)
    return expect(getAllFilesContent(rootPath)).to.deep.equal(files)
}
