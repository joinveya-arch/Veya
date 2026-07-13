<div align="center">

# VEYA

**Find makeup artists you can trust.**

A beauty marketplace where clients discover, compare and book **verified** makeup
artists and hairstylists.

[Live demo](https://joinveya-arch.github.io/Veya/) · [Design system](./DESIGN_SYSTEM.md) · [Gotchas](./docs/GOTCHAS.md) · [Handoff](./docs/HANDOFF.md)

</div>

---

## What's in here

```
backend/     Express + TypeScript + Prisma + PostgreSQL   REST API      :5000
frontend/    Next.js 15 (App Router) + Tailwind v4        Web app       :3000
docs/        API reference · gotchas · handoff
```

Two independent apps. No shared package — the frontend mirrors the backend's types
by hand.

---

## Quick start

### Frontend only — no backend, no database, 30 seconds

The fastest way to see the whole product. Runs on a built-in sample dataset.

```bash
cd frontend
npm install
NEXT_PUBLIC_USE_MOCK=1 npm run dev      # → http://localhost:3000
```

**Sign in with any password.** Your role comes from the email:

| Email | Role |
|---|---|
| anything — e.g. `demo@veya.in` | **Customer** |
| `artist@veya.in` | **Artist** |
| `admin@veya.in` | **Admin** |

Writes (bookings, reviews, verification) work and reset on reload.

### Full stack

```bash
# 1 — database + API
cd backend
cp .env.example .env
docker compose up -d          # PostgreSQL
npm install && npm run db:migrate
npm run dev                   # → :5000

# 2 — web app
cd ../frontend
cp .env.example .env.local    # point NEXT_PUBLIC_API_URL at the API
npm install
npm run dev                   # → :3000
```

There's no seed script — register a user at `/signup`.

> ### ⚠️ macOS: port 5000 will not bind
> ControlCenter (AirPlay Receiver) already listens there. Either disable it in
> **System Settings → General → AirDrop & Handoff**, or run the API on another port
> and update `NEXT_PUBLIC_API_URL`. This is [gotcha **G-4**](./docs/GOTCHAS.md) and it
> has bitten everyone once.

---

## Documentation — start here, not in the code

These are written so that **you (or an AI agent) can get oriented without reading the
codebase.** That's deliberate: exploring from scratch is slow and expensive.

| File | What it's for |
|---|---|
| **[`CLAUDE.md`](./CLAUDE.md)** | **Agent entry point.** Map of the repo, conventions, the 5 things that will trip you up. |
| **[`docs/GOTCHAS.md`](./docs/GOTCHAS.md)** | Real bugs that already happened, and the rules that follow. **Read before debugging.** |
| **[`docs/HANDOFF.md`](./docs/HANDOFF.md)** | What's done, what's missing, what's deliberately faked, what to do next. |
| **[`docs/API.md`](./docs/API.md)** | Every endpoint, every validation rule, the booking state machine. |
| **[`DESIGN_SYSTEM.md`](./DESIGN_SYSTEM.md)** | Tokens, type scale, spacing, components, motion. **Read before writing UI.** |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Backend layering rules. |
| [`frontend/CLAUDE.md`](./frontend/CLAUDE.md) · [`backend/CLAUDE.md`](./backend/CLAUDE.md) | Per-app context. |
| `implementation.md` | **Historical.** The original backend build plan. Already implemented — not a spec. |

---

## Working on this — the one rule

**Docs are part of the change, not a follow-up.**

Before you commit, run:

```bash
npm run check-docs          # from the repo root
```

It flags code changes that should have come with a doc update — a new endpoint
without `docs/API.md`, a new design token without `DESIGN_SYSTEM.md`, and so on. CI
runs the same check on every PR.

If you're working with an AI agent, have it run the **`/finish`** skill before it
tells you it's done. It walks the same checklist (docs · typecheck · lint · build ·
gotchas) so work doesn't land half-finished. See [`.claude/skills/`](./.claude/skills/).

---

## Deployment

Push to `master` → GitHub Actions builds the **static demo** (mock data, no backend)
and publishes it to GitHub Pages. See `.github/workflows/deploy.yml`.

**One-time setup:** repo **Settings → Pages → Build and deployment → Source =
GitHub Actions**. Without it, the workflow goes green but serves nothing.

The backend is not deployed anywhere.

---

## Stack

**Frontend** — Next.js 15 · React 19 · TypeScript (strict) · Tailwind v4 · Framer
Motion · TanStack Query · React Hook Form + Zod · Radix · Lucide · next-themes

**Backend** — Express · TypeScript (strict) · Prisma · PostgreSQL · Zod · JWT ·
bcrypt · Winston · Cloudinary · Helmet · rate-limiting
