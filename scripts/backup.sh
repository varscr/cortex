#!/bin/bash
# Run manually: ./scripts/backup.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="./db/backups"

echo "Starting backup at $TIMESTAMP..."

sudo docker compose exec -T postgres pg_dump -U "${POSTGRES_USER:-cortex}" cortex_db > "$BACKUP_DIR/cortex_$TIMESTAMP.sql"

# Clean backups older than 7 days
find "$BACKUP_DIR" -name "*.sql" -mtime +7 -delete

echo "Backup complete: $BACKUP_DIR/cortex_$TIMESTAMP.sql"
ls -lh "$BACKUP_DIR"/*.sql 2>/dev/null | tail -5
