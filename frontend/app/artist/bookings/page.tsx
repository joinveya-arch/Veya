"use client";

import { useMemo, useState } from "react";
import { CalendarDays } from "lucide-react";
import { formatDate } from "@/lib/utils";
import { useMyBookings, useUpdateBookingStatus } from "@/hooks/use-bookings";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ARTIST_NAV } from "@/components/dashboard/nav";
import { BookingRow } from "@/components/cards/booking-row";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/controls";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Booking } from "@/types";

type TabKey = "requests" | "upcoming" | "past" | "cancelled";

const TABS: { key: TabKey; label: string }[] = [
  { key: "requests", label: "Requests" },
  { key: "upcoming", label: "Upcoming" },
  { key: "past", label: "Past" },
  { key: "cancelled", label: "Cancelled" },
];

const EMPTY: Record<TabKey, { title: string; description: string }> = {
  requests: {
    title: "No new requests",
    description:
      "When a client requests a date, it lands here first. Accepting confirms the booking for them.",
  },
  upcoming: {
    title: "Nothing confirmed yet",
    description:
      "Bookings you accept appear here until the day has passed.",
  },
  past: {
    title: "No completed bookings",
    description:
      "Once a confirmed date has passed, mark it completed and your client can leave a review.",
  },
  cancelled: {
    title: "Nothing cancelled",
    description: "Declined and cancelled bookings are kept here for your records.",
  },
};

export default function ArtistBookingsPage() {
  const { data, isPending, isError, refetch } = useMyBookings();
  const [tab, setTab] = useState<TabKey>("requests");
  const [declining, setDeclining] = useState<Booking | null>(null);

  const updateStatus = useUpdateBookingStatus();

  const grouped = useMemo(() => {
    const now = Date.now();
    const all = data ?? [];
    const byDate = (a: Booking, b: Booking) =>
      new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();

    return {
      requests: all.filter((b) => b.bookingStatus === "PENDING").sort(byDate),
      upcoming: all
        .filter(
          (b) =>
            b.bookingStatus === "CONFIRMED" &&
            new Date(b.bookingDate).getTime() >= now,
        )
        .sort(byDate),
      // A confirmed date that has passed still needs closing out, so it belongs
      // with the history rather than hiding in "upcoming".
      past: all
        .filter(
          (b) =>
            b.bookingStatus === "COMPLETED" ||
            (b.bookingStatus === "CONFIRMED" &&
              new Date(b.bookingDate).getTime() < now),
        )
        .sort((a, b) => byDate(b, a)),
      cancelled: all
        .filter((b) => b.bookingStatus === "CANCELLED")
        .sort((a, b) => byDate(b, a)),
    } satisfies Record<TabKey, Booking[]>;
  }, [data]);

  function accept(booking: Booking) {
    updateStatus.mutate({ id: booking.id, status: "CONFIRMED" });
  }

  function complete(booking: Booking) {
    updateStatus.mutate({ id: booking.id, status: "COMPLETED" });
  }

  async function confirmDecline() {
    if (!declining) return;
    await updateStatus.mutateAsync({ id: declining.id, status: "CANCELLED" });
    setDeclining(null);
  }

  function actionsFor(booking: Booking): React.ReactNode {
    const isPast = new Date(booking.bookingDate).getTime() < Date.now();

    if (booking.bookingStatus === "PENDING") {
      return (
        <>
          <Button
            size="sm"
            onClick={() => accept(booking)}
            disabled={updateStatus.isPending}
          >
            Accept
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setDeclining(booking)}
            disabled={updateStatus.isPending}
          >
            Decline
          </Button>
        </>
      );
    }

    if (booking.bookingStatus === "CONFIRMED" && isPast) {
      return (
        <Button
          size="sm"
          variant="secondary"
          onClick={() => complete(booking)}
          disabled={updateStatus.isPending}
        >
          Mark completed
        </Button>
      );
    }

    return null;
  }

  return (
    <DashboardShell
      role="ARTIST"
      nav={ARTIST_NAV}
      title="Bookings"
      description="Requests, confirmed dates and everything you've already delivered."
    >
      {isPending ? (
        <div className="space-y-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton
              key={i}
              className="h-28 w-full rounded-[var(--radius-card)]"
            />
          ))}
        </div>
      ) : isError ? (
        <ErrorState
          title="We couldn't load your bookings"
          onRetry={() => refetch()}
        />
      ) : (
        <Tabs value={tab} onValueChange={(v) => setTab(v as TabKey)}>
          <TabsList>
            {TABS.map(({ key, label }) => (
              <TabsTrigger key={key} value={key}>
                {label}
                {grouped[key].length > 0 && (
                  <span className="tabular ml-2 text-caption text-foreground-muted">
                    {grouped[key].length}
                  </span>
                )}
              </TabsTrigger>
            ))}
          </TabsList>

          {TABS.map(({ key }) => (
            <TabsContent key={key} value={key} className="mt-2">
              {grouped[key].length === 0 ? (
                <EmptyState
                  icon={<CalendarDays />}
                  title={EMPTY[key].title}
                  description={EMPTY[key].description}
                />
              ) : (
                <div>
                  {grouped[key].map((booking) => (
                    <BookingRow
                      key={booking.id}
                      booking={booking}
                      perspective="artist"
                      actions={actionsFor(booking)}
                    />
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <Dialog
        open={Boolean(declining)}
        onOpenChange={(open) => !open && setDeclining(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Decline this booking?</DialogTitle>
            <DialogDescription>
              {declining?.customer?.name ?? "Your client"} will be told the date
              is no longer available. This can&apos;t be undone.
            </DialogDescription>
          </DialogHeader>

          {declining && (
            <dl className="my-8 space-y-3 rounded-[var(--radius-card)] bg-surface-soft p-6">
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-caption text-foreground-muted">Package</dt>
                <dd className="text-right text-caption font-medium text-foreground">
                  {declining.service?.title ?? "Service"}
                </dd>
              </div>
              <div className="flex items-baseline justify-between gap-6">
                <dt className="text-caption text-foreground-muted">Date</dt>
                <dd className="tabular text-right text-caption font-medium text-foreground">
                  {formatDate(declining.bookingDate, {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                  })}
                </dd>
              </div>
            </dl>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setDeclining(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              onClick={confirmDecline}
              loading={updateStatus.isPending}
            >
              Decline booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}
