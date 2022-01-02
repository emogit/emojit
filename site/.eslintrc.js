module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json'
	},
	settings: {
		react: {
			version: 'detect',
		},
	},
	extends: [
		'../.eslintrc.js',
		'plugin:react/recommended',
	],
	rules: {
	},
	env: {
		browser: true,
		node: true,
	},
}
