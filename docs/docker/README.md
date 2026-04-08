# Docker & Worktree Architecture

This project uses a highly dynamic Docker Compose setup designed to support multiple parallel development sessions using Git worktrees.

## Core Concepts

### 1. Parameterized Services
The `docker-compose.yml` uses environment variables with sensible defaults. This allows you to "inject" different configurations without modifying the file.

| Variable | Default | Description |
|----------|---------|-------------|
| `APP_PATH` | `.` | The host directory mounted to `/app` |
| `APP_PORT` | `3000` | The external port for the Nuxt app |
| `DB_PORT` | `5432` | The external port for PostgreSQL |
| `ADMINER_PORT` | `8080` | The external port for the Adminer UI |
| `AUTH_URL` | `http://localhost:3000` | The public URL for the browser |
| `AUTH_URL_INTERNAL` | `http://localhost:3000` | The internal URL for SSR (server-side) |

### 2. Isolation Modes

#### Shared Database Mode
Best for UI/Frontend testing where you want to use your existing data.
```bash
APP_PATH=./.claude/worktrees/feature-name \
APP_PORT=3001 \
AUTH_URL=http://localhost:3001 \
AUTH_URL_INTERNAL=http://localhost:3000 \
DATABASE_URL=postgresql://cortex:changeme@host.docker.internal:5432/cortex_db \
docker compose -p cortex-feature-name up -d --no-deps cortex
```

#### Full Isolation Mode
Best for destructive testing or database migrations.
```bash
APP_PATH=./.claude/worktrees/feature-name \
APP_PORT=3001 \
DB_PORT=5433 \
ADMINER_PORT=8081 \
AUTH_URL=http://localhost:3001 \
AUTH_URL_INTERNAL=http://localhost:3000 \
docker compose -p cortex-feature-name up -d
```

---

## Common Operations

### Seeding an Admin User
Since `disableSignUp` is enabled by default, use the provided script to create or reset users:

```bash
docker compose -p <project-name> exec cortex \
  bun run scripts/seed-admin.ts <email> <password> <name>
```

### Viewing Logs
```bash
docker compose -p <project-name> logs -f cortex
```

### Stopping a Session
```bash
docker compose -p <project-name> down
```
