# Body Harmony – instalacja na Windows i restore bazy

## 1. Zainstaluj MongoDB Community Server

1. Wejdź na: **https://www.mongodb.com/try/download/community**
2. Wybierz:
   - Version: np. **7.0** (lub aktualna)
   - Platform: **Windows**
   - Package: **msi**
3. Pobierz instalator i uruchom go.
4. Wybierz **Complete**. Opcjonalnie zaznacz **Install MongoDB as a Service**, żeby MongoDB uruchamiał się z systemem.
5. Zakończ instalację. Domyślnie MongoDB działa na **localhost:27017**.

## 2. Zainstaluj MongoDB Database Tools (mongorestore)

Do przywracania backupu potrzebne są **MongoDB Database Tools** (m.in. `mongorestore`).

1. Wejdź na: **https://www.mongodb.com/try/download/database-tools**
2. Wybierz **Windows** i pobierz instalator (msi).
3. Zainstaluj (domyślna ścieżka to np. `C:\Program Files\MongoDB\Server\7.0\bin` – sprawdź w instalatorze).
4. **Dodaj do PATH**:  
   Ustawienia systemu → Wyszukaj „zmienne środowiska” → **Zmienne środowiska** → w „Zmienne użytkownika” wybierz **Path** → **Edytuj** → **Nowy** → wklej ścieżkę do `bin` z instalacji (np. `C:\Program Files\MongoDB\Server\7.0\bin`). Zapisz.
5. Zamknij i otwórz ponownie terminal (PowerShell / CMD). Sprawdź:
   ```powershell
   mongorestore --version
   ```

## 3. Skopiuj backup na nowy komputer

- Skopiuj folder z backupem (np. `db-backup\body-harmony_20240213_120000`) do katalogu projektu **body-harmony-BE** (np. do `db-backup`).
- Struktura powinna być taka, żeby wewnątrz był folder z nazwą bazy, np.:
  ```
  db-backup\
    body-harmony_20240213_120000\
      body-harmony\    <-- tu są kolekcje
        ...
  ```

## 4. Skrypty backup i restore (z poziomu projektu)

W katalogu projektu (**body-harmony-BE**) możesz używać tych samych poleceń na Windows i na Mac/Linux:

**Backup bazy** (tworzy folder `db-backup/body-harmony_YYYYMMDD_HHMMSS`):

```bash
npm run db:backup
```

**Restore bazy** (domyślnie z `db-backup` lub z ostatniego backupu):

```bash
npm run db:restore
```

**Restore z konkretnego folderu:**

```bash
npm run db:restore -- db-backup\body-harmony_20240213_120000
```

(Data w nazwie folderu zależy od tego, kiedy zrobiłaś backup.)

Na Windows uruchamiane są skrypty PowerShell (`.ps1`), na Mac/Linux – bash (`.sh`).  
Jeśli na Windows pojawi się błąd o polityce wykonywania skryptów:

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

**Podsumowanie:**  
Zainstaluj **MongoDB Server** i **MongoDB Database Tools**, skopiuj folder backupu do projektu, potem `npm run db:backup` / `npm run db:restore`.
