import js from '@eslint/js';
import globals from 'globals';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'coverage'] },
  {
    files: ['**/*.{ts,tsx,js,jsx}'],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: {
      ecmaVersion: 2022,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      // The classic hooks rules only. eslint-plugin-react-hooks v7's `recommended`
      // preset also enables React Compiler diagnostics (refs, purity, set-state-in-effect...)
      // that target compiler adoption, which this app does not use; they misfire on
      // react-hook-form's `field` object (it carries `field.ref`).
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // Field wrappers forward the caller's opt-in `autoFocus` prop to inner components;
      // only autoFocus written directly on DOM elements is checked.
      'jsx-a11y/no-autofocus': ['error', { ignoreNonDOM: true }],
    },
  },
  {
    files: ['**/*.{test,spec}.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: {
      globals: { ...globals.browser, ...globals.vitest },
    },
  },
  {
    files: ['*.config.{js,ts}'],
    languageOptions: {
      globals: globals.node,
    },
  },
);
