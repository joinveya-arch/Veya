import { formatDate } from "@/lib/utils";
import { Avatar } from "@/components/ui/avatar";
import { Rating } from "@/components/ui/rating";
import type { Review } from "@/types";

export function ReviewCard({ review }: { review: Review }) {
  const name = review.customer?.name ?? "VEYA client";

  return (
    <article className="border-t border-border py-8 first:border-t-0 first:pt-0">
      <div className="flex items-center gap-3">
        <Avatar name={name} size="md" />
        <div className="min-w-0">
          <p className="text-caption font-medium text-foreground">{name}</p>
          <p className="text-caption text-foreground-muted">
            {formatDate(review.createdAt, { month: "long", year: "numeric" })}
          </p>
        </div>
        <Rating value={review.rating} variant="stars" size="sm" className="ml-auto" />
      </div>

      {review.comment && (
        <p className="mt-5 max-w-[46rem] text-body text-foreground-secondary">
          {review.comment}
        </p>
      )}
    </article>
  );
}
