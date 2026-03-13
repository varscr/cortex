# Cortex

Personal command center and second brain — built with Nuxt 3, PostgreSQL, and pgvector.

## Features

- **Log** — journal entries, decisions, market notes with tagging and mood tracking
- **Trading** — BingX copy trading dashboard with sync, snapshots, and P&L tracking
- **Finances** — accounts, transactions, and monthly summaries
- **Kanban** — boards with drag-and-drop columns and cards
- **Profile** — about, education, experience, skills, projects, goals, links
- **Semantic Search** — pgvector embeddings for AI-powered content search (optional)

## Quick Start

```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/cortex.git
cd cortex

# Create your environment file
cp .env.example .env
# Edit .env with your values

# Start everything
sudo docker compose up -d

# Open http://localhost:3000
```

That's it. The database schema is applied automatically on first start.

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `POSTGRES_USER` | Yes | Database username (default: `cortex`) |
| `POSTGRES_PASSWORD` | Yes | Database password |
| `OPENAI_API_KEY` | No | Enables semantic search embeddings |
| `BINGX_API_KEY` | No | BingX trading API integration |
| `BINGX_SECRET_KEY` | No | BingX trading API secret |

## Services

| Service | Port | Description |
|---|---|---|
| cortex | 3000 | Nuxt 3 app |
| postgres | 5432 | PostgreSQL with pgvector |
| adminer | 8080 | Database UI |
| backup | — | Daily automated backups |

## Backup & Restore

```bash
# Manual backup
./scripts/backup.sh

# Restore from backup
./scripts/restore.sh cortex_20260315_030000.sql
```

Automated backups run daily and are stored in `db/backups/`. Last 7 days are retained.

## Tech Stack

- **Runtime**: Bun
- **Framework**: Nuxt 3
- **UI**: Nuxt UI v2 + Tailwind CSS
- **Database**: PostgreSQL 16 with pgvector
- **Embeddings**: OpenAI text-embedding-3-small (optional)

## License

MIT
