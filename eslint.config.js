// eslint.config.js

import typescriptParser from "@typescript-eslint/parser";
import stylisticTs from "@stylistic/eslint-plugin-ts";
import stylisticJs from "@stylistic/eslint-plugin-js";
import prettier from "eslint-plugin-prettier";

const __dirname = new URL(
	".",
	import.meta.url
).pathname;

export default [
	{
		files: [
			"**/*.ts",
			"**/*.tsx",
			"**/*.js"
		],
		languageOptions: {
			parser: typescriptParser,
			parserOptions: {
				ecmaVersion: 2024,
				sourceType: "module",
				project: "**/tsconfig.json",
				tsconfigRootDir: __dirname
			}
		},
		ignores: [
			"node_modules",
			"dist",
			"lib",
			"build",
			"coverage",
			"public",
			"scripts",
			"tmp"
		],
		plugins: {
			stylisticTs,
			stylisticJs,
			prettier
		},
		rules: {
			"stylisticJs/eol-last": [
				"warn",
				"always"
			],
			"stylisticJs/no-trailing-spaces": [
				"warn",
				{
					ignoreComments: false,
					skipBlankLines: false
				}
			],
			"stylisticJs/key-spacing": [
				"warn",
				{
					beforeColon: false,
					afterColon: true,
					mode: "strict"
				}
			],
			"stylisticJs/keyword-spacing": [
				"warn",
				{
					before: true,
					after: true
				}
			],
			"stylisticJs/newline-per-chained-call": [
				"warn",
				{
					ignoreChainWithDepth: 1
				}
			],
			"stylisticJs/indent": [
				"warn",
				"tab",
				{
					SwitchCase: 1,
					VariableDeclarator: 1,
					outerIIFEBody: 1,
					FunctionDeclaration: {
						parameters: 1,
						body: 1
					},
					FunctionExpression: {
						parameters: 1,
						body: 1
					},
					CallExpression: {
						arguments: 1
					},
					ArrayExpression: 1,
					ObjectExpression: 1,
					ImportDeclaration: 1
				}
			],
			"stylisticJs/max-len": [
				"off",
				{
					code: 80,
					tabWidth: 4,
					ignoreComments: false,
					ignoreTrailingComments: true,
					ignoreUrls: false,
					ignoreStrings: false,
					ignoreTemplateLiterals: true,
					ignoreRegExpLiterals: true
				}
			],
			"stylisticJs/max-statements-per-line": [
				"warn",
				{
					max: 1
				}
			],
			"stylisticTs/padding-line-between-statements": [
				"warn",

				// Prevent blank lines between consecutive export statements
				{
					blankLine: "never",
					prev: "export",
					next: "export"
				},

				// Existing rules to enforce blank lines between other statements
				{
					blankLine: "always",
					prev: "*",
					next: [
						"block",
						"block-like",
						"break",
						"class",
						"continue",
						"default",
						"directive",
						"do",
						"empty",
						"expression",
						"for",
						"function",
						"if",
						"iife",
						"multiline-block-like",
						"multiline-const",
						"multiline-export",
						"multiline-expression",
						"multiline-let",
						"multiline-var",
						"return",
						"switch",
						"throw",
						"try",
						"var",
						"while",
						"with"
					]
				},
				{
					blankLine: "always",
					prev: [
						"block",
						"block-like",
						"break",
						"class",
						"continue",
						"default",
						"directive",
						"do",
						"empty",
						"expression",
						"for",
						"function",
						"if",
						"iife",
						"multiline-block-like",
						"multiline-const",
						"multiline-export",
						"multiline-expression",
						"multiline-let",
						"multiline-var",
						"return",
						"switch",
						"throw",
						"try",
						"var",
						"while",
						"with"
					],
					next: "*"
				},
				{
					blankLine: "never",
					prev: "import",
					next: "import"
				},
				{
					blankLine: "always",
					prev: "*",
					next: "export"
				}
			],
			"stylisticJs/padded-blocks": [
				"warn",
				"never"
			],
			"no-multiple-empty-lines": [
				"warn",
				{
					max: 1,
					maxEOF: 0,
					maxBOF: 0
				}
			],
			"stylisticTs/no-extra-parens": [
				"warn",
				"all",
				{
					ignoreJSX: "multi-line",
					conditionalAssign: false
				}
			],
			"stylisticTs/comma-spacing": [
				"warn",
				{
					before: false,
					after: true
				}
			],
			"stylisticJs/object-property-newline": [
				"warn",
				{
					allowAllPropertiesOnSameLine: false
				}
			],
			"stylisticJs/object-curly-newline": [
				"warn",
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
			"stylisticJs/object-curly-spacing": [
				"warn",
				"always"
			],
			"stylisticJs/function-paren-newline": [
				"warn",
				{
					minItems: 2
				}
			],
			"stylisticJs/function-call-argument-newline": [
				"warn",
				"always"
			],
			"stylisticJs/array-bracket-newline": [
				"warn",
				{
					minItems: 1
				}
			],
			"stylisticJs/array-bracket-spacing": [
				"warn",
				"always"
			],
			"stylisticJs/array-element-newline": [
				"warn",
				"always"
			],
			"stylisticTs/brace-style": [
				"warn",
				"1tbs",
				{
					allowSingleLine: true
				}
			],
			"stylisticJs/multiline-ternary": [
				"warn",
				"always"
			],
			"stylisticJs/arrow-spacing": [
				"warn",
				{
					before: true,
					after: true
				}
			],
			"stylisticJs/arrow-parens": [
				"warn",
				"always"
			],
			"stylisticJs/block-spacing": [
				"warn",
				"always"
			],
			"stylisticJs/comma-style": [
				"warn",
				"last"
			],
			"stylisticJs/comma-dangle": [
				"warn",
				"never"
			],
			"stylisticJs/lines-around-comment": [
				"warn",
				{
					beforeBlockComment: true,
					afterBlockComment: false,
					beforeLineComment: true,
					afterLineComment: false,
					allowBlockStart: true,
					allowObjectStart: true,
					allowObjectEnd: false,
					allowArrayStart: true,
					allowArrayEnd: false,
					allowClassStart: true,
					allowClassEnd: false,
					applyDefaultIgnorePatterns: true,
					afterHashbangComment: true
				}
			]
		}
	}
];
