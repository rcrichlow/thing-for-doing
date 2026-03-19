# API KNOWLEDGE BASE

## OVERVIEW
Rails 8 JSON API for boards, lists, cards, and working memory entries backed by PostgreSQL in Docker.

## WHERE TO LOOK
| Task | Location | Notes |
|---|---|---|
| Resource routing | `config/routes.rb` | Nested create routes plus top-level CRUD |
| CRUD behavior | `app/controllers/*_controller.rb` | Plain JSON, strong params, error status handling |
| Working memory API | `app/controllers/working_memory_entries_controller.rb`, `app/models/working_memory_entry.rb` | Plain JSON CRUD for lightweight note capture |
| Data model | `app/models/*.rb` | Associations and dependent destroys |
| Schema evolution | `db/migrate/`, `db/schema.rb` | Board → list → card structure |
| API verification | `spec/requests/` | Canonical request/response expectations |
| Model behavior checks | `spec/models/` | Association and cascade tests |
| Runtime boot | `docker-compose.yml`, `config/boot.rb`, `config/environment.rb` | Compose startup runs migrations |

## STRUCTURE
```text
api/
├── app/controllers/
├── app/models/
├── config/
├── db/migrate/
├── spec/requests/
└── spec/models/
```

## CONVENTIONS
- Run backend work through `docker compose exec api ...`.
- `docker-compose.yml` starts Rails with `bundle exec rails db:migrate` before server boot; preserve that clean-start behavior.
- Request specs are the fastest source of truth for status codes and JSON shapes.
- Controllers currently render nested JSON directly with `as_json`; follow existing style unless doing a deliberate serialization refactor.
- Nested creation routes matter: lists under boards and cards under lists only.
- Working memory entries are top-level resources at `/working_memory_entries` with index/create/update/destroy actions.
- Keep working memory responses simple JSON shaped for the lightweight frontend modal flow unless requirements explicitly change.

## ANTI-PATTERNS
- Do not assume host Ruby gems or local Postgres; use the compose stack.
- Do not change `tfd-network` external network settings without coordinating both stacks.
- Do not “fix” failing collection specs with `delete_all` when associations require `destroy_all`.
- Do not reintroduce boot/runtime regressions in `config/boot.rb` or `config/environment.rb`; these were previously repaired.
- Do not commit secret-bearing files casually; `config/master.key` exists in this tree.

## COMMANDS
```bash
cd api && docker compose up -d
cd api && docker compose exec api bundle exec rails db:seed
cd api && docker compose exec api bundle exec rspec
```

## NOTES
- Shared QA seed guidance and deterministic-ID assumptions live in `.sisyphus/plans/kanban-notes.md`.
- `test/` exists from scaffold, but active verification work is centered in `spec/`.
