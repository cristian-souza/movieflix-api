import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

export default [
    {
        ignores: ["node_modules/", "dist/"],
    },
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        languageOptions: {
            globals: globals.node,
            ecmaVersion: "latest",
            sourceType: "module",
            parser: tseslint.parser,
        },
    },
    js.configs.recommended,
    ...tseslint.configs.recommended,
    {
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        rules: {
            indent: ["error", 4],
            "linebreak-style": ["error", "windows"],
            quotes: ["error", "double"],
            semi: ["error", "always"],
        },
    },
];