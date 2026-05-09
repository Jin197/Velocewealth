import { test, expect } from '@playwright/test';

test.describe('i18n routing', () => {
  test('default locale (fr) has no prefix', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveURL(/\/$|\/\?/);
    await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
  });

  test('English locale renders at /en', async ({ page }) => {
    await page.goto('/en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page.locator('html')).toHaveAttribute('dir', 'ltr');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/Drive/);
  });

  test('Arabic locale switches to RTL', async ({ page }) => {
    await page.goto('/ar');
    await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
    await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  });

  test('Spanish locale renders at /es', async ({ page }) => {
    await page.goto('/es');
    await expect(page.locator('html')).toHaveAttribute('lang', 'es');
  });

  test('Portuguese locale renders at /pt', async ({ page }) => {
    await page.goto('/pt');
    await expect(page.locator('html')).toHaveAttribute('lang', 'pt');
  });

  test('unknown locale 404s', async ({ page }) => {
    const res = await page.goto('/de');
    expect(res?.status()).toBe(404);
  });

  test('locale switcher changes URL preserving path', async ({ page }) => {
    await page.goto('/pricing');
    await page.locator('select[aria-label="Langue"]').first().selectOption('en');
    await expect(page).toHaveURL(/\/en\/pricing/);
  });
});
