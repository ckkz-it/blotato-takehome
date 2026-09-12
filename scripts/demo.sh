#!/usr/bin/env bash
set -Eeuo pipefail

COMMENT_ID="comment-demo"
WORKFLOW_ID="automation:00000000-0000-0000-0000-000000000001:comment:${COMMENT_ID}"
LOG_PID=""

cleanup() {
  local exit_code=$?
  trap - EXIT INT TERM

  if [[ -n "${LOG_PID}" ]]; then
    kill "${LOG_PID}" 2>/dev/null || true
    wait "${LOG_PID}" 2>/dev/null || true
  fi

  printf '\nStopping demo services and removing demo data...\n'
  docker compose down -v --remove-orphans >/dev/null 2>&1 || true
  printf 'Demo stopped.\n'

  exit "${exit_code}"
}
trap cleanup EXIT INT TERM

wait_for_api() {
  local deadline=$((SECONDS + 120))

  until curl --silent --output /dev/null http://localhost:3000; do
    if ((SECONDS >= deadline)); then
      printf 'API did not become ready in time.\n' >&2
      docker compose logs api worker temporal >&2
      return 1
    fi
    sleep 1
  done
}

wait_for_worker_log() {
  local expected=$1
  local deadline=$((SECONDS + 30))

  until docker compose logs --no-color worker 2>/dev/null | grep --fixed-strings --quiet "${expected}"; do
    if ((SECONDS >= deadline)); then
      printf 'Timed out waiting for worker log: %s\n' "${expected}" >&2
      return 1
    fi
    sleep 0.5
  done
}

printf 'Starting Postgres, Temporal, Temporal UI, API, and worker...\n'
docker compose down -v --remove-orphans >/dev/null 2>&1 || true
docker compose up --build --detach
wait_for_api

printf '\nDemo is ready (Temporal UI: http://localhost:8080).\n'
printf 'Following worker activity logs...\n\n'
docker compose logs --follow --tail=0 worker &
LOG_PID=$!

printf '%s\n' '1. Sending a normalized "pricing" comment event...'
curl --fail-with-body --silent --show-error --output /dev/null \
  --write-out '   API response: HTTP %{http_code}\n' \
  --header 'Content-Type: application/json' \
  --data "{
    \"id\": \"comment-event-demo\",
    \"platform\": \"instagram\",
    \"postId\": \"post-demo\",
    \"commentId\": \"${COMMENT_ID}\",
    \"userId\": \"user-demo\",
    \"text\": \"pricing\"
  }" \
  http://localhost:3000/events/comments

wait_for_worker_log "What's your email address?"
printf '   Workflow is now durably waiting for the incoming message signal.\n\n'

printf '%s\n' '2. Sending the user email as a normalized message event...'
curl --fail-with-body --silent --show-error --output /dev/null \
  --write-out '   API response: HTTP %{http_code}\n' \
  --header 'Content-Type: application/json' \
  --data "{
    \"id\": \"message-event-demo\",
    \"platform\": \"instagram\",
    \"userId\": \"user-demo\",
    \"workflowId\": \"${WORKFLOW_ID}\",
    \"text\": \"person@example.com\"
  }" \
  http://localhost:3000/events/messages

wait_for_worker_log "Thanks! Here's your link: https://example.com"
sleep 1

printf '\n3. Temporal execution result:\n'
docker compose exec -T temporal temporal workflow describe \
  --address temporal:7233 \
  --workflow-id "${WORKFLOW_ID}" \
  | grep --extended-regexp 'WorkflowId|Status' \
  | sed 's/^/   /'

printf '\nDemo completed successfully.\n'
