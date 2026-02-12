
## Architecture (human-readable)

This project uses a strict **layered architecture**. The folder structure and responsibilities **must** be respected.

### General principles
- Each layer has a single responsibility.
- Dependency direction is one-way:
  **routes → controllers → services → repository → models**
- Higher layers must never import lower implementation details (e.g. Mongo/Mongoose).
- DB-agnostic types live in `src/types`.
- Mongo-specific logic is isolated in `src/repository` and `src/models`.

### Naming convention
- All folders and filenames use **kebab-case**.

### Folder structure

```
src/
  routes/
  controllers/
  services/
    <domain>/
  repository/
    <domain>/
  models/
    <domain>/
  types/
  middleware/
  helpers/
  config/
  app.ts / index.ts
```

### Responsibilities by layer

#### routes/
- Only Express route definitions.
- Connect routes to controllers.
- No business logic.

#### controllers/
- HTTP boundary only: parse request, validate input, call services, return response.
- No business logic.
- No DB access.

#### services/
- Business logic and orchestration.
- DB-agnostic: no Mongo/Mongoose imports.
- Does NOT depend on Express types.

#### repository/
- Data access layer.
- Exposes DB-agnostic interfaces + concrete DB implementations.

#### models/
- Mongo-only (Mongoose) schemas/models and optional Mongo-only typings.
- Must NOT be imported outside repository.

#### types/
- Shared DB-agnostic contracts.
- `src/types/index.ts` exports common domain types only.

#### middleware/
- Express middleware (auth, validation middleware, error handling).

#### helpers/
- Pure utility functions (no business logic).

#### config/
- Environment variables, app config, DB config.

#### app.ts / index.ts
- App bootstrap: create Express app, register middleware/routes, start server.

---

## Cursor Rules (AI-enforced)

These are strict rules Cursor must follow when generating or modifying code.

### 1) Dependency direction (MUST)
Allowed dependency flow:
**routes → controllers → services → repository → models**

Rules:
- Controllers MUST NOT contain business logic.
- Services MUST NOT import Express types (Request/Response/NextFunction).
- Services MUST NOT import Mongo/Mongoose models.
- Repositories are the ONLY layer that talks to DB implementations.
- Mongo/Mongoose code MUST live only in:
  - `src/repository/**`
  - `src/models/**`

### 2) File & folder naming (MUST)
- All folders and filenames MUST use kebab-case.
- Do NOT use camelCase or PascalCase in file/folder names.

Suffix conventions (MUST):
- `*.routes.ts`
- `*.controller.ts`
- `*.service.ts`
- `*.repository.ts` (interface, DB-agnostic)
- `*.mongo.repository.ts` (Mongo implementation)
- `*.instance.ts` (exports chosen implementation instance)
- `*.model.ts` (Mongoose schema/model)
- `*.types.ts` (types for that layer/domain)

### 3) Imports boundaries (MUST)
Controllers may import:
- `services/*`
- `types/*`
- `helpers/*`
- `middleware/*` (only if needed for request handling)

Services may import:
- `repository/<domain>/*.repository.ts` (interfaces/types)
- `repository/<domain>/*.instance.ts` (implementation instance)
- `types/*`
- `helpers/*`
- `config/*` (only non-DB config)

Repository may import:
- `models/**`
- `config/*` (DB config)
- `helpers/*`
- `types/*` (only if DB-agnostic contracts are needed)

Forbidden:
- services importing `models` or Mongoose
- controllers importing repository directly
- any upward imports (repository → services, services → controllers, etc.)

### 4) Repository pattern (MUST)
Each repository domain module exports:
- interface: `<domain>.repository.ts`
- implementation: `<domain>.mongo.repository.ts`
- instance selector: `<domain>.instance.ts` (exports chosen implementation)
- local types: `<domain>.types.ts`

Service layer depends ONLY on repository interfaces/instances.

### 5) Input validation & DTOs (MUST)
- Validate input at controller boundary (body/query/params).
- Services assume validated input and focus on business rules.
- Never pass raw `req.body` deeper than controller.
- Define explicit DTO/types for service input when useful.

### 6) Error handling strategy (MUST)
- Services throw typed/domain errors (e.g. NotFoundError, ValidationError).
- Controllers return proper HTTP status OR pass error to `next(error)`.
- Prefer a centralized error middleware in `src/middleware` as the single translator.

### 7) How to add a new feature/module (MUST)
When adding a new domain feature (e.g. weight, nutrition, activity), create:
- `routes/<domain>.routes.ts`
- `controllers/<domain>.controller.ts` (+ `<domain>.types.ts` if needed)
- `services/<domain>/<domain>.service.ts` (+ `<domain>.types.ts`)
- `repository/<domain>/<domain>.repository.ts`
- `repository/<domain>/<domain>.mongo.repository.ts`
- `repository/<domain>/<domain>.instance.ts`
- `repository/<domain>/<domain>.types.ts`

Add Mongoose model only if needed:
- `models/<domain>/<domain>.model.ts` (+ `types.ts` optional)

Keep everything consistent with kebab-case and suffix conventions.