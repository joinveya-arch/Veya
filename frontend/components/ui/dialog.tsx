"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Dialog = DialogPrimitive.Root;
export const DialogTrigger = DialogPrimitive.Trigger;
export const DialogClose = DialogPrimitive.Close;

const Overlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      // Warm wine scrim, not black — a neutral overlay greys out the
      // whole palette and cheapens the surface underneath.
      "fixed inset-0 z-50 bg-burgundy-900/35 backdrop-blur-[3px]",
      "data-[state=open]:animate-in data-[state=open]:fade-in-0",
      "data-[state=closed]:animate-out data-[state=closed]:fade-out-0",
      className,
    )}
    {...props}
  />
));
Overlay.displayName = "DialogOverlay";

/* ---------------------------------------------------------------- Modal */

export const DialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    hideClose?: boolean;
  }
>(({ className, children, hideClose, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <Overlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed left-1/2 top-1/2 z-50 w-full max-w-[32rem] -translate-x-1/2 -translate-y-1/2",
        "rounded-[var(--radius-dialog)] border border-border bg-surface p-8",
        "shadow-[var(--shadow-dialog)] focus:outline-none",
        "duration-200 ease-[var(--ease-out-soft)]",
        "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-[0.98]",
        "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-[0.98]",
        className,
      )}
      {...props}
    >
      {children}
      {!hideClose && (
        <DialogPrimitive.Close
          className="absolute right-6 top-6 rounded-full p-1.5 text-foreground-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
          aria-label="Close"
        >
          <X className="size-[1.125rem]" aria-hidden />
        </DialogPrimitive.Close>
      )}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
DialogContent.displayName = "DialogContent";

/* -------------------------------------------------- Sheet (edge drawer) */

/**
 * Same primitive as Dialog, anchored to an edge. Used for the mobile
 * filter drawer and the mobile nav.
 */
export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content> & {
    side?: "left" | "right" | "bottom";
  }
>(({ className, children, side = "right", ...props }, ref) => (
  <DialogPrimitive.Portal>
    <Overlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed z-50 flex flex-col bg-surface shadow-[var(--shadow-dialog)] focus:outline-none",
        "duration-300 ease-[var(--ease-out-soft)] data-[state=open]:animate-in data-[state=closed]:animate-out",
        side === "right" &&
          "inset-y-0 right-0 h-full w-full max-w-[26rem] border-l border-border data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
        side === "left" &&
          "inset-y-0 left-0 h-full w-full max-w-[26rem] border-r border-border data-[state=open]:slide-in-from-left data-[state=closed]:slide-out-to-left",
        side === "bottom" &&
          "inset-x-0 bottom-0 max-h-[88vh] rounded-t-[var(--radius-dialog)] border-t border-border data-[state=open]:slide-in-from-bottom data-[state=closed]:slide-out-to-bottom",
        className,
      )}
      {...props}
    >
      {children}
      <DialogPrimitive.Close
        className="absolute right-5 top-5 rounded-full p-1.5 text-foreground-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
        aria-label="Close"
      >
        <X className="size-[1.125rem]" aria-hidden />
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
));
SheetContent.displayName = "SheetContent";

export const Sheet = DialogPrimitive.Root;
export const SheetTrigger = DialogPrimitive.Trigger;
export const SheetClose = DialogPrimitive.Close;

/* ------------------------------------------------------- Shared pieces */

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("space-y-2 pr-10", className)} {...props} />;
}

export const DialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn("font-display text-h4 font-medium", className)}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

export const DialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-body text-foreground-secondary", className)}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

export function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col-reverse gap-3 sm:flex-row sm:justify-end", className)}
      {...props}
    />
  );
}
