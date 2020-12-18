module.exports = {
    env: {
        node: true,
        commonjs: true,
        es6: true,
        mocha: true
    },
    extends: [
        "eslint:recommended"
    ],
    globals: {
        Atomics: "readonly",
        SharedArrayBuffer: "readonly"
    },
    parserOptions: {
        ecmaVersion: 2018
    },
    rules: {
        semi: ["warn", "never"],
        indent: ["warn", 4, {"SwitchCase": 1}],
        quotes: ["warn", "double"],
        strict: ["error", "global"]
    }
}
