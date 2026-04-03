import js from '@eslint/js';
import globals from 'globals';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

export default [
  {
    ignores: ['dist/**', 'coverage/**', 'playwright-report/**', 'test-results/**']
  },
  js.configs.recommended,
  {
    files: ['**/*.{js,jsx}'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parserOptions: {
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        ...globals.node
      }
    },
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks
    },
    settings: {
      react: {
        version: 'detect'
      }
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react/react-in-jsx-scope': 'off',
      'react/jsx-uses-vars': 'error',
      'react/prop-types': 'off',
      'react/no-unescaped-entities': 'off'
    }
  },
  {
    files: ['src/**/__tests__/**/*.{js,jsx}', 'src/**/*.{test,spec}.{js,jsx}', 'test/**/*.js', 'tests/**/*.js'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest
      }
    },
    rules: {
      'no-unused-vars': 'off'
    }
  },
  {
    files: ['playwright.config.cjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  },
  {
    files: ['vite.config.mjs'],
    languageOptions: {
      globals: {
        ...globals.node
      }
    }
  }
];
