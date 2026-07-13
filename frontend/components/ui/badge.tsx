import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 whitespace-nowrap font-medium [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        neutral: "bg-surface-sunken text-foreground-secondary",
        outline: "border border-border text-foreground-secondary",
        gold: "bg-accent-soft text-accent-foreground dark:text-accent",
        burgundy: "bg-primary text-primary-foreground",
        success: "bg-success-soft text-success",
        warning: "bg-warning-soft text-warning",
        error: "bg-error-soft text-error",
        /* Frosted — sits on top of photography. */
        overlay:
          "bg-white/92 text-burgundy-700 backdrop-blur-md shadow-[var(--shadow-subtle)]",
      },
      size: {
        sm: "h-6 rounded-full px-2.5 text-[0.6875rem] [&_svg]:size-3",
        md: "h-7 rounded-full px-3 text-caption [&_svg]:size-3.5",
      },
    },
    defaultVariants: { variant: "neutral", size: "md" },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant, size }), className)} {...props} />
  );
}

/**
 * The single trust signal on the platform. Deliberately the only place a
 * gold fill is paired with an icon, so it never competes for meaning.
 */
export function VerifiedBadge({
  size = "md",
  overlay,
  className,
}: {
  size?: "sm" | "md";
  overlay?: boolean;
  className?: string;
}) {
  return (
    <Badge
      variant={overlay ? "overlay" : "gold"}
      size={size}
      className={className}
    >
      <BadgeCheck aria-hidden />
      Verified
    </Badge>
  );
}
