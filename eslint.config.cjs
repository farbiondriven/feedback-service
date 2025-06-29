const { FlatCompat } = require("@eslint/eslintrc");
const js = require("@eslint/js");
const tsParser = require("@typescript-eslint/parser");
const tsPlugin = require("@typescript-eslint/eslint-plugin");
const prettierPlugin = require("eslint-plugin-prettier");

// Compat needs the base ESLint recommended config to translate "eslint:recommended"
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
});

module.exports = [
  {
    ignores: ["**/*.js", "**/*.cjs", "dist/**", "apps/**/dist/**", 'apps/service/__tests__/**', "apps/frontend/vite.config.ts"],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ),
  {
    files: ["**/*.ts", "**/*.tsx"],

    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: ["./apps/service/tsconfig.json", './apps/frontend/tsconfig.json'],
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },

    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
];
