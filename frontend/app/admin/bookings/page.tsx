"use client";

import * as React from "react";
import { CalendarX } from "lucide-react";
import { BOOKING_STATUS_META } from "@/lib/constants";
import { ADMIN_NAV } from "@/components/dashboard/nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { BookingRow } from "@/components/cards/booking-row";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/controls";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";
import { useAdminBookings } from "@/hooks/use-admin";
import type { BookingStatus } from "@/types";

type Filter = "ALL" | BookingStatus;

const FILTERS: Filter[] = [
  "ALL",
  "PENDING",
  "CONFIRMED",
  "COMPLETED",
  "CANCELLED",
];

const labelFor = (filter: Filter) =>
  filter === "ALL" ? "All" : BOOKING_STATUS_META[filter].label;

export default function AdminBookingsPage() {
  return (
    <DashboardShell
      role="ADMIN"
      nav={ADMIN_NAV}
      title="Bookings"
      description="Every booking made on VEYA. Admins observe here — a booking's status belongs to the customer and the artist who agreed it."
    >
      <BookingsAdmin />
    </DashboardShell>
  );
}

function BookingsAdmin() {
  const { data, isPending, isError, refetch } = useAdminBookings();
  const [filter, setFilter] = React.useState<Filter>("ALL");

  if (isPending) return <BookingsSkeleton />;
  if (isError) {
    return (
      <ErrorState
        description="We couldn't load the platform's bookings. Please try again."
        onRetry={() => void refetch()}
      />
    );
  }

  const bookings = data;

  const countFor = (filter: Filter) =>
    filter === "ALL"
      ? bookings.length
      : bookings.filter((booking) => booking.bookingStatus === filter).length;

  const listFor = (filter: Filter) =>
    filter === "ALL"
      ? bookings
      : bookings.filter((booking) => booking.bookingStatus === filter);

  return (
    <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
      <TabsList aria-label="Filter bookings by status">
        {FILTERS.map((value) => (
          <TabsTrigger key={value} value={value}>
            {labelFor(value)}
            <span className="tabular ml-2 text-foreground-muted">
              {countFor(value)}
            </span>
          </TabsTrigger>
        ))}
      </TabsList>

      {FILTERS.map((value) => {
        const list = listFor(value);
        return (
          <TabsContent key={value} value={value} className="mt-6">
            {list.length === 0 ? (
              <EmptyState
                icon={<CalendarX />}
                title={
                  value === "ALL"
                    ? "No bookings yet"
                    : `No ${labelFor(value).toLowerCase()} bookings`
                }
                description={
                  value === "ALL"
                    ? "Bookings will appear here the moment a customer books an artist."
                    : "Nothing sits in this state right now. Try another filter."
                }
              />
            ) : (
              /* No actions: there is no admin endpoint to change a booking's
                 status, and inventing one in the UI would be a lie. */
              <Reveal variants={stagger} as="ul" immediate>
                {list.map((booking) => (
                  <RevealItem as="li" key={booking.id}>
                    <BookingRow booking={booking} perspective="admin" />
                  </RevealItem>
                ))}
              </Reveal>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}

function BookingsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-full max-w-md" />
      <div className="space-y-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-24 w-full rounded-[var(--radius-card)]"
          />
        ))}
      </div>
    </div>
  );
}
