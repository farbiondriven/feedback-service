// @ts-check
import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,       // core JS rules
  tseslint.configs.recommended,     // TS rules without type-checking
  {
    files: ['**/*.ts', '**/*.tsx'],
    ignores: ['dist', 'build'],
  }
);
