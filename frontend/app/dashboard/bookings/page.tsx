"use client";

import { Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CalendarDays, CheckCircle2 } from "lucide-react";
import { formatDate } from "@/lib/utils";
import {
  useCreateReview,
  useMyBookings,
  useUpdateBookingStatus,
} from "@/hooks/use-bookings";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CUSTOMER_NAV } from "@/components/dashboard/nav";
import { BookingRow } from "@/components/cards/booking-row";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Textarea } from "@/components/ui/input";
import { RatingInput } from "@/components/ui/rating";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Booking } from "@/types";

const COMMENT_MAX = 1000;

export default function BookingsPage() {
  return (
    <DashboardShell
      role="CUSTOMER"
      nav={CUSTOMER_NAV}
      title="Bookings"
      description="Every appointment you've made on VEYA — upcoming, past and cancelled."
      action={
        <Button asChild variant="secondary">
          <Link href="/artists">Book another artist</Link>
        </Button>
      }
    >
      {/* useSearchParams needs a boundary or the route can't be prerendered. */}
      <Suspense fallback={<BookingListSkeleton />}>
        <BookingsView />
      </Suspense>
    </DashboardShell>
  );
}

function BookingsView() {
  const params = useSearchParams();
  const { data, isPending, isError, refetch } = useMyBookings();
  const [dismissed, setDismissed] = useState(false);

  const justBooked = params.get("booked") === "1" && !dismissed;

  const groups = useMemo(() => {
    const now = Date.now();
    const bookings = data ?? [];

    const byDate = (a: Booking, b: Booking) =>
      new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime();

    const upcoming = bookings
      .filter(
        (b) =>
          (b.bookingStatus === "PENDING" || b.bookingStatus === "CONFIRMED") &&
          new Date(b.bookingDate).getTime() >= now,
      )
      .sort(byDate);

    // Anything that has happened, or was meant to: completed appointments and
    // pending/confirmed ones whose date has come and gone.
    const past = bookings
      .filter(
        (b) =>
          b.bookingStatus !== "CANCELLED" &&
          !upcoming.some((u) => u.id === b.id),
      )
      .sort((a, b) => byDate(b, a));

    const cancelled = bookings
      .filter((b) => b.bookingStatus === "CANCELLED")
      .sort((a, b) => byDate(b, a));

    return { upcoming, past, cancelled };
  }, [data]);

  if (isPending) return <BookingListSkeleton />;

  if (isError) {
    return (
      <ErrorState
        title="We couldn't load your bookings"
        description="This is on us, not you. Try again in a moment."
        onRetry={() => refetch()}
      />
    );
  }

  return (
    <div>
      {justBooked && (
        <div
          role="status"
          className="mb-10 flex flex-col gap-4 rounded-[var(--radius-card)] border border-border bg-success-soft px-6 py-5 sm:flex-row sm:items-center"
        >
          <CheckCircle2 className="size-5 shrink-0 text-success" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-foreground">
              Your booking is confirmed
            </p>
            <p className="mt-1 text-caption text-foreground-secondary">
              We&rsquo;ve sent the details to your artist. You&rsquo;ll find the
              appointment under Upcoming.
            </p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setDismissed(true)}
            className="shrink-0 self-start sm:self-auto"
          >
            Dismiss
          </Button>
        </div>
      )}

      <Tabs defaultValue="upcoming">
        <TabsList>
          <TabsTrigger value="upcoming">
            Upcoming
            <Count value={groups.upcoming.length} />
          </TabsTrigger>
          <TabsTrigger value="past">
            Past
            <Count value={groups.past.length} />
          </TabsTrigger>
          <TabsTrigger value="cancelled">
            Cancelled
            <Count value={groups.cancelled.length} />
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upcoming" className="mt-4">
          <BookingList
            bookings={groups.upcoming}
            empty={
              <EmptyState
                icon={<CalendarDays />}
                title="No upcoming appointments"
                description="When you book an artist, the appointment will appear here with everything you need on the day."
                action={
                  <Button asChild>
                    <Link href="/artists">Find an artist</Link>
                  </Button>
                }
              />
            }
          />
        </TabsContent>

        <TabsContent value="past" className="mt-4">
          <BookingList
            bookings={groups.past}
            empty={
              <EmptyState
                icon={<CalendarDays />}
                title="Nothing here yet"
                description="Appointments move here once the date has passed. That's also where you can leave a review."
              />
            }
          />
        </TabsContent>

        <TabsContent value="cancelled" className="mt-4">
          <BookingList
            bookings={groups.cancelled}
            empty={
              <EmptyState
                icon={<CalendarDays />}
                title="No cancelled bookings"
                description="Nothing to see here — which is exactly how it should be."
              />
            }
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function Count({ value }: { value: number }) {
  return (
    <span className="tabular ml-2 text-caption text-foreground-muted">
      {value}
    </span>
  );
}

function BookingList({
  bookings,
  empty,
}: {
  bookings: Booking[];
  empty: React.ReactNode;
}) {
  if (bookings.length === 0) return <>{empty}</>;

  return (
    <ul>
      {bookings.map((booking) => (
        <li key={booking.id}>
          <BookingRow
            booking={booking}
            perspective="customer"
            actions={<BookingActions booking={booking} />}
          />
        </li>
      ))}
    </ul>
  );
}

function BookingActions({ booking }: { booking: Booking }) {
  const upcoming = new Date(booking.bookingDate).getTime() >= Date.now();
  const cancellable =
    upcoming &&
    (booking.bookingStatus === "PENDING" ||
      booking.bookingStatus === "CONFIRMED");

  if (cancellable) return <CancelBookingDialog booking={booking} />;

  if (booking.bookingStatus === "COMPLETED" && !booking.review) {
    return <ReviewBookingDialog booking={booking} />;
  }

  return null;
}

/* ---------------------------------------------------------------- cancel */

function CancelBookingDialog({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const update = useUpdateBookingStatus();
  const name = booking.artist?.user?.name ?? "your artist";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Cancel your booking with ${name}`}
        >
          Cancel
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cancel this booking?</DialogTitle>
          <DialogDescription>
            Your appointment with {name} on{" "}
            <span className="tabular font-medium text-foreground">
              {formatDate(booking.bookingDate, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
            </span>{" "}
            will be cancelled. This can&rsquo;t be undone — you&rsquo;d need to
            book the date again.
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="mt-8">
          <Button variant="secondary" onClick={() => setOpen(false)}>
            Keep booking
          </Button>
          <Button
            variant="danger"
            loading={update.isPending}
            onClick={() =>
              update.mutate(
                { id: booking.id, status: "CANCELLED" },
                { onSuccess: () => setOpen(false) },
              )
            }
          >
            Cancel booking
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------------------------- review */

function ReviewBookingDialog({ booking }: { booking: Booking }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | undefined>();
  const create = useCreateReview();

  const name = booking.artist?.user?.name ?? "your artist";

  function reset() {
    setRating(0);
    setComment("");
    setError(undefined);
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    if (rating < 1 || rating > 5) {
      setError("Choose a rating from one to five stars.");
      return;
    }
    setError(undefined);
    create.mutate(
      {
        bookingId: booking.id,
        rating,
        comment: comment.trim() || undefined,
      },
      {
        onSuccess: () => {
          setOpen(false);
          reset();
        },
      },
    );
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) reset();
      }}
    >
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`Leave a review for ${name}`}
        >
          Leave a review
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={submit}>
          <DialogHeader>
            <DialogTitle>How was {name}?</DialogTitle>
            <DialogDescription>
              Your review is public and helps the next client book with
              confidence. Be honest, be specific.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-8 space-y-6">
            <Field label="Rating" error={error} required>
              <RatingInput value={rating} onChange={setRating} className="-ml-1" />
            </Field>

            <Field
              label="Your review"
              htmlFor={`review-${booking.id}`}
              hint={`${comment.length}/${COMMENT_MAX}`}
            >
              <Textarea
                id={`review-${booking.id}`}
                value={comment}
                maxLength={COMMENT_MAX}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What was the session like? Did the look hold up through the day?"
              />
            </Field>
          </div>

          <DialogFooter className="mt-8">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setOpen(false)}
            >
              Not now
            </Button>
            <Button type="submit" loading={create.isPending}>
              Post review
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------- skeleton */

function BookingListSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-72" />
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-28 w-full rounded-[var(--radius-card)]"
          />
        ))}
      </div>
    </div>
  );
}
