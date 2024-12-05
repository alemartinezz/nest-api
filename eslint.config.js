import typescriptParser from '@typescript-eslint/parser';
import plugin from './eslint.rules.js';
import prettier from 'eslint-plugin-prettier';

const __dirname = new URL('.', import.meta.url).pathname;

export default [
  {
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        project: './tsconfig.json',
        tsconfigRootDir: __dirname,
      },
    },
    ignores: ['eslint.config.js', 'eslint.rules.js'],
    plugins: {
      plugin, // Object notation for plugins
      prettier, // Directly use the imported `prettier` plugin
    },
    rules: {
      'plugin/no-blank-line-between-closing-braces': 'warn',
      'plugin/blank-line-before-return': 'warn',
      'plugin/no-blank-line-before-catch': 'warn',
      'prettier/prettier': [
        'warn', // Run Prettier as an ESLint rule
        {
          singleQuote: true,
          proseWrap: 'always',
          tabWidth: 4,
          useTabs: true,
          trailingComma: 'none',
          bracketSpacing: true,
          jsxBracketSameLine: false,
          semi: true,
          printWidth: 77,
        },
      ],

      // Ensure no multiple consecutive empty lines
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],

      // Enforce consistent brace style (1TBS)
      'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    },
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
  },
];
