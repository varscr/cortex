#!/bin/bash
# Stop a worktree session: tears down Docker services, removes the worktree
# directory, and merges the branch into main.
# If the merge fails due to conflicts, it aborts cleanly and prints instructions.
#
# Usage:
#   ./scripts/worktree-stop.sh <name>

set -e

NAME="${1}"

if [[ -z "$NAME" ]]; then
  echo "Usage: ./scripts/worktree-stop.sh <name>"
  exit 1
fi

WORKTREE_PATH=".claude/worktrees/${NAME}"
PROJECT="cortex-${NAME}"

# Resolve the branch name from the worktree before removing it
BRANCH=$(git worktree list --porcelain | awk -v path="$(pwd)/${WORKTREE_PATH}" '
  $1 == "worktree" && $2 == path { found=1 }
  found && $1 == "branch" { sub("refs/heads/", "", $2); print $2; exit }
')

if [[ -z "$BRANCH" ]]; then
  echo "Warning: could not resolve branch for worktree '${NAME}'. Skipping merge."
  SKIP_MERGE=1
fi

# ── Docker ────────────────────────────────────────────────────────────────────
echo "Stopping Docker services for project: ${PROJECT}"
if docker compose -p "${PROJECT}" ps -q 2>/dev/null | grep -q .; then
  docker compose -p "${PROJECT}" down --volumes
else
  echo "  (no running services found — skipping)"
fi

# ── Worktree ──────────────────────────────────────────────────────────────────
if git worktree list | grep -q "${WORKTREE_PATH}"; then
  echo "Removing worktree: ${WORKTREE_PATH}"
  git worktree remove --force "${WORKTREE_PATH}"
else
  echo "  (worktree path not found — skipping)"
fi

# ── Merge into main ───────────────────────────────────────────────────────────
if [[ -z "$SKIP_MERGE" ]]; then
  CURRENT_BRANCH=$(git rev-parse --abbrev-ref HEAD)
  echo "Merging '${BRANCH}' into main..."

  if [[ "$CURRENT_BRANCH" != "main" ]]; then
    git checkout main
  fi

  if git merge --no-ff "${BRANCH}" -m "Merge branch '${BRANCH}'"; then
    echo "  Merged successfully."
    echo ""
    echo "  Branch '${BRANCH}' is still local — push when ready:"
    echo "    git push -u origin ${BRANCH}"
  else
    git merge --abort
    echo ""
    echo "  !! Merge conflict detected — aborted cleanly."
    echo "  !! Resolve it manually:"
    echo "       git merge --no-ff ${BRANCH}"
    echo "     Fix conflicts, then: git add . && git commit"
  fi
fi

# ── Done ──────────────────────────────────────────────────────────────────────
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Stopped : ${NAME}"
[[ -n "$BRANCH" ]] && echo "  Branch  : ${BRANCH}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
