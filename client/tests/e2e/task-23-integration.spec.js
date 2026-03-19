import { test, expect } from '@playwright/test';
import fs from 'node:fs/promises';
import path from 'node:path';
import { dragCardToList } from './helpers';

async function waitForApiReady(page) {
  await expect
    .poll(
      async () => {
        try {
          const response = await page.request.get('/api/boards', { failOnStatusCode: false });
          const status = response.status();

          if ([502, 503, 504].includes(status)) return 'not-ready';
          if (status !== 200) return `status-${status}`;

          const body = await response.text();
          return body.trim().startsWith('[') ? 'ready' : 'invalid-body';
        } catch {
          return 'network-error';
        }
      },
      {
        timeout: 90000,
        intervals: [500, 1000, 2000, 3000],
        message: 'API not ready for /api/boards via client proxy'
      }
    )
    .toBe('ready');

  const confirmation = await page.request.get('/api/boards', { failOnStatusCode: false });
  expect(confirmation.status()).toBe(200);
}

test('task 23 integrated workflow from clean environment', async ({ page }) => {
  test.setTimeout(120000);

  const stamp = Date.now();
  const data = {
    stamp,
    boardTitle: `Task23 Board ${stamp}`,
    listTodo: `Todo ${stamp}`,
    listDone: `Done ${stamp}`,
    cardToMove: `Card Move ${stamp}`,
    extraTodoCard: `Card Extra ${stamp}`,
    secondCard: `Card Stay ${stamp}`
  };

  const consoleErrors = [];
  const failedResponses = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
  page.on('response', response => {
    if (response.status() >= 400) {
      failedResponses.push({ status: response.status(), url: response.url() });
    }
  });

  await waitForApiReady(page);

  await page.goto('/boards');

  await page.getByTestId('new-board-btn').click();
  await page.getByTestId('board-title-input').fill(data.boardTitle);
  const boardResponsePromise = page.waitForResponse(
    response => response.url().includes('/api/boards') && response.request().method() === 'POST'
  );
  await page.getByTestId('board-submit-btn').click();
  const boardResponse = await boardResponsePromise;
  expect(boardResponse.ok()).toBeTruthy();
  const board = await boardResponse.json();
  const boardId = String(board.id);

  await page.goto(`/boards/${boardId}`);
  await page.waitForURL(`**/boards/${boardId}`);
  await expect(page.locator('h1')).toContainText(data.boardTitle);

  await page.getByTestId('list-title-input').fill(data.listTodo);
  await page.getByTestId('add-list-btn').click();
  const todoList = page.getByTestId('list-column').filter({ hasText: data.listTodo });
  await expect(todoList).toBeVisible();

  await page.getByTestId('list-title-input').fill(data.listDone);
  await page.getByTestId('add-list-btn').click();
  const doneList = page.getByTestId('list-column').filter({ hasText: data.listDone });
  await expect(doneList).toBeVisible();

  await todoList.getByTestId('add-card-btn').click();
  await todoList.getByTestId('card-title-input').fill(data.cardToMove);
  await todoList.getByTestId('card-title-input').press('Enter');
  await expect(todoList.getByTestId('card-item').filter({ hasText: data.cardToMove })).toBeVisible();

  await todoList.getByTestId('add-card-btn').click();
  await todoList.getByTestId('card-title-input').fill(data.extraTodoCard);
  await todoList.getByTestId('card-title-input').press('Enter');
  await expect(todoList.getByTestId('card-item').filter({ hasText: data.extraTodoCard })).toBeVisible();

  await doneList.getByTestId('add-card-btn').click();
  await doneList.getByTestId('card-title-input').fill(data.secondCard);
  await doneList.getByTestId('card-title-input').press('Enter');
  await expect(doneList.getByTestId('card-item').filter({ hasText: data.secondCard })).toBeVisible();

  await page.goto(`/boards/${boardId}`);
  await page.getByTestId('card-item').filter({ hasText: data.cardToMove }).click();
  await expect(page.getByText('No description provided')).toBeVisible();
  await page.getByLabel('Close details').click();
  await expect(page.getByLabel('Close details')).toHaveCount(0);

  await dragCardToList(page, {
    sourceList: todoList,
    targetList: doneList,
    cardTitle: data.cardToMove
  });

  await page.reload();
  await page.waitForURL(`**/boards/${boardId}`);

  const todoListAfterReload = page.getByTestId('list-column').filter({ hasText: data.listTodo });
  const doneListAfterReload = page.getByTestId('list-column').filter({ hasText: data.listDone });

  await expect(todoListAfterReload).toBeVisible();
  await expect(doneListAfterReload).toBeVisible();
  await expect(doneListAfterReload.getByTestId('card-item').filter({ hasText: data.cardToMove })).toBeVisible();
  await expect(todoListAfterReload.getByTestId('card-item').filter({ hasText: data.cardToMove })).toHaveCount(0);

  await doneListAfterReload.getByTestId('card-item').filter({ hasText: data.cardToMove }).click();
  await expect(page.getByText('No description provided')).toBeVisible();

  expect(consoleErrors, `Console errors detected:\n${consoleErrors.join('\n')}\nFailed responses: ${JSON.stringify(failedResponses, null, 2)}`).toEqual([]);

  const evidenceDir = path.resolve(process.cwd(), '../.sisyphus/evidence');
  const evidencePath = path.join(evidenceDir, `task-23-integration-${stamp}.json`);
  const screenshotPath = path.join(evidenceDir, `task-23-integration-${stamp}.png`);

  await fs.mkdir(evidenceDir, { recursive: true });
  await page.screenshot({ path: screenshotPath, fullPage: true });

  const evidence = {
    task: 23,
    timestamp: new Date().toISOString(),
    boardId,
    workflow: [
      'create board',
      'add 2 lists',
      'add cards to each list',
      'open card detail drawer',
      'drag card between lists',
      'refresh and verify persistence'
    ],
    persistence: {
      movedCardInTargetListAfterRefresh: true,
      movedCardAbsentFromSourceListAfterRefresh: true
    },
    consoleErrors,
    failedResponses,
    artifacts: {
      screenshot: screenshotPath,
      evidenceJson: evidencePath
    },
    entities: data
  };

  await fs.writeFile(evidencePath, `${JSON.stringify(evidence, null, 2)}\n`, 'utf8');
});
