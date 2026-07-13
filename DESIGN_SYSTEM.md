# VEYA — Design System

The reference for every visual and interaction decision in the product.
If something isn't written here, it isn't a rule yet — add it rather than
inventing a one-off.

**Source of truth:** `frontend/app/globals.css`. Every token below is a CSS
custom property defined there and exposed to Tailwind v4 via `@theme`.
Components compose from the **semantic** layer (`bg-surface`, `text-foreground`),
never from raw hex and only rarely from the brand ramps.

---

## 1. Principles

1. **Whitespace over decoration.** If a section feels flat, add space before
   adding a border, a shadow, or a background.
2. **Photography is the ornament.** The UI is a quiet frame around the work.
   Chrome that competes with an artist's portfolio is a bug.
3. **Type carries hierarchy; weight does not.** We ship exactly three weights
   (400/500/600). Emphasis comes from size, space and colour.
4. **Trust is a visual property.** Verified badges, real ratings and honest
   empty states are design elements, not afterthoughts.
5. **Motion confirms, never entertains.** Content arrives. It does not bounce,
   spin, or slide in from off-screen.

**Never:** bright pink, neon, Material elevation, pill-shaped everything,
oversaturated shadows, emoji in UI, cartoon illustration, dashboard chrome.

---

## 2. Colour

### Brand ramps
Used for photography scrims, decorative fills and the gold accent. Not for
body text.

| Token | Hex | Use |
|---|---|---|
| `burgundy-600` | `#4A1028` | **Primary.** Buttons, active chips, slider fill. |
| `burgundy-700` | `#3A0D1F` | Primary hover; the "ink" section background. |
| `burgundy-900` | `#1D060F` | Photography scrims, dialog overlay. |
| `champagne-400` | `#D4AF37` | **Accent.** Verified badge, focus ring, overlines, the hero rule. |
| `champagne-50` | `#FBF6E7` | Accent-soft fill behind the verified badge. |

### Semantic tokens
These are what components actually use. Each flips automatically in dark mode.

| Token | Light | Dark | Use |
|---|---|---|---|
| `background` | `#F7F3ED` | `#131011` | Page field. Rose beige / warm charcoal. |
| `surface` | `#FFFFFF` | `#1B1718` | Cards, inputs, navbar. |
| `surface-soft` | `#FAF8F6` | `#201C1D` | Alternating sections, footer. |
| `surface-sunken` | `#F2ECE4` | `#0E0C0D` | Skeletons, hover wells, image placeholders. |
| `border` | `#E7DDD6` | `#322C2E` | Default hairline. |
| `border-strong` | `#D8CABF` | `#453D40` | Hover state; the `.rule` gradient. |
| `foreground` | `#1F1B1D` | `#F5F1EC` | Primary text. |
| `foreground-secondary` | `#6D6465` | `#A9A0A0` | Body copy, descriptions. |
| `foreground-muted` | `#958A8A` | `#7C7375` | Captions, metadata, placeholders. |
| `primary` | `#4A1028` | `#F5F1EC` | Primary action fill. |
| `primary-foreground` | `#FFFFFF` | `#1D060F` | Text on primary. |
| `accent` | `#D4AF37` | `#D4AF37` | Gold. Constant across themes. |
| `success` | `#3F8C61` | `#5AAB7E` | Confirmed bookings. |
| `warning` | `#D49A1E` | `#E0AE42` | Pending bookings. |
| `error` | `#B33A3A` | `#D05A5A` | Cancelled, destructive, validation. |

### Dark mode
Deep **warm charcoal**, never pure black. Burgundy is too dark to survive as a
button fill on a dark field, so **the primary action inverts** to warm bone
(`#F5F1EC`) with a wine label. Gold carries the brand instead. Shadows are
re-tinted to true black at higher opacity — a burgundy shadow is invisible on
charcoal.

### Accessibility
All text/background pairs meet **WCAG AA**. Body copy uses
`foreground-secondary`, never `foreground-muted`, at 16px. `foreground-muted`
is reserved for ≥14px metadata.

---

## 3. Typography

| Face | Role | Source |
|---|---|---|
| **General Sans** (400/500/600) | All headings, prices, the wordmark | Fontshare `<link>` |
| **Manrope** (400/500/600/700) | All body, UI labels, buttons | `next/font/google` |
| Inter | Fallback only | system |

General Sans ships **no italic** — never apply `italic` to a heading or the
browser will synthesise an oblique. Emphasis is carried by the gold rule
(see `Hero`) or by colour.

### Scale
Fluid via `clamp()`, so desktop-first degrades without media queries.

| Token | Size | Line height | Tracking | Use |
|---|---|---|---|---|
| `text-display` | 48 → **64** | 1.04 | −0.03em | Hero only. Once per site. |
| `text-h1` | 36 → **48** | 1.08 | −0.025em | Page title. Once per page. |
| `text-h2` | 30 → **36** | 1.16 | −0.02em | Section heading. |
| `text-h3` | 24 → **28** | 1.24 | −0.015em | Sub-section, category tile. |
| `text-h4` | **22** | 1.34 | −0.01em | Card title, dialog title. |
| `text-body` | **16** | 1.65 | — | Body copy, buttons, inputs. |
| `text-caption` | **14** | 1.5 | — | Metadata, helper text. |
| `text-overline` | **12** | 1.4 | **+0.16em** | Section eyebrow. Uppercase, gold. |

`.tabular` (`font-variant-numeric: tabular-nums`) is **mandatory** on every
price, rating, count and date so numerals don't wobble as they update.

> **Gotcha — `tailwind-merge`.** Our size tokens (`text-body`, `text-h4`, …)
> are not in tailwind-merge's default theme, so it files them under
> *text-colour* and a size class will silently **delete** a colour class in the
> same `cn()`. `lib/utils.ts` extends the `font-size` class group to fix this.
> **Any new `text-*` size token must be added to that list.**

---

## 4. Spacing

8-pt grid: `4 · 8 · 12 · 16 · 24 · 32 · 48 · 64 · 96 · 128`.

Vertical rhythm is a **closed set** owned by `<Section>`. Sections never pick
their own padding.

| `spacing` | Padding |
|---|---|
| `sm` | `py-16 md:py-20` |
| `md` (default) | `py-20 md:py-28` |
| `lg` | `py-24 md:py-32 lg:py-40` |

`<Container>` owns horizontal gutters (`px-6 md:px-10 lg:px-16`) and measure:

| `size` | Max width | Use |
|---|---|---|
| `prose` | 46rem | Long-form text. Never exceed for reading copy. |
| `narrow` | 64rem | FAQ, auth, focused forms. |
| `default` | 80rem | Standard content. |
| `wide` | 90rem | Landing, listing grid, dashboards. |

Grid gutters: `gap-x-8 gap-y-14` for artist cards — the tall vertical gap is
what makes the grid read as editorial rather than as a card wall.

---

## 5. Radius

| Token | Value | Applies to |
|---|---|---|
| `--radius-button` | 14px | Buttons |
| `--radius-input` | 14px | Inputs, textareas, selects, skeletons |
| `--radius-image` | 18px | All photography |
| `--radius-card` | 20px | Cards, popovers, dropdowns |
| `--radius-dialog` | 24px | Modals, bottom sheets |

`rounded-full` is permitted in exactly three places: **avatars**, **filter
chips**, and the **hero search bar** (desktop). Everywhere else it reads as a
generic template.

---

## 6. Elevation

Large blur, low opacity, **tinted burgundy** — a neutral grey shadow over
rose-beige reads as dirt, not depth.

| Token | Use |
|---|---|
| `--shadow-subtle` | Resting buttons. |
| `--shadow-soft` | Resting cards that need lift; hovered buttons. |
| `--shadow-lifted` | Hovered cards, dropdowns, the hero search bar. |
| `--shadow-dialog` | Modals and sheets only. |

Default cards carry **no shadow** — a border does the work. Shadow is a hover
affordance, not a resting state.

---

## 7. Motion

All variants live in `components/ui/motion.tsx`. Import them; do not hand-roll
a transition.

- **Easing:** `cubic-bezier(0.22, 1, 0.36, 1)` (`--ease-out-soft`) for
  everything that enters. Never `linear`, never a spring with bounce.
- **Duration:** 150–350ms for interaction; up to 550ms for scroll reveals.
- **Vocabulary:** `fadeUp` (opacity + 16px rise), `fadeIn`, `scaleIn`
  (0.98 → 1), `stagger` (70ms), `staggerSlow` (110ms, hero only).
- **Reveals fire once.** Content that re-animates each time it re-enters the
  viewport reads as a gimmick.
- **Hover:** cards lift shadow and scale their image to 1.04. Buttons shift
  colour and press to `scale(0.985)`.
- `prefers-reduced-motion` collapses every duration to ~0. Honoured globally.

**Do not animate:** page background, text colour, layout, or anything on a
timer.

### Reveal must fail open — this is a correctness rule, not a style rule

A scroll reveal starts its content at `opacity: 0`. If the trigger never fires,
that content is **permanently invisible** — the DOM is full and the page looks
empty. An `IntersectionObserver` does not deliver entries while the document is
hidden, and can be absent or degraded in other environments.

Two safeguards, both already in `Reveal`:

1. **Anything on-screen at mount shows immediately**, measured with
   `getBoundingClientRect` in a layout effect — no observer needed. Only
   genuinely below-the-fold content waits for scroll.
2. **Primary content passes `immediate`** and opts out of scroll-triggering
   altogether. Search results, dashboard lists and anything a user came to the
   page *for* must never depend on an observer. Scroll reveals are for marketing
   sections.

> **Gotcha — dynamic motion tags.** `Reveal` resolves `motion.div` / `motion.li`
> from a map built **once at module scope**. Reading `motion[as]` inside a render
> can return a fresh component identity each pass, which remounts the subtree and
> resets every child's variant state — the parent animates while the children
> stay pinned at `hidden`, silently killing every stagger.

---

## 8. Components

Location and one-line contract. Composition over duplication — if two things
differ only in padding, they are one component with a variant.

```
components/
  ui/        primitives — button, input, field, badge, card, layout,
             avatar, rating, states, dialog, select, controls, motion
  layout/    navbar, footer, logo, theme-toggle, account-menu
  sections/  landing-page sections + search-bar
  cards/     artist-card
  artist/    filter-panel, artist-browser, profile pieces
  booking/   booking flow
  dashboard/ shared dashboard shell + pieces
```

### Button — `variant × size`
`primary` (burgundy fill) · `secondary` (bordered surface) · `outline` ·
`ghost` · `gold` · `link` · `danger`.
Sizes `sm` (36px) · `md` (44px) · `lg` (52px) · `icon` · `icon-sm`.
`loading` swaps in a spinner and sets `aria-busy`. `asChild` opts out of
loading (Slot forwards to one child, so no spinner can be injected).

### Card — `variant × padding`
`surface` (default, bordered, no shadow) · `soft` · `bare` · `elevated`.
`interactive` adds the hover lift. Padding `none|sm|md|lg`.

### Badge
`neutral · outline · gold · burgundy · success · warning · error · overlay`.
`overlay` is frosted white, for use on top of photography.
**`VerifiedBadge` is the only gold-filled icon+label pairing in the product** —
that exclusivity is what makes it read as a trust mark.

### Rating
`compact` (star + number, for card footers) or `stars` (five glyphs).
`RatingInput` is the review-form picker. Zero ratings render "New", never
"0.0" — a new artist is not a badly-rated one.

### States
`Skeleton`, `ArtistCardSkeleton` (mirrors card geometry so the grid never
reflows), `EmptyState`, `ErrorState`. Every async surface must handle
**pending / error / empty / loaded**. No exceptions.

### Tabs
Underline, never pills. A row of filled pills is the fastest way to make an
interface look like an admin template.

---

## 9. Interaction patterns

- **Focus:** one treatment app-wide — a 2px gold ring at 2px offset. Never
  removed, never restyled per component.
- **The artist card is a link,** not a div with an onClick, so the whole
  surface is keyboard-reachable. Save/Book layer above and stop propagation.
- **Hover-only affordances need a touch fallback.** The card's Book button is
  desktop-only; on touch, tapping the card opens the profile, which carries the
  primary CTA.
- **Filters live in the URL** (`useArtistFilters`), so a search is shareable
  and the back button undoes one filter at a time.
- **Destructive actions** (cancel a booking) require confirmation in a Dialog.
- **Forms:** React Hook Form + Zod, mirroring the backend's Zod schemas. Field
  reserves its message slot so validation doesn't reflow the layout.

---

## 10. Responsive

Desktop-first, then tablet, then mobile. Breakpoints: `sm 640 · md 768 ·
lg 1024 · xl 1280 · 2xl 1536`.

- Artist grid: 1 → 2 (`sm`) → 3 (`xl`) columns.
- Filters: sticky left rail on `lg`+, right-hand drawer below it.
- Navigation: full links on `lg`+, sheet below it.
- **No horizontal scrolling at any width.** Wide content scrolls inside its own
  container.

---

## 11. Images

Real photography only — no illustration, no cartoons. Sources are centralised
in `lib/images.ts`; components never inline an image URL.

Artists without an uploaded portrait fall back to a **deterministic** portrait
keyed off their id, so the same artist always shows the same face. A card that
reshuffles its photo between renders destroys the sense that these are real
people.

`next/image` everywhere, with `sizes` set and `priority` on the first row only.
