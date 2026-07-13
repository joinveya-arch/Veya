"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ImagePlus, Images, Loader2, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";
import { useArtistPortfolio } from "@/hooks/use-artists";
import {
  isMissingProfile,
  useAddPortfolioImage,
  useMyArtistProfile,
} from "@/hooks/use-artist-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ARTIST_NAV } from "@/components/dashboard/nav";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import type { PortfolioImage } from "@/types";

export default function ArtistPortfolioPage() {
  const profile = useMyArtistProfile();

  return (
    <DashboardShell
      role="ARTIST"
      nav={ARTIST_NAV}
      title="Portfolio"
      description="Your photographs are the pitch. Ten strong images will win you more work than forty average ones."
    >
      {profile.isPending ? (
        <GridSkeleton />
      ) : profile.isError && isMissingProfile(profile.error) ? (
        <EmptyState
          icon={<UserRound />}
          title="Complete your profile first"
          description="Your portfolio lives on your artist profile, so we need that before you can upload."
          action={
            <Button asChild>
              <Link href="/artist/profile">Complete your profile</Link>
            </Button>
          }
        />
      ) : profile.isError || !profile.data ? (
        <ErrorState
          title="We couldn't load your profile"
          onRetry={() => profile.refetch()}
        />
      ) : (
        <Portfolio artistId={profile.data.id} />
      )}
    </DashboardShell>
  );
}

function Portfolio({ artistId }: { artistId: string }) {
  const { data, isPending, isError, refetch } = useArtistPortfolio(artistId);
  const addImage = useAddPortfolioImage();
  const inputRef = useRef<HTMLInputElement>(null);

  // Be honest here: the public grid falls back to stock photography, but the
  // artist must see exactly what they have actually uploaded.
  const images: PortfolioImage[] = (data ?? []).filter((img) =>
    Boolean(img.imageUrl),
  );

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    // Reset immediately so picking the same file twice still fires a change.
    event.target.value = "";
    if (!file) return;
    addImage.mutate(file);
  }

  return (
    <div className="space-y-12">
      <label
        className={cn(
          "group flex cursor-pointer flex-col items-center justify-center gap-3 rounded-[var(--radius-card)]",
          "border border-dashed border-border-strong bg-surface-soft px-6 py-14 text-center",
          "transition-[border-color,background-color] duration-200 ease-[var(--ease-out-soft)]",
          "hover:border-accent hover:bg-surface-sunken",
          "focus-within:border-accent",
          addImage.isPending && "pointer-events-none opacity-70",
        )}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={addImage.isPending}
          onChange={onPick}
        />
        <span
          className="flex size-12 items-center justify-center rounded-full bg-surface text-foreground-secondary [&_svg]:size-5"
          aria-hidden
        >
          {addImage.isPending ? (
            <Loader2 className="animate-spin" />
          ) : (
            <ImagePlus />
          )}
        </span>
        <span className="font-display text-body font-medium text-foreground">
          {addImage.isPending ? "Uploading…" : "Add an image"}
        </span>
        <span className="text-caption text-foreground-secondary">
          JPG or PNG. One at a time — choose the frame you&apos;d put in a
          window.
        </span>
      </label>

      <div>
        <div className="mb-6 flex items-baseline justify-between gap-6">
          <h2 className="text-h3">Your images</h2>
          {images.length > 0 && (
            <p className="tabular text-caption text-foreground-muted">
              {images.length} {images.length === 1 ? "image" : "images"}
            </p>
          )}
        </div>

        {isPending ? (
          <GridSkeleton />
        ) : isError ? (
          <ErrorState
            title="We couldn't load your portfolio"
            onRetry={() => refetch()}
          />
        ) : images.length === 0 ? (
          <EmptyState
            icon={<Images />}
            title="No images yet"
            description="Upload your first photograph. Clients scroll the work long before they read a word of the profile."
            action={
              <Button onClick={() => inputRef.current?.click()}>
                <ImagePlus aria-hidden />
                Add an image
              </Button>
            }
          />
        ) : (
          <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {images.map((image, i) => (
              <li
                key={image.id}
                className="relative aspect-square overflow-hidden rounded-[var(--radius-image)] bg-surface-sunken"
              >
                <Image
                  src={image.imageUrl}
                  alt={`Portfolio image ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover"
                />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Skeleton
          key={i}
          className="aspect-square w-full rounded-[var(--radius-image)]"
        />
      ))}
    </div>
  );
}
