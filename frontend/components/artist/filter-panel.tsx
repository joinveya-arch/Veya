"use client";

import { X } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import {
  CITIES,
  EXPERIENCE_OPTIONS,
  PRICE_MAX,
  PRICE_STEP,
  RATING_OPTIONS,
} from "@/lib/constants";
import { Button } from "@/components/ui/button";
import { Checkbox, Separator, Slider } from "@/components/ui/controls";
import { Label } from "@/components/ui/field";
import type { ArtistFilters } from "@/types";

export interface FilterPanelProps {
  filters: ArtistFilters;
  onChange: (patch: Partial<ArtistFilters>) => void;
  onReset: () => void;
  activeCount: number;
}

/**
 * Shared by the desktop sidebar and the mobile drawer — same component,
 * two containers. Groups are separated by hairlines and generous space
 * rather than by boxing each one in its own card.
 */
export function FilterPanel({
  filters,
  onChange,
  onReset,
  activeCount,
}: FilterPanelProps) {
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="font-display text-h4 font-medium">Filters</h2>
        {activeCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onReset}
            className="-mr-2 text-caption"
          >
            <X aria-hidden />
            Clear ({activeCount})
          </Button>
        )}
      </div>

      <FilterGroup label="City">
        <div className="flex flex-wrap gap-2">
          {CITIES.map((city) => {
            const active = filters.city === city;
            return (
              <Chip
                key={city}
                active={active}
                onClick={() => onChange({ city: active ? undefined : city })}
              >
                {city}
              </Chip>
            );
          })}
        </div>
      </FilterGroup>

      <Separator />

      <FilterGroup
        label="Budget"
        hint={
          filters.maxPrice
            ? `Up to ${formatPrice(filters.maxPrice)}`
            : "Any budget"
        }
      >
        <Slider
          value={[filters.maxPrice ?? PRICE_MAX]}
          min={PRICE_STEP}
          max={PRICE_MAX}
          step={PRICE_STEP}
          onValueChange={([value]) =>
            // Sliding to the ceiling means "no ceiling", not "≤ ₹50,000".
            onChange({ maxPrice: value >= PRICE_MAX ? undefined : value })
          }
        />
        <div className="flex justify-between text-caption text-foreground-muted">
          <span className="tabular">{formatPrice(PRICE_STEP)}</span>
          <span className="tabular">{formatPrice(PRICE_MAX)}+</span>
        </div>
      </FilterGroup>

      <Separator />

      <FilterGroup label="Experience">
        <div className="flex flex-wrap gap-2">
          {EXPERIENCE_OPTIONS.map((option) => {
            const active = (filters.minExperience ?? 0) === option.value;
            return (
              <Chip
                key={option.value}
                active={active}
                onClick={() =>
                  onChange({
                    minExperience: option.value === 0 ? undefined : option.value,
                  })
                }
              >
                {option.label}
              </Chip>
            );
          })}
        </div>
      </FilterGroup>

      <Separator />

      <FilterGroup label="Rating">
        <div className="flex flex-wrap gap-2">
          {RATING_OPTIONS.map((option) => {
            const active = (filters.minRating ?? 0) === option.value;
            return (
              <Chip
                key={option.value}
                active={active}
                onClick={() =>
                  onChange({
                    minRating: option.value === 0 ? undefined : option.value,
                  })
                }
              >
                {option.label}
              </Chip>
            );
          })}
        </div>
      </FilterGroup>

      <Separator />

      <label className="flex cursor-pointer items-center gap-3">
        <Checkbox
          checked={filters.verifiedOnly ?? false}
          onCheckedChange={(checked) =>
            onChange({ verifiedOnly: checked === true ? true : undefined })
          }
        />
        <span className="text-body text-foreground">Verified artists only</span>
      </label>
    </div>
  );
}

function FilterGroup({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-baseline justify-between">
        <Label className="text-overline uppercase text-foreground-muted">
          {label}
        </Label>
        {hint && (
          <span className="tabular text-caption text-foreground-secondary">
            {hint}
          </span>
        )}
      </div>
      {children}
    </div>
  );
}

/**
 * Selection is shown with a burgundy fill, not a checkbox. Chips are the
 * one place rounded-full is used in the app — they read as tokens, and a
 * squared chip reads as a button the user is meant to press once.
 */
function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "h-9 rounded-full border px-4 text-caption transition-all duration-200 ease-[var(--ease-out-soft)]",
        active
          ? "border-primary bg-primary text-primary-foreground"
          : "border-border bg-surface text-foreground-secondary hover:border-border-strong hover:text-foreground",
      )}
    >
      {children}
    </button>
  );
}
