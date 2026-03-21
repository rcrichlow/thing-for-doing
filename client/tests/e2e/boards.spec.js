import { test, expect } from '@playwright/test';
import { setupTestBoard } from './helpers';

test.describe('Board Management', () => {
  test('should create a board, add a list, and add a card', async ({ page }) => {
    const boardTitle = `My Test Board ${Date.now()}`;
    await page.goto('/boards');
    await page.getByTestId('new-board-btn').click();
    await page.getByTestId('board-title-input').fill(boardTitle);
    await page.getByTestId('board-submit-btn').click();

    const boardCard = page.getByTestId('board-card').filter({ hasText: boardTitle });
    await boardCard.waitFor({ state: 'visible' });
    await boardCard.click();

    await expect(page).toHaveURL(/\/boards\/\d+/);
    await expect(page.getByTestId('list-title-input')).toBeVisible({ timeout: 10000 });

    await page.getByTestId('list-title-input').fill('To Do');
    await page.getByTestId('add-list-btn').click();

    const listColumn = page.getByTestId('list-column');
    await expect(listColumn).toContainText('To Do');

    await page.getByTestId('add-card-btn').click();
    await page.getByTestId('card-title-input').fill('First Task');
    await page.getByTestId('card-title-input').press('Enter');

    await expect(page.getByTestId('card-item')).toContainText('First Task');
  });

  test('should navigate back to boards list', async ({ page }) => {
    await setupTestBoard(page);

    await page.locator('a[href="/boards"]').click();

    await expect(page).toHaveURL('/boards');
    await expect(page.getByTestId('new-board-btn')).toBeVisible();
  });
});
