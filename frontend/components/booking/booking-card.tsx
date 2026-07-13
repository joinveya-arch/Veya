"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CalendarDays, Check, Clock, ShieldCheck } from "lucide-react";
import { cn, formatDate, formatDuration, formatPrice, toDateKey } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useArtistAvailability } from "@/hooks/use-artists";
import { useCreateBooking } from "@/hooks/use-bookings";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { Skeleton } from "@/components/ui/states";
import { Separator } from "@/components/ui/controls";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ArtistProfile, Service } from "@/types";

/**
 * The conversion surface. Sticks alongside the profile on desktop and, at the
 * bottom of the page on mobile, becomes the primary CTA.
 *
 * Deliberately shows the full price before asking for a sign-in — hiding cost
 * behind an auth wall is the single fastest way to lose the trust this whole
 * brand is built on.
 */
export function BookingCard({ artist }: { artist: ArtistProfile }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuth();
  const { data: availability, isPending } = useArtistAvailability(artist.id);
  const createBooking = useCreateBooking();

  const services = artist.services ?? [];
  const [serviceId, setServiceId] = useState(services[0]?.id ?? "");
  const [date, setDate] = useState<Date | undefined>();
  const [confirming, setConfirming] = useState(false);

  const service = services.find((s) => s.id === serviceId);

  // The artist's open days, as a Set of calendar-day keys. Anything not in
  // here is disabled on the calendar.
  const openDays = useMemo(() => {
    const set = new Set<string>();
    for (const slot of availability ?? []) {
      if (slot.status === "AVAILABLE") {
        set.add(toDateKey(new Date(slot.date)));
      }
    }
    return set;
  }, [availability]);

  const isClosed = (day: Date) => !openDays.has(toDateKey(day));

  function onBook() {
    if (!isAuthenticated) {
      // Preserve intent — send them back here after signing in.
      router.push(`/login?next=${encodeURIComponent(`/artists/${artist.id}`)}`);
      return;
    }
    setConfirming(true);
  }

  async function onConfirm() {
    if (!service || !date) return;
    await createBooking.mutateAsync({
      serviceId: service.id,
      bookingDate: date.toISOString(),
    });
    setConfirming(false);
    router.push("/dashboard/bookings?booked=1");
  }

  const canBook = Boolean(service && date);
  // Artists can't book themselves; admins have no customer context.
  const wrongRole = user && user.role !== "CUSTOMER";

  return (
    <>
      <Card variant="surface" padding="none" className="shadow-[var(--shadow-soft)]">
        <div className="space-y-6 p-7">
          <div>
            <p className="text-caption text-foreground-muted">Starting from</p>
            <p className="mt-1 flex items-baseline gap-2">
              <span className="tabular font-display text-h2 font-medium text-foreground">
                {services.length > 0
                  ? formatPrice(
                      Math.min(...services.map((s) => Number(s.price))),
                    )
                  : "—"}
              </span>
            </p>
          </div>

          {services.length > 0 ? (
            <>
              <fieldset className="space-y-2">
                <legend className="mb-3 text-overline font-medium uppercase text-foreground-muted">
                  Choose a package
                </legend>
                {services.map((s) => (
                  <ServiceOption
                    key={s.id}
                    service={s}
                    selected={s.id === serviceId}
                    onSelect={() => setServiceId(s.id)}
                  />
                ))}
              </fieldset>

              <Separator />

              <div>
                <p className="mb-3 text-overline font-medium uppercase text-foreground-muted">
                  Pick a date
                </p>
                {isPending ? (
                  <Skeleton className="h-[19rem] w-full" />
                ) : openDays.size === 0 ? (
                  <p className="rounded-[var(--radius-input)] bg-surface-sunken px-4 py-6 text-center text-caption text-foreground-secondary">
                    {artist.user?.name?.split(" ")[0] ?? "This artist"} hasn&apos;t
                    opened any dates yet. Check back shortly.
                  </p>
                ) : (
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
                    disabled={isClosed}
                    startMonth={new Date()}
                  />
                )}
              </div>

              <Button
                full
                size="lg"
                onClick={onBook}
                disabled={!canBook || Boolean(wrongRole)}
              >
                {wrongRole
                  ? "Sign in as a client to book"
                  : date
                    ? `Book ${formatDate(date, { day: "numeric", month: "short" })}`
                    : "Select a date"}
              </Button>

              <p className="flex items-center justify-center gap-1.5 text-caption text-foreground-muted">
                <ShieldCheck className="size-3.5" aria-hidden />
                Free cancellation up to 7 days before
              </p>
            </>
          ) : (
            <p className="text-caption text-foreground-secondary">
              This artist hasn&apos;t published packages yet. Pricing is on
              request.
            </p>
          )}
        </div>
      </Card>

      <Dialog open={confirming} onOpenChange={setConfirming}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm your booking</DialogTitle>
            <DialogDescription>
              We&apos;ll hold this slot and notify{" "}
              {artist.user?.name?.split(" ")[0] ?? "the artist"} straight away.
            </DialogDescription>
          </DialogHeader>

          {service && date && (
            <dl className="my-8 space-y-4 rounded-[var(--radius-card)] bg-surface-soft p-6">
              <Row label="Artist" value={artist.user?.name ?? "—"} />
              <Row label="Package" value={service.title} />
              <Row
                label="Date"
                value={formatDate(date, {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                })}
              />
              <Row label="Duration" value={formatDuration(service.duration)} />
              <Separator />
              <div className="flex items-baseline justify-between">
                <dt className="text-body font-medium text-foreground">Total</dt>
                <dd className="tabular font-display text-h4 font-medium text-foreground">
                  {formatPrice(service.price)}
                </dd>
              </div>
            </dl>
          )}

          <DialogFooter>
            <Button variant="secondary" onClick={() => setConfirming(false)}>
              Back
            </Button>
            <Button onClick={onConfirm} loading={createBooking.isPending}>
              Confirm booking
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-6">
      <dt className="text-caption text-foreground-muted">{label}</dt>
      <dd className="text-right text-caption font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}

function ServiceOption({
  service,
  selected,
  onSelect,
}: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      className={cn(
        "flex cursor-pointer items-start gap-3 rounded-[var(--radius-input)] border p-4",
        "transition-[border-color,background-color] duration-200 ease-[var(--ease-out-soft)]",
        selected
          ? "border-primary bg-primary/[0.03] dark:border-accent dark:bg-accent/[0.06]"
          : "border-border hover:border-border-strong",
      )}
    >
      <input
        type="radio"
        name="service"
        className="sr-only"
        checked={selected}
        onChange={onSelect}
      />
      <span
        className={cn(
          "mt-0.5 flex size-[1.125rem] shrink-0 items-center justify-center rounded-full border transition-colors",
          selected
            ? "border-primary bg-primary text-primary-foreground dark:border-accent dark:bg-accent dark:text-burgundy-900"
            : "border-border-strong",
        )}
        aria-hidden
      >
        {selected && <Check className="size-3" strokeWidth={3} />}
      </span>

      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-3">
          <span className="text-caption font-medium text-foreground">
            {service.title}
          </span>
          <span className="tabular shrink-0 text-caption font-medium text-foreground">
            {formatPrice(service.price)}
          </span>
        </span>
        <span className="mt-1 flex items-center gap-1.5 text-caption text-foreground-muted">
          <Clock className="size-3.5" aria-hidden />
          {formatDuration(service.duration)}
        </span>
      </span>
    </label>
  );
}

/** Mobile: a fixed bar that scrolls the sticky card into view. */
export function MobileBookingBar({ artist }: { artist: ArtistProfile }) {
  const services = artist.services ?? [];
  const from =
    services.length > 0
      ? Math.min(...services.map((s) => Number(s.price)))
      : null;

  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 px-6 py-4 backdrop-blur-xl lg:hidden">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-caption text-foreground-muted">From</p>
          <p className="tabular font-display text-h4 font-medium">
            {from !== null ? formatPrice(from) : "On request"}
          </p>
        </div>
        <Button asChild size="lg">
          <a href="#book">
            <CalendarDays aria-hidden />
            Check dates
          </a>
        </Button>
      </div>
    </div>
  );
}
