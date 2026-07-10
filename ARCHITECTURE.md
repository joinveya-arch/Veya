# VEYA Backend Architecture Specification

This document details the architectural rules, coding standards, design patterns, and system components of the VEYA beauty-tech marketplace MVP.

---

## 1. Directory Structure

The codebase is organized into modular layers adhering to Clean Architecture principles:

```
backend/
├── prisma/                 # Prisma database configuration and migration files
│   ├── schema.prisma       # Database models schema definition
│   └── migrations/         # Auto-generated SQL migration steps
├── src/
│   ├── config/             # Environment variable validation & global configs
│   ├── controllers/        # Thin layer orchestrating HTTP req/res (business-logic free)
│   ├── services/           # Business logic layer
│   ├── repositories/       # Data-access layer using Prisma ORM
│   ├── routes/             # Express route mappings
│   ├── middleware/         # Custom Express middlewares (Auth, Rate-limiting, Errors)
│   ├── validators/         # Zod schemas for request validation
│   ├── utils/              # Helper utilities (Logger, Custom Errors)
│   ├── constants/          # Application-wide static values
│   ├── types/              # Custom TypeScript types and interface extensions
│   ├── lib/                # Shared third-party SDK clients (Prisma Client, Cloudinary)
│   ├── app.ts              # Express application configuration
│   └── server.ts           # HTTP server bootstrapping and graceful shutdown hooks
├── uploads/                # Temporary local directory for file uploads
├── package.json
├── tsconfig.json
├── Dockerfile              # Multi-stage production Docker build specification
└── docker-compose.yml      # Local development container specs (PostgreSQL)
```

---

## 2. Core Architectural Guidelines

### Data Flow Pattern
```
HTTP Request → Route (Express Router)
  ↓
Validation (Zod Schema Middleware)
  ↓
Controller (Thin; parses params, calls Service, sends response)
  ↓
Service (Business Logic; implements business rules, calls Repositories/SDKs)
  ↓
Repository (Data Access; direct queries via Prisma Client)
  ↓
PostgreSQL Database
```

### Architectural Rules
1. **Thin Controllers**: No SQL/ORM queries, external requests, or complex calculations are allowed in the controllers. They serve only as entry/exit points for HTTP traffic.
2. **TypeScript Only**: `any` type is strictly forbidden. Custom interfaces/types must be declared for all data payloads.
3. **Database IDs**: To prevent enumeration attacks, all primary keys in database models use UUID strings (`default(uuid())`).
4. **Environment Safety**: Any new configuration must be added to the `.env.example` file and declared inside `src/config/index.ts` within the Zod schema validation script. If a setting is missing, the application will fail-fast at startup.

---

## 3. Implemented Infrastructure (Phase 1)

### Centralized Logging (Winston)
Winston is configured in `src/utils/logger.ts`. It segregates logs by level and destination:
- **Development**: Output to console is colorized and displays formatted stack traces.
- **File Output**: Logs are saved to `logs/combined.log` (all standard messages) and `logs/error.log` (errors and exceptions) with auto-rotation (max 5MB, 5 backup files).
- **HTTP request logger**: Morgan is integrated with Winston, streaming web request summaries to the logger.

### Custom Error Framework (`AppError`)
A robust operational error framework is defined in `src/utils/customErrors.ts`:
- **`AppError`**: Base class extending standard `Error`. Flags the error as "operational" to safely return clean details to the client.
- **Standardized sub-classes**: `BadRequestError` (400), `UnauthorizedError` (401), `ForbiddenError` (403), `NotFoundError` (404), `ConflictError` (409), `InternalServerError` (500).

### Global Exception Catching (`errorHandler`)
Registered in `src/middleware/errorHandler.ts`:
- **Error categorization**: Custom `AppError`, Zod validation errors, and Prisma Client DB errors are automatically mapped to precise HTTP response status codes.
- **Client payload**: Returns a clean JSON payload:
  ```json
  {
    "success": false,
    "message": "Reason for error",
    "errors": [...] // Optional sub-details/validation fields
  }
  ```
- **Information disclosure prevention**: Stack traces are omitted from client responses in production mode to avoid security leaks, but remain visible in development.

### Security Defenses
- **Helmet**: Secures standard HTTP headers to protect against common web vulnerabilities.
- **CORS**: Handles Cross-Origin Resource Sharing restrictions.
- **Rate-Limiter**: Configured on a per-IP basis using `express-rate-limit` to prevent brute force and denial of service. Default is 100 requests per 15-minute window.

---

## 4. Authentication & Security (Phase 2)

### JWT Authentication Pattern
Authentication uses JSON Web Tokens (JWT) signed using the `JWT_SECRET` key:
1. **Token Generation**: During a successful login via `POST /auth/login`, a token is generated containing the user's `id`, `email`, and `role`. The token expiration is set by `JWT_EXPIRES_IN` (default `24h`).
2. **Token Verification**: Protected routes use the `authenticate` middleware in `src/middleware/auth.middleware.ts`. This middleware:
   - Validates that the request has an `Authorization: Bearer <token>` header.
   - Verifies the signature of the token.
   - Extracts the user information and attaches it to `req.user`.

### Role-Based Access Control (RBAC)
Authorizing specific user groups (e.g., `CUSTOMER`, `ARTIST`, `ADMIN`) is performed by the `authorize` middleware:
- Place it *after* `authenticate` on routes requiring authorization.
- Example: `router.get('/admin-only', authenticate, authorize(Role.ADMIN), controller.handler)`
- Throws a `ForbiddenError` (403) if the authenticated user's role is not included in the allowed list.

### Password Security
- Passwords are never stored in plain text.
- BCrypt is used to hash passwords with `10` salt rounds during registration.
- Matching is performed securely via `bcrypt.compare`.
- The User object returned in API responses is sanitized via services to exclude the password hash before serialization.
