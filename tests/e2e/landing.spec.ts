import { test, expect } from '@playwright/test';

test.describe('Landing page', () => {
  test('renders hero with primary CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    await expect(
      page.getByRole('link', { name: /démarrer gratuitement/i }).first(),
    ).toBeVisible();
  });

  test('shows the 6 feature cards', async ({ page }) => {
    await page.goto('/');
    const features = await page
      .locator('section#features')
      .getByRole('heading', { level: 3 })
      .all();
    expect(features.length).toBe(6);
  });

  test('FAQ accordions expand', async ({ page }) => {
    await page.goto('/');
    const firstFaq = page.locator('details').first();
    await firstFaq.locator('summary').click();
    await expect(firstFaq).toHaveAttribute('open', '');
  });

  test('signup CTA navigates to /signup', async ({ page }) => {
    await page.goto('/');
    await page
      .getByRole('link', { name: /démarrer gratuitement/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/signup/);
    await expect(page.getByRole('heading', { name: /créer/i })).toBeVisible();
  });
});
