# CLIENT KNOWLEDGE BASE

## OVERVIEW
React 18 + Vite frontend for working memory, boards, and drag-and-drop flows; Bun is the package manager and Playwright/Vitest cover the app.

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| App routes / shell | `src/App.jsx`, `src/main.jsx` | Providers + route tree |
| Working memory page | `src/pages/working-memory/WorkingMemoryView.jsx` | Home route, modal composer, keyboard-open flow, inline edit, send-to-board flow |
| Board state | `src/context/BoardContext.jsx` | Reducer-backed board collection state only |
| Working memory state hook | `src/hooks/useWorkingMemoryState.js` | Fetching entries, modal state, keyboard-open behavior, inline updates, multiline composer behavior |
| Boards page state hook | `src/hooks/useBoardsIndexState.js` | Boards fetch/create state and board context updates |
| Board UX / DnD / card detail | `src/pages/boards/BoardView.jsx` | List creation, card/list deletion flows, card detail modal, drag handling |
| Boards page | `src/pages/boards/BoardsIndex.jsx` | Board creation tile, truncated board titles |
| Shared modal pattern | `src/components/Modal.jsx` | Reused custom modal for working memory and card details |
| Card detail editing | `src/components/CardDetailModal.jsx` | Centered modal, click-to-edit title/description, card delete |
| Shared async error helper | `src/utils/getErrorMessage.js` | Normalizes unknown errors into UI-safe messages |
| API calls | `src/services/api.js` | `/api` base path, shared request helper |
| Unit/integration tests | `src/**/__tests__`, `src/components/*.test.jsx` | Vitest coverage |
| E2E tests | `tests/e2e/` | Playwright helpers and integrated flow |

## STRUCTURE
```text
client/
├── src/components/
├── src/context/
├── src/pages/
├── src/services/
├── src/__tests__/
└── tests/e2e/
```

## CONVENTIONS
- Use Bun commands, usually via Docker: `docker compose exec client bun ...`.
- Vite proxy owns backend access; keep API calls on `/api` instead of embedding `http://api:3000` in source files.
- Preserve `data-testid` attributes unless tests are intentionally updated in the same change.
- Keep Vitest scoped to app tests only; `vite.config.js` excludes `node_modules/**` and `tests/e2e/**` for a reason.
- Follow current route structure exactly: `/`, `/working-memory`, `/boards`, `/boards/:id`.
- `/` redirects to `/working-memory`; treat the working memory page as the default landing experience.
- `App.jsx` wraps page routes in `ErrorBoundary`; preserve route-level crash isolation when changing routing.
- The working memory composer is a lightweight custom modal opened by typing anywhere outside form fields, not by an always-visible input.
- Working memory modal behavior: semi-transparent gray backdrop, backdrop click closes, `Escape` cancels, `Enter` submits, and `Shift+Enter` promotes the field into multiline mode.
- Working memory entries support inline click-to-edit, per-entry deletion, and multiline content with preserved line breaks in display.
- Working memory entries support a send-to-board flow that keeps the entry in place while creating a card on a selected list.
- The send-to-board modal supports inline board/list creation and preserves multiline entry text in its preview; avoid nested forms inside that dialog.
- Card details use the same custom modal family as working memory, not a right-side drawer.
- Card detail fields are display-first and become editable only after click, and the modal also owns card deletion.
- Lists expose hover-delete affordances in board columns, and non-empty list deletion can transfer cards to another list before removal.
- Keep `BoardContext` focused on shared board collection data; page-local loading, form, and modal state belong in page hooks/components.
- Prefer extracting page-specific orchestration into custom hooks when a page starts mixing data loading, modal state, and event wiring.
- Keep working memory UX intentionally lightweight for personal use; avoid overbuilding accessibility or modal infrastructure unless requested.

## ANTI-PATTERNS
- Do not switch package management back to Yarn or npm.
- Do not use `bun test` for Vitest coverage here; use `bun run test`.
- Do not rely on full visible board-title text in Playwright when titles can truncate in the UI.
- Do not remove readiness polling from Task 23-style clean-start integration coverage without replacing it with equally robust startup synchronization.
- Do not reintroduce a third-party modal library for working memory or card details unless requirements change.
- Do not reintroduce removed note or notebook UI flows without updating tests and evidence together.

## COMMANDS
```bash
cd client && docker compose up -d
cd client && docker compose exec client bun run test -- --run
cd client && docker compose exec client bun run build
cd client && docker compose exec client bunx playwright test
```

## NOTES
- `playwright.config.cjs` uses CommonJS and system Chromium settings; preserve that unless you rework the Docker/browser story too.
- `client/dist/`, `playwright-report/`, and `test-results/` are outputs, not authoritative code.
- The current working memory implementation favors speed and simplicity over full accessibility semantics because the app is personal-use.
