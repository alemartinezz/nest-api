// /Users/ale/projects/nest-api/eslint.config.js

import tsEslintPlugin from '@typescript-eslint/eslint-plugin';
import tsEslintParser from '@typescript-eslint/parser';
import globals from 'globals';
import path from 'path';
import { fileURLToPath } from 'url';

// Define __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default [
	{
		ignores: ['**/.eslintrc.js', 'dist/**']
	},
	{
		files: ['**/*.ts', '**/*.tsx', '**/*.d.ts', '**/*.config.ts'],
		ignores: ['dist/**', 'node_modules/**'],
		languageOptions: {
			parser: tsEslintParser,
			parserOptions: {
				project: path.join(__dirname, 'tsconfig.json'),
				tsconfigRootDir: __dirname,
				sourceType: 'module'
			},
			globals: {
				...globals.node,
				...globals.jest
			}
		},
		plugins: {
			'@typescript-eslint': tsEslintPlugin
		},
		rules: {
			'padding-line-between-statements': [
				'error',
				{
					blankLine: 'never',
					prev: 'import',
					next: 'import'
				},
				{
					blankLine: 'always',
					prev: 'import',
					next: '*'
				}
			]
		}
	}
];
