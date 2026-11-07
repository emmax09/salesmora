import js from '@eslint/js';
import next from '@next/eslint-plugin-next';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['**/.next/**', '**/dist/**', '**/coverage/**', '**/node_modules/**', '**/src/generated/**'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{js,mjs,cjs,ts,tsx}'],
    languageOptions: { globals: { ...globals.browser, ...globals.node }, parserOptions: { ecmaFeatures: { jsx: true } } },
  },
  { files: ['src/**/*.{ts,tsx}', 'packages/ui/src/**/*.{ts,tsx}'], plugins: { '@next/next': next }, rules: { ...next.configs.recommended.rules } },
);
