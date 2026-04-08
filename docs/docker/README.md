# Docker Architecture

Cortex's Docker setup is built around one core goal: **supporting multiple parallel AI agent sessions**, each working independently on its own branch with its own isolated server and database.

This is achieved through a fully parameterized `docker-compose.yml` and Git worktrees. See `docs/worktrees/README.md` for the full worktree workflow.

## How It Works

### Parameterized Compose File

`docker-compose.yml` uses environment variables with sensible defaults. Every port, path, and URL is injectable — no file edits needed to run a second instance.

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PATH` | `.` | Host directory mounted to `/app` in the container |
| `APP_PORT` | `3000` | External port for the Nuxt app |
| `DB_PORT` | `5432` | External port for PostgreSQL |
| `ADMINER_PORT` | `8080` | External port for Adminer UI |
| `AUTH_URL` | `http://localhost:3000` | Public URL used by the browser |
| `AUTH_URL_INTERNAL` | `http://localhost:3000` | Internal URL used by SSR (always port 3000 inside the container) |

### Project Namespacing

Docker Compose's `-p <project>` flag isolates all containers, networks, and volumes under a project name. The main instance is `cortex`; worktrees get names like `cortex-my-feature`. They run in parallel without any interference.

### Runtime Code Mounting

The Dockerfile builds a base image (installs deps, Claude CLI, OpenCode). At runtime, the actual source code is mounted via `APP_PATH`. This means:
- The same Docker image can serve any branch
- Worktrees get their branch's code at runtime without rebuilding
- `node_modules` lives in an anonymous volume — it's built once into the image and isolated from the host mount

---

## Running the Main Instance

```bash
# Start everything
docker compose up -d --build

# Rebuild app only
docker compose up -d --build cortex

# View logs
docker compose logs -f cortex

# Access the database
docker compose exec postgres psql -U cortex -d cortex_db
```

---

## Running a Worktree Session

Use the start script — it handles port allocation, worktree creation, Docker startup, and seeding automatically:

```bash
./scripts/worktree-start.sh <name>
```

Or manually (full isolation — separate DB):

```bash
APP_PATH=./.claude/worktrees/my-feature \
APP_PORT=3001 \
DB_PORT=5433 \
ADMINER_PORT=8081 \
AUTH_URL=http://localhost:3001 \
AUTH_URL_INTERNAL=http://localhost:3000 \
docker compose -p cortex-my-feature up -d
```

---

## Auth URL Explained

Two separate URLs are needed because the app runs in two contexts:

- **Browser** → accesses the app from the host machine, e.g. `http://localhost:3001`
- **SSR (server-side rendering)** → runs inside the Docker container where the app is always on port 3000

So for a worktree on external port 3001:
- `AUTH_URL=http://localhost:3001` — what the browser sends requests to
- `AUTH_URL_INTERNAL=http://localhost:3000` — what SSR uses inside the container

## Services

| Service | Port | Description |
|---------|------|-------------|
| `cortex` | 3000 | Nuxt 3 app |
| `postgres` | 5432 | PostgreSQL 16 with pgvector |
| `adminer` | 8080 | Database UI |
| `backup` | — | Daily pg_dump, 7-day retention |

---

## Seeding an Admin User

Sign-up is disabled. Use the seed script to create users:

```bash
# Main instance
docker compose exec cortex bun run scripts/seed-admin.ts <email> <password>

# Worktree
docker compose -p cortex-<name> exec cortex bun run scripts/seed-admin.ts <email> <password>
```

The script creates a user + credential account with the correct `providerId = 'credential'` that Better Auth expects.
