import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------ Container */

const containerVariants = cva("mx-auto w-full", {
  variants: {
    size: {
      /* Editorial measure — long-form text should never exceed this. */
      prose: "max-w-[46rem]",
      narrow: "max-w-[64rem]",
      default: "max-w-[80rem]",
      wide: "max-w-[90rem]",
      full: "max-w-none",
    },
    gutter: {
      true: "px-6 md:px-10 lg:px-16",
      false: "",
    },
  },
  defaultVariants: { size: "default", gutter: true },
});

export interface ContainerProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof containerVariants> {}

export function Container({ className, size, gutter, ...props }: ContainerProps) {
  return (
    <div className={cn(containerVariants({ size, gutter }), className)} {...props} />
  );
}

/* -------------------------------------------------------------- Section */

const sectionVariants = cva("w-full", {
  variants: {
    /* Vertical rhythm is a closed set. Sections never choose their own
       padding — this is what keeps the page breathing consistently. */
    spacing: {
      sm: "py-16 md:py-20",
      md: "py-20 md:py-28",
      lg: "py-24 md:py-32 lg:py-40",
    },
    tone: {
      default: "",
      surface: "bg-surface",
      soft: "bg-surface-soft",
      sunken: "bg-surface-sunken",
      ink: "bg-burgundy-700 text-white dark:bg-surface-sunken",
    },
  },
  defaultVariants: { spacing: "md", tone: "default" },
});

export interface SectionProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof sectionVariants> {}

export function Section({ className, spacing, tone, ...props }: SectionProps) {
  return (
    <section
      className={cn(sectionVariants({ spacing, tone }), className)}
      {...props}
    />
  );
}

/* ---------------------------------------------------------- SectionHead */

interface SectionHeadProps {
  /** Small tracked-out label. Carries hierarchy so headings stay light. */
  overline?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "left" | "center";
  /** Trailing slot — a "View all" link, typically. */
  action?: React.ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}

export function SectionHead({
  overline,
  title,
  description,
  align = "left",
  action,
  className,
  as: Heading = "h2",
}: SectionHeadProps) {
  const centered = align === "center";

  return (
    <div
      className={cn(
        "flex gap-8",
        centered
          ? "flex-col items-center text-center"
          : "flex-col items-start md:flex-row md:items-end md:justify-between",
        className,
      )}
    >
      <div className={cn("space-y-4", centered && "max-w-[42rem]")}>
        {overline && (
          <p className="text-overline font-medium uppercase text-accent">
            {overline}
          </p>
        )}
        <Heading className="text-h2">{title}</Heading>
        {description && (
          <p
            className={cn(
              "text-body text-foreground-secondary",
              !centered && "max-w-[36rem]",
            )}
          >
            {description}
          </p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
