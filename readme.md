# Thing For Doing

A working full-stack productivity app with a Rails 8 JSON API and a React 18 frontend. It provides 
a Trello-style board for task flow.

## Current Status

The app is already functional end to end.

### Implemented

- Create and view boards
- Create lists inside boards
- Create cards inside lists
- Reorder cards with drag-and-drop
- Persist card order through the API so refreshes keep the same order
- Move cards between lists with drag-and-drop
- Open a card detail drawer
- Handle loading, empty, and error states across the main flows

### Current Product Flow

- `/` shows the boards dashboard
- `/boards/:id` shows a board with lists and cards
- Card details currently rely on the card title and description only

## Stack

### Backend

- Rails 8 API
- PostgreSQL
- RSpec
- Docker Compose for local execution

### Frontend

- React 18
- Vite
- Bun
- Vitest
- Playwright
- `@dnd-kit` for drag-and-drop

## Data Model

| Model | Description | Key Fields |
|---|---|---|
| Board | Container for lists | `title` |
| List | Column within a board | `title`, `position`, `board_id` |
| Card | Task item within a list | `title`, `description`, `position`, `list_id` |

## API

### Boards

- `GET /boards`
- `POST /boards`
- `GET /boards/:id`
- `PATCH /boards/:id`
- `DELETE /boards/:id`

### Lists

- `POST /boards/:board_id/lists`
- `PATCH /lists/:id`
- `DELETE /lists/:id`

### Cards

- `GET /cards`
- `GET /cards/:id`
- `POST /lists/:list_id/cards`
- `PATCH /cards/:id`
- `DELETE /cards/:id`

## Local Development

Create the shared Docker network once if needed:

```bash
docker network create tfd-network
```

Start the backend:

```bash
cd api && docker compose up -d
```

Start the frontend:

```bash
cd client && docker compose up -d
```

## Verification Commands

Backend specs:

```bash
cd api && docker compose exec api bundle exec rspec
```

Frontend unit/integration tests:

```bash
cd client && docker compose exec client bun run test -- --run
```

Frontend production build:

```bash
cd client && docker compose exec client bun run build
```

End-to-end tests:

```bash
cd client && docker compose exec client bunx playwright test
```

Isolated end-to-end tests with a dedicated Rails test database and optional cleanup:

```bash
./run-e2e.sh
E2E_CLEANUP=0 ./run-e2e.sh
```

## Notes on Behavior

- Frontend API calls go through the Vite `/api` proxy
- Card ordering is persisted by the API using `position`
- Board responses return lists and cards in stable position order
- Card detail currently shows title and description only

## Future Enhancements Roadmap

These are proposed product directions, not current features.

### Phase 1 — Quick Wins / Highest Leverage

- UI refresh foundation with improved spacing, typography, and visual hierarchy
- Dark mode
- Better empty states
- Global search across boards and cards

### Phase 2 — Core Usability Improvements

- Unified sidebar navigation for boards and recent or favorite items
- card detail displayed in modal window, not drawer
- Labels/tags and filtering tools
- Keyboard shortcuts and a command palette for faster navigation and creation

### Phase 3 — Card Detail Usability

- Better card detail editing and visibility

### Phase 4 — Planning and Accountability

- Due dates and reminders
- Recurring tasks
- Archive and completed-item views
- Progress indicators at the list or board level

### Phase 5 — Collaboration and Visibility

- Activity history
- Recent changes dashboard

### Recommended Milestone

The most impactful near-term milestone would be a modern productivity UX pass that combines:

- UI refresh foundation
- Dark mode
- Search

## Additional Ideas Under Consideration

- Saved filters and smart views such as “My tasks” or “Due this week”
