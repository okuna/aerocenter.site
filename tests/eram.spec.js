const { test, expect } = require('@playwright/test');

// The scope is driven entirely in-browser by radar/eram/sim-bridge.js, which
// replaces window.WebSocket and serves the map-data endpoints from
// radar/airspace/. rate=40 runs the sim 40x faster than real time so aircraft
// activate within the test window; home=1 forces the saved view back to the
// airspace in case a previous run left a different one in localStorage.
const SCOPE = '/radar/eram/?scenario=11m&rate=40&home=1';

test.describe('ERAM scope', () => {
	test('boots against the simulated feed and renders tracks', async ({ page }) => {
		const failures = [];
		page.on('pageerror', e => failures.push(String(e)));
		// The basemap tiles come from a CDN that need not be reachable in CI.
		page.on('response', r => {
			if (r.status() >= 400 && !r.url().includes('cartocdn')) {
				failures.push(`${r.status()} ${r.url()}`);
			}
		});

		await page.goto(SCOPE);
		await page.waitForFunction(() => window.simPlayer && window.simPlayer.snapshot().length > 0,
			null, { timeout: 20_000 });
		// The scope draws each track as a Leaflet marker carrying its data block.
		await page.waitForFunction(
			() => document.querySelectorAll('.leaflet-marker-icon').length > 0,
			null, { timeout: 20_000 });

		expect(failures, `unexpected failures:\n${failures.join('\n')}`).toEqual([]);
		await expect(page.locator('#connection-status')).toHaveText(/Connected/);
	});

	test('every scenario aircraft resolves a start point and route', async ({ page }) => {
		await page.goto(SCOPE);
		await page.waitForFunction(() => window.simPlayer != null, null, { timeout: 20_000 });
		const { planned, unresolved } = await page.evaluate(() => ({
			planned: window.simPlayer.plan.length,
			unresolved: window.simPlayer.unresolved,
		}));
		expect(unresolved).toEqual([]);
		expect(planned).toBe(25);
	});

	test('tracks advance and carry the fields the scope reads', async ({ page }) => {
		await page.goto(SCOPE);
		await page.waitForFunction(() => window.simPlayer && window.simPlayer.snapshot().length > 0,
			null, { timeout: 20_000 });

		const first = await page.evaluate(() => window.simPlayer.snapshot()[0]);
		for (const field of ['gufi', 'callsign', 'latitude', 'longitude', 'assignedAltitude',
			'reportedAltitude', 'groundSpeed', 'trackVelocityX', 'trackVelocityY',
			'squawk', 'computerIds', 'flightStatus']) {
			expect(first[field], `missing ${field}`).not.toBe(undefined);
		}
		// Positions must be inside the drawn airspace.
		expect(first.latitude).toBeGreaterThan(29);
		expect(first.latitude).toBeLessThan(36);
		expect(first.longitude).toBeGreaterThan(-94);
		expect(first.longitude).toBeLessThan(-86);

		const before = await page.evaluate(() => window.simPlayer.time);
		await page.waitForFunction(t => window.simPlayer.time !== t, before, { timeout: 20_000 });
	});
});

test.describe('Scenario loader', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto(SCOPE);
		await page.waitForFunction(() => window.simBridge && window.simBridge.player,
			null, { timeout: 20_000 });
		await page.click('#scn-toggle');
	});

	test('lists saved scenarios and switches between them', async ({ page }) => {
		const options = await page.$$eval('#scn-select option', els => els.map(e => e.value));
		expect(options).toContain('11m');
		expect(options).toContain('po');

		await page.selectOption('#scn-select', 'po');
		await page.click('#scn-load');
		await page.waitForFunction(() => window.simPlayer.scenario.id === 'po', null, { timeout: 10_000 });
		expect(await page.evaluate(() => window.simPlayer.plan.length)).toBe(8);
	});

	test('switching scenarios leaves no stale tracks behind', async ({ page }) => {
		await page.waitForFunction(() => window.simPlayer.snapshot().length > 0, null, { timeout: 20_000 });
		await page.selectOption('#scn-select', 'po');
		await page.click('#scn-load');
		await page.waitForFunction(() => window.simPlayer.scenario.id === 'po', null, { timeout: 10_000 });
		await page.waitForFunction(() => window.simPlayer.snapshot().length > 0, null, { timeout: 20_000 });

		// Every marker the scope still shows must correspond to a live track.
		await expect.poll(async () => page.evaluate(() => {
			const live = window.simPlayer.snapshot().length;
			return document.querySelectorAll('.leaflet-marker-icon').length - live;
		}), { timeout: 15_000 }).toBe(0);
	});

	test('runs a pasted script and reports a bad line without stopping the sim', async ({ page }) => {
		await page.fill('#scn-script', [
			'MY TEST',
			'TIME 1200',
			'FP TEST01 B738/G 1234 450 JAN E1200 250 JAN..SQS..KGWO',
		].join('\n'));
		await page.click('#scn-run');
		await page.waitForFunction(() => window.simPlayer.scenario.name === 'MY TEST', null, { timeout: 10_000 });
		expect(await page.evaluate(() => window.simPlayer.plan[0].callsign)).toBe('TEST01');

		// A malformed line reports the line number and leaves the sim running.
		await page.fill('#scn-script', 'BROKEN\nTIME 0000\nFP TOOFEW 1 2');
		await page.click('#scn-run');
		await expect(page.locator('#scn-status')).toHaveText(/line 3/i);
		expect(await page.evaluate(() => window.simPlayer.scenario.name)).toBe('MY TEST');
	});
});
