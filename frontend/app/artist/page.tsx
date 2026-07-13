"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarCheck,
  CalendarDays,
  Clock3,
  Images,
  Tag,
  UserRound,
} from "lucide-react";
import { formatRating } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { useMyBookings } from "@/hooks/use-bookings";
import {
  isMissingProfile,
  useMyArtistProfile,
  useMyServices,
} from "@/hooks/use-artist-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ARTIST_NAV } from "@/components/dashboard/nav";
import { BookingRow } from "@/components/cards/booking-row";
import { VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Reveal } from "@/components/ui/motion";
import type { ArtistProfile, Booking } from "@/types";

export default function ArtistOverviewPage() {
  const { user } = useAuth();
  const firstName = user?.name?.split(" ")[0] ?? "there";

  const profile = useMyArtistProfile();
  const bookings = useMyBookings();
  const services = useMyServices(profile.data?.id);

  return (
    <DashboardShell
      role="ARTIST"
      nav={ARTIST_NAV}
      // A time-of-day greeting would be computed during render, and client
      // components are still server-rendered — a server in another timezone
      // emits "Good evening" while the browser renders "Good morning", which
      // is a hydration mismatch. The customer dashboard greets the same way.
      title={`Welcome back, ${firstName}`}
      description="Your work, your dates, your bookings — all in one place."
    >
      {profile.isPending ? (
        <OverviewSkeleton />
      ) : profile.isError && isMissingProfile(profile.error) ? (
        <EmptyState
          icon={<UserRound />}
          title="Complete your profile to start taking bookings"
          description="Clients can't find you until you've told them where you work, how long you've been doing this, and what you're known for. It takes about two minutes."
          action={
            <Button asChild>
              <Link href="/artist/profile">Complete your profile</Link>
            </Button>
          }
        />
      ) : profile.isError || !profile.data ? (
        <ErrorState
          title="We couldn't load your profile"
          description="This is on us, not you. Try again in a moment."
          onRetry={() => profile.refetch()}
        />
      ) : (
        <Overview
          profile={profile.data}
          bookings={bookings.data}
          bookingsPending={bookings.isPending}
          serviceCount={services.data?.length ?? 0}
        />
      )}
    </DashboardShell>
  );
}

/* -------------------------------------------------------------- overview */

function Overview({
  profile,
  bookings,
  bookingsPending,
  serviceCount,
}: {
  profile: ArtistProfile;
  bookings: Booking[] | undefined;
  bookingsPending: boolean;
  serviceCount: number;
}) {
  const all = bookings ?? [];
  const now = Date.now();

  // The one booking that actually matters today: the soonest still-live date.
  const next = [...all]
    .filter(
      (b) =>
        (b.bookingStatus === "CONFIRMED" || b.bookingStatus === "PENDING") &&
        new Date(b.bookingDate).getTime() >= now,
    )
    .sort(
      (a, b) =>
        new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime(),
    )[0];

  const pendingCount = all.filter((b) => b.bookingStatus === "PENDING").length;

  return (
    <div className="space-y-16">
      <Reveal immediate>
        {profile.verified ? (
          <div className="flex flex-wrap items-center gap-4">
            <VerifiedBadge />
            <p className="text-caption text-foreground-secondary">
              Your profile carries the trust mark. Clients see it everywhere you
              appear.
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap items-start gap-x-4 gap-y-2 rounded-[var(--radius-card)] border border-border bg-surface-soft px-6 py-5">
            <Clock3
              className="mt-0.5 size-[1.125rem] shrink-0 text-foreground-muted"
              aria-hidden
            />
            <div className="min-w-0">
              <p className="text-body font-medium text-foreground">
                Verification pending — we&apos;re reviewing your work
              </p>
              <p className="mt-1 text-caption text-foreground-secondary">
                You can still take bookings. A strong portfolio is the fastest
                way through the review.
              </p>
            </div>
          </div>
        )}
      </Reveal>

      {/* Typography, not stat cards. Hairlines carry the grouping. */}
      <Reveal immediate delay={0.05}>
        <dl className="grid grid-cols-2 gap-y-8 border-y border-border py-9 sm:grid-cols-4 sm:divide-x sm:divide-border">
          <Summary
            label="Rating"
            value={profile.rating > 0 ? formatRating(profile.rating) : "New"}
            className="sm:pr-8"
          />
          <Summary
            label={profile.reviewCount === 1 ? "Review" : "Reviews"}
            value={String(profile.reviewCount)}
            className="sm:px-8"
          />
          <Summary
            label="Bookings"
            value={bookingsPending ? "—" : String(all.length)}
            className="sm:px-8"
          />
          <Summary
            label={serviceCount === 1 ? "Package" : "Packages"}
            value={String(serviceCount)}
            className="sm:px-8"
          />
        </dl>
      </Reveal>

      <Reveal immediate delay={0.1}>
        <div className="mb-6 flex items-baseline justify-between gap-6">
          <h2 className="text-h3">Next booking</h2>
          <Link
            href="/artist/bookings"
            className="text-caption font-medium text-foreground-secondary underline decoration-border-strong underline-offset-4 transition-colors hover:text-foreground hover:decoration-accent"
          >
            {pendingCount > 0 ? (
              <span className="tabular">
                {pendingCount} awaiting your reply
              </span>
            ) : (
              "All bookings"
            )}
          </Link>
        </div>

        {bookingsPending ? (
          <Skeleton className="h-28 w-full rounded-[var(--radius-card)]" />
        ) : next ? (
          <div className="border-t border-border">
            <BookingRow booking={next} perspective="artist" />
          </div>
        ) : (
          <p className="border-t border-border py-8 text-body text-foreground-secondary">
            Nothing on the books yet. Open some dates and publish a package —
            that&apos;s all a client needs to reach you.
          </p>
        )}
      </Reveal>

      <Reveal immediate delay={0.15}>
        <h2 className="mb-6 text-h3">Keep going</h2>
        <ul className="border-t border-border">
          <QuickLink
            href="/artist/services"
            icon={<Tag />}
            title="Publish a package"
            description="Title, price, duration. Clients book packages, not enquiries."
          />
          <QuickLink
            href="/artist/portfolio"
            icon={<Images />}
            title="Add to your portfolio"
            description="Your photographs are the whole pitch. Ten strong images beat forty average ones."
          />
          <QuickLink
            href="/artist/availability"
            icon={<CalendarCheck />}
            title="Open your dates"
            description="Clients can only book the days you've opened."
          />
          <QuickLink
            href="/artist/bookings"
            icon={<CalendarDays />}
            title="Answer your requests"
            description="A fast reply is the strongest signal you can send."
          />
        </ul>
      </Reveal>
    </div>
  );
}

function Summary({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <dt className="text-overline font-medium uppercase text-foreground-muted">
        {label}
      </dt>
      <dd className="tabular mt-2 font-display text-h3 font-medium text-foreground">
        {value}
      </dd>
    </div>
  );
}

function QuickLink({
  href,
  icon,
  title,
  description,
}: {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <li className="border-b border-border">
      <Link
        href={href}
        className="group flex items-center gap-5 py-6 transition-colors hover:bg-surface-soft"
      >
        <span
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-surface-sunken text-foreground-secondary [&_svg]:size-[1.125rem]"
          aria-hidden
        >
          {icon}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block font-display text-body font-medium text-foreground">
            {title}
          </span>
          <span className="mt-0.5 block text-caption text-foreground-secondary">
            {description}
          </span>
        </span>
        <ArrowUpRight
          className="size-4 shrink-0 text-foreground-muted transition-colors group-hover:text-foreground"
          aria-hidden
        />
      </Link>
    </li>
  );
}

function OverviewSkeleton() {
  return (
    <div className="space-y-12">
      <Skeleton className="h-20 w-full rounded-[var(--radius-card)]" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-28 w-full rounded-[var(--radius-card)]" />
    </div>
  );
}
