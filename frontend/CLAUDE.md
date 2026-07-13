# Frontend — agent context

Next.js 15 (App Router) · TypeScript (strict) · Tailwind **v4** · Framer Motion ·
TanStack Query · React Hook Form + Zod · Radix primitives · Lucide icons.

**Before writing UI:** read `../DESIGN_SYSTEM.md`.
**Before debugging:** read `../docs/GOTCHAS.md`. Seriously — G-1 and G-2 are silent
and will cost you an hour each.

---

## The data path — never bypass it

```
component → hooks/ → services/ → lib/api.ts → fetch | mock adapter
```

**Nothing calls `fetch` directly.** `lib/api.ts` is the single chokepoint, and that
is exactly what makes the backend-free demo mode possible: with
`NEXT_PUBLIC_USE_MOCK=1` it routes to `lib/mock/adapter.ts` instead, and *nothing
above it knows*. Break that rule and you break the static deploy.

- `services/index.ts` — one typed function per endpoint. Returns the unwrapped
  payload; throws `ApiError` on failure.
- `hooks/` — TanStack Query wrappers. Own the query keys, invalidation, toasts.
- Components consume hooks. They don't know the API exists.

---

## Layout of the code

```
app/                 routes
  (auth)/            login · signup · forgot-password   (shared split-canvas layout)
  artists/           browse (+ [id] profile)
  dashboard/         CUSTOMER
  artist/            ARTIST
  admin/             ADMIN
components/
  ui/                primitives. Look here FIRST before building anything.
  layout/            navbar · footer · logo · theme-toggle · account-menu
  sections/          landing-page sections + search-bar
  cards/             artist-card · review-card · booking-row
  artist/            browse, filters, profile view, portfolio grid
  booking/           booking-card (the conversion surface)
  dashboard/         dashboard-shell (role guard + chrome) · nav
  forms/             login · signup · forgot-password
hooks/               use-artists · use-bookings · use-artist-filters · use-saved-artists · …
lib/                 api.ts · utils.ts (cn, formatters) · images.ts · constants.ts · mock/
providers/           query client · theme · auth
types/               mirrors backend/prisma/schema.prisma BY HAND
```

### Components you should reuse, not rebuild

`Button` · `Card` · `Badge`/`VerifiedBadge` · `Input`/`Textarea` · `Field` ·
`Avatar` · `Rating`/`RatingInput` · `Calendar` · `Dialog`/`Sheet` · `Select` ·
`Checkbox`/`Slider`/`Separator`/`Tabs` · `Container`/`Section`/`SectionHead` ·
`Skeleton`/`EmptyState`/`ErrorState` · `Reveal`/`RevealItem` + variants.

**All of them are in `components/ui/`.** Duplicating one of these is the most common
way to make this codebase worse.

---

## Hard rules

1. **Semantic tokens only.** `bg-surface`, `text-foreground-secondary`,
   `border-border`, `rounded-[var(--radius-card)]`. **No raw hex. No inline styles.
   Never hardcode `white`/`black`** — that's what silently breaks dark mode.
2. **`.tabular` on every numeral.** Prices, ratings, counts, dates. Without it they
   visibly wobble as they update.
3. **Format via helpers:** `formatPrice` (₹, Indian grouping), `formatDate`,
   `formatDuration`, `formatRating`. Not by hand.
4. **Four states per async surface:** pending · error · empty · loaded. Components
   exist for all four.
5. **Mirror the backend's Zod rules** in forms (see `../docs/API.md`) so a payload
   that passes here can't be rejected server-side for a reason we could have caught.
6. **Underline tabs, never pills.** A row of filled pills is the fastest way to make
   this look like an admin template.
7. **Motion only from `components/ui/motion.tsx`.** Don't hand-roll transitions.

---

## Auth & routing

- `providers/auth-provider.tsx` holds the session. Token in `localStorage`
  (`veya.token`); rehydrated on mount via `GET /auth/me`; a token the server rejects
  is dropped.
- `DashboardShell` (`components/dashboard/`) is the **role guard**. Pass `role`; the
  wrong role gets redirected to their own home. It renders the shell — not a spinner
  — while the session rehydrates.
- Login honours `?next=` so an interrupted booking resumes where it left off.

---

## The two build modes

| | Default | `NEXT_PUBLIC_USE_MOCK=1` |
|---|---|---|
| Data | real Express API | in-memory (`lib/mock/`) |
| `/artists/[id]` | dynamic route | pre-rendered via `generateStaticParams` |
| `next/image` | optimised | `unoptimized` (no server at request time) |
| Output | server app | static export → `out/` |
| Used by | local dev, prod | **GitHub Pages demo** |

Demo sign-in: **any password**. Role comes from the email — `artist@veya.in` →
ARTIST, `admin@veya.in` → ADMIN, anything else → CUSTOMER. (`lib/mock/adapter.ts`)

---

## Gotchas specific to this app

- **`cn()` is patched** (`lib/utils.ts`). Adding a `text-*` **size** token to
  `globals.css`? You must register it there too, or it will silently delete colour
  classes. → GOTCHAS **G-1**.
- **`Reveal` fails open by design.** Primary content (results, lists) passes
  `immediate` and must never wait on a scroll observer. → **G-2**.
- **`service.price` is a string** (Prisma `Decimal` over JSON). `Number()` it.
- **`artistService.me()` 404s** when an artist hasn't created a profile yet. That's
  a normal state, not an error — handle it.
- Don't read time-of-day/`Math.random()` during render. → **G-5**.
