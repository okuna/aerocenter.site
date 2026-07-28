/**
 * Scenario player — drives an ERAM-style scope from a saved scenario file.
 *
 * The ERAM scope in SwimReader consumes a read-only WebSocket feed and has no
 * command for creating a track (its own reference marks QT as unimplemented:
 * "autotrack handles association from SWIM"). So a scenario cannot be replayed
 * by issuing commands -- it has to arrive through the data path. This module is
 * that data path: it simulates aircraft and emits the same message shapes the
 * scope already expects, so no scope code has to change.
 *
 * Emitted messages:
 *   { type: 'snapshot', data: [flight, ...] }   full state, on start/seek
 *   { type: 'batch',    data: [flight, ...] }   per-tick updates
 *   { type: 'remove',   data: { gufi } }        landed / left the airspace
 *
 * Flight fields mirror what the scope reads: gufi, callsign, latitude,
 * longitude, assignedAltitude, reportedAltitude, groundSpeed, trackVelocityX/Y
 * (knots east/north), squawk, computerIds (keyed by facility), flightStatus,
 * aircraftType, equipmentQualifier, destination, route, posAge, history.
 */

(function (root, factory) {
	if (typeof module === 'object' && module.exports) module.exports = factory();
	else root.ScenarioPlayer = factory();
}(typeof self !== 'undefined' ? self : this, function () {
	'use strict';

	const NM_PER_DEG_LAT = 60;
	const CLIMB_RATE_FPM = 2000;
	const SCAN_SECONDS = 12;      // matches the scope's expected update cadence
	const MAX_HISTORY = 5;
	const CAPTURE_NM = 1.5;       // waypoint capture radius
	const DEG = Math.PI / 180;

	function nmPerDegLon(lat) {
		return NM_PER_DEG_LAT * Math.cos(lat * DEG);
	}

	/** Distance in nautical miles, flat-earth approximation (fine at this scale). */
	function distanceNm(a, b) {
		const dLat = (b.lat - a.lat) * NM_PER_DEG_LAT;
		const dLon = (b.lon - a.lon) * nmPerDegLon((a.lat + b.lat) / 2);
		return Math.hypot(dLat, dLon);
	}

	/** True bearing in degrees from a to b. */
	function bearing(a, b) {
		const dLat = (b.lat - a.lat) * NM_PER_DEG_LAT;
		const dLon = (b.lon - a.lon) * nmPerDegLon((a.lat + b.lat) / 2);
		return (Math.atan2(dLon, dLat) / DEG + 360) % 360;
	}

	/** "0035" -> seconds since midnight. */
	function hhmmToSeconds(hhmm) {
		const s = String(hhmm).padStart(4, '0');
		return Number(s.slice(0, 2)) * 3600 + Number(s.slice(2, 4)) * 60;
	}

	function secondsToHhmm(sec) {
		const t = ((sec % 86400) + 86400) % 86400;
		return String(Math.floor(t / 3600)).padStart(2, '0')
			+ String(Math.floor((t % 3600) / 60)).padStart(2, '0');
	}

	/**
	 * Resolve a scenario fix string to { lat, lon }.
	 *
	 * Three formats, matching radar/src-v1-2.js fixToCords():
	 *   SQS          plain fix name
	 *   SQS230005    name + 3-digit radial + 3-digit DME
	 *   3231/9146    lat/lon -- note the legacy quirk that these are read as
	 *                DECIMAL degrees (32.31, -91.46), not degrees+minutes.
	 */
	function resolveFix(str, navaids) {
		if (!str) return null;
		const s = String(str).toUpperCase();

		if (s.indexOf('/') === 4) {
			const lat = s.slice(0, 4), lon = s.slice(5, 9);
			return {
				lat: Number(`${lat.slice(0, 2)}.${lat.slice(2, 4)}`),
				lon: -Number(`${lon.slice(0, 2)}.${lon.slice(2, 4)}`),
			};
		}

		if (s.length >= 9) {
			const name = s.slice(0, s.length - 6);
			const radial = Number(s.slice(-6, -3));
			const dme = Number(s.slice(-3));
			const base = navaids.get(name) || navaids.get(`K${name}`);
			if (!base) return null;
			// Project outbound along the radial.
			const lat = base.lat + (dme * Math.cos(radial * DEG)) / NM_PER_DEG_LAT;
			const lon = base.lon + (dme * Math.sin(radial * DEG)) / nmPerDegLon(base.lat);
			return { lat, lon };
		}

		return navaids.get(s) || navaids.get(`K${s}`) || null;
	}

	/**
	 * Build an ident -> {lat, lon} lookup.
	 *
	 * `geojson` is the drawn airspace; `fixes` is the optional wider database
	 * (radar/fixes.json, which stores WEST longitude as a positive number).
	 * Scenario routes routinely leave the drawn map -- AEX, KORD, KMSY, KAMA --
	 * and those fixes carry surveyed coordinates, so once we are working in
	 * lat/lon they need no transform at all, just a lookup.
	 */
	function navaidIndex(geojson, fixes) {
		const map = new Map();
		// Wider database first so drawn features take precedence on collision.
		for (const f of fixes || []) {
			map.set(f.ident.toUpperCase(), { lat: f.latitude_deg, lon: -f.longitude_deg });
		}
		for (const f of geojson.features) {
			const [lon, lat] = f.geometry.coordinates;
			// Prefer the surveyed position where one exists.
			const p = f.properties;
			map.set(p.ident, {
				lat: p.surveyed && p.lat != null ? p.lat : lat,
				lon: p.surveyed && p.lon != null ? p.lon : lon,
			});
		}
		return map;
	}

	class ScenarioPlayer {
		constructor(options) {
			const opts = options || {};
			this.facility = opts.facility || 'ZME';
			this.navaids = navaidIndex(opts.navaids, opts.fixes);
			this.listeners = [];
			this.timer = null;
			this.rate = opts.rate || 1;
			this.load(opts.scenario);
		}

		load(scenario) {
			this.scenario = scenario;
			this.startSeconds = hhmmToSeconds(scenario.startTime || '0000');
			this.clock = this.startSeconds;
			this.flights = new Map();
			this.removed = new Set();

			let cid = 0;
			this.plan = scenario.aircraft.map(ac => {
				const origin = resolveFix(ac.start, this.navaids);
				const legs = ac.route
					.map(r => ({ ident: r, pos: resolveFix(r, this.navaids) }))
					.filter(l => l.pos);
				// Drop a leading departure airport, as the legacy engine does, so
				// the aircraft flies toward its first enroute fix.
				if (legs.length > 1 && /^K/.test(legs[0].ident)) legs.shift();
				cid += 1;
				return {
					...ac,
					gufi: `SIM-${scenario.id || 'scn'}-${ac.callsign}`,
					computerId: String(1000 + cid).slice(1),
					activateSeconds: ac.activate == null
						? this.startSeconds
						: hhmmToSeconds(ac.activate),
					origin,
					legs,
					unresolved: !origin || legs.length === 0,
				};
			});

			this.unresolved = this.plan.filter(p => p.unresolved).map(p => p.callsign);
			this.reset();
		}

		reset() {
			this.clock = this.startSeconds;
			this.flights.clear();
			this.removed.clear();
			for (const p of this.plan) {
				if (p.unresolved) continue;
				this.flights.set(p.gufi, {
					plan: p,
					lat: p.origin.lat,
					lon: p.origin.lon,
					altitude: p.altitude,
					assigned: p.assignedAltitude != null ? p.assignedAltitude : p.altitude,
					legIndex: 0,
					active: false,
					history: [],
				});
			}
		}

		onMessage(fn) {
			this.listeners.push(fn);
			return () => {
				this.listeners = this.listeners.filter(l => l !== fn);
			};
		}

		emit(msg) {
			for (const fn of this.listeners) fn(msg);
		}

		/** Advance the simulation by `seconds` and emit the resulting messages. */
		step(seconds) {
			const dt = seconds == null ? SCAN_SECONDS : seconds;
			this.clock += dt;
			const updated = [];

			for (const [gufi, st] of this.flights) {
				const p = st.plan;

				if (!st.active) {
					if (this.clock < p.activateSeconds) continue;
					st.active = true;
					updated.push(this.toFlight(gufi, st));
					continue;
				}

				const leg = p.legs[st.legIndex];
				if (!leg) continue;

				// Altitude: climb or descend toward the assigned level.
				const climb = (CLIMB_RATE_FPM / 60) * dt;
				if (st.altitude < st.assigned) st.altitude = Math.min(st.assigned, st.altitude + climb);
				else if (st.altitude > st.assigned) st.altitude = Math.max(st.assigned, st.altitude - climb);

				// Position: fly direct to the active waypoint.
				const here = { lat: st.lat, lon: st.lon };
				const hdg = bearing(here, leg.pos);
				const nm = (p.speed / 3600) * dt;
				st.lat += (nm * Math.cos(hdg * DEG)) / NM_PER_DEG_LAT;
				st.lon += (nm * Math.sin(hdg * DEG)) / nmPerDegLon(st.lat);
				st.heading = hdg;

				st.history.push({ lat: st.lat, lon: st.lon, sym: '\\', age: 0 });
				while (st.history.length > MAX_HISTORY) st.history.shift();

				// Waypoint capture, then sequence or terminate.
				if (distanceNm({ lat: st.lat, lon: st.lon }, leg.pos) < CAPTURE_NM) {
					const arrivedAtDestination = st.legIndex === p.legs.length - 1;
					if (arrivedAtDestination) {
						this.flights.delete(gufi);
						this.removed.add(gufi);
						this.emit({ type: 'remove', data: { gufi } });
						continue;
					}
					st.legIndex += 1;
				}

				updated.push(this.toFlight(gufi, st));
			}

			if (updated.length) this.emit({ type: 'batch', data: updated });
			return updated.length;
		}

		/** Project internal state into the flight object shape the scope reads. */
		toFlight(gufi, st) {
			const p = st.plan;
			const speed = p.speed;
			const hdg = st.heading != null ? st.heading : 0;
			const destination = p.route.length ? p.route[p.route.length - 1] : '';
			return {
				gufi,
				callsign: p.callsign,
				latitude: +st.lat.toFixed(6),
				longitude: +st.lon.toFixed(6),
				assignedAltitude: st.assigned,
				reportedAltitude: Math.round(st.altitude),
				groundSpeed: speed,
				// East / north components, in knots.
				trackVelocityX: +(speed * Math.sin(hdg * DEG)).toFixed(2),
				trackVelocityY: +(speed * Math.cos(hdg * DEG)).toFixed(2),
				squawk: p.beacon,
				assignedSquawk: p.beacon,
				computerIds: { [this.facility]: p.computerId },
				computerId: p.computerId,
				controllingFacility: this.facility,
				reportingFacility: this.facility,
				flightStatus: 'ACTIVE',
				aircraftType: p.type,
				equipmentQualifier: p.equipment,
				// FAA LID convention: drop the leading K on US airports.
				destination: destination.replace(/^K([A-Z]{3})$/, '$1'),
				route: p.route.join('..'),
				posAge: 0,
				history: st.history.slice(),
			};
		}

		snapshot() {
			const data = [];
			for (const [gufi, st] of this.flights) {
				if (st.active) data.push(this.toFlight(gufi, st));
			}
			return data;
		}

		start(intervalMs) {
			this.stop();
			this.emit({ type: 'snapshot', data: this.snapshot() });
			const period = intervalMs || (SCAN_SECONDS * 1000) / this.rate;
			this.timer = setInterval(() => this.step(SCAN_SECONDS), period);
			return this;
		}

		stop() {
			if (this.timer) clearInterval(this.timer);
			this.timer = null;
			return this;
		}

		/** Jump to an absolute HHMM, replaying deterministically from the start. */
		seek(hhmm) {
			const target = hhmmToSeconds(hhmm);
			this.reset();
			while (this.clock < target) this.step(SCAN_SECONDS);
			this.emit({ type: 'snapshot', data: this.snapshot() });
			return this;
		}

		get time() {
			return secondsToHhmm(this.clock);
		}
	}

	ScenarioPlayer.resolveFix = resolveFix;
	ScenarioPlayer.navaidIndex = navaidIndex;
	ScenarioPlayer.distanceNm = distanceNm;
	ScenarioPlayer.bearing = bearing;
	return ScenarioPlayer;
}));
