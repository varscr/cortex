#!/bin/bash
# Usage: ./scripts/restore.sh cortex_20260315_030000.sql

BACKUP=$1

if [ -z "$BACKUP" ]; then
    echo "Usage: ./scripts/restore.sh <backup_file.sql>"
    echo ""
    echo "Available backups:"
    ls -lh ./db/backups/*.sql 2>/dev/null
    exit 1
fi

echo "This will REPLACE all current data. Are you sure? (yes/no)"
read CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

echo "Restoring database..."

sudo docker compose exec -T postgres psql -U "${POSTGRES_USER:-cortex}" -d cortex_db < "./db/backups/$BACKUP"

echo "Restore complete!"
