# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-20 America/New_York
**Commit:** current working tree
**Branch:** master

## OVERVIEW
Kanban app with a working-memory home view: Rails 8 JSON API in `api/`, React 18 + Vite frontend in `client/`, workflow artifacts in `.sisyphus/`.

## STRUCTURE
```text
thing-for-doing/
├── api/         # Rails API, PostgreSQL, RSpec
├── client/      # React UI, Bun, Vitest, Playwright
├── .sisyphus/   # plans, learnings, evidence, boulder state
└── readme.md    # product scope and data model
```

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Product scope / entity model | `readme.md` | Boards, lists, cards |
| Full implementation history / constraints | `.sisyphus/plans/kanban-notes.md` | Canonical workflow, guardrails, verification history |
| Backend routes / nested resources | `api/config/routes.rb` | Lists under boards, cards under lists, board archive/unarchive member routes |
| Frontend app shell / routes | `client/src/App.jsx`, `client/src/components/AppLayout.jsx` | `/`, `/working-memory`, `/boards`, `/boards/archived`, active header nav |
| Working memory frontend | `client/src/pages/working-memory/WorkingMemoryView.jsx` | Default landing page, keyboard-open modal composer, send-to-board flow |
| Shared API client | `client/src/services/api.js` | Uses `/api` proxy, standardized JSON error handling |
| Working memory API | `api/app/controllers/working_memory_entries_controller.rb` | Plain JSON CRUD for entries |
| E2E helpers / integration flow | `client/tests/e2e/` | Stable board setup and Task 23 integrated flow |
| Manual QA / evidence | `.sisyphus/evidence/` | Final QA screenshots + Task 23 JSON/PNG artifacts |

## CODE MAP
| Symbol | Type | Location | Role |
|---|---|---|---|
| `BoardProvider` | context provider | `client/src/context/BoardContext.jsx` | Global active board collection state with explicit archive/unarchive/delete lifecycle actions |
| `BoardView` | page | `client/src/pages/boards/BoardView.jsx` | Board detail, archive state indicator, board archive/unarchive/delete actions, list creation, card/list deletion flows, card detail modal, DnD |
| `ArchivedBoardsIndex` | page | `client/src/pages/boards/ArchivedBoardsIndex.jsx` | Archived board browsing plus unarchive/delete actions |
| `useBoardsIndexState` | custom hook | `client/src/hooks/useBoardsIndexState.js` | Boards page fetch/create state and board context updates |
| `WorkingMemoryView` | page | `client/src/pages/working-memory/WorkingMemoryView.jsx` | Root page, entry list, lightweight modal composer, send-to-board entry flow |
| `useWorkingMemoryState` | custom hook | `client/src/hooks/useWorkingMemoryState.js` | Working memory fetch/modal/form state, inline updates, multiline composer behavior |
| `WorkingMemoryEntry` | component | `client/src/pages/working-memory/WorkingMemoryEntry.jsx` | Entry row with inline editing plus send/delete actions |
| `SendToBoardModal` | component | `client/src/pages/working-memory/SendToBoardModal.jsx` | Board/list picker plus inline board/list creation and multiline entry preview |
| `Modal` | shared component | `client/src/components/Modal.jsx` | Reused backdrop/dialog pattern for working memory and card details |
| `ErrorBoundary` | component | `client/src/components/ErrorBoundary.jsx` | App-level and route-level error containment |
| `CardDetailModal` | component | `client/src/components/CardDetailModal.jsx` | Click-to-edit card title/description modal with delete action |
| `ListDeleteModal` | component | `client/src/components/ListDeleteModal.jsx` | Optional card-transfer flow before list deletion |
| `BoardsController` | controller | `api/app/controllers/boards_controller.rb` | Board CRUD plus archive/unarchive and archived index payloads |
| `WorkingMemoryEntriesController` | controller | `api/app/controllers/working_memory_entries_controller.rb` | Index/create/update/destroy working memory entries |
| `setupTestBoard` | test helper | `client/tests/e2e/helpers.js` | Creates board, reads POST response, navigates by ID |
| `waitForApiReady` | test helper | `client/tests/e2e/task-23-integration.spec.js` | Polls `/api/boards` before integrated flow |

## CONVENTIONS
- All real app commands run through Docker, not host language runtimes.
- Client package manager is Bun. Do not switch to npm or Yarn.
- Frontend API calls go through Vite proxy path `/api`, not hard-coded backend URLs.
- Rails responses are plain JSON via `as_json`; preserve nested board/list/card shapes unless intentionally changing the API contract.
- `/` redirects to `/working-memory`; treat working memory as the current home experience unless intentionally changing navigation.
- Working memory entry creation is currently a lightweight custom modal opened by typing anywhere outside form fields; backdrop click and `Escape` close it, `Enter` submits, and `Shift+Enter` promotes the field into multiline mode.
- Working memory entries support inline click-to-edit, preserve multiline content, and can be deleted individually with confirmation.
- Working memory entries can be sent to boards without being removed; the send flow uses a custom modal with board/list selection, inline board/list creation, and a multiline-safe entry preview.
- Card details now open in a centered modal, not a side drawer; title/description are click-to-edit and the modal includes card deletion.
- Boards can be archived from active board flows, disappear from the main boards list, and appear in `/boards/archived` until they are unarchived or deleted.
- Archived boards remain viewable at their normal board URLs, show a visible archived indicator, and can be unarchived from either the archived boards index or the archived board page.
- Archived boards currently behave like regular boards aside from being hidden from the main boards list and marked as archived; do not assume they are read-only unless requirements change.
- Board deletion now fails loudly: failed `DELETE /boards/:id` destroys return structured `422` JSON errors instead of silent `204` success.
- Board → list → card foreign keys now cascade deletes at the database level as a safety net; keep model-level `dependent: :destroy` callbacks too.
- Lists can be deleted from the board UI; when a non-empty list is removed and another list exists, the delete flow can transfer cards before the list is deleted.
- `BoardContext` is intentionally scoped to the active board collection only; archive, unarchive, and permanent delete use distinct reducer actions instead of overloading delete semantics.
- Page-specific state has started moving into custom hooks (`useWorkingMemoryState`, `useBoardsIndexState`) instead of growing page components further.
- Shared modal keyboard dismissal (`Escape`) now lives in `client/src/components/Modal.jsx`; keep modal close behavior centralized there.
- Prefer app/test changes over workaround noise in evidence files or generated output.

## ANTI-PATTERNS (THIS PROJECT)
- Do not run Rails or Bun commands outside containers.
- Do not break the shared external Docker network `tfd-network` used by both compose stacks.
- Do not let Vitest discover Playwright specs; `client/vite.config.js` must keep `tests/e2e/**` excluded.
- Do not rely on truncated UI text for E2E navigation when response data gives a stable ID.
- Do not reintroduce a third-party modal library for working memory or card details unless there is an explicit product need.
- Do not reintroduce removed note or notebook workflows without explicitly changing product scope and verification.
- Do not edit committed secrets/runtime artifacts casually (`api/config/master.key`, temp/runtime files) without explicit need.

## UNIQUE STYLES
- `.sisyphus/plans/kanban-notes.md` is the repo-specific source of truth for work sequencing, QA expectations, and accepted deviations.
- Evidence-heavy workflow: meaningful UI/integration changes are backed by screenshots and JSON reports under `.sisyphus/evidence/`.
- Frontend components use `data-testid` heavily; preserve them when refactoring test-covered UI.
- Working memory intentionally favors personal-speed UX over robust accessibility right now; keep changes simple unless requirements change.

## COMMANDS
```bash
docker network create tfd-network

cd api && docker compose up -d
cd client && docker compose up -d

cd api && docker compose exec api bundle exec rspec
cd client && docker compose exec client bun run test -- --run
cd client && docker compose exec client bun run build
cd client && docker compose exec client bunx playwright test
```

## NOTES
- No existing `AGENTS.md` or `CLAUDE.md` were present before this file.
- `client/dist/`, Playwright reports, logs, and similar outputs are artifacts, not source of truth.
- If behavior and tests disagree, check `.sisyphus/notepads/kanban-notes/` and evidence before changing product behavior.
