module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json'
	},
	plugins: [
		'@typescript-eslint',
	],
	extends: [
		'eslint:recommended',
		'plugin:@typescript-eslint/recommended',
	],
	rules: {
		'@typescript-eslint/no-explicit-any': 'off',
		'@typescript-eslint/no-non-null-assertion': 'off',
		'@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: "^_" }],
		'@typescript-eslint/type-annotation-spacing': ['error'],
		'array-bracket-spacing': ['error', 'never'],
		'arrow-spacing': ['error'],
		'comma-dangle': ['off', 'ignore'],
		'comma-spacing': ['error', { before: false, after: true }],

		// Indentation
		// Disable the typical indenting in favor of TypeScript indenting as per:
		// https://github.com/typescript-eslint/typescript-eslint/blob/master/packages/eslint-plugin/docs/rules/indent.md
		// It works for JavaScript files.
		indent: 'off',
		'@typescript-eslint/indent': ['error', 'tab', { SwitchCase: 1 }],

		'key-spacing': ['error'],
		'keyword-spacing': ['error'],
		'linebreak-style': ['error', 'unix'],
		'no-tabs': 0,
		'no-trailing-spaces': ['error', { skipBlankLines: false, ignoreComments: false, }],
		'object-curly-spacing': ['error', 'always'],
		'operator-linebreak': ['off'],
		quotes: ['off'],
		semi: ['error', 'never'],
		'space-before-function-paren': [2, {
			named: 'never',
			anonymous: 'always',
			asyncArrow: 'always'
		}],
		'space-in-parens': ['error', 'never'],
		'space-infix-ops': ['error', { int32Hint: false }],
	},
	env: {
		node: true,
	},
	ignorePatterns: [
		//Other projects
		'/core/',
		'/extension/',
		'/react-core/',
		'/site/',
		// Coverage
		'/coverage/',
		// Build
		'/build/',
		'/dist/',
		'/lib/',
		'/out/',
		// Other
		'node_modules/',
		'/.yarn/',
		'/.git*',
	]
}
