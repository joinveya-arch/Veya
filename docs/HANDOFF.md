# Handoff — state of the project

Last updated: **2026-07-13**.

If you're picking this up cold, read this and `docs/GOTCHAS.md`. Between them you
should not need to explore the codebase to know where things stand.

---

## Status at a glance

| Area | State |
|---|---|
| Backend API | ✅ Complete for the MVP scope. Auth, artists, services, bookings, reviews, admin. |
| Frontend — public | ✅ Landing, artist browse + filters, artist profile, booking flow, auth pages. |
| Frontend — customer | ✅ Overview, bookings (cancel + review), profile (read-only). |
| Frontend — artist | ✅ Overview, bookings, services CRUD, portfolio, availability, profile. |
| Frontend — admin | ✅ Overview, artist verification, bookings, reviews, users (derived). |
| Dark mode | ✅ Full. |
| Responsive | ✅ Verified to 390px, no horizontal scroll. |
| Static demo + CI | ✅ Deploys to GitHub Pages on push to `master`. |
| Payments | ❌ Not started. Not in scope. |
| Notifications (email/SMS) | ❌ Not started. |
| Tests | ❌ **None. Zero test coverage, front or back.** |

Frontend build is clean: `tsc --noEmit` 0 errors, `eslint` 0 warnings, 24 routes
build.

---

## ⚠️ Known gaps — features whose UI exists but whose API does not

**These are the traps.** The UI is finished and looks real. The endpoint behind it
is missing. Do not assume a screen is wired just because it renders.

### GAP-1 · Forgot password — no endpoint
- **UI:** `frontend/app/(auth)/forgot-password/` + `components/forms/forgot-password-form.tsx` — complete, with a success state.
- **Missing:** `POST /auth/forgot-password`. The form calls it; the call 404s.
- **To finish:** add the route, a reset-token model, and an email sender. The
  frontend needs **no changes**.

### GAP-2 · Admin → Users is derived, not real
- **UI:** `frontend/app/admin/users/page.tsx`.
- **Reality:** there is **no `GET /admin/users` endpoint**. The page derives the
  user list from the distinct customers appearing in `GET /admin/bookings`.
- **Consequence:** **a user who has never booked does not appear.** The page says
  so on-screen — it does not pretend to be complete.
- **To finish:** add `GET /admin/users`, then replace the derivation.

### GAP-3 · Customer profile is read-only
- **UI:** `frontend/app/dashboard/profile/page.tsx`.
- **Reality:** there is no endpoint to update a `User`. The page renders the
  details read-only with an honest note, rather than faking a save.
- **To finish:** add `PUT /auth/me` (or `/users/me`), then add the form.

### GAP-4 · Admin → Reviews is an N+1
- `GET /admin/reviews` doesn't exist. The page fans out `GET /artists/:id/reviews`
  across every artist with TanStack `useQueries` and flattens the result.
- Fine at 12 artists. **Will not scale.** Add the endpoint before this list grows.

### GAP-5 · Portfolio images can't be deleted
- `POST /artists/portfolio` exists; there is no `DELETE`. The artist portfolio page
  offers no delete, deliberately.

### GAP-6 · Service-type filter is cosmetic
- The landing page's category tiles and the search bar's "What" selector pass
  `?service=bridal` etc. The API **has no service-type filter** — it only filters
  on `city` and `minExperience`.
- The listing page therefore uses `service` as a **heading** ("Bridal artists"),
  not as a filter. This is honest, but it is not what a user expects.
- **To finish:** add a service/category field to the `Service` model and a
  `serviceType` query param to `GET /artists`.

---

## Deliberate design decisions (don't "fix" these)

- **Saved artists live in `localStorage`** (`hooks/use-saved-artists.ts`). There's
  no favourites API. A custom event keeps mounted cards in sync — `storage` alone
  won't, since it only fires in *other* tabs.
- **The artist card's "Book" button is desktop-only.** It's a hover affordance;
  hover doesn't exist on touch. Tapping the card opens the profile, which has the
  primary CTA.
- **Prices are shown before sign-in.** Hiding cost behind an auth wall is the
  fastest way to destroy the trust this brand is built on.
- **Ratings of 0 render as "New", never "0.0".** A new artist is not a badly-rated
  one.
- **Unavailable calendar days are disabled, not marked.** The calendar reads as an
  invitation, not a list of rejections.

---

## Test users (mock / demo mode only)

The static demo has **no backend**. Sign-in accepts **any password**; the role is
taken from the email:

| Email | Role you get |
|---|---|
| anything (e.g. `demo@veya.in`) | **Customer** |
| `artist@veya.in` | **Artist** |
| `admin@veya.in` | **Admin** |

Implemented in `frontend/lib/mock/adapter.ts` (`roleFor()`). The demo store is
in-memory: writes work, and reset on reload.

**Against the real backend** there are no seeded users — register one. Note that
`POST /auth/register` accepts a `role`, so an ADMIN can be created directly. That
is a **security hole to close before production** (see below).

---

## Before this goes to production

1. **Lock down `role` on registration.** `registerSchema` accepts
   `role: CUSTOMER | ARTIST | ADMIN`, so anyone can self-register as an admin.
   Strip `ADMIN` from the public path.
2. **CORS is `origin: "*"`** in `backend/src/app.ts`. Restrict it.
3. **No tests.** At minimum: auth, the booking state machine, and the
   role-authorisation middleware.
4. **`console.error` in `frontend/app/error.tsx`** is a placeholder — wire a real
   reporter (Sentry).
5. Payments and notifications are entirely absent.

---

## Next tasks, in the order I'd do them

1. **Close the admin self-registration hole.** Small, and it's a real vulnerability.
2. **Service categories** (GAP-6) — the category browse is the most visible thing
   that doesn't do what it appears to do.
3. **`GET /admin/users`** (GAP-2) and **`PUT /auth/me`** (GAP-3) — both small, both
   unblock a finished UI.
4. **Forgot-password** (GAP-1) — needs an email provider decision first.
5. **Tests**, before the surface area grows any further.
