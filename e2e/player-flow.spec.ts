import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Player Game Flow
 * 
 * These tests require:
 * 1. Dev server running: npm run dev
 * 2. An active game with a known game code
 * 
 * Run with: npm run test:e2e
 */

test.describe('Player Game Flow', () => {
  test('should render join game page', async ({ page }) => {
    await page.goto('/play');

    // Verify page elements
    await expect(page.locator('text=Join Game')).toBeVisible();
    await expect(page.locator('input[placeholder*="ABC123"]')).toBeVisible();
    await expect(page.locator('button:has-text("Join Game")')).toBeVisible();
  });

  test('should show error for invalid game code', async ({ page }) => {
    await page.goto('/play');

    // Enter invalid code
    const input = page.locator('input[placeholder*="ABC123"]');
    await input.fill('INVALID');
    await page.click('button:has-text("Join Game")');

    // Verify error message appears
    await expect(
      page.locator('text=/Game not found|Invalid|not found/i')
    ).toBeVisible({ timeout: 5000 });
  });

  test('should convert code to uppercase automatically', async ({ page }) => {
    await page.goto('/play');

    const input = page.locator('input[placeholder*="ABC123"]');
    await input.fill('abc123');

    // Code should be converted to uppercase
    await expect(input).toHaveValue('ABC123');
  });

  test('should limit code input to 6 characters', async ({ page }) => {
    await page.goto('/play');

    const input = page.locator('input[placeholder*="ABC123"]');
    await input.fill('ABCDEFGHIJ');

    // Should only have 6 characters
    const value = await input.inputValue();
    expect(value.length).toBeLessThanOrEqual(6);
  });

  test('should disable join button while loading', async ({ page }) => {
    await page.goto('/play');

    const input = page.locator('input[placeholder*="ABC123"]');
    await input.fill('ABC123');
    
    const joinButton = page.locator('button:has-text("Join Game")');
    await joinButton.click();

    // Button should be disabled while processing
    await expect(joinButton).toBeDisabled({ timeout: 1000 });
  });

  test('should allow joining with URL code parameter', async ({ page }) => {
    // Navigate with code in URL
    await page.goto('/play?code=TEST12');

    // Code should be pre-filled
    const input = page.locator('input[placeholder*="ABC123"]');
    await expect(input).toHaveValue('TEST12');
  });

  // Note: Full join flow test requires an active game
  // This would need to be set up with test fixtures or Firebase emulators
  test.skip('should successfully join game with valid code', async ({ page }) => {
    // This test requires:
    // 1. A game created via test fixtures
    // 2. Known game code
    // 3. Firebase emulators or test environment
    
    await page.goto('/play');
    
    // Enter valid game code (would come from test fixture)
    const gameCode = process.env.E2E_TEST_GAME_CODE || 'TEST12';
    await page.fill('input[placeholder*="ABC123"]', gameCode);
    await page.click('button:has-text("Join Game")');

    // Should redirect to player game page
    await expect(page).toHaveURL(/\/play\/.+/, { timeout: 10000 });
    
    // Should show game information
    await expect(page.locator('text=/Current Number|Game Code/i')).toBeVisible();
  });
});
