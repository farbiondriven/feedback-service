// eslint.config.cjs
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
  // 1) Ignore all JS files and build output
  {
    ignores: ["**/*.js", "**/*.cjs", "dist/**", "apps/**/dist/**", 'apps/service/__tests__/**'],
  },

  // 2) Pull in the old "extends": presets
  ...compat.extends(
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:prettier/recommended",
  ),

  // 3) TypeScript‐only overrides
  {
    files: ["**/*.ts", "**/*.tsx"],

    // **Here** we pass in the actual parser object, not a string
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        project: "./apps/service/tsconfig.json", // adjust path if needed
        tsconfigRootDir: __dirname,
        ecmaVersion: 2022,
        sourceType: "module",
      },
    },

    plugins: {
      "@typescript-eslint": tsPlugin,
      prettier: prettierPlugin,
    },

    // our Prettier rule to surface formatting errors
    rules: {
      // disable the “no-explicit-any” rule entirely:
      '@typescript-eslint/no-explicit-any': 'off',
      "prettier/prettier": [
        "error",
        {
          singleQuote: true,
          semi: true,
          printWidth: 100,
        },
      ],
    },
  },
];
