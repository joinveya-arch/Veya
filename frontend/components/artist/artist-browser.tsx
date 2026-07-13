"use client";

import { useSearchParams } from "next/navigation";
import { SlidersHorizontal, SearchX } from "lucide-react";
import { SERVICE_TYPES, SORT_OPTIONS } from "@/lib/constants";
import { useArtists } from "@/hooks/use-artists";
import { useArtistFilters } from "@/hooks/use-artist-filters";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/dialog";
import { ArtistGridSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";
import { ArtistCard } from "@/components/cards/artist-card";
import { FilterPanel } from "./filter-panel";

export function ArtistBrowser() {
  const { filters, setFilters, reset, activeCount } = useArtistFilters();
  const { artists, isPending, isError, refetch } = useArtists(filters);
  const params = useSearchParams();

  // `service` is a browse context from the landing page. The API has no
  // service-type filter, so it's surfaced as a heading, honestly, rather
  // than pretending to narrow the results.
  const service = SERVICE_TYPES.find((s) => s.value === params.get("service"));

  const heading = service ? `${service.label} artists` : "All artists";
  const where = filters.city ? ` in ${filters.city}` : "";

  return (
    <Container size="wide" className="py-14 md:py-16">
      <header className="max-w-[46rem]">
        <p className="text-overline font-medium uppercase text-accent">
          {activeCount > 0 ? "Filtered results" : "Browse"}
        </p>
        <h1 className="mt-4 text-h1">
          {heading}
          {where}
        </h1>
        <p className="mt-5 text-body text-foreground-secondary">
          Every artist here has been verified by hand. Compare their work,
          packages and reviews, then book the date.
        </p>
      </header>

      <div className="mt-14 grid gap-x-12 lg:grid-cols-[16rem_1fr]">
        {/* Desktop rail. Sticks so filters stay reachable deep in the grid. */}
        <aside className="hidden lg:block">
          <div className="sticky top-28 max-h-[calc(100vh-9rem)] overflow-y-auto pr-2">
            <FilterPanel
              filters={filters}
              onChange={setFilters}
              onReset={reset}
              activeCount={activeCount}
            />
          </div>
        </aside>

        <div>
          <div className="flex items-center justify-between gap-4 border-b border-border pb-5">
            <p className="text-caption text-foreground-secondary">
              {isPending ? (
                "Finding artists…"
              ) : (
                <>
                  <span className="tabular font-medium text-foreground">
                    {artists.length}
                  </span>{" "}
                  {artists.length === 1 ? "artist" : "artists"}
                </>
              )}
            </p>

            <div className="flex items-center gap-3">
              {/* Mobile: the same panel, in a drawer. */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="secondary" size="sm" className="lg:hidden">
                    <SlidersHorizontal aria-hidden />
                    Filters
                    {activeCount > 0 && (
                      <Badge variant="burgundy" size="sm" className="ml-1">
                        {activeCount}
                      </Badge>
                    )}
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="overflow-y-auto p-8">
                  <div className="mt-6">
                    <FilterPanel
                      filters={filters}
                      onChange={setFilters}
                      onReset={reset}
                      activeCount={activeCount}
                    />
                  </div>
                </SheetContent>
              </Sheet>

              <Select
                value={filters.sort ?? "recommended"}
                onValueChange={(sort) =>
                  setFilters({ sort: sort as typeof filters.sort })
                }
              >
                <SelectTrigger
                  aria-label="Sort artists"
                  className="h-9 w-auto min-w-[11rem] gap-3 border-border text-caption"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SORT_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-12">
            {isPending ? (
              <ArtistGridSkeleton count={9} />
            ) : isError ? (
              <ErrorState onRetry={() => refetch()} />
            ) : artists.length === 0 ? (
              <EmptyState
                icon={<SearchX />}
                title="No artists match those filters"
                description="Try widening the budget, or clearing a filter or two. We'd rather show you nothing than show you someone we can't vouch for."
                action={
                  activeCount > 0 && (
                    <Button variant="secondary" onClick={reset}>
                      Clear all filters
                    </Button>
                  )
                }
              />
            ) : (
              /* `immediate`: results are this page's primary content and must
                 never wait on a scroll observer. A grid left invisible because
                 an IntersectionObserver didn't fire is an empty page — worse
                 than an unanimated one. Scroll reveals are for marketing. */
              <Reveal
                immediate
                variants={stagger}
                className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 xl:grid-cols-3"
              >
                {artists.map((artist, i) => (
                  <RevealItem key={artist.id}>
                    <ArtistCard artist={artist} priority={i < 3} />
                  </RevealItem>
                ))}
              </Reveal>
            )}
          </div>
        </div>
      </div>
    </Container>
  );
}
