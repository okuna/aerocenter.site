#!/usr/bin/env node
/* global document, getComputedStyle, mapQuizItems */
// Builds the native iOS map quiz resources in ios/AeroCenter/Resources:
//
//   mapData.json - quiz item positions/rotations and airspace sector labels,
//                  measured from the SVG geometry the same way the website's
//                  renderAnswerInputs() places its <input> overlays
//   map.png      - the map SVG rasterized at 2x
//
// A headless Chromium (via the repo's Playwright dev dependency) does the
// measuring and rasterizing so the numbers match the website exactly.
// Re-run whenever map/map.svg, map/quizItems.js, map/src.js, or the sector
// overlay in map/index.html change:
//
//   npm run build:ios-map
//
// Pass --check to verify mapData.json is up to date without rewriting
// anything (used by npm test). Set CHROMIUM_EXECUTABLE to use a Chromium
// binary other than the one Playwright downloaded.
const fs = require('fs');
const path = require('path');
const { chromium } = require('@playwright/test');

const ROOT = path.resolve(__dirname, '..');
const RESOURCES = path.join(ROOT, 'ios/AeroCenter/Resources');
const JSON_OUT = path.join(RESOURCES, 'mapData.json');
const PNG_OUT = path.join(RESOURCES, 'map.png');

function read(rel) {
	return fs.readFileSync(path.join(ROOT, rel), 'utf8');
}

function extract(haystack, startMarker, endMarker, label) {
	const start = haystack.indexOf(startMarker);
	if (start === -1) throw new Error(`could not find start of ${label} (${startMarker})`);
	const end = haystack.indexOf(endMarker, start);
	if (end === -1) throw new Error(`could not find end of ${label} (${endMarker})`);
	return haystack.slice(start, end);
}

function buildMeasurementPage() {
	const indexHtml = read('map/index.html');
	const quizItems = read('map/quizItems.js');
	const svg = read('map/map.svg').replace(/^<\?xml[^>]*\?>\s*/, '');
	const style = extract(indexHtml, '<style>', '</style>', 'style block') + '</style>';
	const sectors = extract(indexHtml, '<div id="sectors">', '<div id="mapContainer">', 'sectors block');

	// No <!DOCTYPE>: like the website, this page must render in quirks mode
	// because the sector overlay uses unitless CSS lengths (left: 435) that
	// standards mode ignores.
	return `<html>
<head>
<meta charset="utf-8">
${style}
</head>
<body>
${sectors}
<div id="mapContainer">${svg}</div>
<script>${quizItems}</script>
</body>
</html>`;
}

// Runs in the browser. Positions mirror the placement rules of
// renderAnswerInputs() in map/src.js; keep the two in sync.
function measure() {
	const svg = document.querySelector('#mapContainer svg');
	const box = svg.getBoundingClientRect();
	const round = (v) => Math.round(v * 100) / 100;

	const items = [];
	for (const item of mapQuizItems) {
		const el = document.getElementById(item.id);
		if (!el) continue;
		const rect = el.getBoundingClientRect();
		const cx = rect.left + rect.width / 2 - box.left;
		const cy = rect.top + rect.height / 2 - box.top;
		let x = cx;
		let y = cy;
		let rotation = 0;
		let align = 'center';
		if (item.type === 'label' || item.type === 'airway') {
			y = cy - 15;
		} else if (item.type === 'vorDegree') {
			const deg = parseInt(item.answer, 10);
			rotation = deg < 180 ? deg - 90 : deg - 270;
			align = deg < 180 ? 'leading' : 'trailing';
			x = cx + Math.sin(deg * (Math.PI / 180)) * 50;
			y = cy - Math.cos(deg * (Math.PI / 180)) * 50;
		} else if (item.type === 'boundary') {
			// A few boundary shapes carry a translate() instead; the website
			// turns those into invalid CSS that the browser drops, so only
			// rotate() counts.
			const transform = el.getAttribute('transform'); // "rotate(NN.N)"
			if (transform !== null && transform.startsWith('rotate(')) {
				rotation = parseFloat(transform.substring(7));
			}
		}
		items.push({
			key: `${item.id}_${item.answer}`,
			answer: item.answer,
			type: item.type,
			x: round(x),
			y: round(y),
			rotation: round(rotation),
			align,
		});
	}

	const colorNames = { 'rgb(0, 128, 0)': 'green', 'rgb(255, 0, 0)': 'red' };
	const sectors = [];
	for (const el of document.querySelectorAll('.sectorText')) {
		const rect = el.getBoundingClientRect();
		sectors.push({
			x: round(rect.left - box.left),
			y: round(rect.top - box.top),
			color: colorNames[getComputedStyle(el).color] || 'black',
			underlineFirst: el.querySelector('u') !== null,
			lines: el.innerText.split('\n').map((s) => s.trim()).filter((s) => s !== ''),
		});
	}

	return { width: Math.round(box.width), height: Math.round(box.height), items, sectors };
}

function closeEnough(a, b) {
	return Math.abs(a - b) <= 0.5;
}

// Numeric comparison with tolerance so tiny sub-pixel differences between
// Chromium builds don't fail CI.
function sameData(a, b) {
	if (!a || a.width !== b.width || a.height !== b.height) return false;
	if (a.items.length !== b.items.length || a.sectors.length !== b.sectors.length) return false;
	for (let i = 0; i < a.items.length; i++) {
		const x = a.items[i], y = b.items[i];
		if (x.key !== y.key || x.answer !== y.answer || x.type !== y.type || x.align !== y.align) return false;
		if (!closeEnough(x.x, y.x) || !closeEnough(x.y, y.y) || !closeEnough(x.rotation, y.rotation)) return false;
	}
	for (let i = 0; i < a.sectors.length; i++) {
		const x = a.sectors[i], y = b.sectors[i];
		if (x.color !== y.color || x.underlineFirst !== y.underlineFirst) return false;
		if (x.lines.join('\n') !== y.lines.join('\n')) return false;
		if (!closeEnough(x.x, y.x) || !closeEnough(x.y, y.y)) return false;
	}
	return true;
}

(async () => {
	const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_EXECUTABLE });
	const page = await browser.newPage({
		viewport: { width: 1450, height: 1260 },
		deviceScaleFactor: 2,
	});
	await page.setContent(buildMeasurementPage());
	const data = await page.evaluate(measure);

	if (process.argv.includes('--check')) {
		await browser.close();
		let existing = null;
		try {
			existing = JSON.parse(fs.readFileSync(JSON_OUT, 'utf8'));
		} catch {
			// missing or unparseable; sameData() will fail below
		}
		if (!sameData(existing, data) || !fs.existsSync(PNG_OUT)) {
			console.error(`✗ ${path.relative(ROOT, RESOURCES)} is out of date — run: npm run build:ios-map`);
			process.exit(1);
		}
		console.log(`✓ ${path.relative(ROOT, RESOURCES)} is up to date`);
		return;
	}

	// The sector overlay is rendered natively; keep it out of the raster.
	await page.evaluate(() => {
		document.getElementById('sectors').style.display = 'none';
	});
	fs.mkdirSync(RESOURCES, { recursive: true });
	await page.locator('#mapContainer svg').screenshot({ path: PNG_OUT });
	await browser.close();

	fs.writeFileSync(JSON_OUT, JSON.stringify(data, null, '\t') + '\n');
	console.log(`wrote ${path.relative(ROOT, JSON_OUT)} (${data.items.length} items, ${data.sectors.length} sectors)`);
	console.log(`wrote ${path.relative(ROOT, PNG_OUT)} (${(fs.statSync(PNG_OUT).size / 1024).toFixed(0)} KB)`);
})();
