"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { UserX } from "lucide-react";
import { cn } from "@/lib/utils";
import { artistImage } from "@/lib/images";
import { ADMIN_NAV } from "@/components/dashboard/nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { Badge, VerifiedBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/controls";
import { Rating } from "@/components/ui/rating";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";
import { useAdminArtists, useVerifyArtist } from "@/hooks/use-admin";
import type { ArtistProfile } from "@/types";

type Filter = "all" | "pending" | "verified";

const FILTERS: { value: Filter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "pending", label: "Pending" },
  { value: "verified", label: "Verified" },
];

export default function AdminArtistsPage() {
  return (
    <DashboardShell
      role="ADMIN"
      nav={ADMIN_NAV}
      title="Artists"
      description="Verification is the platform's only trust signal. Grant it by hand, and take it back when the work no longer earns it."
    >
      <ArtistsAdmin />
    </DashboardShell>
  );
}

function ArtistsAdmin() {
  const { data, isPending, isError, refetch } = useAdminArtists();
  const [filter, setFilter] = React.useState<Filter>("all");

  /* Confirmation is only required in the destructive direction — verifying
     is reversible and additive; unverifying strips a live trust mark. */
  const [unverifying, setUnverifying] = React.useState<ArtistProfile | null>(
    null,
  );

  const verify = useVerifyArtist();

  if (isPending) return <ArtistsSkeleton />;
  if (isError) {
    return (
      <ErrorState
        description="We couldn't load the artist roster. Please try again."
        onRetry={() => void refetch()}
      />
    );
  }

  const artists = data;
  const counts: Record<Filter, number> = {
    all: artists.length,
    pending: artists.filter((artist) => !artist.verified).length,
    verified: artists.filter((artist) => artist.verified).length,
  };

  const listFor = (value: Filter) =>
    value === "all"
      ? artists
      : artists.filter((artist) =>
          value === "verified" ? artist.verified : !artist.verified,
        );

  return (
    <>
      <Tabs value={filter} onValueChange={(value) => setFilter(value as Filter)}>
        <TabsList aria-label="Filter artists by verification">
          {FILTERS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
              <span className="tabular ml-2 text-foreground-muted">
                {counts[tab.value]}
              </span>
            </TabsTrigger>
          ))}
        </TabsList>

        {FILTERS.map((tab) => {
          const list = listFor(tab.value);
          return (
            <TabsContent key={tab.value} value={tab.value} className="mt-10">
              {list.length === 0 ? (
                <EmptyState
                  icon={<UserX />}
                  title={
                    tab.value === "pending"
                      ? "No artists awaiting verification"
                      : tab.value === "verified"
                        ? "No verified artists yet"
                        : "No artists on the platform yet"
                  }
                  description={
                    tab.value === "pending"
                      ? "Every profile has been reviewed. New ones will surface here as they're created."
                      : "Artist profiles will appear here as soon as they're created."
                  }
                />
              ) : (
                <Reveal variants={stagger} as="ul" immediate>
                  {list.map((artist) => (
                    <RevealItem as="li" key={artist.id}>
                      <ArtistRow
                        artist={artist}
                        busy={
                          verify.isPending &&
                          verify.variables?.id === artist.id
                        }
                        onVerify={() =>
                          verify.mutate({
                            id: artist.id,
                            verified: true,
                            name: artist.user?.name,
                          })
                        }
                        onUnverify={() => setUnverifying(artist)}
                      />
                    </RevealItem>
                  ))}
                </Reveal>
              )}
            </TabsContent>
          );
        })}
      </Tabs>

      <Dialog
        open={unverifying !== null}
        onOpenChange={(open) => !open && setUnverifying(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Remove verification?</DialogTitle>
            <DialogDescription>
              {unverifying?.user?.name ?? "This artist"} will immediately lose
              their verified badge everywhere on VEYA, and will drop below
              verified artists in recommended results. You can restore it at any
              time.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-8">
            <Button variant="secondary" onClick={() => setUnverifying(null)}>
              Keep verified
            </Button>
            <Button
              variant="danger"
              loading={verify.isPending}
              onClick={() => {
                if (!unverifying) return;
                verify.mutate(
                  {
                    id: unverifying.id,
                    verified: false,
                    name: unverifying.user?.name,
                  },
                  { onSettled: () => setUnverifying(null) },
                );
              }}
            >
              Remove verification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ArtistRow({
  artist,
  busy,
  onVerify,
  onUnverify,
}: {
  artist: ArtistProfile;
  busy: boolean;
  onVerify: () => void;
  onUnverify: () => void;
}) {
  const name = artist.user?.name ?? "Unnamed artist";

  return (
    <article className="flex flex-col gap-5 border-b border-border py-6 sm:flex-row sm:items-center sm:gap-6">
      {/* Decorative: the name beside it is the link, so this stays out of
          the tab order rather than duplicating the same destination. */}
      <div className="relative size-16 shrink-0 overflow-hidden rounded-[var(--radius-image)] bg-surface-sunken">
        <Image
          src={artistImage(artist.id, artist.profileImage)}
          alt=""
          fill
          sizes="64px"
          className="object-cover"
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-h4 font-medium text-foreground">
            <Link
              href={`/artists/${artist.id}`}
              className="transition-colors hover:text-accent"
            >
              {name}
            </Link>
          </h3>
          {artist.verified ? (
            <VerifiedBadge size="sm" />
          ) : (
            <Badge variant="outline" size="sm">
              Pending
            </Badge>
          )}
        </div>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-caption text-foreground-muted">
          <span>{artist.city}</span>
          <span className="tabular">
            {artist.experience} {artist.experience === 1 ? "year" : "years"}
          </span>
          <Rating value={artist.rating} count={artist.reviewCount} size="sm" />
        </div>
      </div>

      <div className="shrink-0">
        {artist.verified ? (
          <Button
            variant="secondary"
            size="sm"
            loading={busy}
            onClick={onUnverify}
          >
            Unverify
          </Button>
        ) : (
          <Button
            variant="primary"
            size="sm"
            loading={busy}
            onClick={onVerify}
          >
            Verify
          </Button>
        )}
      </div>
    </article>
  );
}

function ArtistsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="space-y-6">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className={cn("flex items-center gap-6 border-b border-border pb-6")}
          >
            <Skeleton className="size-16 shrink-0 rounded-[var(--radius-image)]" />
            <div className="flex-1 space-y-2.5">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>
            <Skeleton className="h-9 w-24 rounded-[var(--radius-button)]" />
          </div>
        ))}
      </div>
    </div>
  );
}
