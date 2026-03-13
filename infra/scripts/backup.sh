#!/bin/bash
# =============================================
# Picook DB Backup Script (pg_dump → S3)
# Usage: ./backup.sh
# Recommended: cron daily at 3:00 AM
# =============================================
set -euo pipefail

DB_NAME="${DB_NAME:-picook_db}"
DB_USER="${DB_USER:-picook_user}"
DB_HOST="${DB_HOST:-localhost}"
S3_BUCKET="${S3_BUCKET:-picook-backups}"
BACKUP_DIR="/tmp/picook-backups"
DATE=$(date +%Y%m%d_%H%M%S)
FILENAME="${DB_NAME}_${DATE}.sql.gz"

echo "=== Picook DB Backup ==="

mkdir -p "${BACKUP_DIR}"

# Dump and compress
echo "Dumping database..."
pg_dump -h "${DB_HOST}" -U "${DB_USER}" -d "${DB_NAME}" | gzip > "${BACKUP_DIR}/${FILENAME}"

# Upload to S3
echo "Uploading to S3..."
aws s3 cp "${BACKUP_DIR}/${FILENAME}" "s3://${S3_BUCKET}/db-backups/${FILENAME}"

# Cleanup local
rm -f "${BACKUP_DIR}/${FILENAME}"

# Remove S3 backups older than 30 days
echo "Cleaning old backups..."
aws s3 ls "s3://${S3_BUCKET}/db-backups/" | \
    awk '{print $4}' | \
    while read -r file; do
        file_date=$(echo "${file}" | grep -oP '\d{8}')
        if [ -n "${file_date}" ]; then
            cutoff=$(date -d "30 days ago" +%Y%m%d)
            if [ "${file_date}" -lt "${cutoff}" ]; then
                aws s3 rm "s3://${S3_BUCKET}/db-backups/${file}"
            fi
        fi
    done

echo "Backup complete: ${FILENAME}"
