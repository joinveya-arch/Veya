"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Heart, MapPin } from "lucide-react";
import { cn, formatPrice } from "@/lib/utils";
import { artistImage } from "@/lib/images";
import { startingPrice } from "@/hooks/use-artists";
import { useSavedArtists } from "@/hooks/use-saved-artists";
import { Button } from "@/components/ui/button";
import { VerifiedBadge } from "@/components/ui/badge";
import { Rating } from "@/components/ui/rating";
import type { ArtistProfile } from "@/types";

/**
 * The card is a link, not a div with an onClick — the whole surface is
 * navigable and keyboard-reachable for free. Save and Book are real
 * buttons layered above it, so they need to stop propagation.
 */
export function ArtistCard({
  artist,
  priority = false,
  className,
}: {
  artist: ArtistProfile;
  /** True for the first row only — everything else lazy-loads. */
  priority?: boolean;
  className?: string;
}) {
  const router = useRouter();
  const { isSaved, toggle } = useSavedArtists();
  const saved = isSaved(artist.id);

  const name = artist.user?.name ?? "VEYA Artist";
  const from = startingPrice(artist);
  const href = `/artists/${artist.id}`;

  return (
    <article className={cn("group relative", className)}>
      <Link
        href={href}
        className="block focus:outline-none"
        aria-label={`View ${name}'s profile`}
      >
        <div className="relative aspect-[4/5] overflow-hidden rounded-[var(--radius-image)] bg-surface-sunken">
          <Image
            src={artistImage(artist.id, artist.profileImage)}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            priority={priority}
            className="object-cover transition-transform duration-[600ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.04]"
          />

          {/* Scrim exists only to keep the overlay chips legible; it stays
              off until hover so the photograph is never dulled at rest. */}
          <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-burgundy-900/45 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

          {artist.verified && (
            <div className="absolute left-4 top-4">
              <VerifiedBadge size="sm" overlay />
            </div>
          )}

          {/* Book slides up from under the frame on hover. On touch, where
              there is no hover, it simply isn't shown — tapping the card
              opens the profile, which has the primary Book CTA. */}
          <div className="pointer-events-none absolute inset-x-4 bottom-4 hidden translate-y-3 opacity-0 transition-[transform,opacity] duration-300 ease-[var(--ease-out-soft)] group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 lg:block">
            <Button
              size="sm"
              full
              className="bg-white text-burgundy-700 shadow-[var(--shadow-lifted)] hover:bg-white hover:brightness-[0.97]"
              onClick={(e) => {
                e.preventDefault();
                router.push(`${href}#book`);
              }}
            >
              Book {name.split(" ")[0]}
            </Button>
          </div>
        </div>
      </Link>

      <button
        type="button"
        onClick={() => toggle(artist.id)}
        aria-pressed={saved}
        aria-label={saved ? `Remove ${name} from saved` : `Save ${name}`}
        className={cn(
          "absolute right-4 top-4 flex size-9 items-center justify-center rounded-full",
          "bg-white/90 backdrop-blur-md transition-all duration-200 ease-[var(--ease-out-soft)]",
          "hover:scale-110 active:scale-95",
        )}
      >
        <Heart
          className={cn(
            "size-[1.125rem] transition-colors duration-200",
            saved
              ? "fill-burgundy-600 text-burgundy-600"
              : "fill-none text-burgundy-700/70",
          )}
          aria-hidden
        />
      </button>

      <Link href={href} className="mt-5 block focus:outline-none" tabIndex={-1}>
        <div className="flex items-baseline justify-between gap-4">
          <h3 className="font-display text-h4 font-medium text-foreground">
            {name}
          </h3>
          <Rating value={artist.rating} count={artist.reviewCount} />
        </div>

        <p className="mt-1.5 flex items-center gap-1.5 text-caption text-foreground-secondary">
          <MapPin className="size-3.5 shrink-0" aria-hidden />
          {artist.city}
          <span className="text-border-strong" aria-hidden>
            ·
          </span>
          <span className="tabular">
            {artist.experience} {artist.experience === 1 ? "yr" : "yrs"}
          </span>
        </p>

        <p className="mt-3 text-caption text-foreground-muted">
          {from !== null ? (
            <>
              From{" "}
              <span className="tabular font-medium text-foreground">
                {formatPrice(from)}
              </span>
            </>
          ) : (
            "Pricing on request"
          )}
        </p>
      </Link>
    </article>
  );
}
