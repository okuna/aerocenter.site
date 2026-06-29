const { test, expect } = require('@playwright/test');

test.describe('Map page', () => {
	test.beforeEach(async ({ page }) => {
		await page.goto('/map/');
		await page.waitForSelector('#mapContainer svg');
		await page.waitForSelector('#labels input');
	});

	test('renders an input for every quiz item with a matching SVG element', async ({ page }) => {
		const counts = await page.evaluate(() => {
			const matching = mapQuizItems.filter(item => document.getElementById(item.id));
			const inputs = document.querySelectorAll('#labels input');
			return { expected: matching.length, actual: inputs.length };
		});
		expect(counts.actual).toBe(counts.expected);
		expect(counts.actual).toBeGreaterThan(100);
	});

	test('warn when quiz item ids do not match any element in the SVG', async ({ page }, testInfo) => {
		const missing = await page.evaluate(() =>
			mapQuizItems.filter(item => !document.getElementById(item.id)).map(i => i.id)
		);
		if (missing.length > 0) {
			const msg = `${missing.length} quiz item id(s) have no matching SVG element: ${missing.join(', ')}`;
			console.warn(`⚠️  ${msg}`);
			testInfo.annotations.push({ type: 'warning', description: msg });
		}
	});

	test('Fill Answers populates every input', async ({ page }) => {
		await page.click('button:has-text("Fill Answers")');
		const empties = await page.evaluate(() =>
			[...document.querySelectorAll('#labels input')]
				.filter(el => el.value === '').length
		);
		expect(empties).toBe(0);
	});

	test('Reset clears all inputs', async ({ page }) => {
		await page.click('button:has-text("Fill Answers")');
		await page.click('button:has-text("Reset")');
		const nonEmpty = await page.evaluate(() =>
			[...document.querySelectorAll('#labels input')]
				.filter(el => el.value !== '').length
		);
		expect(nonEmpty).toBe(0);
	});

	test('autocorrect flags wrong answers red and correct answers green', async ({ page }) => {
		await page.click('#enableAutocorrect');

		const result = await page.evaluate(() => {
			const input = document.querySelector('#labels input');
			const answer = input.dataset.answer;

			input.value = 'ZZZ';
			checkBoxes(input);
			const wrongColor = input.style.color;

			input.value = answer;
			checkBoxes(input);
			const rightColor = input.style.color;

			return { answer, wrongColor, rightColor, disabled: input.disabled };
		});

		expect(result.wrongColor).toBe('red');
		expect(result.rightColor).toBe('rgb(5, 90, 0)');
		expect(result.disabled).toBe(true);
	});
});
