"use strict"

const fs = require("fs-extra")
const os = require("os")
const {execFileSync} = require("child_process")
const path = require("path")
const {expect} = require("chai")
const {getAllFilesContent, expectedSampleFileContent} = require("./test-utils")

const rootPath = path.join(os.tmpdir(), "i18n-unit-test/index")

describe("index", () => {

    beforeEach(() => fs.emptyDirSync(rootPath))

    it("generates translations from cmd line", () => {
        execFileSync("node", [
            path.resolve(__dirname, "../src/index.js"),
            "-s", path.resolve(__dirname, "resources/sample.json"),
            "-t", rootPath
        ])
        expect(getAllFilesContent(rootPath)).to.deep.equal(expectedSampleFileContent)
    })
})
