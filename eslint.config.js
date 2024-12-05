// eslint.config.js

import typescriptParser from '@typescript-eslint/parser';
import stylisticTs from '@stylistic/eslint-plugin-ts';
import stylisticJs from '@stylistic/eslint-plugin-js';

const __dirname = new URL(
    '.',
    import.meta.url
).pathname;

export default [
    {
        files: [
            '**/*.ts',
            '**/*.tsx',
            '**/*.js'
        ],
        languageOptions: {
            parser: typescriptParser,
            parserOptions: {
                ecmaVersion: 2022,
                sourceType: 'module',
                project: '**/tsconfig.json',
                tsconfigRootDir: __dirname
            }
        },
        ignores: [
            'node_modules',
            'dist',
            'lib',
            'build',
            'coverage',
            'public',
            'scripts',
            'tmp'
        ],
        plugins: {
            stylisticTs,
            stylisticJs
        },
        rules: {
            // Blank Line Management Using `stylisticTs` Plugin
            'stylisticTs/padding-line-between-statements': [
                'error',
                {
                    blankLine: 'always',
                    prev: [
                        'block-like',
                        'multiline-block-like',
                        'multiline-const',
                        'multiline-expression',
                        'multiline-let',
                        'throw'
                    ],
                    next: '*'
                },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: 'return'
                },
                {
                    blankLine: 'always',
                    prev: '*',
                    next: 'throw'
                },
                {
                    blankLine: 'never',
                    prev: 'import',
                    next: 'import'
                }
            ],

            // Avoid blank lines as first and last line inside blocks
            'stylisticJs/padded-blocks': [
                'error',
                'never'
            ],

            // Use ESLint's Core Rules Where Appropriate
            'no-multiple-empty-lines': [
                'error',
                {
                    max: 1,
                    maxEOF: 0,
                    maxBOF: 0
                }
            ],

            // Restrict the use of parentheses to only where they are necessary
            'stylisticTs/no-extra-parens': [
                'error',
                'all',
                {
                    ignoreJSX: 'multi-line',
                    conditionalAssign: false
                }
            ],

            // Enforce consistent spacing before and after commas
            'stylisticTs/comma-spacing': [
                'error',
                {
                    before: false,
                    after: true
                }
            ],

            // Object formatting rules using stylisticJs
            'stylisticJs/object-property-newline': [
                'error',
                {
                    allowAllPropertiesOnSameLine: false
                }
            ],

            'stylisticJs/object-curly-newline': [
                'error',
                {
                    ObjectExpression: {
                        minProperties: 1
                    },
                    ObjectPattern: {
                        minProperties: 1
                    },
                    ImportDeclaration: {
                        minProperties: 2
                    },
                    ExportDeclaration: {
                        multiline: true,
                        minProperties: 1
                    }
                }
            ],

            'stylisticJs/object-curly-spacing': [
                'error',
                'always'
            ],

            // Functions formatting rules using stylisticJs
            'stylisticJs/function-paren-newline': [
                'error',
                {
                    "minItems": 1
                }
            ],

            'stylisticJs/function-call-argument-newline': [
                'error',
                'always'
            ],

            // Array formatting rules
            'stylisticJs/array-bracket-newline': [
                'error',
                'always'
            ],
            'stylisticJs/array-bracket-spacing': [
                'error',
                'always'
            ],
            'stylisticJs/array-element-newline': [
                'error',
                'always'
            ],

            // Enforce consistent indentation
            'indent': [
                'error',
                4
            ],

            // Enforce consistent spacing inside braces
            'stylisticTs/brace-style': [
                'error',
                '1tbs',
                {
                    allowSingleLine: true
                }
            ],

            'stylisticJs/multiline-ternary': [
                'error',
                'always'
            ]
        }
    }
];
