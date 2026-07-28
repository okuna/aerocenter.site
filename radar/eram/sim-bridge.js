/**
 * Simulation bridge — lets the ERAM scope run against a saved scenario with no
 * server behind it.
 *
 * The scope is a read-only consumer: it opens a WebSocket to /ws and never
 * sends anything (there are no .send() calls in it at all), and every other
 * endpoint it uses degrades gracefully on a non-OK response. That makes it
 * drivable entirely from the browser. This module:
 *
 *   1. seeds the localStorage settings the facility selector would normally write,
 *   2. intercepts fetch() for the handful of map-data endpoints, serving the
 *      georeferenced airspace built by scripts/build-airspace.js,
 *   3. replaces window.WebSocket so /ws is fed by ScenarioPlayer.
 *
 * It must load BEFORE eram.js, which calls connectWs() at parse time.
 */

(function () {
	'use strict';

	const FACILITY = 'ZME';
	// Sector ids as drawn on the aerocenter chart (see map/index.html).
	const SECTORS = ['66', '45', '67', '15', '12', '65', 'F30', 'H40', 'H27', 'H65'];
	const SETTINGS_VERSION = 3;   // must match eram.js
	const STORAGE_KEY = 'eram-settings';
	const DATA = '../airspace';
	const SCENARIOS = '../scenarios';

	const params = new URLSearchParams(location.search);
	const scenarioId = params.get('scenario') || '11m';
	// Wall-clock seconds per simulated scan. Lower = faster than real time.
	const rate = Number(params.get('rate')) || 1;

	// Centroid of the drawn chart (radar/airspace/*.geojson spans roughly
	// -92.45..-87.79 lon, 31.04..34.43 lat) — without this the scope opens on
	// its own default view and the airspace sits off-screen.
	const HOME = { lat: 32.73, lng: -90.12, zoom: 8 };

	// ── 1. Settings the facility selector would have written ────────────────
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		const settings = raw ? JSON.parse(raw) || {} : {};
		settings.settingsVersion = SETTINGS_VERSION;
		settings.facility = FACILITY;
		if (!Array.isArray(settings.sectors) || settings.sectors.length === 0) {
			settings.sectors = SECTORS.slice();
		}
		// ?home=1 re-centres a scope whose saved view has drifted away.
		if (!settings.mapCenter || params.get('home') === '1') {
			settings.mapCenter = { lat: HOME.lat, lng: HOME.lng };
			settings.mapZoom = HOME.zoom;
		}
		// Show the layers we actually have data for. The boundary keys are the
		// category names eram.js uses (BOUNDARY_CATS), not the slider ids —
		// 'Low Altitude' in particular defaults to 0, which would hide every
		// aerocenter sector boundary.
		settings.boundaryBrightness = settings.boundaryBrightness || {
			'Ultra High': 0,
			'High Altitude': 0,
			'Low Altitude': 70,
			'Approach Control': 0,
		};
		settings.nasrBrightness = settings.nasrBrightness
			|| { jroutes: 0, vroutes: 45, vors: 60, airports: 45, centerlines: 0, proc: 0 };
		localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
	} catch (e) {
		console.warn('[sim] could not seed settings:', e);
	}

	// ── 2. Static data, shaped the way the scope expects ────────────────────
	const cache = {};
	const loadJson = async (url) => {
		if (!cache[url]) cache[url] = fetch(url).then(r => r.json());
		return cache[url];
	};

	const json = (body) => new Response(JSON.stringify(body), {
		status: 200,
		headers: { 'Content-Type': 'application/json' },
	});

	// Sector boundaries reach the scope as KML, not GeoJSON. loadKml() reads a
	// <Placemark> per sector and takes the ARTCC and altitude category out of a
	// FolderPath key inside an HTML table in <description>:
	//
	//     .../<ARTCC>/<category> (<count>)/<sectorId>
	//
	// where category is one of eram.js's BOUNDARY_CATS and selects which of the
	// UHI/HI/LO/APP sliders controls the layer.
	//
	// The drawn chart carries no sector identity — radar/map.svg has no text at
	// all, so a path cannot be tied back to sector 66, 45, F30 and so on. Every
	// boundary is therefore published under one category, named by its source
	// path id. The lines are correct; only the per-sector labelling is absent.
	const KML_CATEGORY = 'Low Altitude';

	function sectorKml(geo) {
		const escape = s => String(s).replace(/[<>&]/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
		const placemarks = geo.features.map(f => {
			const id = escape(f.properties.id || 'SECTOR');
			// KML coordinates are lon,lat — the same order GeoJSON stores them.
			const coords = f.geometry.coordinates.map(([lon, lat]) => `${lon},${lat}`).join(' ');
			const folderPath = `Sectors/${FACILITY}/${KML_CATEGORY} (${geo.features.length})/${id}`;
			return `<Placemark><name>${id}</name>`
				+ `<description><![CDATA[<table>`
				+ `<tr><td>FolderPath</td><td>${folderPath}</td></tr>`
				+ `<tr><td>ALT</td><td>SFC-FL230</td></tr>`
				+ `</table>]]></description>`
				+ `<LineString><coordinates>${coords}</coordinates></LineString></Placemark>`;
		}).join('\n');
		return new Response(
			`<?xml version="1.0" encoding="UTF-8"?>\n`
			+ `<kml xmlns="http://www.opengis.net/kml/2.2"><Document>\n${placemarks}\n</Document></kml>`,
			{ status: 200, headers: { 'Content-Type': 'application/vnd.google-earth.kml+xml' } },
		);
	}

	async function serve(pathname, search) {
		switch (pathname) {
			case '/ARTCC_BOUND.geojson':
				// Consumed straight through L.geoJSON, so pass it as-is.
				return json(await loadJson(`${DATA}/boundaries.geojson`));

			case '/api/nasr/navaids': {
				const g = await loadJson(`${DATA}/navaids.geojson`);
				return json(g.features
					.filter(f => f.properties.type === 'vor')
					.map(f => ({
						ident: f.properties.ident,
						lat: f.geometry.coordinates[1],
						lon: f.geometry.coordinates[0],
					})));
			}

			case '/api/nasr/airports': {
				const g = await loadJson(`${DATA}/navaids.geojson`);
				return json(g.features
					.filter(f => f.properties.type === 'airport')
					.map(f => {
						const id = f.properties.ident;
						return {
							// The overlay labels with `icao || lid`; the FAA LID is
							// the ICAO code without its leading K.
							icao: /^K[A-Z]{3}$/.test(id) ? id : null,
							lid: id.replace(/^K([A-Z]{3})$/, '$1'),
							lat: f.geometry.coordinates[1],
							lon: f.geometry.coordinates[0],
							cls: 'D',
						};
					}));
			}

			case '/api/nasr/airways': {
				// The chart draws low-altitude victor airways only; the HI layer
				// legitimately has nothing to show.
				if (new URLSearchParams(search).get('type') === 'hi') return json([]);
				const g = await loadJson(`${DATA}/airways.geojson`);
				return json(g.features.map(f => ({
					ident: f.properties.id,
					points: f.geometry.coordinates.map(([lon, lat]) => [lat, lon]),
				})));
			}

			case '/api/kml/AllSectors.kml':
				return sectorKml(await loadJson(`${DATA}/boundaries.geojson`));

			case '/api/handoff-codes':
				return json({ default: {} });

			case '/STATE_BOUND.json':
				return json({ type: 'FeatureCollection', features: [] });

			case '/destination-codes.json':
				return json({});

			case '/api/nasr/centerlines':
				return json([]);

			default:
				return null;
		}
	}

	const nativeFetch = window.fetch.bind(window);
	window.fetch = function (input, init) {
		const url = typeof input === 'string' ? input : (input && input.url) || '';
		// Only intercept the scope's absolute server paths; leave everything
		// else (our own relative data files, CDN assets) alone.
		if (url.startsWith('/')) {
			const u = new URL(url, location.origin);
			return serve(u.pathname, u.search).then(res => res || new Response('', {
				status: 404,
				statusText: 'Not available in simulation',
			}));
		}
		return nativeFetch(input, init);
	};

	// ── 3. Fake WebSocket driven by the scenario player ─────────────────────
	const NativeWebSocket = window.WebSocket;

	class SimWebSocket {
		constructor(url) {
			this.url = url;
			this.readyState = 0;
			this.onopen = this.onclose = this.onerror = this.onmessage = null;
			// The scope only ever opens /ws; anything else keeps real behaviour.
			if (!/\/ws$/.test(String(url).split('?')[0])) {
				return new NativeWebSocket(url);
			}
			SimWebSocket.attach(this);
		}
		send() { /* the scope never sends; ignore for API compatibility */ }
		close() {
			this.readyState = 3;
			if (this.onclose) this.onclose({ code: 1000 });
		}
		addEventListener(type, fn) { this['on' + type] = fn; }
		removeEventListener(type) { this['on' + type] = null; }
	}
	SimWebSocket.CONNECTING = 0;
	SimWebSocket.OPEN = 1;
	SimWebSocket.CLOSING = 2;
	SimWebSocket.CLOSED = 3;

	let player = null;
	let currentRate = rate;
	const sockets = [];
	let world = null;   // { navaids, fixes } — loaded once, reused across scenarios

	SimWebSocket.attach = function (socket) {
		sockets.push(socket);
		socket.readyState = 1;
		// Let the caller finish assigning handlers before firing anything.
		setTimeout(() => {
			if (socket.onopen) socket.onopen({});
			if (player) send(socket, { type: 'snapshot', data: player.snapshot() });
		}, 0);
	};

	function send(socket, msg) {
		if (socket.readyState === 1 && socket.onmessage) {
			socket.onmessage({ data: JSON.stringify(msg) });
		}
	}

	function broadcast(msg) {
		for (const s of sockets) send(s, msg);
	}

	/**
	 * Swap in a scenario. Any tracks from the previous one are explicitly
	 * removed first — the scope keys flights by gufi and would otherwise keep
	 * showing them as stale targets forever.
	 */
	function activate(scenario) {
		if (player) {
			player.stop();
			for (const f of player.snapshot()) broadcast({ type: 'remove', data: { gufi: f.gufi } });
		}
		player = new window.ScenarioPlayer({
			scenario,
			navaids: world.navaids,
			fixes: world.fixes,
			facility: FACILITY,
			rate: currentRate,
		});
		player.onMessage(broadcast);
		broadcast({ type: 'snapshot', data: player.snapshot() });
		player.start(12000 / currentRate);
		window.simPlayer = player;

		if (player.unresolved.length) {
			console.warn('[sim] unresolved fixes for:', player.unresolved.join(', '));
		}
		console.info(`[sim] ${scenario.name}: ${player.plan.length} aircraft, facility ${FACILITY}`);
		window.dispatchEvent(new CustomEvent('sim:loaded', { detail: { scenario, player } }));
		return player;
	}

	// Public surface for the loader UI.
	const simBridge = {
		get player() { return player; },
		get rate() { return currentRate; },
		get ready() { return world !== null; },
		activate,
		listScenarios: () => nativeFetch(`${SCENARIOS}/index.json`).then(r => r.json()),
		loadById(id) {
			return nativeFetch(`${SCENARIOS}/${id}.json`)
				.then(r => {
					if (!r.ok) throw new Error(`no such scenario: ${id}`);
					return r.json();
				})
				.then(activate);
		},
		loadScript(text, id) {
			return activate(window.ScenarioFormat.parseScenarioScript(text, id));
		},
		restart() {
			if (player) activate(player.scenario);
		},
		setRate(next) {
			currentRate = Number(next) || 1;
			if (player) { player.stop(); player.start(12000 / currentRate); }
		},
		pause() { if (player) player.stop(); },
		resume() { if (player) player.start(12000 / currentRate); },
	};
	window.simBridge = simBridge;

	Promise.all([
		nativeFetch(`${DATA}/navaids.geojson`).then(r => r.json()),
		nativeFetch('../fixes.json').then(r => r.text()),
	]).then(([navaids, fixesSrc]) => {
		// radar/fixes.json is JS, not JSON: it assigns `fixes_json = [...]`.
		const ctx = {};
		new Function('c', `${fixesSrc}; c.f = fixes_json;`)(ctx);
		world = { navaids, fixes: ctx.f };
		window.dispatchEvent(new CustomEvent('sim:ready'));
		return simBridge.loadById(scenarioId);
	}).catch(err => console.error('[sim] failed to start:', err));

	window.WebSocket = SimWebSocket;
}());
