"use client";

import { Info, UsersRound } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { ADMIN_NAV } from "@/components/dashboard/nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Avatar } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";
import { useDerivedUsers, type DerivedUser } from "@/hooks/use-admin";

export default function AdminUsersPage() {
  return (
    <DashboardShell
      role="ADMIN"
      nav={ADMIN_NAV}
      title="Users"
      description="The customers who have booked on VEYA, with how much they've booked."
    >
      <UsersAdmin />
    </DashboardShell>
  );
}

function UsersAdmin() {
  /**
   * There is no `GET /admin/users`. Rather than fabricate an endpoint — or,
   * worse, fabricate users — this list is derived from the distinct
   * customers who appear in `GET /admin/bookings`. The note below says so
   * plainly, because a partial list presented as a complete one is a bug in
   * the product, not just in the code.
   */
  const { users, isPending, isError, refetch, bookingCount } = useDerivedUsers();

  return (
    <div className="space-y-10">
      <Card variant="surface" padding="md" className="flex gap-4">
        <Info
          className="mt-0.5 size-[1.125rem] shrink-0 text-foreground-muted"
          aria-hidden
        />
        <div className="space-y-1.5">
          <p className="text-caption font-medium text-foreground">
            Derived from bookings
          </p>
          <p className="max-w-[46rem] text-caption text-foreground-secondary">
            The API has no dedicated users endpoint yet, so this view is built
            from the customers attached to bookings. Anyone who has registered
            but never booked — and every artist and admin account — is not shown
            here. A <code className="tabular text-foreground">GET /admin/users</code>{" "}
            endpoint would make this a complete roster.
          </p>
        </div>
      </Card>

      {isPending ? (
        <UsersSkeleton />
      ) : isError ? (
        <ErrorState
          description="We couldn't load the bookings this list is derived from. Please try again."
          onRetry={() => void refetch()}
        />
      ) : users.length === 0 ? (
        <EmptyState
          icon={<UsersRound />}
          title="No customers to show"
          description="No bookings have been made yet, so there are no customers to derive. They'll appear here after the first booking."
        />
      ) : (
        <div className="space-y-6">
          <p className="text-caption text-foreground-secondary">
            <span className="tabular font-medium text-foreground">
              {users.length}
            </span>{" "}
            {users.length === 1 ? "customer" : "customers"} across{" "}
            <span className="tabular font-medium text-foreground">
              {bookingCount}
            </span>{" "}
            {bookingCount === 1 ? "booking" : "bookings"}
          </p>

          <Reveal variants={stagger} as="ul" immediate className="border-t border-border">
            {users.map((user) => (
              <RevealItem as="li" key={user.id}>
                <UserRow user={user} />
              </RevealItem>
            ))}
          </Reveal>
        </div>
      )}
    </div>
  );
}

function UserRow({ user }: { user: DerivedUser }) {
  return (
    <article className="flex flex-col gap-4 border-b border-border py-5 sm:flex-row sm:items-center sm:gap-6">
      <Avatar name={user.name} size="md" />

      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-foreground">
          {user.name}
        </p>
        <p className="truncate text-caption text-foreground-muted">
          {user.email}
        </p>
      </div>

      <dl className="flex shrink-0 items-center gap-8 text-caption sm:justify-end">
        <div className="sm:text-right">
          <dt className="text-foreground-muted">Bookings</dt>
          <dd className="tabular mt-0.5 font-medium text-foreground">
            {user.bookingCount}
          </dd>
        </div>
        <div className="sm:text-right">
          <dt className="text-foreground-muted">Latest</dt>
          <dd className="tabular mt-0.5 font-medium text-foreground">
            {formatDate(user.latestBooking)}
          </dd>
        </div>
      </dl>
    </article>
  );
}

function UsersSkeleton() {
  return (
    <div className="space-y-6">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-6 border-b border-border pb-5">
          <Skeleton className="size-10 shrink-0 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-56" />
          </div>
          <Skeleton className="h-9 w-32" />
        </div>
      ))}
    </div>
  );
}
