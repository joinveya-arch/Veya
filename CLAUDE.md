# VEYA — agent context

**Read this first. It exists so you don't have to read the codebase to understand
the codebase.** If something here is enough to act on, act — don't go re-derive it
by grepping.

VEYA is a beauty marketplace: clients discover, compare and book **verified**
makeup artists and hairstylists. Two apps in one repo, no shared package.

```
backend/    Express + TypeScript + Prisma + PostgreSQL   (REST API, port 5000)
frontend/   Next.js 15 App Router + Tailwind v4          (web app, port 3000)
```

---

## Where to look — by task

| If you're doing this | Read this | Don't read |
|---|---|---|
| Anything UI, at all | `DESIGN_SYSTEM.md` | — |
| Anything, before debugging | **`docs/GOTCHAS.md`** ← traps that will burn you | — |
| Picking up work / "what's left?" | `docs/HANDOFF.md` | git log |
| Calling an endpoint | `docs/API.md` | the route files |
| Frontend code | `frontend/CLAUDE.md` | — |
| Backend code | `backend/CLAUDE.md`, `ARCHITECTURE.md` | — |
| Running it locally | `README.md` | — |

`implementation.md` is a **historical** build plan for the backend. It is already
implemented. Do not treat it as a spec for current behaviour — read the code or
`docs/API.md` instead.

---

## The five things that will trip you up

Full detail in `docs/GOTCHAS.md`. The short version, because these are expensive
to rediscover:

1. **`cn()` is customised.** Tailwind-merge doesn't know `text-body` / `text-h4`
   are *font sizes*, so out of the box it treats them as text *colours* and a
   size class silently deletes a colour class. `lib/utils.ts` patches this.
   **Adding a new `text-*` size token? You must register it there too.**
2. **Scroll reveals must fail open.** `Reveal` starts content at `opacity: 0`. If
   the IntersectionObserver never fires, the content is invisible forever — a
   full DOM that looks like an empty page. Primary content (search results,
   dashboard lists) passes `immediate` and never waits on an observer.
3. **Port 5000 is taken on macOS** by ControlCenter/AirPlay. The backend won't
   bind. Run it elsewhere and update `NEXT_PUBLIC_API_URL`.
4. **The frontend has two build modes.** `NEXT_PUBLIC_USE_MOCK=1` swaps the whole
   API for an in-memory dataset *at the transport layer*. That's how the static
   GitHub Pages demo runs with no backend.
5. **Don't compute time-of-day during render.** Client components are still
   server-rendered; `new Date().getHours()` at render time is a hydration
   mismatch waiting to happen.

---

## Conventions that are non-negotiable

- **Frontend never calls `fetch` directly.** Components → hooks → `services/` →
  `lib/api.ts`. That single chokepoint is what makes the mock mode possible.
- **No raw hex, no inline styles.** Only semantic tokens (`bg-surface`,
  `text-foreground-secondary`, `border-border`). This is what makes dark mode
  work for free — hardcode `white` and you've broken it.
- **`.tabular` on every numeral** (prices, ratings, counts, dates), or they
  visibly wobble as they update.
- **Backend layering is strict:** route → validator → controller → service →
  repository → Prisma. Controllers hold no business logic. See `ARCHITECTURE.md`.
- **Every async surface handles four states:** pending, error, empty, loaded.
  There are prebuilt components for all of them in `components/ui/states.tsx`.

---

## Ground truth

- The **Prisma schema** (`backend/prisma/schema.prisma`) is the source of truth
  for data shapes. `frontend/types/index.ts` mirrors it by hand — if you change
  one, change the other.
- The **backend Zod validators** (`backend/src/validators/`) are the source of
  truth for input rules. Frontend forms mirror them so a payload that passes in
  the browser can't be rejected by the server for a reason we could have caught.
- **Every response is wrapped**: `{ success: boolean, data: T, message?: string }`.
  `lib/api.ts` unwraps it, so services return `T` directly.
