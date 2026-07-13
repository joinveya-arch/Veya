"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { CITIES, SERVICE_TYPES } from "@/lib/constants";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/**
 * The hero search. Built as one continuous pill split by hairlines —
 * three separate bordered inputs sitting in a row is the Bootstrap tell.
 */
export function SearchBar({
  variant = "hero",
  className,
}: {
  /** `hero` floats on photography; `inline` sits on a page background. */
  variant?: "hero" | "inline";
  className?: string;
}) {
  const router = useRouter();
  const [city, setCity] = useState<string>("");
  const [service, setService] = useState<string>("");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (service) params.set("service", service);
    router.push(`/artists${params.size ? `?${params}` : ""}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      role="search"
      aria-label="Find an artist"
      className={cn(
        "flex w-full flex-col gap-2 rounded-[var(--radius-card)] p-2 md:flex-row md:items-center md:rounded-full md:pl-2",
        variant === "hero"
          ? "bg-white/95 shadow-[var(--shadow-lifted)] backdrop-blur-xl"
          : "border border-border bg-surface shadow-[var(--shadow-soft)]",
        className,
      )}
    >
      <SearchField label="Where" className="md:pl-4">
        <Select value={city} onValueChange={setCity}>
          <SelectTrigger
            aria-label="City"
            className="h-auto border-0 bg-transparent p-0 text-body font-medium text-burgundy-900 hover:border-0 focus:ring-0 dark:text-burgundy-900"
          >
            <SelectValue placeholder="Select a city" />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((c) => (
              <SelectItem key={c} value={c}>
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchField>

      <span
        className="hidden h-10 w-px shrink-0 bg-black/[0.07] md:block"
        aria-hidden
      />

      <SearchField label="What">
        <Select value={service} onValueChange={setService}>
          <SelectTrigger
            aria-label="Service type"
            className="h-auto border-0 bg-transparent p-0 text-body font-medium text-burgundy-900 hover:border-0 focus:ring-0 dark:text-burgundy-900"
          >
            <SelectValue placeholder="Any occasion" />
          </SelectTrigger>
          <SelectContent>
            {SERVICE_TYPES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchField>

      <Button
        type="submit"
        size="lg"
        className="shrink-0 md:rounded-full md:px-8"
      >
        <Search aria-hidden />
        Search
      </Button>
    </form>
  );
}

function SearchField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("min-w-0 flex-1 px-4 py-2.5", className)}>
      <p className="text-overline font-medium uppercase text-burgundy-900/45">
        {label}
      </p>
      <div className="mt-0.5">{children}</div>
    </div>
  );
}
