"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  /** Rendered inside the field, left of the caret. */
  icon?: React.ReactNode;
  invalid?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, icon, invalid, ...props }, ref) => (
    <div className="relative">
      {icon && (
        <span
          className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-foreground-muted [&_svg]:size-[1.125rem]"
          aria-hidden
        >
          {icon}
        </span>
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-12 w-full rounded-[var(--radius-input)] border bg-surface px-4 text-body text-foreground",
          "border-border placeholder:text-foreground-muted",
          "transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out-soft)]",
          "hover:border-border-strong",
          "focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15",
          "disabled:cursor-not-allowed disabled:opacity-50",
          icon && "pl-11",
          invalid && "border-error focus:border-error focus:ring-error/15",
          className,
        )}
        {...props}
      />
    </div>
  ),
);
Input.displayName = "Input";

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }
>(({ className, invalid, ...props }, ref) => (
  <textarea
    ref={ref}
    aria-invalid={invalid || undefined}
    className={cn(
      "min-h-[7.5rem] w-full resize-y rounded-[var(--radius-input)] border bg-surface px-4 py-3",
      "text-body leading-relaxed text-foreground border-border placeholder:text-foreground-muted",
      "transition-[border-color,box-shadow] duration-200 ease-[var(--ease-out-soft)]",
      "hover:border-border-strong",
      "focus:border-accent focus:outline-none focus:ring-4 focus:ring-accent/15",
      "disabled:cursor-not-allowed disabled:opacity-50",
      invalid && "border-error focus:border-error focus:ring-error/15",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";
