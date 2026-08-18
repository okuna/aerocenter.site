const js = require('@eslint/js');

const browserGlobals = {
	document: 'readonly',
	window: 'readonly',
	fetch: 'readonly',
	console: 'readonly',
};

module.exports = [
	js.configs.recommended,
	{
		// quizItems.js defines mapQuizItems as a top-level const consumed by src.js.
		files: ['map/quizItems.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'script',
			globals: browserGlobals,
		},
		rules: {
			'no-unused-vars': 'off',
		},
	},
	{
		// src.js consumes mapQuizItems (defined in quizItems.js) and exposes
		// functions called from inline HTML handlers.
		files: ['map/src.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'script',
			globals: {
				...browserGlobals,
				mapQuizItems: 'readonly',
			},
		},
		rules: {
			'no-unused-vars': ['error', { varsIgnorePattern: '.*' }],
		},
	},
	{
		files: ['scripts/**/*.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: {
				console: 'readonly',
				process: 'readonly',
				__dirname: 'readonly',
				require: 'readonly',
			},
		},
	},
	{
		files: ['tests/**/*.js', 'playwright.config.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'commonjs',
			globals: {
				console: 'readonly',
				process: 'readonly',
				module: 'readonly',
				require: 'readonly',
				document: 'readonly',
				mapQuizItems: 'readonly',
				checkBoxes: 'readonly',
			},
		},
	},
];
