# CLAUDE.md — Body Harmony Backend

## Project Overview

Body Harmony is a portfolio project — a PWA for health and wellness tracking. The primary goal is to **test business assumptions** and **learn domain-driven architecture** in parallel with feature development. There is intentionally no authentication for now.

- **Backend:** Node.js + Express + TypeScript + MongoDB (this repo)
- **Frontend:** React + Vite (separate repo: `body-harmony_logs`)
- **Production:** Railway (hosting) + MongoDB Atlas (database)
- **API Docs:** Swagger UI at `/api-docs`

---

## Architecture

Strict layered architecture — follow this pattern for all new features:

```
Routes → Controllers → Services → Repository → Models
```

- **Routes** (`src/routes/`) — HTTP endpoint definitions + validation middleware
- **Controllers** (`src/controllers/`) — request handling, error catching, response formatting
- **Services** (`src/services/`) — business logic, orchestration
- **Repository** (`src/repository/`) — data access; interface + Mongo implementation + singleton instance
- **Models** (`src/models/`) — Mongoose schemas with types

Each domain (e.g. `meal/`, `body-metric/`) has its own subfolder across all layers.

### Repository Pattern Structure
For every new domain, create:
- `*.repository.ts` — interface
- `*.mongo.repository.ts` — Mongoose implementation
- `*.instance.ts` — singleton export
- `*.types.ts` — DTOs and filter types

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Runtime | Node.js 18+ |
| Framework | Express 4 |
| Language | TypeScript 5 (strict mode) |
| Database | MongoDB via Mongoose 8 |
| Testing | Jest + Supertest |
| Docs | Swagger / OpenAPI 3.0 |
| Linting | ESLint 9 + Prettier |
| Dev server | tsx --watch |

---

## Key Rules

### TypeScript
- All new code must be TypeScript. No new `.js` files.
- When touching a legacy `.js` file, migrate it to `.ts` as part of that change — do not create separate migration tasks.
- Use strict typing; no `any` unless truly unavoidable.

### Swagger — Priority, Not Nice-to-Have
- **Update Swagger docs with every API change.** This is mandatory, not optional.
- Schemas live in `src/swagger/schemas/`, paths in `src/swagger/paths/`.
- Use JSDoc annotations in route files where needed.

### Testing
- Run tests after every code change and report the result.
- Tests use a dedicated database (`body-harmony-test`). Never run against production data.
- **`seed.ts` is for development only** — never suggest or run it against production.
- Integration tests live in `src/__tests__/integration/`, unit tests in `src/__tests__/units/`.

### Proactive Suggestions
- Propose improvements proactively, but **always ask before implementing**.
- Keep suggestions focused — no unsolicited refactors beyond what was asked.

### Error Handling
- Controllers must use try-catch and delegate to the global error handler.
- Use typed, descriptive error codes for business logic errors (e.g. `MEAL_ALREADY_EXISTS`).

---

## Commit Convention

```
feat(): short description
fix(): short description
doc(): short description
```

No scope in parentheses for now. Keep messages concise and in English.

---

## NPM Scripts

```bash
npm run dev          # Start dev server with hot-reload
npm run build        # Compile TypeScript
npm start            # Run compiled server

npm test             # Run all tests (NODE_ENV=test)
npm run test:watch   # Tests in watch mode

npm run lint         # Run ESLint
npm run lint:fix     # Auto-fix lint issues
npm run format       # Format with Prettier

npm run seed         # Seed dev database only
npm run seed:fresh   # Clear + seed dev database

npm run db:backup    # Backup local MongoDB
npm run db:restore   # Restore from backup
```

---

## Environment Variables

| Variable | Purpose |
|----------|---------|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Server port (default 4000) |
| `HOST` | Server host |
| `API_URL` | Public API base URL |
| `NODE_ENV` | `development` / `test` / `production` |

Test environment uses `.env.test` with a separate `body-harmony-test` database.

---

## Legacy Files

The following `.js` files are legacy and will be migrated to TypeScript opportunistically:
- `src/config/database.js`
- `src/middleware/errorHandler.js`, `validation.js`
- `src/models/DailyNutrition.js`, `Meal.js`, `Product.js`
- `src/routes/meals.js`, `nutrition.js`, `products.js`

Migrate when you touch them. Do not create standalone migration PRs.

---

## Design Decisions

### Nutriment rounding
All nutriment values (`calories`, `proteins`, `carbs`, `fat`) are rounded to the nearest integer (1g) before being returned in API responses.

- New products: rounded in `extractNutrientsPer100g` (`src/helpers/nutrition.ts`) at save time.
- Existing products (stored unrounded): rounded in the service layer via `roundNutrients()` when building the response — see `getMealsByDateWithProducts` in `src/services/meal/meal.service.ts`.

Do not move rounding into the MongoDB aggregation pipeline.
