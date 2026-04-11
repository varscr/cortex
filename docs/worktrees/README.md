# Worktree Sessions

Cortex is designed to run multiple parallel AI agent sessions simultaneously — each working on its own branch with a fully isolated environment. This is powered by Git worktrees and Docker Compose project namespacing.

## Why This Architecture

When working with AI coding agents (like Claude Code), you often want to:
- Run several agents in parallel on different features without them interfering
- Give each agent its own running server to test against
- Keep each agent's database state isolated so one session doesn't corrupt another
- Spin up and tear down sessions quickly

A worktree is a Git checkout of the repo on a separate branch, living in a subdirectory. Combined with Docker's `-p <project>` flag (which namespaces all containers, networks, and volumes), each session gets its own fully independent stack.

## Quick Start

```bash
./scripts/worktree-start.sh <name>
```

This single command:
1. Creates a new Git branch `feature/<name>` and checks it out at `.claude/worktrees/<name>`
2. Auto-detects free ports (starting from 3001, 5433, 8081)
3. Starts an isolated Docker stack (app + postgres + adminer)
4. Waits for the app to be healthy
5. Seeds an admin user with default credentials
6. Prints a summary with the URL and credentials

### Examples

```bash
# Minimal — branch is feature/my-feature, credentials are admin@dev.local / admin
./scripts/worktree-start.sh my-feature

# Custom branch name
./scripts/worktree-start.sh my-feature feature/custom-branch-name

# Custom credentials
./scripts/worktree-start.sh my-feature feature/my-feature me@dev.local mypassword
```

## What Gets Created

```
.claude/worktrees/
└── my-feature/          ← independent Git checkout on feature/my-feature
    ├── server/
    ├── components/
    └── ...               ← same structure as the main repo
```

Docker project `cortex-my-feature` runs with isolated containers:
- `cortex-my-feature-cortex-1` — Nuxt app on its own port
- `cortex-my-feature-postgres-1` — fresh PostgreSQL with its own volume
- `cortex-my-feature-adminer-1` — Adminer UI

## Stopping a Session

When a session is done, use the stop script to tear everything down and merge the branch into `main`:

```bash
./scripts/worktree-stop.sh <name>
```

This single command:
1. Stops the Docker stack and removes its volumes
2. Removes the worktree directory
3. Checks out `main` and merges the branch with `--no-ff` (preserving branch history)
4. If there are conflicts → aborts the merge cleanly, leaves `main` untouched, and prints instructions to resolve manually

The local branch is **always kept** after stopping so you can push it to the remote when ready:

```bash
git push -u origin feature/<name>
```

### Conflict resolution

If the stop script reports a conflict:

```bash
# Retry the merge manually
git merge --no-ff feature/<name>

# Fix conflicts in your editor, then:
git add .
git commit
```

## Port Allocation

The start script auto-picks free ports by scanning running containers. Multiple parallel sessions don't need any manual coordination:

| Session | App | DB | Adminer |
|---------|-----|----|---------|
| main | 3000 | 5432 | 8080 |
| first worktree | 3001 | 5433 | 8081 |
| second worktree | 3002 | 5434 | 8082 |
| ... | ... | ... | ... |

## Auth in Worktrees

Each worktree has its own empty database. The start script seeds an admin user automatically. Key env vars:

- `AUTH_URL=http://localhost:<APP_PORT>` — the URL the browser uses
- `AUTH_URL_INTERNAL=http://localhost:3000` — the URL the SSR server uses (always 3000 inside the container regardless of external port mapping)

See `docs/docker/README.md` for a deeper explanation of the Docker architecture.
