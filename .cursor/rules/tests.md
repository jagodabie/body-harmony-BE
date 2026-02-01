# Cursor Rules — Testing (Jest)

This project uses **Jest** as the test runner.
Tests are centralized in a `__tests__` folder and strictly separated by test type.

---

## Test folder structure (MUST)

```
__tests__/
  unit/
  integration/
  e2e/
```

---

## 1) Unit tests (MUST)

Location:
- `__tests__/unit/`

File naming:
- `*.spec.ts`
- kebab-case only

Examples:
- `body-metric.service.spec.ts`
- `calculate-bmi.spec.ts`

Rules:
- Unit tests test ONE unit in isolation.
- Allowed to test:
  - services
  - helpers
  - pure functions
- MUST mock:
  - repositories
  - database access
  - external services
- MUST NOT:
  - connect to a real database
  - start Express app
  - use Supertest

Jest rules:
- Use `jest.mock()` for dependencies.
- Use spies (`jest.spyOn`) when partial mocking is needed.
- Reset mocks between tests using `afterEach(jest.clearAllMocks)`.

---

## 2) Integration tests (MUST)

Location:
- `__tests__/integration/`

File naming:
- `*.integration.spec.ts`
- kebab-case only

Examples:
- `body-metric.repository.integration.spec.ts`
- `body-metric.api.integration.spec.ts`

Rules:
- Integration tests verify collaboration between layers.
- Allowed to test:
  - repository + real Mongo/Mongoose
  - Express app + database
- MAY use:
  - Supertest
  - real Mongo test database
- MUST NOT:
  - mock the system under test
- MAY mock:
  - external services (third-party APIs)

Jest rules:
- Use real implementations instead of mocks.
- Setup and teardown DB state using `beforeAll` / `afterAll`.
- Clean database between tests to ensure isolation.

---

## 3) E2E / API tests (OPTIONAL)

Location:
- `__tests__/e2e/`

File naming:
- `*.e2e.spec.ts`
- kebab-case only

Examples:
- `body-metric.e2e.spec.ts`
- `auth.e2e.spec.ts`

Rules:
- E2E tests verify full user flows.
- Treat the application as a black box.
- MUST:
  - start the Express app
  - use real routing and middleware
- MAY use:
  - Supertest
- SHOULD:
  - use a dedicated E2E test database

Jest rules:
- Increase Jest timeout when needed (`jest.setTimeout`).
- Avoid mocking internal layers.

---

## 4) General testing rules (MUST)

- Do NOT mix test types in a single file.
- Do NOT place tests outside `__tests__`.
- All test files MUST use kebab-case.
- Prefer behavior-based test descriptions.
- Tests MUST be deterministic and isolated.

---

## 5) When generating tests (IMPORTANT)

When generating tests:
- Default to **unit tests** unless integration or E2E is explicitly requested.
- Place the test in the correct `__tests__` subfolder.
- Follow file naming conventions strictly.
- Match the test type to the layer under test.