# API reference

Base URL: `/api/v1` · Source of truth: `backend/src/routes/` + `backend/src/validators/`

This exists so you don't have to read the route files. If you change a route,
change this.

---

## Conventions

**Every response is wrapped.** Success and failure both.

```jsonc
{ "success": true,  "data": { ... } }
{ "success": false, "message": "Booking not found" }
```

`frontend/lib/api.ts` unwraps the envelope and throws an `ApiError` (carrying
`.message` and `.status`) on failure — so everything in `services/` returns the
payload `T` directly, and every hook can just read `error.message`.

**Auth** is a bearer JWT: `Authorization: Bearer <token>`.
Get one from `POST /auth/login`.

**Access** column: 🌐 public · 🔒 any signed-in user · 👤 CUSTOMER · 🎨 ARTIST · 🛡️ ADMIN

---

## Auth

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/auth/register` | 🌐 | Returns the **user, not a token** — log in after. |
| POST | `/auth/login` | 🌐 | Returns `{ token, user }`. |
| GET | `/auth/me` | 🔒 | Current user. Used to rehydrate the session. |

**`register`** — `name` (min 2), `email`, `password` (min 6), `phone?`
(`/^\+?[1-9]\d{1,14}$/`), `role?` (`CUSTOMER` | `ARTIST` | `ADMIN`, default
`CUSTOMER`).

> ⚠️ **`role` is client-supplied.** Anyone can register as `ADMIN`. Known hole —
> see `docs/HANDOFF.md`.

---

## Artists

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/artists` | 🌐 | List/search. **Only** `?city=` and `?minExperience=`. |
| GET | `/artists/:id` | 🌐 | One profile, with `user` and `services` included. |
| GET | `/artists/:id/portfolio` | 🌐 | Portfolio images. |
| GET | `/artists/:id/reviews` | 🌐 | Reviews written about this artist. |
| GET | `/artists/:id/availability` | 🌐 | Upcoming open slots. |
| POST | `/artists/profile` | 🎨 | Create own profile. |
| GET | `/artists/profile/me` | 🎨 | Own profile. **404s if not created yet** — handle it. |
| PUT | `/artists/profile` | 🎨 | Update own profile. |
| POST | `/artists/profile/image` | 🎨 | `multipart`, field **`image`**. |
| POST | `/artists/portfolio` | 🎨 | `multipart`, field **`image`**. No DELETE exists. |
| POST | `/artists/availability` | 🎨 | `{ dates: string[] }` (ISO). Open dates. |
| DELETE | `/artists/availability` | 🎨 | `{ dates: string[] }`. Close dates. |

**Profile fields** — `city` (min 2, required), `experience` (int ≥ 0, required),
`bio?` (max 1000), `instagram?` (`/^@?[a-zA-Z0-9._]{1,30}$/`).

> ⚠️ **There is no service-type / category filter.** The `?service=bridal` param the
> frontend passes around is a display hint only. See GAP-6 in `docs/HANDOFF.md`.

> ⚠️ **Availability is deleted by exact stored `Date`.** Send back the server's own
> ISO string, not a re-derived local midnight, or the delete silently matches nothing.
> Slots at or before *now* are rejected.

---

## Services (an artist's packages)

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/services/artist/:artistId` | 🌐 | All packages for one artist. |
| GET | `/services/:id` | 🌐 | One package. |
| POST | `/services` | 🎨 | Create, on own profile. |
| PUT | `/services/:id` | 🎨 | Update. Ownership enforced. |
| DELETE | `/services/:id` | 🎨 | Delete. Ownership enforced. |

**Fields** — `title` (**min 3**), `description?` (**max 500**), `price` (positive
number), `duration` (positive int, **minutes**).

> ⚠️ `price` is a Prisma `Decimal`, so it **serialises to JSON as a string**.
> Always `Number(service.price)` before doing arithmetic. `types/index.ts` types it
> as `string | number` for exactly this reason.

---

## Bookings

| Method | Path | Access | Notes |
|---|---|---|---|
| POST | `/bookings` | 👤 | `{ serviceId (uuid), bookingDate (ISO) }`. |
| GET | `/bookings/me` | 👤 🎨 | Role-aware: your bookings *as a client*, or the ones *made with you*. |
| PATCH | `/bookings/:id/status` | 👤 🎨 | `{ status: CONFIRMED \| CANCELLED \| COMPLETED }`. |

### The state machine — enforced server-side

```
PENDING ──▶ CONFIRMED ──▶ COMPLETED
   │             │
   └─────────────┴──────▶ CANCELLED
```

- `PENDING` is the **creation state only**. You cannot transition *to* it.
- `CANCELLED` and `COMPLETED` are **terminal**. Any further change → 400.
- **A customer may only ever set `CANCELLED`.** Confirming and completing are the
  artist's calls. A customer sending `CONFIRMED` gets a 400.
- Booking a **past** timeslot → 400.
- Booking a slot the artist hasn't opened → 400.

---

## Reviews

| Method | Path | Access |
|---|---|---|
| POST | `/reviews` | 👤 |

`{ bookingId (uuid), rating (int 1–5), comment? (max 1000) }`

**Only against a `COMPLETED` booking you own, once.** This is the whole trust model:
a review cannot exist without a completed booking behind it.

There is no `GET /reviews`. Read them per-artist via `/artists/:id/reviews`.

---

## Admin

| Method | Path | Access | Notes |
|---|---|---|---|
| GET | `/admin/bookings` | 🛡️ | Every booking, with customer + artist + service. |
| PATCH | `/admin/artists/:id/verify` | 🛡️ | `{ verified: boolean }`. |

That is **the entire admin API**. There is no users endpoint and no global reviews
endpoint — the admin UI derives both. See GAP-2 and GAP-4 in `docs/HANDOFF.md`.

---

## Health

`GET /api/v1/health` → `{ status: "UP", timestamp, environment }`

---

## Endpoints the frontend expects but that DO NOT EXIST

Calling these will 404. The UI for them is built and waiting.

| Missing | Needed by |
|---|---|
| `POST /auth/forgot-password` | `/forgot-password` page |
| `PUT /auth/me` | customer profile editing |
| `GET /admin/users` | admin → Users |
| `GET /admin/reviews` | admin → Reviews (currently an N+1 fan-out) |
| `DELETE /artists/portfolio/:id` | artist portfolio |
| service-type filter on `GET /artists` | category browse |
