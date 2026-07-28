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
