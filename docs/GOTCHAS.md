# Gotchas — read before you debug

Every entry below is a **real bug that actually happened** in this repo, or a
trap that is guaranteed to catch the next person. They are written out because
each one costs hours (or an agent's whole context window) to rediscover from
symptoms.

Format: **symptom → cause → fix → the rule that follows from it.**

---

## G-1 · A size class silently deletes a colour class (`cn` / tailwind-merge)

**Severity: high — silent, and it produces *wrong output*, not an error.**

### Symptom
The hero's Search button rendered **near-black text on a burgundy fill**.
Unreadable. The JSX plainly said white:

```tsx
<Button variant="primary" size="md">Search</Button>
// variant contributes: text-primary-foreground   (a COLOUR → white)
// size    contributes: text-body                 (a SIZE   → 16px)
```

Computed style came back `color: rgb(31, 27, 29)` — the colour class was simply
**gone from the DOM**.

### Cause
`cn()` runs `clsx` → `tailwind-merge`. Tailwind-merge de-duplicates conflicting
classes by grouping them: two classes in the same group, last one wins.

It resolves `text-*` against **its own default theme**, and it has never heard of
our custom scale (`text-body`, `text-h4`, `text-display`, …). Not recognising them
as font sizes, it files them under **text-colour**. So `text-primary-foreground`
and `text-body` land in the same group, and the size — being last — **wins and
deletes the colour.**

This is not a Tailwind bug. It's what happens when you extend the theme with
custom scale names and don't tell tailwind-merge.

### Fix
`frontend/lib/utils.ts` — declare the scale as a font-size group:

```ts
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display", "h1", "h2", "h3", "h4", "body", "caption", "overline"] },
      ],
    },
  },
});
```

### 🔴 The rule
**Any new `text-*` size token added to `globals.css` MUST also be added to that
array in `lib/utils.ts`.** If you skip it, every component that composes that size
with a colour will silently lose its colour — and nothing will fail, lint, or
warn. You'll only see it with your eyes.

### How to spot it again
Element looks the wrong colour → inspect computed `color` → if the class you
wrote isn't in the DOM at all, it's this.

---

## G-2 · Scroll reveals must fail open, or the page renders empty

**Severity: high — the page looks broken, but the DOM is fine.**

### Symptom
The artist grid was **completely blank**. Not "unstyled" — blank. But the DOM had
all 12 `<article>` elements, correct data, correct classes. Every one of them:
`opacity: 0`.

### Cause
`Reveal` animates content in from `opacity: 0` when it scrolls into view, using
an `IntersectionObserver`.

**An IntersectionObserver does not deliver entries while the document is hidden**
(`document.visibilityState === "hidden"`), and can be absent or degraded in other
environments — headless browsers, some automation contexts, prerender passes.

When the observer never fires, the `hidden → show` transition never happens, and
the content stays at `opacity: 0` **permanently**. A full DOM that paints as an
empty page. This is a worse failure than having no animation at all.

### Fix
`frontend/components/ui/motion.tsx` — `Reveal` now fails open, two ways:

1. **On-screen at mount ⇒ show immediately.** Measured with
   `getBoundingClientRect()` in a layout effect. No observer needed. Only content
   genuinely below the fold ever waits for a scroll.
2. **Primary content passes `immediate`** and opts out of scroll-triggering
   entirely.

### 🔴 The rule
**Scroll reveals are for marketing sections only.** Anything the user came to the
page *for* — search results, dashboard lists, booking data — passes `immediate`.
Never gate content a user is waiting on behind an animation trigger.

```tsx
<Reveal immediate variants={stagger}>   {/* results, lists  ✅ */}
<Reveal variants={stagger}>             {/* marketing only  ✅ */}
```

---

## G-3 · Dynamic `motion[tag]` kills every stagger

**Severity: medium — subtle, looks like "animation just doesn't work".**

### Symptom
Parent `Reveal` animated fine (`opacity: 1`), but **every child stayed at
`opacity: 0`**. Stagger never ran.

### Cause
`Reveal` is polymorphic (`as="ul"`, `as="li"`, …). The original code did:

```ts
const Comp = motion[as];   // ❌ inside render
```

Indexing the `motion` proxy during render can return a **fresh component identity
on every pass**. React sees a different component type, unmounts and remounts the
subtree, and every child's variant state resets — so the parent's `show` label
never propagates down.

### Fix
Resolve the tags **once, at module scope**:

```ts
const MOTION_TAGS = { div: motion.div, ul: motion.ul, li: motion.li, /* … */ };
const motionTag = (as: RevealTag) => MOTION_TAGS[as];
```

### 🔴 The rule
Never index `motion[...]` inside a render. Stable component identity is what makes
parent → child variant propagation (and therefore `stagger`) work at all.

---

## G-4 · Port 5000 is occupied on macOS

**Severity: low, but it looks like a code bug and wastes real time.**

### Symptom
Backend dies on boot: `EADDRINUSE: address already in use :::5000`. Or worse — it
*seems* to start, but the frontend gets HTML/404s instead of JSON.

### Cause
macOS **ControlCenter (AirPlay Receiver)** listens on `:5000`. It's not your code.

```bash
lsof -nP -iTCP:5000 -sTCP:LISTEN     # → ControlCe … (LISTEN)
```

### Fix
Either turn off AirPlay Receiver (System Settings → General → AirDrop & Handoff),
or run the backend on another port and update `frontend/.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:5050/api/v1
```

---

## G-5 · Don't compute time-of-day during render

**Severity: medium — a hydration mismatch, which React reports cryptically.**

### Symptom
`Good morning, Ananya` on the server, `Good evening, Ananya` in the browser →
React hydration error, and the whole subtree gets thrown away and re-rendered.

### Cause
`"use client"` does **not** mean "client-only" — client components are still
**server-rendered** for the initial HTML. So this:

```tsx
title={`${greeting()}, ${name}`}   // greeting() reads new Date().getHours()
```

runs on a server whose timezone is almost certainly not the visitor's.

### Fix
Greet without time-of-day (`Welcome back, {name}`), or compute it in a
`useEffect` after mount.

### 🔴 The rule
Nothing that varies between server and client — time-of-day, `Math.random()`,
`window` — may be read **during render**. Reading `Date.now()` *after* data has
loaded client-side is fine (React Query renders a skeleton on the server), which
is why the `isPast` checks in `booking-row.tsx` are safe.

---

## G-6 · An absolutely-positioned child needs a positioned ancestor

**Severity: low. Visual only, but confusing.**

### Symptom
The calendar's ‹ › month arrows escaped the calendar and floated at the **top of
the booking card**, hundreds of pixels away.

### Cause
`react-day-picker` positions its `nav` absolutely. Our `months` wrapper wasn't
`position: relative`, so the arrows anchored to the nearest positioned ancestor
*upstream* — which happened to be the booking card.

### Fix
`components/ui/calendar.tsx`: `months: "relative flex flex-col"`.

---

## G-7 · `asChild` buttons can't show a spinner

**Severity: low. By design — documented so nobody "fixes" it.**

Radix's `Slot` forwards props to a **single** child, so no spinner element can be
injected alongside it. `<Button asChild loading>` therefore ignores `loading`.

This is intentional and guarded in `components/ui/button.tsx`. If you need a
loading state, use a real `<button>`, not `asChild` + `<Link>`.

---

## G-8 · The `next dev` server dies if you run `next build`

**Severity: low. Pure dev-environment friction.**

`npm run build` wipes and rewrites `.next/`, which the running dev server is
reading from. The dev server survives, but starts serving **HTML with no CSS** —
the page renders as unstyled text, which looks like a catastrophic style bug.

**Fix:** stop the dev server before building, then `rm -rf .next` and restart it.
Nothing is actually broken.

---

## Debugging checklist

Before you go spelunking, rule these out — they cover most weird symptoms:

| Symptom | Suspect |
|---|---|
| Text is the wrong colour | **G-1** — check the class is even in the DOM |
| Section/list renders blank but DOM is populated | **G-2** — `opacity: 0`, observer never fired |
| Children don't animate, parent does | **G-3** — motion tag identity |
| API calls fail / return HTML | **G-4** — port 5000 |
| Hydration error on a dashboard | **G-5** — something time/random at render |
| Element floats somewhere absurd | **G-6** — missing `relative` |
| Page renders with zero CSS | **G-8** — you built while dev was running |
