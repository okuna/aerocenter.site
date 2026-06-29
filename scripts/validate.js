#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const VALID_TYPES = new Set(['label', 'airway', 'vorDegree', 'boundary']);

let failures = 0;
function fail(msg) {
	console.error(`✗ ${msg}`);
	failures++;
}
function pass(msg) {
	console.log(`✓ ${msg}`);
}

// 1. mapQuizItems shape
try {
	const src = fs.readFileSync(path.join(ROOT, 'map/quizItems.js'), 'utf8');
	const mapQuizItems = new Function(`${src}\nreturn mapQuizItems;`)();
	if (!Array.isArray(mapQuizItems) || mapQuizItems.length === 0) {
		fail('mapQuizItems must be a non-empty array');
	} else {
		const seen = new Set();
		let itemErrors = 0;
		mapQuizItems.forEach((item, i) => {
			if (typeof item.id !== 'string' || item.id === '') {
				fail(`item[${i}]: missing or empty "id"`);
				itemErrors++;
			}
			if (typeof item.answer !== 'string' || item.answer === '') {
				fail(`item[${i}] (id=${item.id}): missing or empty "answer"`);
				itemErrors++;
			}
			if (!VALID_TYPES.has(item.type)) {
				fail(`item[${i}] (id=${item.id}): invalid type "${item.type}" — must be one of ${[...VALID_TYPES].join(', ')}`);
				itemErrors++;
			}
			const key = `${item.id}_${item.answer}`;
			if (seen.has(key)) {
				fail(`duplicate entry: ${key}`);
				itemErrors++;
			}
			seen.add(key);
		});
		if (itemErrors === 0) {
			pass(`mapQuizItems: ${mapQuizItems.length} entries, all valid`);
		}
	}
} catch (err) {
	fail(`mapQuizItems failed to parse: ${err.message}`);
}

// 2. Cache-buster ?id= values match between script tags in index.html
try {
	const html = fs.readFileSync(path.join(ROOT, 'map/index.html'), 'utf8');
	const ids = [...html.matchAll(/<script src="[^"]+\?id=([^"]+)"/g)].map(m => m[1]);
	if (ids.length < 2) {
		fail(`expected at least 2 script tags with ?id=, found ${ids.length}`);
	} else if (new Set(ids).size > 1) {
		fail(`script ?id= values differ: ${[...new Set(ids)].join(', ')}`);
	} else {
		pass(`cache-buster ?id=${ids[0]} consistent across ${ids.length} script tags`);
	}
} catch (err) {
	fail(`cache-buster check failed: ${err.message}`);
}

console.log();
if (failures > 0) {
	console.error(`${failures} check(s) failed.`);
	process.exit(1);
}
console.log('All checks passed.');
