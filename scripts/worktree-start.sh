#!/bin/bash
# Start a new worktree session with isolated Docker services and a seeded admin user.
#
# Usage:
#   ./scripts/worktree-start.sh <name> [branch] [email] [password]
#
# Examples:
#   ./scripts/worktree-start.sh my-feature
#   ./scripts/worktree-start.sh my-feature feature/my-feature
#   ./scripts/worktree-start.sh my-feature feature/my-feature me@dev.local mypass

set -e

NAME="${1}"
BRANCH="${2:-feature/${NAME}}"
SEED_EMAIL="${3:-admin@dev.local}"
SEED_PASSWORD="${4:-admin}"

if [[ -z "$NAME" ]]; then
  echo "Usage: ./scripts/worktree-start.sh <name> [branch] [email] [password]"
  exit 1
fi

WORKTREE_PATH=".claude/worktrees/${NAME}"
PROJECT="cortex-${NAME}"

# ── Port allocation ────────────────────────────────────────────────────────────
# Find the first free port starting from $1
find_free_port() {
  local port="${1}"
  while docker ps --format '{{.Ports}}' 2>/dev/null | grep -q "0\.0\.0\.0:${port}->" || \
        ss -tlnp 2>/dev/null | grep -q ":${port} "; do
    port=$((port + 1))
  done
  echo "${port}"
}

APP_PORT=$(find_free_port 3001)
DB_PORT=$(find_free_port 5433)
ADMINER_PORT=$(find_free_port 8081)

# ── Worktree ───────────────────────────────────────────────────────────────────
echo "Creating worktree: ${WORKTREE_PATH} (branch: ${BRANCH})"
git worktree add "${WORKTREE_PATH}" -b "${BRANCH}"

# ── Docker ────────────────────────────────────────────────────────────────────
echo "Starting services  app=:${APP_PORT}  db=:${DB_PORT}  adminer=:${ADMINER_PORT}"
APP_PATH="${WORKTREE_PATH}" \
APP_PORT="${APP_PORT}" \
DB_PORT="${DB_PORT}" \
ADMINER_PORT="${ADMINER_PORT}" \
AUTH_URL="http://localhost:${APP_PORT}" \
AUTH_URL_INTERNAL="http://localhost:3000" \
docker compose -p "${PROJECT}" up -d --build

# ── Wait for app ──────────────────────────────────────────────────────────────
echo "Waiting for app to be ready..."
MAX_WAIT=300
ELAPSED=0
until curl -sf "http://localhost:${APP_PORT}/api/auth/get-session" > /dev/null 2>&1; do
  sleep 3
  ELAPSED=$((ELAPSED + 3))
  if [[ $ELAPSED -ge $MAX_WAIT ]]; then
    echo "Timed out waiting for app. Check logs: docker compose -p ${PROJECT} logs -f cortex"
    exit 1
  fi
done

# ── DB migrations ─────────────────────────────────────────────────────────────
# Run all init SQL files from the worktree — catches any schema changes on the
# branch that aren't in the project root's db/init/ (which postgres used on init).
# All files use IF NOT EXISTS so this is safe and idempotent.
echo "Applying DB migrations from worktree..."
for f in "${WORKTREE_PATH}/db/init/"*.sql; do
  docker compose -p "${PROJECT}" exec -T postgres \
    psql -U "${POSTGRES_USER:-cortex}" -d cortex_db < "$f" > /dev/null 2>&1 || true
done

# ── Seed ──────────────────────────────────────────────────────────────────────
echo "Seeding admin user..."
docker compose -p "${PROJECT}" exec -T cortex \
  bun run scripts/seed-admin.ts "${SEED_EMAIL}" "${SEED_PASSWORD}" "Admin"

# ── VS Code setup ─────────────────────────────────────────────────────────────
# Docker creates node_modules as root inside the anonymous volume — use a
# temporary container to remove it so no sudo is needed on the host.
echo "Installing dependencies for VS Code..."
docker run --rm -v "$(pwd)/${WORKTREE_PATH}:/app" alpine sh -c "rm -rf /app/node_modules"
(cd "${WORKTREE_PATH}" && bun install --silent)
echo "Generating Nuxt types..."
(cd "${WORKTREE_PATH}" && bunx nuxt prepare 2>/dev/null)

# ── Summary ───────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Worktree : ${NAME}"
echo "  Branch   : ${BRANCH}"
echo "  URL      : http://localhost:${APP_PORT}"
echo "  Email    : ${SEED_EMAIL}"
echo "  Password : ${SEED_PASSWORD}"
echo "  Adminer  : http://localhost:${ADMINER_PORT}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "Logs   : docker compose -p ${PROJECT} logs -f cortex"
echo "VS Code: code ${WORKTREE_PATH}"
echo ""
