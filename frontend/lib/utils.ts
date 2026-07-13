import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * tailwind-merge resolves `text-*` against its own idea of the theme. It
 * has no way to know our custom scale (`text-body`, `text-h4`, …) is a set
 * of FONT SIZES, so it files them under text-COLOR — and then a size class
 * silently wins over a colour class in the same merge, wiping the colour.
 *
 * That bit us for real: `<Button variant="primary" size="md">` composes
 * `text-primary-foreground` (colour) with `text-body` (size), and the
 * button rendered near-black text on a burgundy fill.
 *
 * Declaring the scale as font-size keeps the two groups distinct.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        {
          text: [
            "display",
            "h1",
            "h2",
            "h3",
            "h4",
            "body",
            "caption",
            "overline",
          ],
        },
      ],
    },
  },
});

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** ₹ with no decimals — Indian grouping (1,20,000 not 120,000). */
export function formatPrice(value: number | string): string {
  const n = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(n)) return "—";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
}

/** "1h 30m" from a minute count. */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h} hr` : `${h} hr ${m} min`;
}

export function formatDate(
  date: string | Date,
  opts: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "short",
    year: "numeric",
  },
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", opts).format(d);
}

/** Ratings render to exactly one decimal so cards never jitter. */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}

export function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/** Calendar-day key, timezone-stable, matching the API's date slots. */
export function toDateKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
