#!/bin/bash
BACKUP_DIR="/e/HEILER/zenda4.8/backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/zenda_$TIMESTAMP.sql"

mkdir -p $BACKUP_DIR

docker exec zenda-postgres pg_dump -U zenda_admin zenda > $BACKUP_FILE

echo "Backup creado: $BACKUP_FILE"
