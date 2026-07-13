"use client";

import { DayPicker } from "react-day-picker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * react-day-picker, restyled to the VEYA system. Availability is expressed
 * by *disabling* everything the artist hasn't opened — an unavailable day is
 * simply not selectable, rather than being marked with a red X. The calendar
 * should read as an invitation, not as a list of rejections.
 */
export function Calendar({
  className,
  ...props
}: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      showOutsideDays={false}
      className={cn("w-full", className)}
      classNames={{
        // `nav` is absolutely positioned over the caption row, so `months`
        // must establish the containing block — otherwise the chevrons escape
        // and anchor to whatever card happens to be positioned upstream.
        months: "relative flex flex-col",
        month: "w-full space-y-5",
        month_caption: "flex items-center justify-center h-9",
        caption_label: "font-display text-body font-medium text-foreground",
        nav: "flex items-center justify-between absolute inset-x-0 top-0 h-9 px-1",
        button_previous: cn(
          "inline-flex size-9 items-center justify-center rounded-full text-foreground-secondary",
          "transition-colors hover:bg-surface-sunken hover:text-foreground",
          "disabled:pointer-events-none disabled:opacity-30",
        ),
        button_next: cn(
          "inline-flex size-9 items-center justify-center rounded-full text-foreground-secondary",
          "transition-colors hover:bg-surface-sunken hover:text-foreground",
          "disabled:pointer-events-none disabled:opacity-30",
        ),
        month_grid: "w-full border-collapse",
        weekdays: "flex w-full",
        weekday:
          "flex-1 text-[0.6875rem] font-medium uppercase tracking-[0.1em] text-foreground-muted pb-2",
        week: "flex w-full mt-1",
        day: "flex-1 p-0.5",
        day_button: cn(
          "tabular flex size-full aspect-square items-center justify-center rounded-[10px]",
          "text-caption text-foreground transition-colors duration-150 ease-[var(--ease-out-soft)]",
          "hover:bg-surface-sunken",
          // Available-but-unselected days get a faint gold dot via `available`.
          "disabled:pointer-events-none disabled:text-foreground-muted/40 disabled:line-through",
        ),
        selected:
          "[&>button]:bg-primary [&>button]:text-primary-foreground [&>button]:font-medium [&>button]:hover:bg-primary-hover",
        today: "[&>button]:ring-1 [&>button]:ring-inset [&>button]:ring-accent",
        outside: "invisible",
        hidden: "invisible",
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === "left" ? (
            <ChevronLeft className="size-4" aria-hidden />
          ) : (
            <ChevronRight className="size-4" aria-hidden />
          ),
      }}
      {...props}
    />
  );
}
