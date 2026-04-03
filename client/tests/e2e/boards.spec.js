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

    await page.getByRole('link', { name: '← Back to Boards' }).click();

    await expect(page).toHaveURL('/boards');
    await expect(page.getByTestId('new-board-btn')).toBeVisible();
  });

  test('should edit board title', async ({ page }) => {
    const { boardTitle } = await setupTestBoard(page);

    // Verify original title is displayed
    await expect(page.locator('h1')).toContainText(boardTitle);

    // Click on the title button to edit
    await page.locator('h1 button[title*="Edit"]').click();

    // Input should be visible with original title
    const titleInput = page.getByTestId('board-title-input');
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue(boardTitle);

    // Update the title
    const newTitle = `Updated Board ${Date.now()}`;
    await titleInput.fill(newTitle);
    await titleInput.blur();

    // New title should be displayed
    await expect(page.locator('h1')).toContainText(newTitle);

    // Verify title persists after page refresh
    await page.reload();
    await expect(page.locator('h1')).toContainText(newTitle);

    // Verify title updates in boards list
    await page.goto('/boards');
    await expect(page.getByTestId('board-card').filter({ hasText: newTitle })).toBeVisible();
  });

  test('should cancel board title edit with Escape', async ({ page }) => {
    const { boardTitle } = await setupTestBoard(page);

    // Click on the title button to edit
    await page.locator('h1 button[title*="Edit"]').click();

    // Change the title but press Escape
    const titleInput = page.getByTestId('board-title-input');
    await titleInput.fill('Cancelled Title');
    await titleInput.press('Escape');

    // Original title should still be displayed
    await expect(page.locator('h1')).toContainText(boardTitle);
    await expect(titleInput).not.toBeVisible();
  });

  test('should save board title with Enter key', async ({ page }) => {
    await setupTestBoard(page);

    // Click on the title button to edit
    await page.locator('h1 button[title*="Edit"]').click();

    // Update the title and press Enter
    const titleInput = page.getByTestId('board-title-input');
    const newTitle = `Enter Key Title ${Date.now()}`;
    await titleInput.fill(newTitle);
    await titleInput.press('Enter');

    // New title should be displayed
    await expect(page.locator('h1')).toContainText(newTitle);
  });

  test('should edit list title', async ({ page }) => {
    await setupTestBoard(page);

    // Create a list
    await page.getByTestId('list-title-input').fill('Original List');
    await page.getByTestId('add-list-btn').click();

    // Wait for list to appear
    const listColumn = page.getByTestId('list-column').filter({ hasText: 'Original List' });
    await expect(listColumn).toBeVisible();

    // Click on list title button to edit - find the title button within the list column
    const titleButton = listColumn.locator('button[title="Edit list title"]');
    await titleButton.click();

    // Input should appear with original title
    const titleInput = page.getByTestId(/list-title-edit-input-/);
    await expect(titleInput).toBeVisible();
    await expect(titleInput).toHaveValue('Original List');

    // Update the title
    await titleInput.fill('Updated List');
    await titleInput.blur();

    // New title should be displayed - get fresh reference after update
    const updatedListColumn = page.getByTestId('list-column').filter({ hasText: 'Updated List' });
    await expect(updatedListColumn).toBeVisible();

    // Verify persists after refresh
    await page.reload();
    await expect(page.getByText('Updated List')).toBeVisible();
  });

  test('should cancel list title edit with Escape', async ({ page }) => {
    await setupTestBoard(page);

    await page.getByTestId('list-title-input').fill('My List');
    await page.getByTestId('add-list-btn').click();

    const listColumn = page.getByTestId('list-column').filter({ hasText: 'My List' });
    const titleButton = listColumn.locator('button[title="Edit list title"]');
    await titleButton.click();

    const titleInput = page.getByTestId(/list-title-edit-input-/);
    await titleInput.fill('Cancelled Title');
    await titleInput.press('Escape');

    // Original title should still be displayed
    await expect(listColumn).toContainText('My List');
    await expect(titleInput).not.toBeVisible();
  });

  test('should save list title with Enter key', async ({ page }) => {
    await setupTestBoard(page);

    await page.getByTestId('list-title-input').fill('Enter List');
    await page.getByTestId('add-list-btn').click();

    const listColumn = page.getByTestId('list-column').filter({ hasText: 'Enter List' });
    const titleButton = listColumn.locator('button[title="Edit list title"]');
    await titleButton.click();

    const titleInput = page.getByTestId(/list-title-edit-input-/);
    await titleInput.fill('Enter Key List');
    await titleInput.press('Enter');

    // New title should be displayed - get fresh reference after update
    const updatedListColumn = page.getByTestId('list-column').filter({ hasText: 'Enter Key List' });
    await expect(updatedListColumn).toBeVisible();
  });
});
