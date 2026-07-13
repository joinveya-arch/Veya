import * as React from "react";
import { AlertCircle, RotateCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./button";

/* ------------------------------------------------------------- Skeleton */

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-hidden
      className={cn(
        "animate-pulse rounded-[var(--radius-input)] bg-surface-sunken",
        className,
      )}
      {...props}
    />
  );
}

/** Matches ArtistCard's geometry so the grid never reflows on load. */
export function ArtistCardSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-[4/5] w-full rounded-[var(--radius-image)]" />
      <div className="space-y-2.5">
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}

export function ArtistGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 gap-x-8 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <ArtistCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ----------------------------------------------------------- EmptyState */

interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center px-6 py-24 text-center",
        className,
      )}
    >
      {icon && (
        <div
          className="mb-6 flex size-14 items-center justify-center rounded-full bg-surface-sunken text-foreground-muted [&_svg]:size-6"
          aria-hidden
        >
          {icon}
        </div>
      )}
      <h3 className="font-display text-h4 font-medium">{title}</h3>
      {description && (
        <p className="mt-3 max-w-[32rem] text-body text-foreground-secondary">
          {description}
        </p>
      )}
      {action && <div className="mt-8">{action}</div>}
    </div>
  );
}

/* ----------------------------------------------------------- ErrorState */

export function ErrorState({
  title = "Something went wrong",
  description = "We couldn't load this just now. Please try again.",
  onRetry,
  className,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <EmptyState
      className={className}
      icon={<AlertCircle />}
      title={title}
      description={description}
      action={
        onRetry && (
          <Button variant="secondary" onClick={onRetry}>
            <RotateCw aria-hidden />
            Try again
          </Button>
        )
      }
    />
  );
}
