import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import importPlugin from "eslint-plugin-import";
import jsxA11y from "eslint-plugin-jsx-a11y";
import prettierPlugin from "eslint-plugin-prettier";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import globals from "globals";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "coverage", "node_modules", "*.config.js"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      react.configs.flat.recommended,
      react.configs.flat["jsx-runtime"],
      reactHooks.configs["flat"]["recommended"],
      jsxA11y.flatConfigs.recommended,
      importPlugin.flatConfigs.recommended,
      prettierConfig,
    ],
    plugins: {
      prettier: prettierPlugin,
    },
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    settings: {
      react: { version: "detect" },
      "import/resolver": {
        typescript: { alwaysTryTypes: true },
      },
    },
    rules: {
      "prettier/prettier": "warn",
      "react/prop-types": "off",
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "import/order": [
        "warn",
        {
          groups: ["builtin", "external", "internal", "parent", "sibling", "index"],
          "newlines-between": "always",
          alphabetize: { order: "asc", caseInsensitive: true },
        },
      ],
      "import/no-unresolved": "off",
      "import/named": "off",
      "import/namespace": "off",
      "import/default": "off",
      "import/no-named-as-default": "off",
      "import/no-named-as-default-member": "off",
      "import/no-duplicates": "off",
    },
  },
  {
    files: ["**/*.test.{ts,tsx}", "test/**/*.{ts,tsx}"],
    languageOptions: {
      globals: { ...globals.browser, ...globals.jest, ...globals.node },
    },
  },
  {
    files: ["*.config.{js,ts,mts}", "jest.config.js"],
    languageOptions: {
      globals: globals.node,
    },
  },
);
