const js = require('@eslint/js');

const browserGlobals = {
	document: 'readonly',
	window: 'readonly',
	fetch: 'readonly',
	console: 'readonly',
};

module.exports = [
	// Vendored third-party code — see radar/eram/vendor/NOTICE.
	{ ignores: ['radar/eram/vendor/**', 'node_modules/**'] },
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
		// UMD module: runs in the browser via <script> and in Node via require()
		// for scripts/validate.js.
		files: ['radar/sim/**/*.js', 'radar/eram/sim-bridge.js'],
		languageOptions: {
			ecmaVersion: 2022,
			sourceType: 'script',
			globals: {
				...browserGlobals,
				self: 'readonly',
				location: 'readonly',
				localStorage: 'readonly',
				URL: 'readonly',
				URLSearchParams: 'readonly',
				Response: 'readonly',
				WebSocket: 'readonly',
				Promise: 'readonly',
				setTimeout: 'readonly',
				module: 'writable',
				setInterval: 'readonly',
				clearInterval: 'readonly',
			},
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
				// page.evaluate() callbacks are serialized into the browser.
				window: 'readonly',
				mapQuizItems: 'readonly',
				checkBoxes: 'readonly',
			},
		},
	},
];
