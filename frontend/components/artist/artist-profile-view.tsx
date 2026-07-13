"use client";

import Image from "next/image";
import { Heart, Instagram, MapPin, MessageSquare, Share2 } from "lucide-react";
import { toast } from "sonner";
import { cn, formatDuration, formatPrice, formatRating } from "@/lib/utils";
import { artistImage } from "@/lib/images";
import { useArtist, useArtistReviews } from "@/hooks/use-artists";
import { useSavedArtists } from "@/hooks/use-saved-artists";
import { Container } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { VerifiedBadge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import { Separator } from "@/components/ui/controls";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Reveal } from "@/components/ui/motion";
import { ReviewCard } from "@/components/cards/review-card";
import { BookingCard, MobileBookingBar } from "@/components/booking/booking-card";
import { PortfolioGrid } from "./portfolio-grid";
import type { ArtistProfile } from "@/types";

export function ArtistProfileView({ artistId }: { artistId: string }) {
  const { data: artist, isPending, isError, refetch } = useArtist(artistId);

  if (isPending) return <ProfileSkeleton />;

  if (isError || !artist) {
    return (
      <Container size="wide" className="py-24">
        <ErrorState
          title="We couldn't find that artist"
          description="The profile may have been removed, or the link may be wrong."
          onRetry={() => refetch()}
        />
      </Container>
    );
  }

  return (
    <>
      <Cover artist={artist} />

      <Container size="wide" className="pb-32 lg:pb-24">
        <div className="grid gap-x-16 gap-y-16 lg:grid-cols-[1fr_22rem]">
          <div className="min-w-0">
            <Identity artist={artist} />

            {artist.bio && (
              <Reveal className="mt-12">
                <p className="max-w-[46rem] text-[1.0625rem] leading-relaxed text-foreground-secondary">
                  {artist.bio}
                </p>
              </Reveal>
            )}

            <SectionBlock title="Portfolio" className="mt-20">
              <PortfolioGrid artistId={artist.id} />
            </SectionBlock>

            <SectionBlock title="Packages" className="mt-20">
              <Packages artist={artist} />
            </SectionBlock>

            <SectionBlock title="Reviews" className="mt-20">
              <Reviews artist={artist} />
            </SectionBlock>
          </div>

          {/* Sticky rail. `#book` is the anchor the card's Book button and the
              mobile bar both target. */}
          <aside id="book" className="scroll-mt-28 lg:sticky lg:top-28 lg:self-start">
            <BookingCard artist={artist} />
          </aside>
        </div>
      </Container>

      <MobileBookingBar artist={artist} />
    </>
  );
}

/* ---------------------------------------------------------------- cover */

function Cover({ artist }: { artist: ArtistProfile }) {
  const { isSaved, toggle } = useSavedArtists();
  const saved = isSaved(artist.id);

  async function share() {
    const url = window.location.href;
    // Native share on mobile; clipboard everywhere else.
    if (navigator.share) {
      try {
        await navigator.share({ title: artist.user?.name, url });
        return;
      } catch {
        // User dismissed the sheet — fall through to the clipboard.
      }
    }
    await navigator.clipboard.writeText(url);
    toast.success("Link copied to clipboard.");
  }

  return (
    <div className="relative h-[38vh] min-h-[18rem] w-full overflow-hidden lg:h-[46vh]">
      <Image
        src={artistImage(artist.id, artist.profileImage)}
        alt=""
        fill
        priority
        sizes="100vw"
        className="object-cover object-[center_30%]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/70 via-burgundy-900/20 to-burgundy-900/30" />

      <Container size="wide" className="relative flex h-full items-end pb-8">
        <div className="ml-auto flex gap-2">
          <IconAction
            label="Share this profile"
            onClick={share}
            icon={<Share2 />}
          />
          <IconAction
            label={saved ? "Remove from saved" : "Save this artist"}
            pressed={saved}
            onClick={() => toggle(artist.id)}
            icon={
              <Heart
                className={cn(saved && "fill-burgundy-600 text-burgundy-600")}
              />
            }
          />
        </div>
      </Container>
    </div>
  );
}

function IconAction({
  label,
  icon,
  onClick,
  pressed,
}: {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  pressed?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      aria-pressed={pressed}
      className="flex size-11 items-center justify-center rounded-full bg-white/90 text-burgundy-700 backdrop-blur-md transition-all duration-200 ease-[var(--ease-out-soft)] hover:scale-105 hover:bg-white active:scale-95 [&_svg]:size-[1.125rem]"
    >
      {icon}
    </button>
  );
}

/* ------------------------------------------------------------- identity */

function Identity({ artist }: { artist: ArtistProfile }) {
  const name = artist.user?.name ?? "VEYA Artist";

  return (
    <Reveal immediate className="-mt-4">
      <div className="flex flex-wrap items-center gap-3">
        {artist.verified && <VerifiedBadge />}
        <span className="text-caption text-foreground-muted">
          Joined {new Date(artist.createdAt).getFullYear()}
        </span>
      </div>

      <h1 className="mt-5 text-h1">{name}</h1>

      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3 text-caption text-foreground-secondary">
        <span className="flex items-center gap-1.5">
          <MapPin className="size-4" aria-hidden />
          {artist.city}
        </span>
        <span className="tabular">
          {artist.experience} {artist.experience === 1 ? "year" : "years"}{" "}
          experience
        </span>
        <Rating value={artist.rating} count={artist.reviewCount} size="md" />
        {artist.instagram && (
          <a
            href={`https://instagram.com/${artist.instagram.replace("@", "")}`}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-1.5 transition-colors hover:text-foreground"
          >
            <Instagram className="size-4" aria-hidden />
            {artist.instagram}
          </a>
        )}
      </div>
    </Reveal>
  );
}

/* ------------------------------------------------------------- sections */

function SectionBlock({
  title,
  className,
  children,
}: {
  title: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Reveal className={className}>
      <h2 className="mb-8 text-h3">{title}</h2>
      {children}
    </Reveal>
  );
}

function Packages({ artist }: { artist: ArtistProfile }) {
  const services = artist.services ?? [];

  if (services.length === 0) {
    return (
      <Card variant="soft" padding="lg">
        <p className="text-body text-foreground-secondary">
          This artist hasn&apos;t published packages yet. Use the booking panel
          to request pricing.
        </p>
      </Card>
    );
  }

  return (
    <div className="divide-y divide-border border-y border-border">
      {services.map((service) => (
        <div
          key={service.id}
          className="flex flex-col gap-2 py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
        >
          <div className="min-w-0">
            <h3 className="font-display text-h4 font-medium">{service.title}</h3>
            {service.description && (
              <p className="mt-2 max-w-[38rem] text-caption text-foreground-secondary">
                {service.description}
              </p>
            )}
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="tabular font-display text-h4 font-medium">
              {formatPrice(service.price)}
            </p>
            <p className="tabular mt-1 text-caption text-foreground-muted">
              {formatDuration(service.duration)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function Reviews({ artist }: { artist: ArtistProfile }) {
  const { data: reviews, isPending } = useArtistReviews(artist.id);

  if (isPending) {
    return (
      <div className="space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-3">
            <Skeleton className="h-10 w-48" />
            <Skeleton className="h-16 w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <EmptyState
        className="py-16"
        icon={<MessageSquare />}
        title="No reviews yet"
        description="Only clients who have completed a booking can leave a review — so this artist is simply new to VEYA, not poorly rated."
      />
    );
  }

  return (
    <div>
      <div className="mb-10 flex items-center gap-8 rounded-[var(--radius-card)] bg-surface-soft p-7">
        <div>
          <p className="tabular font-display text-display font-medium leading-none">
            {formatRating(artist.rating)}
          </p>
        </div>
        <Separator orientation="vertical" className="h-14" />
        <div>
          <Rating value={artist.rating} variant="stars" size="md" />
          <p className="tabular mt-2 text-caption text-foreground-secondary">
            {artist.reviewCount}{" "}
            {artist.reviewCount === 1 ? "review" : "reviews"} from completed
            bookings
          </p>
        </div>
      </div>

      <div>
        {reviews.map((review) => (
          <ReviewCard key={review.id} review={review} />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------- skeleton */

function ProfileSkeleton() {
  return (
    <>
      <Skeleton className="h-[38vh] min-h-[18rem] w-full rounded-none lg:h-[46vh]" />
      <Container size="wide" className="py-16">
        <div className="grid gap-16 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6">
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-12 w-80" />
            <Skeleton className="h-5 w-96" />
            <Skeleton className="h-28 w-full max-w-[46rem]" />
            <div className="grid grid-cols-2 gap-3 pt-8 md:grid-cols-4">
              <Skeleton className="col-span-2 row-span-2 aspect-square rounded-[var(--radius-image)]" />
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="aspect-square rounded-[var(--radius-image)]"
                />
              ))}
            </div>
          </div>
          <Skeleton className="h-[34rem] w-full rounded-[var(--radius-card)]" />
        </div>
      </Container>
    </>
  );
}
