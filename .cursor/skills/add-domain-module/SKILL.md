---

name: add-domain-module
description: Generate a complete new domain module (routes, controller, service, repository, and optional Mongo model) following strict layered architecture, kebab-case naming, and import boundaries. Also update Swagger/OpenAPI docs for the new endpoints.
disable-model-invocation: true
compatibility:
notes: "Express + TypeScript project with strict layering. Mongo/Mongoose allowed ONLY in src/repository/** and src/repository/models/**."
metadata:
language: "en"
command: "slash"
----------------

# Add Domain Module

Your goal is to generate a **complete domain module scaffold** that strictly follows the project’s layered architecture and conventions.

## How to invoke

User types: `/add-domain-module`

## Required input from the user

If not explicitly provided, ask for:

1. **domain name** (e.g. `weight`, `nutrition`, `activity`) — **kebab-case only**
2. list of endpoints (at least one): HTTP method + path + short description
   example: `GET /weights – list`
3. whether a Mongo model is required (yes / no)

> If the user provides only the domain name, suggest and generate a default CRUD.

## Required file structure (MUST)

For domain `<domain>` generate:

* `src/routes/<domain>.routes.ts`
* `src/controllers/<domain>.controller.ts`
* `src/controllers/<domain>.types.ts` (if controller-level DTOs are needed)
* `src/services/<domain>/<domain>.service.ts`
* `src/services/<domain>/<domain>.types.ts` (service input/output DTOs)
* `src/repository/<domain>/<domain>.repository.ts` (DB-agnostic interface)
* `src/repository/<domain>/<domain>.mongo.repository.ts` (Mongo implementation)
* `src/repository/<domain>/<domain>.instance.ts` (exports chosen implementation)
* `src/repository/<domain>/<domain>.types.ts` (repository-local types)

If a model is required (Mongo-only):

* `src/repository/models/<domain>/<domain>.model.ts`
* `src/repository/models/<domain>/<domain>.types.ts` (optional)

All files and folders **MUST use kebab-case** and required suffixes.

## Layer responsibilities (MUST)

### routes

* Express route definitions only
* Connect routes to controllers
* No business logic

### controllers

* HTTP boundary only:

  * parse request
  * validate input
  * map to DTOs
  * call service
* Return response or call `next(error)`
* No database access
* No business logic

### services

* Business logic and orchestration
* **Must NOT import Express types**
* **Must NOT import Mongo/Mongoose**
* Depends only on repository interfaces / instances
* Throws domain errors (e.g. `NotFoundError`, `ValidationError`)

### repository

* Data access layer
* Implements DB-agnostic repository interfaces
* Allowed to import Mongo models and DB config

### repository/models

* Mongo-only (Mongoose schemas/models)
* Must NOT be imported outside repository

## Types & DTOs (MUST)

* Shared DB-agnostic contracts live in `src/types`
* Domain-specific:

  * `services/<domain>/<domain>.types.ts` → service DTOs
  * `repository/<domain>/<domain>.types.ts` → repository types

Never pass raw `req.body` outside controllers.

## Repository pattern (MUST)

* `<domain>.repository.ts` exports an interface
* `<domain>.mongo.repository.ts` implements the interface
* `<domain>.instance.ts` exports the chosen implementation instance
* Services depend ONLY on the interface/instance, never on Mongo details

## Import rules (MUST)

### Controller may import:

* services
* types
* helpers
* middleware (if needed)

### Service may import:

* repository interface (`*.repository.ts`)
* repository instance (`*.instance.ts`)
* types
* helpers
* non-DB config

### Repository may import:

* Mongo models (from `src/repository/models/**`)
* DB config
* helpers
* DB-agnostic types

### Forbidden:

* controllers importing repositories directly
* services importing Mongo/Mongoose or models
* upward imports between layers

## Default CRUD (if endpoints not provided)

Generate:

* `GET /<domain>` – list
* `GET /<domain>/:id` – get by id
* `POST /<domain>` – create
* `PUT /<domain>/:id` – update
* `DELETE /<domain>/:id` – delete

Validation:

* Controller validates `id` params and create/update body (basic validation + TODO allowed)
* Service assumes validated input

HTTP:

* list → 200
* get → 200 or NotFound
* create → 201
* update → 200 or NotFound
* delete → 204 or NotFound

## Swagger / OpenAPI update (MUST)

After generating routes/controllers/services/repository, you MUST update the Swagger/OpenAPI documentation so the new endpoints appear in the docs.

### Step 1: Detect Swagger setup

Search the codebase for one of these patterns:

* `swagger-jsdoc`
* `swagger-ui-express`
* `@swagger` / `@openapi` annotations in route/controller files
* `openapi.yaml` / `openapi.yml` / `swagger.yaml` / `swagger.yml`
* a generated spec file (e.g. `src/swagger.ts`, `src/openapi.ts`, `docs/openapi.yaml`)

If multiple are present, prefer the one actually wired into app bootstrap (e.g. referenced from `app.ts` / `index.ts`).

### Step 2: Update docs in the existing style

Depending on what you detect:

#### A) If the project uses annotation-based docs (swagger-jsdoc)

* Add JSDoc `@openapi` (or `@swagger`) blocks for each endpoint near the route definition (preferred) or controller handler.
* Ensure:

  * `tags: [<domain>]`
  * request body schema for POST/PUT
  * params schema for `id`
  * response schemas (at least minimal)
* Keep naming consistent with existing docs patterns.

#### B) If the project uses a YAML/JSON OpenAPI file

* Add:

  * new tag `<domain>`
  * `paths` entries for each endpoint
  * `components.schemas` for create/update DTOs and response model
* Reuse shared schemas if they already exist.

### Step 3: Keep it minimal but valid

Swagger additions MUST be valid OpenAPI and must not invent fields the API does not return.
If DTO shapes are not fully defined yet, use a minimal schema and add TODOs.

## Final checklist before finishing

1. Verify folder/file placement
2. Verify kebab-case naming + suffixes
3. Ensure no illegal imports
4. Ensure services contain no Express or Mongo code
5. Ensure controllers do not touch repositories
6. Ensure every endpoint has:

   * route
   * controller handler
   * service method
   * repository method stub
7. Ensure Swagger/OpenAPI shows the new endpoints and schemas
