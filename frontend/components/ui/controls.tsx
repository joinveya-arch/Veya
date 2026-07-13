"use client";

import * as React from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import * as SliderPrimitive from "@radix-ui/react-slider";
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import * as TabsPrimitive from "@radix-ui/react-tabs";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

/* -------------------------------------------------------------- Checkbox */

export const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, ...props }, ref) => (
  <CheckboxPrimitive.Root
    ref={ref}
    className={cn(
      "peer size-5 shrink-0 rounded-[6px] border border-border-strong bg-surface",
      "transition-colors duration-150 ease-[var(--ease-out-soft)]",
      "hover:border-primary/50",
      "data-[state=checked]:border-primary data-[state=checked]:bg-primary",
      "data-[state=checked]:text-primary-foreground",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  >
    <CheckboxPrimitive.Indicator className="flex items-center justify-center">
      <Check className="size-3.5" strokeWidth={3} aria-hidden />
    </CheckboxPrimitive.Indicator>
  </CheckboxPrimitive.Root>
));
Checkbox.displayName = "Checkbox";

/* ---------------------------------------------------------------- Slider */

export const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={cn(
      "relative flex w-full touch-none select-none items-center py-2",
      className,
    )}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-surface-sunken">
      <SliderPrimitive.Range className="absolute h-full bg-primary" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb
      className={cn(
        "block size-5 rounded-full border border-border-strong bg-surface shadow-[var(--shadow-soft)]",
        "transition-transform duration-150 ease-[var(--ease-out-soft)]",
        "hover:scale-110 focus-visible:scale-110",
        "disabled:pointer-events-none",
      )}
      aria-label="Price"
    />
  </SliderPrimitive.Root>
));
Slider.displayName = "Slider";

/* ------------------------------------------------------------- Separator */

export const Separator = React.forwardRef<
  React.ElementRef<typeof SeparatorPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SeparatorPrimitive.Root>
>(({ className, orientation = "horizontal", ...props }, ref) => (
  <SeparatorPrimitive.Root
    ref={ref}
    decorative
    orientation={orientation}
    className={cn(
      "shrink-0 bg-border",
      orientation === "horizontal" ? "h-px w-full" : "h-full w-px",
      className,
    )}
    {...props}
  />
));
Separator.displayName = "Separator";

/* ------------------------------------------------------------------ Tabs */

export const Tabs = TabsPrimitive.Root;

/**
 * Underline tabs, not pill tabs. A row of filled pills is the single
 * fastest way to make an interface look like an admin template.
 */
export const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "scrollbar-none flex items-center gap-8 overflow-x-auto border-b border-border",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

export const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      "relative whitespace-nowrap pb-4 pt-2 text-body font-medium text-foreground-muted",
      "transition-colors duration-200 ease-[var(--ease-out-soft)] hover:text-foreground",
      "data-[state=active]:text-foreground",
      // The rule sits on the list's border, so it must overhang by 1px.
      "after:absolute after:inset-x-0 after:-bottom-px after:h-[2px] after:scale-x-0 after:bg-primary",
      "after:transition-transform after:duration-300 after:ease-[var(--ease-out-soft)]",
      "data-[state=active]:after:scale-x-100",
      "dark:data-[state=active]:after:bg-accent",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

export const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "focus-visible:outline-none data-[state=active]:animate-in data-[state=active]:fade-in-0",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";
