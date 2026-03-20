# Thing For Doing

Thing For Doing is a full-stack personal productivity app with a Rails JSON API and a React 
frontend. It is built around two connected workflows:

- **Working Memory** for fast capture
- **Boards** for organizing captured items into lists and cards

The current app treats Working Memory as the default home experience. You can quickly capture 
thoughts, keep them in place, and optionally turn them into board cards without deleting the 
original entry.

## Current Features

- Working Memory is the default landing flow
- Keyboard-open working memory composer for fast capture
- Clear all working memory entries in one action
- Send a working memory entry to a board without removing the entry
- Create boards from the boards page or inline during send-to-board
- Create lists inside a board or inline during send-to-board
- Create cards inside lists
- Edit card title and description in a modal
- Reorder cards within a list and move them across lists with drag-and-drop
- Route-level error boundaries for page isolation

## Current Product Flow

- `/` redirects to `/working-memory`
- `/working-memory` shows working memory entries and a lightweight modal composer
- `/boards` shows the board index and board creation flow
- `/boards/:id` shows a board with lists, cards, drag-and-drop, and card detail editing

### Working Memory behavior

- Typing anywhere outside form fields opens the composer modal
- `Enter` submits the composer
- `Escape` closes the composer
- Backdrop click closes the composer
- Entries can be sent to a board through a modal that supports:
  - choosing an existing board
  - creating a new board inline
  - choosing an existing list
  - creating a new list inline

### Board behavior

- Board responses include nested lists and cards
- Lists and cards are returned in stable `position` order
- Card details open in a centered modal
- Card title and description are click-to-edit fields

## Stack

### Backend

- Rails 8 API
- PostgreSQL
- RSpec
- Docker Compose

### Frontend

- React 18
- React Router
- Vite
- Bun
- Tailwind CSS
- Vitest
- Playwright
- `@dnd-kit` for drag-and-drop

## Data Model

| Model | Description | Key Fields |
|---|---|---|
| Board | Container for lists | `title` |
| List | Column within a board | `title`, `position`, `board_id` |
| Card | Task item within a list | `title`, `description`, `position`, `list_id` |
| WorkingMemoryEntry | Quick capture item | `content` |

## API

The frontend talks to the backend through the Vite `/api` proxy. Rails routes are plain JSON endpoints covering four resources:

- **Boards** — full CRUD
- **Lists** — created under a board, updated and deleted at top level
- **Cards** — created under a list, updated and deleted at top level
- **Working Memory Entries** — top-level CRUD plus a bulk `destroy_all`

See `api/config/routes.rb` for the full route definitions.

## Local Development

This project runs through Docker Compose. The frontend uses Bun, and the backend/frontend share an external Docker network named `tfd-network`.

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

### Notes

- Backend runs on `http://localhost:3000`
- Frontend runs on `http://localhost:5173`
- The frontend proxies `/api` requests to the Rails container
- Backend startup runs migrations automatically
- Client package management is Bun, not npm or Yarn

## Verification Commands

Backend specs:

```bash
cd api && docker compose exec api bundle exec rspec
```

Optional backend seed data:

```bash
cd api && docker compose exec api bundle exec rails db:seed
```

Frontend unit/integration tests:

```bash
cd client && docker compose exec client bun run test -- --run
```

Frontend production build:

```bash
cd client && docker compose exec client bun run build
```

Frontend end-to-end tests against the standard stack:

```bash
cd client && docker compose exec client bunx playwright test
```

Isolated end-to-end tests with a dedicated Rails test stack:

```bash
./run-e2e.sh
E2E_CLEANUP=0 ./run-e2e.sh
```

## Implementation Notes

- Working Memory is the current home experience
- Frontend API calls go through the Vite `/api` proxy, not hard-coded backend URLs
- Board payloads include nested lists and cards
- Card ordering is persisted through `position`
- The app uses shared modal primitives for working memory, send-to-board, and card details
- Tests are split across RSpec, Vitest, and Playwright

## Future Enhancement Ideas

These are ideas, not committed roadmap items.

- UI refresh with improved spacing, hierarchy, and visual consistency
- Dark mode
- Better empty states
- Global search across boards and cards
- Labels or tags
- Filtering tools
- Keyboard shortcuts
- Command palette for fast navigation and creation
- Better card detail editing and visibility
- Due dates and reminders
- Recurring tasks
- Archive and completed-item views
- Progress indicators at the list or board level
- Activity history
- Recent changes dashboard
- Saved filters and smart views such as “My tasks” or “Due this week”
