/**
 * Scenario script format — parser shared by the browser and the build scripts.
 *
 * The legacy format is one command per line, the first line being the scenario
 * name and (by convention) the second a TIME command:
 *
 *     ERAM 11M
 *     TIME 0000
 *     FP ENY111 DH8C/A 0006 220 ZAMMA056041 E0000 120 JAN..AEX..KAEX
 *     QZ 090 N619PL
 *
 * This is the text students already write, so the loader accepts it directly
 * rather than making anyone hand-author JSON.
 */

(function (root, factory) {
	if (typeof module === 'object' && module.exports) module.exports = factory();
	else root.ScenarioFormat = factory();
}(typeof self !== 'undefined' ? self : this, function () {
	'use strict';

	// FP [callsign] [type] [code] [speed] [fix] [time] [altitude] [route]
	const FP_FIELDS = 9;

	function parseFp(parts) {
		if (parts.length < FP_FIELDS) {
			throw new Error('FP needs [callsign] [type] [code] [speed] [fix] [time] [altitude] [route]');
		}
		const [, callsign, type, beacon, speed, start, time, altitude, route] = parts;
		const slash = type.lastIndexOf('/');
		return {
			callsign,
			// "DH8C/A" and the odd "2/F117/I" both split on the LAST slash.
			type: slash > 0 ? type.slice(0, slash) : type,
			equipment: slash > 0 ? type.slice(slash + 1) : '',
			beacon,
			speed: Number(speed),
			start,
			// Only the last 4 chars matter; the literal EXX00 means "now".
			activate: time.slice(-4) === 'XX00' ? null : time.slice(-4),
			altitude: Number(altitude) * 100,
			route: route.split('.').filter(Boolean),
		};
	}

	/**
	 * Parse legacy scenario script text into a scenario object.
	 * Throws an Error with a `line` property on the first bad line.
	 */
	function parseScenarioScript(text, id) {
		const raw = String(text).split('\n');
		const lines = [];
		raw.forEach((line, i) => {
			const trimmed = line.trim();
			// Blank lines are silently skipped -- in the legacy runner they aborted
			// the whole scenario, which was a long-standing trap for authors.
			if (trimmed) lines.push({ text: trimmed, number: i + 1 });
		});
		if (lines.length === 0) throw new Error('scenario is empty');

		const name = lines.shift().text;
		const scenario = {
			id: id || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'scenario',
			name,
			startTime: '0000',
			aircraft: [],
			source: String(text).trim(),
		};
		const byCallsign = new Map();

		for (const { text: line, number } of lines) {
			const parts = line.split(/\s+/).filter(Boolean);
			const verb = parts[0].toUpperCase();
			try {
				if (verb === 'TIME') {
					if (!/^\d{4}$/.test(parts[1] || '')) throw new Error('TIME needs HHMM');
					scenario.startTime = parts[1];
				} else if (verb === 'FP') {
					const ac = parseFp(parts);
					if (byCallsign.has(ac.callsign)) throw new Error(`duplicate callsign ${ac.callsign}`);
					byCallsign.set(ac.callsign, ac);
					scenario.aircraft.push(ac);
				} else if (verb === 'QZ') {
					const target = byCallsign.get(parts[2]);
					if (!target) throw new Error(`QZ for unknown aircraft ${parts[2]}`);
					target.assignedAltitude = Number(parts[1]) * 100;
				} else {
					throw new Error(`unsupported command "${parts[0]}"`);
				}
			} catch (err) {
				const e = new Error(`line ${number}: ${err.message}`);
				e.line = number;
				throw e;
			}
		}

		if (scenario.aircraft.length === 0) throw new Error('scenario has no FP lines');

		// An aircraft with no QZ holds its filed altitude.
		for (const ac of scenario.aircraft) {
			if (ac.assignedAltitude == null) ac.assignedAltitude = ac.altitude;
		}
		return scenario;
	}

	return { parseScenarioScript, parseFp };
}));
