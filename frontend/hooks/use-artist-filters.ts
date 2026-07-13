"use client";

import { useCallback, useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ArtistFilters } from "@/types";

/**
 * Filters live in the URL, not in component state — so a filtered search is
 * shareable, survives a refresh, and the back button undoes one filter at a
 * time. The listing page is exactly the kind of thing people paste into a
 * group chat.
 */
export function useArtistFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = useMemo<ArtistFilters>(() => {
    const num = (key: string) => {
      const raw = params.get(key);
      const value = raw ? Number(raw) : NaN;
      return Number.isFinite(value) ? value : undefined;
    };
    return {
      city: params.get("city") ?? undefined,
      minExperience: num("minExperience"),
      minRating: num("minRating"),
      maxPrice: num("maxPrice"),
      verifiedOnly: params.get("verified") === "1" || undefined,
      sort: (params.get("sort") as ArtistFilters["sort"]) ?? "recommended",
    };
  }, [params]);

  const setFilters = useCallback(
    (patch: Partial<ArtistFilters>) => {
      const next = new URLSearchParams(params.toString());

      const write = (key: string, value: unknown) => {
        if (value === undefined || value === null || value === "")
          next.delete(key);
        else next.set(key, String(value));
      };

      if ("city" in patch) write("city", patch.city);
      if ("minExperience" in patch) write("minExperience", patch.minExperience);
      if ("minRating" in patch) write("minRating", patch.minRating);
      if ("maxPrice" in patch) write("maxPrice", patch.maxPrice);
      if ("verifiedOnly" in patch)
        write("verified", patch.verifiedOnly ? "1" : undefined);
      if ("sort" in patch)
        write("sort", patch.sort === "recommended" ? undefined : patch.sort);

      router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
        scroll: false,
      });
    },
    [params, pathname, router],
  );

  const reset = useCallback(() => {
    // `service` is a browse context set by the landing page, not a filter the
    // panel owns — clearing filters must not silently drop it.
    const next = new URLSearchParams();
    const service = params.get("service");
    if (service) next.set("service", service);
    router.replace(`${pathname}${next.size ? `?${next}` : ""}`, {
      scroll: false,
    });
  }, [params, pathname, router]);

  const activeCount = [
    filters.city,
    filters.minExperience,
    filters.minRating,
    filters.maxPrice,
    filters.verifiedOnly,
  ].filter(Boolean).length;

  return { filters, setFilters, reset, activeCount };
}
