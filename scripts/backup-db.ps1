# Backup script for Body Harmony MongoDB database (Windows)
# Run this on the SOURCE computer before migrating

$ErrorActionPreference = "Stop"
$DB_NAME = "body-harmony"
$BACKUP_DIR = "db-backup"
$TIMESTAMP = Get-Date -Format "yyyyMMdd_HHmmss"
$BACKUP_PATH = Join-Path $BACKUP_DIR "body-harmony_$TIMESTAMP"

Write-Host "Backing up database: $DB_NAME"
Write-Host "Output: $BACKUP_PATH"
Write-Host ""

# Check if mongodump is available
$mongodump = Get-Command mongodump -ErrorAction SilentlyContinue
if (-not $mongodump) {
    Write-Host "mongodump not found. Install MongoDB Database Tools." -ForegroundColor Red
    Write-Host "  https://www.mongodb.com/docs/database-tools/installation/installation-windows/"
    exit 1
}

# Create backup directory
New-Item -ItemType Directory -Path $BACKUP_PATH -Force | Out-Null

# Run mongodump
& mongodump --db=$DB_NAME --out=$BACKUP_PATH

Write-Host ""
Write-Host "Backup complete!" -ForegroundColor Green
Write-Host ""
Write-Host "To transfer to another computer:"
Write-Host "  1. Copy the folder: $BACKUP_PATH"
Write-Host "  2. Or create a zip of the folder"
Write-Host ""
Write-Host "On the NEW computer run: npm run db:restore $BACKUP_PATH"
