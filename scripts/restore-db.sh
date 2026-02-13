#!/bin/bash

# Restore script for Body Harmony MongoDB database
# Run this on the TARGET computer after copying the backup

set -e

DB_NAME="body-harmony"
BACKUP_PATH="${1:-db-backup}"

# If no specific timestamp folder given, find the latest backup
if [ ! -d "${BACKUP_PATH}/${DB_NAME}" ] && [ -d "${BACKUP_PATH}" ]; then
    # Maybe user passed the timestamp folder - check if it has body-harmony inside
    LATEST=$(ls -td ${BACKUP_PATH}/body-harmony_* 2>/dev/null | head -1)
    if [ -n "${LATEST}" ] && [ -d "${LATEST}/${DB_NAME}" ]; then
        BACKUP_PATH="${LATEST}"
    fi
fi

RESTORE_DIR="${BACKUP_PATH}/${DB_NAME}"

echo "🔄 Restoring database: ${DB_NAME}"
echo "📁 From: ${RESTORE_DIR}"
echo ""

if [ ! -d "${RESTORE_DIR}" ]; then
    echo "❌ Backup not found at: ${RESTORE_DIR}"
    echo ""
    echo "Usage: npm run db:restore [path-to-backup-folder]"
    echo "Example: npm run db:restore db-backup/body-harmony_20240213_120000"
    echo ""
    echo "Or copy the backup folder to 'db-backup' and run: npm run db:restore"
    exit 1
fi

# Check if mongorestore is available
if ! command -v mongorestore &> /dev/null; then
    echo "❌ mongorestore not found. Make sure MongoDB tools are installed."
    echo "   On macOS with Homebrew: brew install mongodb-database-tools"
    exit 1
fi

# Run mongorestore
mongorestore --db="${DB_NAME}" --drop "${RESTORE_DIR}"

echo ""
echo "✅ Restore complete! Database '${DB_NAME}' has been restored."
