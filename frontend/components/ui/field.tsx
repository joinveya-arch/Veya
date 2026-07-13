"use client";

import * as React from "react";
import * as LabelPrimitive from "@radix-ui/react-label";
import { cn } from "@/lib/utils";

export const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    className={cn(
      "text-caption font-medium text-foreground-secondary",
      className,
    )}
    {...props}
  />
));
Label.displayName = "Label";

interface FieldProps {
  label?: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  className?: string;
  children: React.ReactNode;
}

/**
 * Label + control + message, with the message slot reserved so a form
 * doesn't reflow the moment validation fails.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: FieldProps) {
  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <div className="flex items-baseline justify-between gap-4">
          <Label htmlFor={htmlFor}>
            {label}
            {required && (
              <span className="ml-1 text-accent" aria-hidden>
                *
              </span>
            )}
          </Label>
          {hint && !error && (
            <span className="text-[0.75rem] text-foreground-muted">{hint}</span>
          )}
        </div>
      )}
      {children}
      {error && (
        <p role="alert" className="text-caption text-error">
          {error}
        </p>
      )}
    </div>
  );
}
