"use client";

import Link from "next/link";
import { MessageSquareOff } from "lucide-react";
import { ADMIN_NAV } from "@/components/dashboard/nav";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ReviewCard } from "@/components/cards/review-card";
import { Rating } from "@/components/ui/rating";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";
import { useAdminReviews } from "@/hooks/use-admin";

export default function AdminReviewsPage() {
  return (
    <DashboardShell
      role="ADMIN"
      nav={ADMIN_NAV}
      title="Reviews"
      description="Every review left on VEYA, newest first, labelled with the artist it belongs to."
    >
      <ReviewsAdmin />
    </DashboardShell>
  );
}

function ReviewsAdmin() {
  /**
   * N+1 by necessity. The API exposes reviews only per artist
   * (GET /artists/:id/reviews) — there is no global reviews endpoint — so
   * `useAdminReviews` fetches the roster, then one request per artist, and
   * flattens the results. A `GET /admin/reviews` endpoint would collapse
   * all of that into a single query.
   */
  const { reviews, isPending, isError, refetch } = useAdminReviews();

  if (isPending) return <ReviewsSkeleton />;
  if (isError) {
    return (
      <ErrorState
        description="We couldn't gather reviews across every artist. Please try again."
        onRetry={refetch}
      />
    );
  }

  if (reviews.length === 0) {
    return (
      <EmptyState
        icon={<MessageSquareOff />}
        title="No reviews yet"
        description="Reviews appear here once customers start writing them after a completed booking."
      />
    );
  }

  return (
    <div className="space-y-6">
      <p className="text-caption text-foreground-secondary">
        <span className="tabular font-medium text-foreground">
          {reviews.length}
        </span>{" "}
        {reviews.length === 1 ? "review" : "reviews"} across the platform
      </p>

      <Reveal variants={stagger} as="ul" immediate>
        {reviews.map(({ review, artist }) => (
          <RevealItem
            as="li"
            key={review.id}
            className="border-t border-border py-8 first:border-t-0"
          >
            {/* Every review is labelled with the artist it was written
                about — otherwise a flat, cross-artist feed is unreadable. */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <Link
                href={`/artists/${artist.id}`}
                className="text-overline font-medium uppercase text-accent transition-opacity hover:opacity-70"
              >
                {artist.user?.name ?? "Unnamed artist"}
              </Link>
              <span className="text-caption text-foreground-muted">
                {artist.city}
              </span>
              <Rating
                value={artist.rating}
                count={artist.reviewCount}
                size="sm"
                className="ml-auto"
              />
            </div>

            <div className="mt-5">
              <ReviewCard review={review} />
            </div>
          </RevealItem>
        ))}
      </Reveal>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div className="space-y-10">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <Skeleton className="h-3 w-32" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
          <Skeleton className="h-12 w-full max-w-[46rem]" />
        </div>
      ))}
    </div>
  );
}
