# Body Harmony – Windows setup and database restore

## 1. Install MongoDB Community Server

1. Go to: **https://www.mongodb.com/try/download/community**
2. Select:
   - Version: e.g. **7.0** (or latest)
   - Platform: **Windows**
   - Package: **msi**
3. Download the installer and run it.
4. Choose **Complete**. Optionally check **Install MongoDB as a Service** so MongoDB starts with your system.
5. Finish the installation. MongoDB runs on **localhost:27017** by default.

## 2. Install MongoDB Database Tools (mongorestore)

Restoring backups requires **MongoDB Database Tools** (including `mongorestore`).

1. Go to: **https://www.mongodb.com/try/download/database-tools**
2. Select **Windows** and download the installer (msi).
3. Install (default path is e.g. `C:\Program Files\MongoDB\Server\7.0\bin` – check in the installer).
4. **Add to PATH**:  
   System Settings → Search for "environment variables" → **Environment Variables** → under "User variables" select **Path** → **Edit** → **New** → paste the path to the `bin` folder from the installation (e.g. `C:\Program Files\MongoDB\Server\7.0\bin`). Save.
5. Close and reopen the terminal (PowerShell / CMD). Verify:
   ```powershell
   mongorestore --version
   ```

## 3. Copy backup to the new computer

- Copy the backup folder (e.g. `db-backup\body-harmony_20240213_120000`) into the **body-harmony-BE** project directory (e.g. into `db-backup`).
- The structure should include a folder with the database name, e.g.:
  ```
  db-backup\
    body-harmony_20240213_120000\
      body-harmony\    <-- collections are here
        ...
  ```

## 4. Backup and restore scripts (from project root)

In the project directory (**body-harmony-BE**), you can use the same commands on Windows and Mac/Linux:

**Database backup** (creates folder `db-backup/body-harmony_YYYYMMDD_HHMMSS`):

```bash
npm run db:backup
```

**Database restore** (from `db-backup` by default or from the latest backup):

```bash
npm run db:restore
```

**Restore from a specific folder:**

```bash
npm run db:restore -- db-backup\body-harmony_20240213_120000
```

(The date in the folder name depends on when you created the backup.)

On Windows, PowerShell scripts (`.ps1`) are used; on Mac/Linux, bash scripts (`.sh`).  
If you see a script execution policy error on Windows:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**Summary:**  
Install **MongoDB Server** and **MongoDB Database Tools**, copy the backup folder into the project, then run `npm run db:backup` / `npm run db:restore`.
