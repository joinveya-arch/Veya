"use client";

import Link from "next/link";
import { ArrowRight, CheckCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADMIN_NAV } from "@/components/dashboard/nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Reveal, RevealItem, fadeUp, stagger } from "@/components/ui/motion";
import { useAdminArtists, useAdminBookings } from "@/hooks/use-admin";
import type { ArtistProfile } from "@/types";

export default function AdminOverviewPage() {
  return (
    <DashboardShell
      role="ADMIN"
      nav={ADMIN_NAV}
      title="Overview"
      description="The whole platform in four numbers, and the one list that needs a decision from you."
    >
      <Overview />
    </DashboardShell>
  );
}

function Overview() {
  const artistsQuery = useAdminArtists();
  const bookingsQuery = useAdminBookings();

  if (artistsQuery.isPending || bookingsQuery.isPending) {
    return <OverviewSkeleton />;
  }

  if (artistsQuery.isError || bookingsQuery.isError) {
    return (
      <ErrorState
        description="We couldn't reach the platform figures just now. Please try again."
        onRetry={() => {
          void artistsQuery.refetch();
          void bookingsQuery.refetch();
        }}
      />
    );
  }

  const artists = artistsQuery.data;
  const bookings = bookingsQuery.data;

  const unverified = artists.filter((artist) => !artist.verified);
  const pending = bookings.filter(
    (booking) => booking.bookingStatus === "PENDING",
  );

  const figures = [
    {
      label: "Artists",
      value: artists.length,
      meta: `${artists.length - unverified.length} verified`,
    },
    {
      label: "Awaiting verification",
      value: unverified.length,
      meta: unverified.length === 0 ? "All clear" : "Needs a decision",
    },
    { label: "Bookings", value: bookings.length, meta: "All time" },
    {
      label: "Bookings pending",
      value: pending.length,
      meta: "Not yet confirmed",
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hairlines, not a wall of coloured stat cards. The 1px grid gaps
          show the parent's border colour through; each cell paints over
          the rest with the page field. */}
      <Reveal variants={fadeUp} immediate>
        <div className="border-y border-border bg-border">
          <dl className="grid gap-px sm:grid-cols-2 lg:grid-cols-4">
            {figures.map((figure) => (
              <div
                key={figure.label}
                className="bg-background py-10 lg:px-8 lg:first:pl-0"
              >
                <dt className="text-overline font-medium uppercase text-foreground-muted">
                  {figure.label}
                </dt>
                <dd className="tabular mt-4 font-display text-h1 font-medium text-foreground">
                  {figure.value}
                </dd>
                <p className="mt-2 text-caption text-foreground-muted">
                  {figure.meta}
                </p>
              </div>
            ))}
          </dl>
        </div>
      </Reveal>

      <section aria-labelledby="attention">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 id="attention" className="text-h3">
            Needs your attention
          </h2>
          {unverified.length > 0 && (
            <Link
              href="/admin/artists"
              className="group inline-flex items-center gap-2 text-caption font-medium text-foreground-secondary transition-colors hover:text-foreground"
            >
              Review all artists
              <ArrowRight
                className="size-4 transition-transform duration-200 ease-[var(--ease-out-soft)] group-hover:translate-x-0.5"
                aria-hidden
              />
            </Link>
          )}
        </div>

        <p className="mt-3 max-w-[42rem] text-body text-foreground-secondary">
          Artists who have created a profile but have not yet been verified.
          Until they are, they carry no trust mark anywhere on VEYA.
        </p>

        <div className="mt-8">
          {unverified.length === 0 ? (
            <EmptyState
              className="py-16"
              icon={<CheckCheck />}
              title="Nothing waiting"
              description="Every artist on the platform has been reviewed. New profiles will appear here the moment they're created."
            />
          ) : (
            <Reveal variants={stagger} as="ul" immediate className="border-t border-border">
              {unverified.map((artist) => (
                <RevealItem as="li" key={artist.id}>
                  <PendingArtistRow artist={artist} />
                </RevealItem>
              ))}
            </Reveal>
          )}
        </div>
      </section>
    </div>
  );
}

function PendingArtistRow({ artist }: { artist: ArtistProfile }) {
  return (
    <Link
      href="/admin/artists"
      className={cn(
        "group flex items-center gap-6 border-b border-border py-5",
        "transition-colors duration-200 ease-[var(--ease-out-soft)]",
      )}
    >
      <div className="min-w-0 flex-1">
        <p className="truncate text-body font-medium text-foreground transition-colors group-hover:text-accent">
          {artist.user?.name ?? "Unnamed artist"}
        </p>
        <p className="mt-1 text-caption text-foreground-muted">
          {artist.city}
          <span aria-hidden> · </span>
          <span className="tabular">{artist.experience}</span>{" "}
          {artist.experience === 1 ? "year" : "years"} experience
        </p>
      </div>
      <span className="shrink-0 text-caption text-foreground-muted">
        Unverified
      </span>
      <ArrowRight
        className="size-4 shrink-0 text-foreground-muted transition-transform duration-200 ease-[var(--ease-out-soft)] group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-16">
      <div className="grid gap-px border-y border-border bg-border sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-4 bg-background py-10 lg:px-8">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-16" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <Skeleton className="h-7 w-56" />
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" />
        ))}
      </div>
    </div>
  );
}
