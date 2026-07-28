#!/usr/bin/env node
/**
 * Convert radar/map.svg into georeferenced GeoJSON.
 *
 * The radar map is a hand-drawn Inkscape chart whose pixel coordinates are the
 * app's native coordinate space. radar/src-v1-2.js converts real coordinates to
 * pixels with a transform calibrated at JAN only:
 *
 *     displayX = 62294.14889 - 682.85668 * longitude
 *     displayY = 14368.92359 - 420.05040 * latitude
 *
 * That longitude scale is ~2.1x too large, so any fix NOT drawn on the SVG (the
 * common case — AEX, KORD, STL) lands in the wrong place. This script instead
 * fits a 6-parameter affine transform by least squares over every drawn feature
 * that has a real-world counterpart in radar/fixes.json, then pushes ALL map
 * geometry through that one transform so the output stays mutually consistent.
 *
 * Usage:  node scripts/build-airspace.js [--out radar/airspace]
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SVG = path.join(ROOT, 'radar/map.svg');
const FIXES = path.join(ROOT, 'radar/fixes.json');

// VOR/VORTAC drawn as <circle>. Everything else is classified by id shape.
const VOR_IDS = new Set(['jan', 'mlu', 'mei', 'mcb', 'lby', 'igb', 'sqs', 'glh', 'hez', 'mon']);
// Inkscape auto-generated ids we never want to treat as a fix.
const GENERATED_ID = /^(path|g|circle|rect|use|tspan|text|flow|svg|defs|ellipse|polyline)\d*$/;
const FIX_ID = /^[a-z0-9]{3,5}$/;

const LAYERS = {
	layer2: 'boundary',	// Inkscape label "map"      — sector boundaries
	layer1: 'airway',	// Inkscape label "airways"
};

function classify(ident, tag) {
	if (VOR_IDS.has(ident)) return 'vor';
	if (tag === 'rect' || /^k[a-z]{3}$/.test(ident) || /^\d[a-z]\d$/.test(ident) || /^[a-z]\d{2}$/.test(ident)) {
		return 'airport';
	}
	return 'fix';
}

/** Least squares solve for v = c0 + c1*x + c2*y over the given points. */
function fitPlane(points, valueOf) {
	const n = points.length;
	let Sx = 0, Sy = 0, Sxx = 0, Sxy = 0, Syy = 0, Sv = 0, Svx = 0, Svy = 0;
	for (const p of points) {
		const v = valueOf(p);
		Sx += p.x; Sy += p.y;
		Sxx += p.x * p.x; Sxy += p.x * p.y; Syy += p.y * p.y;
		Sv += v; Svx += v * p.x; Svy += v * p.y;
	}
	const A = [[n, Sx, Sy], [Sx, Sxx, Sxy], [Sy, Sxy, Syy]];
	const b = [Sv, Svx, Svy];
	for (let i = 0; i < 3; i++) {
		let piv = i;
		for (let r = i + 1; r < 3; r++) {
			if (Math.abs(A[r][i]) > Math.abs(A[piv][i])) piv = r;
		}
		[A[i], A[piv]] = [A[piv], A[i]];
		[b[i], b[piv]] = [b[piv], b[i]];
		for (let r = i + 1; r < 3; r++) {
			const f = A[r][i] / A[i][i];
			for (let c = i; c < 3; c++) A[r][c] -= f * A[i][c];
			b[r] -= f * b[i];
		}
	}
	const c = [0, 0, 0];
	for (let i = 2; i >= 0; i--) {
		let s = b[i];
		for (let j = i + 1; j < 3; j++) s -= A[i][j] * c[j];
		c[i] = s / A[i][i];
	}
	return c;
}

/** Ramer-Douglas-Peucker on [lon, lat] pairs; tolerance in degrees. */
function simplify(pts, tol) {
	if (pts.length < 3) return pts;
	let maxDist = 0, idx = 0;
	const [ax, ay] = pts[0];
	const [bx, by] = pts[pts.length - 1];
	const dx = bx - ax, dy = by - ay;
	const len = Math.hypot(dx, dy);
	for (let i = 1; i < pts.length - 1; i++) {
		const [px, py] = pts[i];
		const d = len === 0
			? Math.hypot(px - ax, py - ay)
			: Math.abs(dy * px - dx * py + bx * ay - by * ax) / len;
		if (d > maxDist) { maxDist = d; idx = i; }
	}
	if (maxDist <= tol) return [pts[0], pts[pts.length - 1]];
	return [
		...simplify(pts.slice(0, idx + 1), tol).slice(0, -1),
		...simplify(pts.slice(idx), tol),
	];
}

function loadFixes() {
	// radar/fixes.json is not JSON — it is JS assigning `fixes_json = [...]`.
	const ctx = {};
	new Function('c', `${fs.readFileSync(FIXES, 'utf8')}; c.f = fixes_json;`)(ctx);
	const byIdent = new Map();
	for (const f of ctx.f) byIdent.set(f.ident.toUpperCase(), f);
	return byIdent;
}

/** Pull point centres and path polylines out of the SVG using a real browser. */
async function extractGeometry() {
	const { chromium } = require('@playwright/test');
	const launch = {};
	// Prefer the environment's pre-installed Chromium over a version-pinned download.
	for (const candidate of fs.existsSync('/opt/pw-browsers') ? fs.readdirSync('/opt/pw-browsers') : []) {
		const exe = `/opt/pw-browsers/${candidate}/chrome-linux/chrome`;
		if (candidate.startsWith('chromium-') && fs.existsSync(exe)) launch.executablePath = exe;
	}
	const browser = await chromium.launch(launch);
	try {
		const page = await browser.newPage({ viewport: { width: 1600, height: 1400 } });
		await page.setContent(
			`<!doctype html><html><body style="margin:0">${fs.readFileSync(SVG, 'utf8')}</body></html>`,
			{ waitUntil: 'load' },
		);
		// The callback below is serialized and run inside the browser, so it sees
		// DOM globals rather than Node's.
		/* global document */
		return await page.evaluate(({ layers, genRe, fixRe }) => {
			const generated = new RegExp(genRe);
			const fixId = new RegExp(fixRe);
			const svg = document.querySelector('svg');
			const root = svg.getScreenCTM().inverse();
			// Express every coordinate in the SVG's own user space so the result is
			// independent of where the element sits in the layer/transform tree.
			const toUser = (el, x, y) => {
				const p = svg.createSVGPoint();
				p.x = x; p.y = y;
				return p.matrixTransform(root.multiply(el.getScreenCTM()));
			};

			const points = [];
			for (const el of svg.querySelectorAll('[id]')) {
				const id = el.id;
				if (!fixId.test(id) || generated.test(id)) continue;
				const b = el.getBoundingClientRect();
				if (b.width === 0 && b.height === 0) continue;
				const sp = svg.createSVGPoint();
				sp.x = b.left + b.width / 2;
				sp.y = b.top + b.height / 2;
				const u = sp.matrixTransform(root);
				points.push({ ident: id, tag: el.tagName.toLowerCase(), x: u.x, y: u.y });
			}

			const lines = [];
			for (const [layerId, kind] of Object.entries(layers)) {
				const layer = document.getElementById(layerId);
				if (!layer) continue;
				for (const el of layer.querySelectorAll('path')) {
					let total;
					try { total = el.getTotalLength(); } catch { continue; }
					if (!isFinite(total) || total < 2) continue;
					// Sample every ~3px; straight runs get collapsed later by RDP.
					const step = 3;
					const coords = [];
					for (let d = 0; d <= total; d += step) {
						const pt = el.getPointAtLength(d);
						const u = toUser(el, pt.x, pt.y);
						coords.push([u.x, u.y]);
					}
					const last = el.getPointAtLength(total);
					const lu = toUser(el, last.x, last.y);
					coords.push([lu.x, lu.y]);
					lines.push({ kind, id: el.id, coords });
				}
			}
			return { points, lines };
		}, { layers: LAYERS, genRe: GENERATED_ID.source, fixRe: FIX_ID.source });
	} finally {
		await browser.close();
	}
}

async function main() {
	const outDir = (() => {
		const i = process.argv.indexOf('--out');
		return path.resolve(ROOT, i > -1 ? process.argv[i + 1] : 'radar/airspace');
	})();

	const truth = loadFixes();
	const { points, lines } = await extractGeometry();

	// Control points: drawn features with a real-world counterpart. fixes.json
	// stores WEST longitude as a positive number, so negate for signed degrees.
	const control = [];
	for (const p of points) {
		const t = truth.get(p.ident.toUpperCase()) || truth.get(`K${p.ident.toUpperCase()}`);
		if (t) control.push({ ...p, lat: t.latitude_deg, lon: -t.longitude_deg });
	}
	if (control.length < 3) throw new Error(`need >=3 control points, found ${control.length}`);

	const latC = fitPlane(control, p => p.lat);
	const lonC = fitPlane(control, p => p.lon);
	const toLatLon = (x, y) => [
		lonC[0] + lonC[1] * x + lonC[2] * y,
		latC[0] + latC[1] * x + latC[2] * y,
	];

	// Residuals, in nautical miles, tell us how faithful the hand drawing is.
	const residuals = control.map(p => {
		const [lon, lat] = toLatLon(p.x, p.y);
		return {
			ident: p.ident,
			nm: Math.hypot((lat - p.lat) * 60, (lon - p.lon) * 60 * Math.cos(p.lat * Math.PI / 180)),
		};
	}).sort((a, b) => b.nm - a.nm);
	const meanNm = residuals.reduce((s, r) => s + r.nm, 0) / residuals.length;

	// px/nm derived from the latitude scale (1 degree latitude == 60 nm exactly).
	const pxPerNm = Math.abs(1 / latC[2]) / 60;

	const navaids = {
		type: 'FeatureCollection',
		features: points.map(p => {
			const [lon, lat] = toLatLon(p.x, p.y);
			const t = truth.get(p.ident.toUpperCase()) || truth.get(`K${p.ident.toUpperCase()}`);
			return {
				type: 'Feature',
				geometry: { type: 'Point', coordinates: [+lon.toFixed(6), +lat.toFixed(6)] },
				properties: {
					ident: p.ident.toUpperCase(),
					type: classify(p.ident, p.tag),
					// Where a surveyed position exists, keep it — it is authoritative.
					surveyed: t ? true : false,
					...(t ? { lat: t.latitude_deg, lon: -t.longitude_deg } : {}),
				},
			};
		}),
	};

	// Boundaries and airways, one FeatureCollection each.
	const asLineCollection = kind => ({
		type: 'FeatureCollection',
		features: lines.filter(l => l.kind === kind).map(l => {
			const coords = simplify(
				l.coords.map(([x, y]) => toLatLon(x, y)),
				0.0004, // ~1.4 nm of latitude; keeps shape, drops sampling noise
			).map(([lon, lat]) => [+lon.toFixed(6), +lat.toFixed(6)]);
			return {
				type: 'Feature',
				geometry: { type: 'LineString', coordinates: coords },
				properties: { id: l.id, kind },
			};
		}).filter(f => f.geometry.coordinates.length >= 2),
	});

	const boundaries = asLineCollection('boundary');
	const airways = asLineCollection('airway');

	const calibration = {
		note: 'Affine fit of radar/map.svg pixel space to WGS84, by least squares over drawn features present in radar/fixes.json.',
		generatedBy: 'scripts/build-airspace.js',
		controlPoints: control.length,
		lonFromPixel: { c0: lonC[0], cx: lonC[1], cy: lonC[2] },
		latFromPixel: { c0: latC[0], cx: latC[1], cy: latC[2] },
		pixelsPerNauticalMile: +pxPerNm.toFixed(5),
		residualsNm: { mean: +meanNm.toFixed(3), worst: +residuals[0].nm.toFixed(3), worstIdent: residuals[0].ident },
	};

	fs.mkdirSync(outDir, { recursive: true });
	const write = (name, data) => {
		fs.writeFileSync(path.join(outDir, name), `${JSON.stringify(data, null, '\t')}\n`);
		return `${name} (${fs.statSync(path.join(outDir, name)).size} bytes)`;
	};

	console.log(`control points      ${control.length}`);
	console.log(`residual mean/worst ${meanNm.toFixed(2)} nm / ${residuals[0].nm.toFixed(2)} nm (${residuals[0].ident})`);
	console.log(`pixels per nm       ${pxPerNm.toFixed(4)}  (legacy constant 6.31571)`);
	console.log(`wrote ${write('navaids.geojson', navaids)}  ${navaids.features.length} features`);
	console.log(`wrote ${write('boundaries.geojson', boundaries)}  ${boundaries.features.length} features`);
	console.log(`wrote ${write('airways.geojson', airways)}  ${airways.features.length} features`);
	console.log(`wrote ${write('calibration.json', calibration)}`);
}

main().catch(err => {
	console.error(err);
	process.exit(1);
});
