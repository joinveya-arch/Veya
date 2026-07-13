"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, Clock, Heart, MapPin } from "lucide-react";
import { cn, formatDate, formatDuration, formatPrice } from "@/lib/utils";
import { artistImage } from "@/lib/images";
import { BOOKING_STATUS_META } from "@/lib/constants";
import { useAuth } from "@/providers/auth-provider";
import { useMyBookings } from "@/hooks/use-bookings";
import { useSavedArtists } from "@/hooks/use-saved-artists";
import { useArtists } from "@/hooks/use-artists";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CUSTOMER_NAV } from "@/components/dashboard/nav";
import { ArtistCard } from "@/components/cards/artist-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArtistCardSkeleton,
  EmptyState,
  ErrorState,
  Skeleton,
} from "@/components/ui/states";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";
import type { Booking } from "@/types";

/**
 * The customer's home. Deliberately typographic rather than a wall of stat
 * cards — what a client actually wants on landing is the answer to "when is
 * my next appointment, and who is it with".
 */
export default function DashboardOverviewPage() {
  const { user } = useAuth();
  const firstName = user?.name.trim().split(/\s+/)[0];

  return (
    <DashboardShell
      role="CUSTOMER"
      nav={CUSTOMER_NAV}
      title={firstName ? `Welcome back, ${firstName}` : "Welcome back"}
      description="Your next appointment, and the artists you've saved for later."
      action={
        <Button asChild variant="secondary">
          <Link href="/artists">Browse artists</Link>
        </Button>
      }
    >
      <div className="space-y-20">
        <NextAppointmentSection />
        <SavedArtistsSection />
      </div>
    </DashboardShell>
  );
}

/* ------------------------------------------------------ next appointment */

function NextAppointmentSection() {
  const { data, isPending, isError, refetch } = useMyBookings();

  // The soonest booking that is still going to happen. A cancelled one, or
  // one whose date has passed, is history — it doesn't belong here.
  const next = useMemo<Booking | null>(() => {
    if (!data) return null;
    const now = Date.now();
    const upcoming = data
      .filter(
        (b) =>
          (b.bookingStatus === "PENDING" || b.bookingStatus === "CONFIRMED") &&
          new Date(b.bookingDate).getTime() >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
      );
    return upcoming[0] ?? null;
  }, [data]);

  return (
    <Reveal variants={stagger} immediate as="section">
      <RevealItem>
        <SectionLabel>Next appointment</SectionLabel>
      </RevealItem>

      <RevealItem className="mt-6">
        {isPending ? (
          <Skeleton className="h-56 w-full rounded-[var(--radius-card)]" />
        ) : isError ? (
          <ErrorState
            className="py-16"
            title="We couldn't load your bookings"
            description="Give it another try — nothing has been lost."
            onRetry={() => refetch()}
          />
        ) : next ? (
          <NextAppointmentCard booking={next} />
        ) : (
          <Card padding="none">
            <EmptyState
              className="py-20"
              icon={<CalendarDays />}
              title="Nothing on the calendar"
              description="When you book an artist, the appointment will live here — with the date, the price and everything you need on the day."
              action={
                <Button asChild>
                  <Link href="/artists">Find an artist</Link>
                </Button>
              }
            />
          </Card>
        )}
      </RevealItem>
    </Reveal>
  );
}

function NextAppointmentCard({ booking }: { booking: Booking }) {
  const { artist, service } = booking;
  const status = BOOKING_STATUS_META[booking.bookingStatus];
  const name = artist?.user?.name ?? "VEYA Artist";
  const date = new Date(booking.bookingDate);

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex flex-col gap-8 p-6 sm:flex-row sm:items-stretch sm:gap-10 sm:p-8">
        {artist && (
          <Link
            href={`/artists/${artist.id}`}
            aria-label={`View ${name}'s profile`}
            className="relative aspect-[4/3] w-full shrink-0 overflow-hidden rounded-[var(--radius-image)] bg-surface-sunken sm:aspect-[4/5] sm:w-40"
          >
            <Image
              src={artistImage(artist.id, artist.profileImage)}
              alt=""
              fill
              sizes="(max-width: 640px) 100vw, 160px"
              priority
              className="object-cover"
            />
          </Link>
        )}

        <div className="flex min-w-0 flex-1 flex-col justify-between gap-8">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="font-display text-h3 font-medium text-foreground">
                {artist ? (
                  <Link
                    href={`/artists/${artist.id}`}
                    className="transition-colors hover:text-accent"
                  >
                    {name}
                  </Link>
                ) : (
                  name
                )}
              </h3>
              <Badge variant={status.variant} size="sm">
                {status.label}
              </Badge>
            </div>

            <p className="mt-2 text-body text-foreground-secondary">
              {service?.title ?? "Service"}
            </p>

            <p className="tabular mt-6 font-display text-h4 font-medium text-foreground">
              {formatDate(date, {
                weekday: "long",
                day: "numeric",
                month: "long",
              })}
              <span className="text-foreground-muted"> · </span>
              {formatDate(date, { hour: "numeric", minute: "2-digit" })}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-caption text-foreground-muted">
              {service && (
                <span className="tabular flex items-center gap-1.5">
                  <Clock className="size-3.5" aria-hidden />
                  {formatDuration(service.duration)}
                </span>
              )}
              {artist?.city && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-3.5" aria-hidden />
                  {artist.city}
                </span>
              )}
              {service && (
                <span className="tabular font-medium text-foreground">
                  {formatPrice(service.price)}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="secondary" size="sm">
              <Link href="/dashboard/bookings">Manage booking</Link>
            </Button>
            {artist && (
              <Button asChild variant="ghost" size="sm">
                <Link href={`/artists/${artist.id}`}>View artist</Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

/* --------------------------------------------------------- saved artists */

function SavedArtistsSection() {
  const { saved } = useSavedArtists();
  const { artists, isPending, isError, refetch } = useArtists();

  // Saved ids come out of localStorage in an effect, so the first client
  // paint always reads as "nothing saved". Waiting a tick avoids flashing
  // an empty state at someone who has ten artists saved.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const savedArtists = useMemo(
    () => artists.filter((a) => saved.includes(a.id)),
    [artists, saved],
  );

  const loading = !hydrated || (saved.length > 0 && isPending);

  return (
    <Reveal as="section">
      <div className="flex items-end justify-between gap-6">
        <SectionLabel>Saved artists</SectionLabel>
        {savedArtists.length > 0 && (
          <p className="tabular text-caption text-foreground-muted">
            {savedArtists.length}{" "}
            {savedArtists.length === 1 ? "artist" : "artists"}
          </p>
        )}
      </div>

      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <ArtistCardSkeleton key={i} />
            ))}
          </div>
        ) : isError && saved.length > 0 ? (
          <ErrorState
            className="py-16"
            title="We couldn't load your saved artists"
            onRetry={() => refetch()}
          />
        ) : savedArtists.length === 0 ? (
          <Card padding="none">
            <EmptyState
              className="py-20"
              icon={<Heart />}
              title="Nothing saved yet"
              description="Tap the heart on any artist to keep them here while you decide. It's the easiest way to shortlist before you book."
              action={
                <Button asChild variant="secondary">
                  <Link href="/artists">Browse artists</Link>
                </Button>
              }
            />
          </Card>
        ) : (
          <Reveal
            variants={stagger}
            className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3"
          >
            {savedArtists.map((artist) => (
              <RevealItem key={artist.id}>
                <ArtistCard artist={artist} />
              </RevealItem>
            ))}
          </Reveal>
        )}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------------ bits */

function SectionLabel({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={cn(
        "text-overline font-medium uppercase text-accent",
        className,
      )}
    >
      {children}
    </h2>
  );
}
