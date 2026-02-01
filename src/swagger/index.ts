/**
 * Swagger Documentation
 *
 * This folder contains all OpenAPI/Swagger documentation files organized by concern:
 *
 * - schemas/  : Component schemas (data models, request/response types)
 * - paths/    : Endpoint documentation (routes, parameters, responses)
 *
 * Files are automatically scanned by swagger-jsdoc via the config in:
 * src/config/swagger.ts
 *
 * To add documentation for a new domain:
 * 1. Create schemas/<domain>.schema.ts with component schemas
 * 2. Create paths/<domain>.paths.ts with endpoint documentation
 * 3. The swagger config will automatically pick up the new files
 */

// Re-export for potential programmatic access if needed
import '../swagger/schemas/body-metric.schema.js';
import '../swagger/paths/body-metric.paths.js';

export {};
