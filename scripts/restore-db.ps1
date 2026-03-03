# Restore script for Body Harmony MongoDB database (Windows)
# Run this on the TARGET computer after copying the backup

$ErrorActionPreference = "Stop"
$DB_NAME = "body-harmony"
$BackupPath = if ($args[0]) { $args[0] } else { "db-backup" }

# If no specific timestamp folder given, find the latest backup
if (-not (Test-Path "$BackupPath\$DB_NAME") -and (Test-Path $BackupPath)) {
    $latest = Get-ChildItem -Path $BackupPath -Filter "body-harmony_*" -Directory -ErrorAction SilentlyContinue |
        Sort-Object LastWriteTime -Descending |
        Select-Object -First 1
    if ($latest -and (Test-Path "$($latest.FullName)\$DB_NAME")) {
        $BackupPath = $latest.FullName
    }
}

$RestoreDir = Join-Path $BackupPath $DB_NAME

Write-Host "Restoring database: $DB_NAME"
Write-Host "From: $RestoreDir"
Write-Host ""

if (-not (Test-Path $RestoreDir)) {
    Write-Host "Backup not found at: $RestoreDir" -ForegroundColor Red
    Write-Host ""
    Write-Host "Usage: .\scripts\restore-db.ps1 [path-to-backup-folder]"
    Write-Host "Example: .\scripts\restore-db.ps1 db-backup\body-harmony_20240213_120000"
    Write-Host ""
    Write-Host "Or copy the backup folder to 'db-backup' and run: .\scripts\restore-db.ps1"
    exit 1
}

# Check if mongorestore is available
$mongorestore = Get-Command mongorestore -ErrorAction SilentlyContinue
if (-not $mongorestore) {
    Write-Host "mongorestore not found. Install MongoDB Database Tools." -ForegroundColor Red
    Write-Host "  https://www.mongodb.com/docs/database-tools/installation/installation-windows/"
    exit 1
}

# Run mongorestore
& mongorestore --db=$DB_NAME --drop $RestoreDir

Write-Host ""
Write-Host "Restore complete! Database '$DB_NAME' has been restored." -ForegroundColor Green
