#!/usr/bin/env node
/**
 * Extract the scenarios hardcoded in radar/src-v1-2.js into standalone JSON.
 *
 * Scenarios currently live as template literals inside loadScenario()'s
 * if/else chain, so adding one means editing both that function and a <select>
 * in radar/index.php, and nothing survives a page reload. This lifts them into
 * radar/scenarios/*.json, which the simulator loads at runtime.
 *
 * The legacy script format is one command per line, first line the scenario
 * name, and is preserved verbatim in `source` so the original remains readable
 * (and re-convertible) alongside the parsed form.
 *
 * Usage:  node scripts/convert-scenarios.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const SRC = path.join(ROOT, 'radar/src-v1-2.js');
const OUT = path.join(ROOT, 'radar/scenarios');

// FP [callsign] [type] [code] [speed] [fix] [time] [altitude] [route]
function parseFp(parts) {
	const [, callsign, type, beacon, speed, start, time, altitude, route] = parts;
	return {
		callsign,
		// "DH8C/A" and the odd "2/F117/I" both split on the LAST slash.
		type: type.slice(0, type.lastIndexOf('/')) || type,
		equipment: type.slice(type.lastIndexOf('/') + 1),
		beacon,
		speed: Number(speed),
		start,
		// Only the last 4 chars matter; the literal EXX00 means "now".
		activate: time.slice(-4) === 'XX00' ? null : time.slice(-4),
		altitude: Number(altitude) * 100,
		route: route.split('.').filter(Boolean),
	};
}

function parseScenario(text) {
	const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
	const name = lines.shift();
	const scenario = { name, startTime: '0000', aircraft: [] };
	const byCallsign = new Map();

	for (const line of lines) {
		const parts = line.split(/\s+/).filter(Boolean);
		switch (parts[0]) {
			case 'TIME':
				scenario.startTime = parts[1];
				break;
			case 'FP': {
				const ac = parseFp(parts);
				byCallsign.set(ac.callsign, ac);
				scenario.aircraft.push(ac);
				break;
			}
			case 'QZ': {
				// QZ [altitude] [ACID] — assigned altitude, applied at load time.
				const target = byCallsign.get(parts[2]);
				if (!target) throw new Error(`QZ for unknown aircraft: ${parts[2]}`);
				target.assignedAltitude = Number(parts[1]) * 100;
				break;
			}
			default:
				throw new Error(`unsupported scenario command: ${line}`);
		}
	}

	// An aircraft with no QZ holds its filed altitude.
	for (const ac of scenario.aircraft) {
		if (ac.assignedAltitude == null) ac.assignedAltitude = ac.altitude;
	}
	return scenario;
}

function main() {
	const src = fs.readFileSync(SRC, 'utf8');
	// Each branch is: scenario == "KEY" ... `template literal`
	const re = /scenario\s*==\s*"([^"]+)"[\s\S]*?=\s*\n?`([^`]*)`/g;
	const found = [];
	let m;
	while ((m = re.exec(src)) !== null) found.push({ key: m[1], text: m[2] });

	if (found.length === 0) throw new Error('no scenarios found in ' + SRC);

	fs.mkdirSync(OUT, { recursive: true });
	const index = [];
	for (const { key, text } of found) {
		const scenario = parseScenario(text);
		scenario.id = key.toLowerCase();
		scenario.source = text.trim();
		const file = `${scenario.id}.json`;
		fs.writeFileSync(path.join(OUT, file), `${JSON.stringify(scenario, null, '\t')}\n`);
		index.push({ id: scenario.id, name: scenario.name, file, aircraft: scenario.aircraft.length });
		console.log(`${file.padEnd(12)} ${scenario.name.padEnd(12)} ${scenario.aircraft.length} aircraft`);
	}
	fs.writeFileSync(path.join(OUT, 'index.json'), `${JSON.stringify(index, null, '\t')}\n`);
	console.log(`index.json   ${index.length} scenarios`);
}

main();
