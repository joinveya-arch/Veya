import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const cardVariants = cva(
  "rounded-[var(--radius-card)] transition-[box-shadow,border-color,transform] duration-300 ease-[var(--ease-out-soft)]",
  {
    variants: {
      variant: {
        /* Default: the quiet card. Border does the work, not shadow. */
        surface: "bg-surface border border-border",
        soft: "bg-surface-soft border border-border",
        /* No chrome at all — for content that groups by whitespace alone. */
        bare: "bg-transparent",
        elevated: "bg-surface border border-border shadow-[var(--shadow-soft)]",
      },
      interactive: {
        true: "hover:border-border-strong hover:shadow-[var(--shadow-lifted)]",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: { variant: "surface", padding: "md" },
  },
);

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, interactive, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        cardVariants({ variant, interactive, padding }),
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

export function CardHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-1.5", className)} {...props} />;
}

export function CardTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("font-display text-h4 font-medium text-foreground", className)}
      {...props}
    />
  );
}

export function CardDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-caption text-foreground-secondary", className)}
      {...props}
    />
  );
}
