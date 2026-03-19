import { test, expect } from '@playwright/test';
import { setupTestBoard, createList, createCard, dragCardToList } from './helpers';

test.describe('Drag and Drop Cards', () => {
  test('should drag a card from one list to another', async ({ page }) => {
    await setupTestBoard(page);
    await createList(page, 'Backlog');
    await createList(page, 'In Progress');
    await createCard(page, 'Backlog', 'Task to Move');
    await createCard(page, 'Backlog', 'Another Task');
    await createCard(page, 'In Progress', 'Already There');

    const backlogList = page.getByTestId('list-column').filter({ hasText: 'Backlog' });
    const inProgressList = page.getByTestId('list-column').filter({ hasText: 'In Progress' });
     
    await expect(backlogList.getByTestId('card-item')).toHaveCount(2);
    await expect(inProgressList.getByTestId('card-item')).toHaveCount(1);

    await dragCardToList(page, {
      sourceList: backlogList,
      targetList: inProgressList,
      cardTitle: 'Task to Move'
    });

    await expect(inProgressList.getByTestId('card-item').filter({ hasText: 'Task to Move' })).toBeVisible();
    await expect(backlogList.getByTestId('card-item')).toHaveCount(1);
    await expect(inProgressList.getByTestId('card-item')).toHaveCount(2);
  });

  test('should maintain card data after drag', async ({ page }) => {
    await setupTestBoard(page);
    await createList(page, 'Todo');
    await createList(page, 'Done');
    await createCard(page, 'Todo', 'Important Task');

    const todoList = page.getByTestId('list-column').filter({ hasText: 'Todo' });
    const doneList = page.getByTestId('list-column').filter({ hasText: 'Done' });
    await dragCardToList(page, {
      sourceList: todoList,
      targetList: doneList,
      cardTitle: 'Important Task'
    });

    await doneList.getByTestId('card-item').filter({ hasText: 'Important Task' }).click();

    await expect(page.locator('h2')).toContainText('Important Task');

    await page.keyboard.press('Escape');

    await expect(doneList.getByTestId('card-item')).toContainText('Important Task');
  });
});
