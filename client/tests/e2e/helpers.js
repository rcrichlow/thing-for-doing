import { expect } from '@playwright/test';

export async function setupTestBoard(page, title = null) {
  const uniqueTitle = title || `Test Board ${Date.now()}`;
  await page.goto('/boards');
  
  await page.getByTestId('new-board-btn').click();
  await page.getByTestId('board-title-input').fill(uniqueTitle);
  
  const responsePromise = page.waitForResponse(response => 
    response.url().includes('/api/boards') && response.request().method() === 'POST'
  );
  await page.getByTestId('board-submit-btn').click();
  const response = await responsePromise;
  
  // Get the created board ID from the API response
  const boardData = await response.json();
  const boardId = boardData.id;
  
  // Navigate directly to the board using the ID instead of searching for the card
  await page.goto(`/boards/${boardId}`);
  await page.waitForURL(`**/boards/${boardId}`, { timeout: 10000 });
  
  return boardId.toString();
}

export async function createList(page, title) {
  await page.getByTestId('list-title-input').fill(title);
  await page.getByTestId('add-list-btn').click();
  await expect(page.getByTestId('list-column').filter({ hasText: title })).toBeVisible();
}

export async function createCard(page, listTitle, cardTitle) {
  const list = page.getByTestId('list-column').filter({ hasText: listTitle });
  await list.getByTestId('add-card-btn').click();
  await list.getByTestId('card-title-input').fill(cardTitle);
  await list.getByTestId('card-title-input').press('Enter');
  await expect(list.getByTestId('card-item').filter({ hasText: cardTitle })).toBeVisible();
}

export async function dragCardToList(page, { sourceList, targetList, cardTitle, attempts = 3 }) {
  let lastError = 'drag produced no PATCH; likely no valid drop target';

  for (let attempt = 0; attempt < attempts; attempt += 1) {
    const card = sourceList.getByTestId('card-item').filter({ hasText: cardTitle });

    await card.scrollIntoViewIfNeeded();
    await targetList.scrollIntoViewIfNeeded();

    const cardBox = await card.boundingBox();
    const targetBox = await targetList.boundingBox();

    expect(cardBox).toBeTruthy();
    expect(targetBox).toBeTruthy();

    const patchResponse = page.waitForResponse(
      response =>
        /\/api\/cards\/\d+$/.test(response.url()) &&
        response.request().method() === 'PATCH' &&
        response.ok(),
      { timeout: 5000 }
    );

    await page.mouse.move(cardBox.x + cardBox.width / 2, cardBox.y + cardBox.height / 2);
    await page.mouse.down();
    await page.mouse.move(cardBox.x + cardBox.width / 2 + 12, cardBox.y + cardBox.height / 2 + 12, { steps: 4 });
    await page.mouse.move(targetBox.x + targetBox.width / 2, targetBox.y + targetBox.height / 2, { steps: 16 });
    await page.mouse.up();

    try {
      await patchResponse;
      await expect(targetList.getByTestId('card-item').filter({ hasText: cardTitle })).toBeVisible({ timeout: 5000 });
      return;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);

      await page.keyboard.press('Escape').catch(() => {});
      await expect(page.getByLabel('Close details')).toHaveCount(0, { timeout: 1000 }).catch(() => {});
    }
  }

  throw new Error(`Failed to drag "${cardTitle}" after ${attempts} attempts: ${lastError}`);
}
