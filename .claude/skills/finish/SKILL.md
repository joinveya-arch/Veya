---
name: finish
description: Run before telling the user a change is done, and before committing. Verifies the change actually works, then updates the docs it invalidated (API.md, DESIGN_SYSTEM.md, HANDOFF.md, GOTCHAS.md). Use whenever you are about to say "done", "finished", "ready to commit", or are asked to commit.
---

# /finish — don't call it done until it is

You are about to tell a human that work is complete. Before you do, you owe them
three things: **it works**, **the docs still tell the truth**, and **what you
learned is written down**.

Work through this in order. Do not skip a step because it "looks fine".

---

## 1 · Verify it actually works

Not "it compiles" — **you observed the behaviour**.

```bash
cd frontend
npx tsc --noEmit        # MUST be 0 errors
npx next lint           # MUST be 0 warnings
```

Then **exercise the thing you changed** in a browser (the dev server, or
`NEXT_PUBLIC_USE_MOCK=1 npm run dev` if there's no backend running). Look at it.

Backend change? Call the endpoint. Don't assume.

> **If you changed anything visual, look at it in BOTH themes.** Hardcoding a colour
> is the single easiest way to silently break dark mode, and nothing will warn you.

---

## 2 · Update the docs your change invalidated

Run the check — it tells you what you broke:

```bash
./scripts/check-docs.sh
```

It's a heuristic, so also think. Use this table:

| If you changed… | You must update |
|---|---|
| A route or validator (`backend/src/routes\|validators/`) | **`docs/API.md`** — the endpoint table, and the validation rules |
| `prisma/schema.prisma` | **`frontend/types/index.ts`** (mirrored by hand!) and `docs/API.md` |
| Business rules in `backend/src/services/` | **`docs/API.md`** — e.g. the booking state machine |
| Design tokens (`frontend/app/globals.css`) | **`DESIGN_SYSTEM.md`** |
| A shared primitive (`frontend/components/ui/`) | **`DESIGN_SYSTEM.md`** §8 (variants + contract) |
| **Added a `text-*` size token** | **`frontend/lib/utils.ts`** ← *or it silently deletes colour classes.* See GOTCHAS G-1. This is not optional. |
| Closed one of the known gaps | **`docs/HANDOFF.md`** — tick it off so nobody redoes it |
| Added a feature whose backend doesn't exist yet | **`docs/HANDOFF.md`** — add it as a GAP, honestly |
| Anything about how to run/deploy it | **`README.md`** |

**Docs are part of the change, not a follow-up.** A PR that ships code and leaves the
docs lying is a net negative — the next person trusts the doc and gets burned.

---

## 3 · Write down what bit you

**Did you hit a bug that cost you more than ~15 minutes, or that had a misleading
symptom?** Add it to **`docs/GOTCHAS.md`**.

This file is the highest-value artefact in the repo. It exists because these bugs are
*silent* — wrong output, not errors — and each one costs the next person hours to
re-derive from symptoms.

Use the existing format:

```markdown
## G-N · One-line title of the trap

**Severity: …**

### Symptom
What you actually saw. Be concrete — the wrong colour, the blank page.

### Cause
Why. The real reason, not the proximate one.

### Fix
The code, and where.

### 🔴 The rule
The general rule that follows, so it can't recur.
```

Then add a row to the **Debugging checklist** at the bottom of that file.

If you found a gotcha, it probably belongs in `CLAUDE.md`'s "five things that will
trip you up" too — but only if it's genuinely load-bearing.

---

## 4 · Then, and only then

- Summarise **what changed, what you verified, and what you did NOT verify.** Be
  honest about the last one — an unverified claim is worse than an admitted gap.
- If tests failed or you skipped something, **say so out loud.** Don't bury it.
- Commit only if the user asked. End the message with the co-author trailer.

---

## The checklist, short

- [ ] `tsc --noEmit` → 0 errors
- [ ] `next lint` → 0 warnings
- [ ] I **ran** it and **looked** at it — light **and** dark
- [ ] `./scripts/check-docs.sh` passes
- [ ] `docs/API.md` matches reality
- [ ] `DESIGN_SYSTEM.md` matches reality
- [ ] `docs/HANDOFF.md` reflects what's now done / newly missing
- [ ] Anything that bit me is in `docs/GOTCHAS.md`
- [ ] I told the user what I did **not** verify
