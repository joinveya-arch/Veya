# VEYA — Frontend

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Framer Motion · TanStack Query

The design language, tokens and component contracts live in
[`../DESIGN_SYSTEM.md`](../DESIGN_SYSTEM.md). Read it before adding UI.

---

## Two build modes

The app runs against the real Express backend, or entirely without one.

### 1. Against the backend (default)

```bash
cp .env.example .env.local     # point NEXT_PUBLIC_API_URL at your API
npm install
npm run dev
```

`/artists/[id]` stays a dynamic route and `next/image` optimisation is on.

> **macOS note:** the backend defaults to port **5000**, which ControlCenter
> (AirPlay Receiver) already occupies. If the API won't bind, run it on another
> port and update `NEXT_PUBLIC_API_URL` to match.

### 2. Static demo — no backend at all

```bash
NEXT_PUBLIC_USE_MOCK=1 npm run build   # → ./out
```

With `NEXT_PUBLIC_USE_MOCK=1`:

- `lib/api.ts` routes every request to `lib/mock/adapter.ts` instead of `fetch`,
  serving an in-memory dataset (`lib/mock/data.ts`). **Interception happens at
  the transport layer**, so no service, hook or component knows the difference.
- `/artists/[id]` is pre-rendered from the demo artist ids via
  `generateStaticParams`.
- `next/image` optimisation is disabled — it needs a server at request time.

Writes (bookings, reviews, verification) mutate the in-memory store and reset on
reload, which is the right behaviour for a demo.

**Demo sign-in — any password works.** The role comes from the email:

| Email | Role |
|---|---|
| anything else | Customer |
| `artist@veya.in` | Artist |
| `admin@veya.in` | Admin |

---

## Deployment

`.github/workflows/deploy.yml` builds the static demo and publishes it to GitHub
Pages on every push to `master` that touches `frontend/`.

**One-time setup:** in the repo, go to **Settings → Pages → Build and
deployment** and set **Source** to **GitHub Actions**. Without that the workflow
runs green but nothing is served.

The site is then served from `https://<owner>.github.io/<repo>/`. The workflow
derives `NEXT_PUBLIC_BASE_PATH` from the repo name, so the path prefix is never
hardcoded.

---

## Scripts

| Command | Does |
|---|---|
| `npm run dev` | Dev server on :3000 |
| `npm run build` | Production build (static export when `NEXT_PUBLIC_USE_MOCK=1`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |

---

## Structure

```
app/          routes (App Router)
components/
  ui/         primitives — button, card, input, dialog, motion, …
  layout/     navbar, footer, logo, theme toggle
  sections/   landing-page sections
  cards/      artist card, review card, booking row
  artist/     browse + profile
  booking/    booking flow
  dashboard/  shared dashboard shell
hooks/        data + UI hooks
lib/          api client, utils, tokens, mock/
services/     typed API layer — components never call fetch directly
providers/    query client, theme, auth
types/        mirrors the Prisma schema
```
