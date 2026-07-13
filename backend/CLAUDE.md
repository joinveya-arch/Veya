# Backend — agent context

Express · TypeScript (strict) · Prisma · PostgreSQL · Zod · JWT · Winston.

**Endpoint contract:** `../docs/API.md` — read that, not the route files.
**Architecture rules:** `../ARCHITECTURE.md`.
**Traps:** `../docs/GOTCHAS.md` (start with **G-4** — port 5000 is occupied on macOS).

`../implementation.md` is a **historical build plan**. It is already implemented.
Don't treat it as a spec for current behaviour.

---

## Layering — strict, one direction

```
route → middleware(auth, validate) → controller → service → repository → Prisma
```

| Layer | Job | Must NOT |
|---|---|---|
| `routes/` | bind path → middleware → controller | contain logic |
| `validators/` | Zod schemas. **The source of truth for input rules.** | — |
| `middleware/` | `authenticate`, `authorize(...roles)`, `validateBody/Query` | — |
| `controllers/` | HTTP in, HTTP out | hold business logic |
| `services/` | **all** business logic + authorisation decisions | touch `req`/`res` |
| `repositories/` | Prisma queries only | hold business logic |

A controller that contains an `if` about business meaning is in the wrong layer.

Wrap every async handler in `asyncHandler` — errors route to `middleware/errorHandler.ts`,
which turns a thrown `NotFoundError` / `BadRequestError` / `ForbiddenError`
(`utils/customErrors.ts`) into the right status. **Never** `try/catch` + `res.status()`
inside a controller.

---

## The response envelope — never break it

```ts
res.status(200).json({ success: true, data: payload });
```

Every single response, success or failure. The frontend's `lib/api.ts` unwraps it
globally; a bare payload will break every caller.

---

## Business rules that live in services (not in the DB)

These are the ones that matter. Don't re-implement them in a controller.

**Bookings** (`services/booking.service.ts`)
- `PENDING` is the creation state; you can't transition *to* it.
- `CANCELLED` / `COMPLETED` are **terminal** — any further change is a 400.
- **A customer can only ever set `CANCELLED`.** Confirm/complete are the artist's.
- Past timeslots and unopened dates are rejected.

**Reviews** — only against a `COMPLETED` booking the customer owns, once. This is the
entire trust model. Don't loosen it.

**Availability** — deleted by **exact stored `Date`**; slots ≤ now are rejected.

**Verification** — `ArtistProfile.verified` is admin-only (`PATCH /admin/artists/:id/verify`).
It's the platform's only trust signal.

---

## Data model

`prisma/schema.prisma` is the **source of truth**. `frontend/types/index.ts` mirrors it
**by hand** — change one, change the other.

`User (1—1) ArtistProfile (1—*) Service | PortfolioImage | Availability`
`Booking` joins `User(customer) × ArtistProfile × Service`; `Review` hangs off a `Booking`.

> `Service.price` is a `Decimal` → **serialises to JSON as a string**. The frontend
> `Number()`s it.

---

## Local setup

```bash
cp .env.example .env
docker compose up -d          # PostgreSQL on :5432
npm install
npm run db:migrate
npm run dev                   # :5000
```

> ⚠️ **macOS: port 5000 is taken by ControlCenter/AirPlay.** The server won't bind.
> Disable AirPlay Receiver, or set `PORT=5050` and update the frontend's
> `NEXT_PUBLIC_API_URL` to match. → GOTCHAS **G-4**.

No seed script exists. Register users via `POST /auth/register`.

---

## ⚠️ Security holes to close before production

1. **`POST /auth/register` accepts a client-supplied `role`** — including `ADMIN`.
   Anyone can make themselves an admin. Fix this first.
2. **CORS is `origin: "*"`** (`src/app.ts`).
3. **Zero tests.**

---

## Endpoints the frontend needs that don't exist yet

`POST /auth/forgot-password` · `PUT /auth/me` · `GET /admin/users` ·
`GET /admin/reviews` · `DELETE /artists/portfolio/:id` · a service-type filter on
`GET /artists`.

Each has finished UI waiting on it. Details in `../docs/HANDOFF.md`.
