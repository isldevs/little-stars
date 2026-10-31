import type {Page} from '@playwright/test';
import {expect, test} from '@playwright/test';

const themeKey = 'little-stars:v1:theme';
const product = '/product/the-everyday-linen-shirt';
const themeSelect = (page: Page) => page.locator('select[aria-label="Color theme"]:visible');
const expectTheme = (page: Page, theme: 'light' | 'dark') => expect(page.locator('html')).toHaveAttribute('data-theme', theme);

async function readyPhotos(page: Page) {
    await page.evaluate(async () => {
        await document.fonts.ready;
        for (const image of document.images) image.loading = 'eager';
        await Promise.all([...document.images].map(image => image.complete ? Promise.resolve() : new Promise<void>(resolve => {
            image.onload = () => resolve();
            image.onerror = () => resolve();
        })));
    });
}

test('explicit themes persist across refreshes and direct routes', async ({page}) => {
    await page.emulateMedia({colorScheme: 'light'});
    await page.goto('/');
    await expectTheme(page, 'light');
    await expect(themeSelect(page)).toHaveValue('system');
    await themeSelect(page).selectOption('dark');
    await expectTheme(page, 'dark');
    expect(await page.evaluate(key => localStorage.getItem(key), themeKey)).toBe('"dark"');
    await page.reload();
    await expectTheme(page, 'dark');
    await expect(themeSelect(page)).toHaveValue('dark');
    await page.goto('/collections/women');
    await expectTheme(page, 'dark');
    await themeSelect(page).selectOption('light');
    await page.emulateMedia({colorScheme: 'dark'});
    await expectTheme(page, 'light');
    await page.reload();
    await expectTheme(page, 'light');
    await expect(themeSelect(page)).toHaveValue('light');
});

test('system mode follows live operating system changes without overriding an explicit choice', async ({page}) => {
    await page.emulateMedia({colorScheme: 'dark'});
    await page.goto('/shop');
    await expectTheme(page, 'dark');
    await expect(themeSelect(page)).toHaveValue('system');
    await page.emulateMedia({colorScheme: 'light'});
    await expectTheme(page, 'light');
    await themeSelect(page).selectOption('dark');
    await page.emulateMedia({colorScheme: 'dark'});
    await page.emulateMedia({colorScheme: 'light'});
    await expectTheme(page, 'dark');
    await themeSelect(page).selectOption('system');
    await expectTheme(page, 'light');
    await page.emulateMedia({colorScheme: 'dark'});
    await expectTheme(page, 'dark');
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
});

test('malformed and unavailable theme storage recover safely', async ({page, context}) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({colorScheme: 'dark'});
    await page.addInitScript(key => localStorage.setItem(key, '{"outdated":"blue"}'), themeKey);
    await page.goto('/contact');
    await expectTheme(page, 'dark');
    await expect(themeSelect(page)).toHaveValue('system');
    await themeSelect(page).selectOption('light');
    await expectTheme(page, 'light');
    const blocked = await context.newPage();
    blocked.on('pageerror', error => errors.push(error.message));
    await blocked.emulateMedia({colorScheme: 'light'});
    await blocked.addInitScript(() => {
        Object.defineProperty(Storage.prototype, 'getItem', {
            configurable: true, value() {
                throw new DOMException('Storage is disabled', 'SecurityError');
            }
        });
        Object.defineProperty(Storage.prototype, 'setItem', {
            configurable: true, value() {
                throw new DOMException('Storage is disabled', 'SecurityError');
            }
        });
    });
    await blocked.goto('/');
    await expectTheme(blocked, 'light');
    await themeSelect(blocked).selectOption('dark');
    await expectTheme(blocked, 'dark');
    await expect(blocked.getByRole('heading', {name: /Life’s little moments/})).toBeVisible();
    expect(errors).toEqual([]);
    await blocked.close();
});

test('theme preferences synchronize between tabs and clearing storage restores system mode', async ({
                                                                                                        page,
                                                                                                        context
                                                                                                    }) => {
    await page.emulateMedia({colorScheme: 'dark'});
    await page.goto('/');
    const other = await context.newPage();
    await other.emulateMedia({colorScheme: 'dark'});
    await other.goto('/shop');
    await expectTheme(other, 'dark');
    await themeSelect(page).selectOption('light');
    await expectTheme(other, 'light');
    await expect(themeSelect(other)).toHaveValue('light');
    await themeSelect(other).selectOption('dark');
    await expectTheme(page, 'dark');
    await expect(themeSelect(page)).toHaveValue('dark');
    await themeSelect(page).selectOption('light');
    await expectTheme(other, 'light');
    await other.evaluate(() => localStorage.clear());
    await expectTheme(page, 'dark');
    await expect(themeSelect(page)).toHaveValue('system');
    await other.close();
});

test('mobile and tablet navigation exposes the theme control with keyboard dismissal and no overflow', async ({page}) => {
    await page.emulateMedia({colorScheme: 'light'});
    for (const width of [320, 390, 820, 1024]) {
        await page.setViewportSize({width, height: 844});
        await page.goto('/');
        const opener = page.getByRole('button', {name: 'Open navigation'});
        await opener.click();
        const drawer = page.getByRole('dialog');
        await expect(drawer).toBeVisible();
        await themeSelect(page).selectOption('dark');
        await expectTheme(page, 'dark');
        await expect(drawer).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
        await page.keyboard.press('Escape');
        await expect(drawer).toHaveCount(0);
        await expect(opener).toBeFocused();
        await page.goto(product);
        await expectTheme(page, 'dark');
        await expect(page.getByRole('button', {name: 'Add to bag', exact: true})).toBeVisible();
        expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    }
    await page.setViewportSize({width: 390, height: 844});
    await readyPhotos(page);
    await page.screenshot({path: 'artifacts/product-dark-mobile.png', fullPage: true});
});

test('dark theme preserves checkout totals and saved order history', async ({page}) => {
    const errors: string[] = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.emulateMedia({colorScheme: 'light'});
    await page.goto('/');
    await themeSelect(page).selectOption('dark');
    await readyPhotos(page);
    await page.screenshot({path: 'artifacts/home-dark-desktop.png', fullPage: true});
    await page.goto(product);
    await page.getByRole('button', {name: 'Color: Ivory', exact: true}).click();
    await page.getByRole('button', {name: 'Size XS', exact: true}).click();
    await page.getByRole('button', {name: 'Add to bag', exact: true}).click();
    await expectTheme(page, 'dark');
    await page.getByRole('link', {name: 'View your bag', exact: true}).click();
    await page.getByRole('button', {name: /^Increase quantity of The Everyday Linen Shirt/}).click();
    await page.getByRole('textbox', {name: 'Have a little treat?'}).fill('STAR10');
    await page.getByRole('button', {name: 'Apply', exact: true}).click();
    await expect(page.locator('.summary-grand-total')).toContainText('$122.40');
    await page.getByRole('link', {name: 'Continue to checkout'}).click();
    for (const [name, value] of [['Email address', 'theme@example.com'], ['First name', 'Taylor'], ['Last name', 'Sample'], ['Street address', '123 Demo Street'], ['City', 'New York'], ['State', 'NY'], ['ZIP code', '10001']]) await page.getByRole('textbox', {
        name,
        exact: true
    }).fill(value);
    await page.getByRole('button', {name: 'Place demo order'}).click();
    await expect(page).toHaveURL(/order-confirmation/);
    await expectTheme(page, 'dark');
    await expect(page.locator('.summary-grand-total')).toContainText('$122.40');
    const orders = await page.evaluate(() => JSON.parse(localStorage.getItem('little-stars:v1:orders') || '[]'));
    expect(orders).toHaveLength(1);
    expect(orders[0].totals.total).toBe(12240);
    await page.reload();
    await expectTheme(page, 'dark');
    await expect(page.getByRole('heading', {name: 'Good things are on their way.'})).toBeVisible();
    await page.getByRole('link', {name: 'View order history'}).click();
    await page.getByRole('button', {name: 'Explore demo account'}).click();
    await expect(page.locator('.history-order')).toHaveCount(1);
    await expectTheme(page, 'dark');
    expect(errors).toEqual([]);
});


test('saved dark theme is applied before the React bundle loads', async ({page}) => {
    await page.emulateMedia({colorScheme: 'light'});
    await page.addInitScript(key => localStorage.setItem(key, '"dark"'), themeKey);
    await page.route('**/src/main.tsx', route => route.abort());
    await page.goto('/', {waitUntil: 'domcontentloaded'});
    await expectTheme(page, 'dark');
    await expect(page.locator('html')).toHaveCSS('color-scheme', 'dark');
    await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#1b211d');
});
