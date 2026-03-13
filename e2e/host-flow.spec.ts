import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Host Game Flow
 * 
 * These tests require:
 * 1. Dev server running: npm run dev
 * 2. Firebase emulators or test Firebase project
 * 3. Test user account created
 * 
 * Run with: npm run test:e2e
 */

test.describe('Host Game Flow', () => {
  // Skip tests if no test credentials provided
  const testEmail = process.env.E2E_TEST_EMAIL || 'test@example.com';
  const testPassword = process.env.E2E_TEST_PASSWORD || 'password123';

  test.beforeEach(async ({ page }) => {
    // Navigate to login page
    await page.goto('/login');
  });

  test('should allow host to login', async ({ page }) => {
    // Fill login form
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');

    // Wait for dashboard
    await expect(page).toHaveURL(/\/host\/dashboard/, { timeout: 10000 });
    await expect(page.locator('text=Host Dashboard')).toBeVisible();
  });

  test('should allow host to create a game', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/host\/dashboard/);

    // Navigate to create game
    await page.click('text=Create New Game');
    await expect(page).toHaveURL(/\/host\/create/);

    // Fill game creation form
    await page.fill('input[type="number"]', '1');
    
    // Click create button
    await page.click('button:has-text("Create Game")');

    // Wait for game page to load
    await expect(page).toHaveURL(/\/host\/game\/.+/, { timeout: 10000 });
    
    // Verify game code is displayed
    await expect(page.locator('text=/[A-Z0-9]{6}/')).toBeVisible();
  });

  test('should allow host to start a game', async ({ page }) => {
    // This test requires a game to be created first
    // For now, we'll test the UI flow
    
    // Login
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await expect(page).toHaveURL(/\/host\/dashboard/);

    // Create game
    await page.click('text=Create New Game');
    await page.fill('input[type="number"]', '1');
    await page.click('button:has-text("Create Game")');
    await expect(page).toHaveURL(/\/host\/game\/.+/);

    // Verify "Game Ready to Start" banner is visible
    await expect(page.locator('text=Game Ready to Start')).toBeVisible();

    // Click Start Game button
    const startButton = page.locator('button:has-text("Start Game")');
    await expect(startButton).toBeVisible();
    await startButton.click();

    // Verify game started (banner should disappear)
    await expect(page.locator('text=Game Ready to Start')).not.toBeVisible({ timeout: 5000 });
  });

  test('should allow host to call numbers', async ({ page }) => {
    // Login and create game
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button[type="submit"]');
    await page.click('text=Create New Game');
    await page.fill('input[type="number"]', '1');
    await page.click('button:has-text("Create Game")');
    await expect(page).toHaveURL(/\/host\/game\/.+/);

    // Start game
    await page.click('button:has-text("Start Game")');
    await expect(page.locator('text=Game Ready to Start')).not.toBeVisible();

    // Click a number button (first available number)
    const numberButtons = page.locator('button:not([disabled])').filter({ hasText: /^\d+$/ });
    const firstButton = numberButtons.first();
    
    if (await firstButton.count() > 0) {
      await firstButton.click();
      
      // Verify number appears in recent calls or current number
      await expect(
        page.locator('text=/[BINGO]\d+/').first()
      ).toBeVisible({ timeout: 3000 });
    }
  });

  test('should show error for invalid login', async ({ page }) => {
    await page.fill('input[type="email"]', 'invalid@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=/failed|error|invalid/i')).toBeVisible({ timeout: 5000 });
  });
});
