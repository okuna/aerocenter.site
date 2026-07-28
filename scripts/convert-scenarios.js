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
const { parseScenarioScript } = require(path.join(ROOT, 'radar/sim/scenario-format.js'));
const SRC = path.join(ROOT, 'radar/src-v1-2.js');
const OUT = path.join(ROOT, 'radar/scenarios');

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
		const scenario = parseScenarioScript(text, key.toLowerCase());
		const file = `${scenario.id}.json`;
		fs.writeFileSync(path.join(OUT, file), `${JSON.stringify(scenario, null, '\t')}\n`);
		index.push({ id: scenario.id, name: scenario.name, file, aircraft: scenario.aircraft.length });
		console.log(`${file.padEnd(12)} ${scenario.name.padEnd(12)} ${scenario.aircraft.length} aircraft`);
	}
	fs.writeFileSync(path.join(OUT, 'index.json'), `${JSON.stringify(index, null, '\t')}\n`);
	console.log(`index.json   ${index.length} scenarios`);
}

main();
