"use client";

import * as React from "react";
import { Star } from "lucide-react";
import { cn, formatRating } from "@/lib/utils";

interface RatingProps {
  value: number;
  count?: number;
  /** Compact renders a single star + number — for dense card footers. */
  variant?: "compact" | "stars";
  size?: "sm" | "md";
  className?: string;
}

const STAR_SIZE = { sm: "size-3.5", md: "size-[1.125rem]" } as const;

export function Rating({
  value,
  count,
  variant = "compact",
  size = "sm",
  className,
}: RatingProps) {
  const hasRating = value > 0;
  const label = hasRating
    ? `Rated ${formatRating(value)} out of 5${count !== undefined ? ` from ${count} reviews` : ""}`
    : "No reviews yet";

  if (variant === "compact") {
    return (
      <span
        className={cn(
          "inline-flex items-baseline gap-1.5 text-caption",
          className,
        )}
        aria-label={label}
      >
        <Star
          className={cn(
            STAR_SIZE[size],
            "translate-y-[2px] fill-accent text-accent",
            !hasRating && "fill-none text-foreground-muted",
          )}
          aria-hidden
        />
        {hasRating ? (
          <>
            <span className="tabular font-medium text-foreground">
              {formatRating(value)}
            </span>
            {count !== undefined && (
              <span className="tabular text-foreground-muted">({count})</span>
            )}
          </>
        ) : (
          <span className="text-foreground-muted">New</span>
        )}
      </span>
    );
  }

  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={label}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={cn(
            STAR_SIZE[size],
            i <= Math.round(value)
              ? "fill-accent text-accent"
              : "fill-none text-border-strong",
          )}
          aria-hidden
        />
      ))}
    </span>
  );
}

/** Star picker for the review form. */
export function RatingInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (value: number) => void;
  className?: string;
}) {
  const [hovered, setHovered] = React.useState(0);
  const shown = hovered || value;

  return (
    <div
      className={cn("inline-flex items-center gap-1", className)}
      role="radiogroup"
      aria-label="Rating"
      onMouseLeave={() => setHovered(0)}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          role="radio"
          aria-checked={value === i}
          aria-label={`${i} star${i > 1 ? "s" : ""}`}
          onMouseEnter={() => setHovered(i)}
          onClick={() => onChange(i)}
          className="rounded-md p-1 transition-transform duration-150 ease-[var(--ease-out-soft)] hover:scale-110"
        >
          <Star
            className={cn(
              "size-7 transition-colors duration-150",
              i <= shown
                ? "fill-accent text-accent"
                : "fill-none text-border-strong",
            )}
            aria-hidden
          />
        </button>
      ))}
    </div>
  );
}
