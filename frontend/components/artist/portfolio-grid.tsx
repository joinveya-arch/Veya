"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { portfolioFallback } from "@/lib/images";
import { useArtistPortfolio } from "@/hooks/use-artists";
import { Skeleton } from "@/components/ui/states";
import { Dialog, DialogContent } from "@/components/ui/dialog";

/**
 * Masonry-ish editorial grid: the first image spans two columns and two rows,
 * so the eye has an anchor. A uniform grid of equal squares reads as a
 * thumbnail dump; an artist's portfolio deserves a lead image.
 */
export function PortfolioGrid({ artistId }: { artistId: string }) {
  const { data, isPending } = useArtistPortfolio(artistId);
  const [open, setOpen] = useState<string | null>(null);

  if (isPending) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Skeleton className="col-span-2 row-span-2 aspect-square rounded-[var(--radius-image)]" />
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton
            key={i}
            className="aspect-square rounded-[var(--radius-image)]"
          />
        ))}
      </div>
    );
  }

  // The API returns rows with an imageUrl that may be empty until the artist
  // uploads. Fall back to a deterministic set so a new profile never looks
  // broken — but keep the count honest to what the artist actually has.
  const uploaded = (data ?? []).map((img) => img.imageUrl).filter(Boolean);
  const images =
    uploaded.length > 0
      ? uploaded
      : portfolioFallback(artistId, Math.max(data?.length ?? 0, 6));

  if (images.length === 0) return null;

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.slice(0, 9).map((src, i) => (
          <button
            key={src + i}
            onClick={() => setOpen(src)}
            aria-label={`View portfolio image ${i + 1}`}
            className={cn(
              "group relative overflow-hidden rounded-[var(--radius-image)] bg-surface-sunken",
              i === 0 ? "col-span-2 row-span-2 aspect-square" : "aspect-square",
            )}
          >
            <Image
              src={src}
              alt=""
              fill
              sizes={i === 0 ? "(max-width: 768px) 100vw, 50vw" : "25vw"}
              className="object-cover transition-transform duration-[600ms] ease-[var(--ease-out-soft)] group-hover:scale-[1.05]"
            />
            <span className="absolute inset-0 bg-burgundy-900/0 transition-colors duration-300 group-hover:bg-burgundy-900/15" />
          </button>
        ))}
      </div>

      {/* Lightbox. Chromeless — the photograph is the whole point. */}
      <Dialog open={Boolean(open)} onOpenChange={() => setOpen(null)}>
        <DialogContent
          hideClose
          className="max-w-[64rem] border-0 bg-transparent p-0 shadow-none"
        >
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-dialog)] bg-burgundy-900"
              >
                <Image
                  src={open}
                  alt=""
                  fill
                  sizes="90vw"
                  className="object-contain"
                />
              </motion.div>
            )}
          </AnimatePresence>
          <button
            onClick={() => setOpen(null)}
            aria-label="Close"
            className="absolute -top-12 right-0 rounded-full p-2 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
          >
            <X className="size-5" aria-hidden />
          </button>
        </DialogContent>
      </Dialog>
    </>
  );
}
