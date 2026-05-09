import { test, expect } from '@playwright/test';

test.describe('Auth pages (UI only — no Supabase required)', () => {
  test('login page renders', async ({ page }) => {
    await page.goto('/login');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /se connecter/i }),
    ).toBeVisible();
  });

  test('signup page collects required fields', async ({ page }) => {
    await page.goto('/signup');
    await expect(page.getByLabel(/nom complet/i)).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/mot de passe/i)).toBeVisible();
    await expect(page.getByLabel(/pays/i)).toBeVisible();
    await expect(page.getByLabel(/devise/i)).toBeVisible();
  });

  test('forgot-password page renders form', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /recevoir le lien/i }),
    ).toBeVisible();
  });

  test('login → signup link works', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('link', { name: /créer un compte/i }).click();
    await expect(page).toHaveURL(/\/signup/);
  });
});

test.describe('Legal pages', () => {
  test('terms page renders', async ({ page }) => {
    await page.goto('/legal/terms');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/CGU|conditions/i);
  });
  test('privacy page renders with RGPD reference', async ({ page }) => {
    await page.goto('/legal/privacy');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/confidentialité/i);
    await expect(page.locator('body')).toContainText(/RGPD/);
  });
  test('imprint page renders', async ({ page }) => {
    await page.goto('/legal/imprint');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/mentions/i);
  });
  test('cookies page lists tracked cookies', async ({ page }) => {
    await page.goto('/legal/cookies');
    await expect(page.locator('body')).toContainText(/sb-access-token/);
  });
});

test.describe('Pricing', () => {
  test('shows three plans', async ({ page }) => {
    await page.goto('/pricing');
    await expect(page.locator('body')).toContainText(/Standard/);
    await expect(page.locator('body')).toContainText(/Premium/);
    await expect(page.locator('body')).toContainText(/Partenaire|Partner/);
  });
});
