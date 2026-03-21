#!/usr/bin/env bash

set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
API_COMPOSE_FILE="$ROOT_DIR/api/docker-compose.e2e.yml"
CLIENT_COMPOSE_FILE="$ROOT_DIR/client/docker-compose.yml"
API_E2E_PROJECT_NAME="${API_E2E_PROJECT_NAME:-api-e2e}"
E2E_CLEANUP="${E2E_CLEANUP:-1}"

cleanup_stack() {
	docker compose -p "$API_E2E_PROJECT_NAME" -f "$API_COMPOSE_FILE" down -v --remove-orphans
}

should_cleanup() {
	[[ "$E2E_CLEANUP" == "1" ]]
}

wait_for_api() {
	local attempts=60

	for ((i = 1; i <= attempts; i += 1)); do
		if curl -fsS "http://localhost:3001/up" >/dev/null; then
			return 0
		fi

		sleep 2
	done

	return 1
}

docker network inspect tfd-network >/dev/null 2>&1 || docker network create tfd-network >/dev/null

cleanup_stack

if should_cleanup; then
	trap cleanup_stack EXIT
fi

docker compose -p "$API_E2E_PROJECT_NAME" -f "$API_COMPOSE_FILE" up -d --build

if ! wait_for_api; then
	echo "E2E API did not become healthy at http://localhost:3001/up" >&2
	exit 1
fi

set +e
docker compose -f "$CLIENT_COMPOSE_FILE" run --rm -T \
	-e PLAYWRIGHT_ISOLATED_E2E=1 \
	client bunx playwright test "$@"
test_status=$?
set -e

exit "$test_status"
