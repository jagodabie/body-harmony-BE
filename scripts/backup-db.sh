#!/bin/bash

# Backup script for Body Harmony MongoDB database
# Run this on the SOURCE computer before migrating

set -e

DB_NAME="body-harmony"
BACKUP_DIR="db-backup"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="${BACKUP_DIR}/body-harmony_${TIMESTAMP}"

echo "🔄 Backing up database: ${DB_NAME}"
echo "📁 Output: ${BACKUP_PATH}"
echo ""

# Check if mongodump is available
if ! command -v mongodump &> /dev/null; then
    echo "❌ mongodump not found. Make sure MongoDB tools are installed."
    echo "   On macOS with Homebrew: brew install mongodb-database-tools"
    echo "   Or use the mongodump from your MongoDB installation bin folder"
    exit 1
fi

# Create backup directory
mkdir -p "${BACKUP_PATH}"

# Run mongodump
mongodump --db="${DB_NAME}" --out="${BACKUP_PATH}"

echo ""
echo "✅ Backup complete!"
echo ""
echo "📦 To transfer to another computer:"
echo "   1. Copy the folder: ${BACKUP_PATH}"
echo "   2. Or create a zip: zip -r body-harmony-backup.zip ${BACKUP_PATH}"
echo ""
echo "📋 On the NEW computer run: npm run db:restore ${BACKUP_PATH}"
