"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { artistService } from "@/services";
import type { ArtistFilters, ArtistProfile, Service } from "@/types";

/** Lowest-priced service on a profile, or null when none are published. */
export function startingPrice(artist: ArtistProfile): number | null {
  const services = artist.services ?? [];
  if (services.length === 0) return null;
  return Math.min(...services.map((s: Service) => Number(s.price)));
}

/**
 * The API filters on city + minExperience only. Rating, price and
 * verification are refined here so the filter panel stays responsive
 * without a round trip per keystroke.
 */
function refine(
  artists: ArtistProfile[],
  filters: ArtistFilters,
): ArtistProfile[] {
  const { minRating, maxPrice, verifiedOnly, sort = "recommended" } = filters;

  const filtered = artists.filter((a) => {
    if (verifiedOnly && !a.verified) return false;
    if (minRating && a.rating < minRating) return false;
    if (maxPrice) {
      const from = startingPrice(a);
      // An artist with no published services can't satisfy a price ceiling.
      if (from === null || from > maxPrice) return false;
    }
    return true;
  });

  const sorted = [...filtered];
  switch (sort) {
    case "rating":
      sorted.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case "experience":
      sorted.sort((a, b) => b.experience - a.experience);
      break;
    case "price-asc":
    case "price-desc": {
      const dir = sort === "price-asc" ? 1 : -1;
      sorted.sort((a, b) => {
        const pa = startingPrice(a);
        const pb = startingPrice(b);
        // Unpriced artists sink to the bottom of either direction.
        if (pa === null) return 1;
        if (pb === null) return -1;
        return (pa - pb) * dir;
      });
      break;
    }
    default:
      // Recommended: verified first, then rating weighted by review volume.
      sorted.sort((a, b) => {
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        const score = (x: ArtistProfile) =>
          x.rating * Math.log10(x.reviewCount + 10);
        return score(b) - score(a);
      });
  }
  return sorted;
}

export function useArtists(filters: ArtistFilters = {}) {
  const { city, minExperience } = filters;

  const query = useQuery({
    // Only server-side params belong in the key — client refinements
    // must not trigger a refetch.
    queryKey: ["artists", { city, minExperience }],
    queryFn: () => artistService.list({ city, minExperience }),
  });

  const artists = useMemo(
    () => (query.data ? refine(query.data, filters) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [
      query.data,
      filters.minRating,
      filters.maxPrice,
      filters.verifiedOnly,
      filters.sort,
    ],
  );

  return { ...query, artists };
}

export function useArtist(id: string) {
  return useQuery({
    queryKey: ["artist", id],
    queryFn: () => artistService.byId(id),
    enabled: Boolean(id),
  });
}

export function useArtistPortfolio(id: string) {
  return useQuery({
    queryKey: ["artist", id, "portfolio"],
    queryFn: () => artistService.portfolio(id),
    enabled: Boolean(id),
  });
}

export function useArtistReviews(id: string) {
  return useQuery({
    queryKey: ["artist", id, "reviews"],
    queryFn: () => artistService.reviews(id),
    enabled: Boolean(id),
  });
}

export function useArtistAvailability(id: string) {
  return useQuery({
    queryKey: ["artist", id, "availability"],
    queryFn: () => artistService.availability(id),
    enabled: Boolean(id),
  });
}

export function useArtistServices(id: string) {
  return useQuery({
    queryKey: ["artist", id, "services"],
    queryFn: () => artistService.byId(id).then((a) => a.services ?? []),
    enabled: Boolean(id),
  });
}
