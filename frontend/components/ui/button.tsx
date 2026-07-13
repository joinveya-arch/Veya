"use client";

import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  // Motion lives on transform + colour only. `active:scale` gives the
  // press a physical quality without a keyframe.
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap select-none",
    "font-sans font-medium rounded-[var(--radius-button)]",
    "transition-[background-color,color,box-shadow,transform,border-color] duration-200",
    "ease-[var(--ease-out-soft)] active:scale-[0.985]",
    "disabled:pointer-events-none disabled:opacity-45",
    "[&_svg]:shrink-0",
  ],
  {
    variants: {
      variant: {
        primary:
          "bg-primary text-primary-foreground shadow-[var(--shadow-subtle)] hover:bg-primary-hover hover:shadow-[var(--shadow-soft)]",
        secondary:
          "bg-surface text-foreground border border-border hover:border-border-strong hover:bg-surface-soft",
        outline:
          "border border-primary/25 text-primary dark:text-foreground dark:border-border-strong hover:bg-primary/[0.04] dark:hover:bg-surface-soft",
        ghost:
          "text-foreground-secondary hover:text-foreground hover:bg-surface-sunken",
        gold: "bg-accent text-accent-foreground shadow-[var(--shadow-subtle)] hover:brightness-[1.06] hover:shadow-[var(--shadow-soft)]",
        link: "text-foreground underline-offset-4 decoration-border-strong underline hover:decoration-accent",
        danger: "bg-error text-white hover:brightness-110",
      },
      size: {
        sm: "h-9 px-4 text-[0.875rem] [&_svg]:size-4",
        md: "h-11 px-6 text-body [&_svg]:size-[1.125rem]",
        lg: "h-[3.25rem] px-8 text-body [&_svg]:size-5",
        icon: "size-11 [&_svg]:size-[1.125rem]",
        "icon-sm": "size-9 [&_svg]:size-4",
      },
      full: { true: "w-full" },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  loading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { className, variant, size, full, asChild, loading, children, disabled, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";

    // Slot forwards to a single child, so a spinner can't be injected
    // alongside it — asChild buttons opt out of the loading affordance.
    if (asChild) {
      return (
        <Comp
          ref={ref}
          className={cn(buttonVariants({ variant, size, full }), className)}
          {...props}
        >
          {children}
        </Comp>
      );
    }

    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size, full }), className)}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {loading && <Loader2 className="animate-spin" aria-hidden />}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";

export { buttonVariants };
