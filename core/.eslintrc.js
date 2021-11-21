module.exports = {
	root: true,
	parser: '@typescript-eslint/parser',
	parserOptions: {
		project: './tsconfig.json'
	},
	extends: [
		'../.eslintrc.js',
	],
	rules: {
	},
	env: {
		node: true,
	},
}
