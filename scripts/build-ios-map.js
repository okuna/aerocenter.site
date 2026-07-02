#!/usr/bin/env node
// Builds ios/AeroCenter/Resources/map.html: a single self-contained copy of
// the map quiz for the iOS app's WKWebView. The SVG and scripts are inlined
// because fetch()/external file references are not usable from a file:// page
// inside WKWebView. Re-run this script whenever map/map.svg, map/quizItems.js,
// map/src.js, or map/index.html change:
//
//   npm run build:ios-map
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, 'ios/AeroCenter/Resources/map.html');

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

const indexHtml = read('map/index.html');
const quizItems = read('map/quizItems.js');
const srcJs = read('map/src.js');
// Drop the XML prolog; the SVG is embedded in an HTML document.
const svg = read('map/map.svg').replace(/^<\?xml[^>]*\?>\s*/, '');

// Reuse the styles from the web page verbatim.
const style = extract(indexHtml, '<style>', '</style>', 'style block') + '</style>';

// The toolbar, minus the "Back to AeroCenter Site" link (meaningless in-app).
const buttons = extract(indexHtml, '<div class="button">', '</div>', 'button toolbar')
	.replace(/^\s*<a href="\/">.*<\/a>\s*$/m, '') + '</div>';

// The airspace/sector overlay, which ends where the map container begins.
const sectors = extract(indexHtml, '<div id="sectors">', '<div id="mapContainer">', 'sectors block');

const html = `<!DOCTYPE html>
<!-- GENERATED FILE - do not edit. Built from map/ by scripts/build-ios-map.js -->
<html>

<head>
	<meta charset="utf-8">
	<meta name="viewport" content="width=device-width, initial-scale=1, minimum-scale=.2, maximum-scale=2, user-scalable=yes" />
	<title>Aero Center Map</title>
	${style}
</head>

<body>

	${buttons}

	${sectors}
	<div id="mapContainer">${svg}</div>
	<div id="labels">
	</div>
	<script>
${quizItems}
	</script>
	<script>
${srcJs}
	</script>
	<script>
		renderAnswerInputs();
	</script>
</body>

</html>
`;

if (process.argv.includes('--check')) {
	const existing = fs.existsSync(OUT) ? fs.readFileSync(OUT, 'utf8') : null;
	if (existing !== html) {
		console.error(`✗ ${path.relative(ROOT, OUT)} is out of date — run: npm run build:ios-map`);
		process.exit(1);
	}
	console.log(`✓ ${path.relative(ROOT, OUT)} is up to date`);
} else {
	fs.mkdirSync(path.dirname(OUT), { recursive: true });
	fs.writeFileSync(OUT, html);
	console.log(`wrote ${path.relative(ROOT, OUT)} (${(html.length / 1024).toFixed(0)} KB)`);
}
