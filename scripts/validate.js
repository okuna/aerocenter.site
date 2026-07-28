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

// 2. Georeferenced airspace
const AIRSPACE = path.join(ROOT, 'radar/airspace');
// Bounds of the drawn chart, with margin — catches a transform regression that
// would silently throw the whole airspace onto another continent.
const BBOX = { lonMin: -94, lonMax: -86, latMin: 29, latMax: 36 };
let navaidsGeo = null;
try {
	const collections = ['navaids', 'boundaries', 'airways'].map(name => ({
		name,
		data: JSON.parse(fs.readFileSync(path.join(AIRSPACE, `${name}.geojson`), 'utf8')),
	}));
	let geoErrors = 0;
	for (const { name, data } of collections) {
		if (data.type !== 'FeatureCollection' || !Array.isArray(data.features) || data.features.length === 0) {
			fail(`${name}.geojson: not a non-empty FeatureCollection`);
			geoErrors++;
			continue;
		}
		if (name === 'navaids') navaidsGeo = data;
		for (const f of data.features) {
			const coords = f.geometry.type === 'Point' ? [f.geometry.coordinates] : f.geometry.coordinates;
			for (const [lon, lat] of coords) {
				if (lon < BBOX.lonMin || lon > BBOX.lonMax || lat < BBOX.latMin || lat > BBOX.latMax) {
					fail(`${name}.geojson: coordinate out of bounds (${lon}, ${lat})`);
					geoErrors++;
					break;
				}
			}
		}
	}
	const cal = JSON.parse(fs.readFileSync(path.join(AIRSPACE, 'calibration.json'), 'utf8'));
	// The legacy milesToPixels constant is 6.31571; a fit that drifts far from
	// it means the control points or the transform have gone wrong.
	if (Math.abs(cal.pixelsPerNauticalMile - 6.31571) > 0.1) {
		fail(`calibration: ${cal.pixelsPerNauticalMile} px/nm differs sharply from the legacy 6.31571`);
		geoErrors++;
	}
	if (geoErrors === 0) {
		pass(`airspace: ${collections.map(c => `${c.data.features.length} ${c.name}`).join(', ')}, ${cal.pixelsPerNauticalMile} px/nm`);
	}
} catch (err) {
	fail(`airspace failed to validate: ${err.message}`);
}

// 3. Scenarios load, resolve, and fly
try {
	const ScenarioPlayer = require(path.join(ROOT, 'radar/sim/scenario-player.js'));
	const fixCtx = {};
	new Function('c', `${fs.readFileSync(path.join(ROOT, 'radar/fixes.json'), 'utf8')}; c.f = fixes_json;`)(fixCtx);
	const index = JSON.parse(fs.readFileSync(path.join(ROOT, 'radar/scenarios/index.json'), 'utf8'));
	let scenarioErrors = 0;
	let totalAircraft = 0;
	for (const entry of index) {
		const scenario = JSON.parse(fs.readFileSync(path.join(ROOT, 'radar/scenarios', entry.file), 'utf8'));
		if (scenario.aircraft.length !== entry.aircraft) {
			fail(`${entry.file}: index says ${entry.aircraft} aircraft, file has ${scenario.aircraft.length}`);
			scenarioErrors++;
		}
		const player = new ScenarioPlayer({ scenario, navaids: navaidsGeo, fixes: fixCtx.f });
		if (player.unresolved.length > 0) {
			fail(`${entry.file}: unresolved start/route for ${player.unresolved.join(', ')}`);
			scenarioErrors++;
		}
		// Fly an hour; every aircraft must either still be airborne or have landed.
		let moved = 0;
		player.onMessage(msg => {
			if (msg.type === 'batch') moved += msg.data.length;
		});
		for (let i = 0; i < 300; i++) player.step(12);
		const accounted = player.snapshot().length + player.removed.size;
		if (accounted !== scenario.aircraft.length) {
			fail(`${entry.file}: ${accounted} of ${scenario.aircraft.length} aircraft accounted for after 1h`);
			scenarioErrors++;
		}
		if (moved === 0) {
			fail(`${entry.file}: produced no track updates`);
			scenarioErrors++;
		}
		totalAircraft += scenario.aircraft.length;
	}
	if (scenarioErrors === 0) {
		pass(`scenarios: ${index.length} files, ${totalAircraft} aircraft, all fixes resolved and flying`);
	}
} catch (err) {
	fail(`scenarios failed to validate: ${err.message}`);
}

// 4. The generated ERAM page is in sync with its assets
//
// The site deploys over FTP, overwriting files at the same URLs, so a browser
// will serve a stale script unless the URL changes. That is how a fresh
// scenario-loader.js once ran against a cached scenario-player.js. Every local
// asset must carry ?v=<hash of its contents>, which also catches editing a
// script without re-running scripts/build-eram-page.js.
try {
	const crypto = require('crypto');
	const pagePath = path.join(ROOT, 'radar/eram/index.html');
	const page = fs.readFileSync(pagePath, 'utf8');
	const pageDir = path.dirname(pagePath);
	let assetErrors = 0;
	let checked = 0;

	for (const m of page.matchAll(/(?:src|href)="([^"?:]+\.(?:js|css))(\?v=([a-f0-9]+))?"/g)) {
		const [, rel, , hash] = m;
		const file = path.resolve(pageDir, rel);
		if (!fs.existsSync(file)) {
			fail(`eram page references a missing asset: ${rel}`);
			assetErrors++;
			continue;
		}
		const want = crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex').slice(0, 8);
		if (!hash) {
			fail(`eram page asset has no cache-buster: ${rel}`);
			assetErrors++;
		} else if (hash !== want) {
			fail(`eram page is stale for ${rel} (has ${hash}, expected ${want}) — re-run scripts/build-eram-page.js`);
			assetErrors++;
		}
		checked++;
	}
	if (checked === 0) {
		fail('eram page references no local assets — the build likely failed');
		assetErrors++;
	}
	if (assetErrors === 0) pass(`eram page: ${checked} assets, all cache-busted and current`);
} catch (err) {
	fail(`eram page failed to validate: ${err.message}`);
}

console.log();
if (failures > 0) {
	console.error(`${failures} check(s) failed.`);
	process.exit(1);
}
console.log('All checks passed.');
