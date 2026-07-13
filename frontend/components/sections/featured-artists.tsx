"use client";

import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { useArtists } from "@/hooks/use-artists";
import { Container, Section, SectionHead } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { ArtistGridSkeleton, EmptyState, ErrorState } from "@/components/ui/states";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";
import { ArtistCard } from "@/components/cards/artist-card";

export function FeaturedArtists() {
  const { artists, isPending, isError, refetch } = useArtists({
    sort: "recommended",
  });

  const featured = artists.slice(0, 6);

  return (
    <Section spacing="lg">
      <Container size="wide">
        <SectionHead
          overline="Handpicked"
          title="Artists our clients return to"
          description="Ranked by verified reviews, consistency and craft — not by who paid to be here."
          action={
            <Button asChild variant="secondary">
              <Link href="/artists">
                View all artists
                <ArrowRight aria-hidden />
              </Link>
            </Button>
          }
        />

        <div className="mt-16">
          {isPending ? (
            <ArtistGridSkeleton />
          ) : isError ? (
            <ErrorState
              title="We couldn't load our artists"
              description="This is on us, not you. Give it another go."
              onRetry={() => refetch()}
            />
          ) : featured.length === 0 ? (
            <EmptyState
              icon={<Sparkles />}
              title="Our first artists are being verified"
              description="We're onboarding artists city by city. Check back shortly — or join as an artist yourself."
              action={
                <Button asChild>
                  <Link href="/become-an-artist">Become a VEYA artist</Link>
                </Button>
              }
            />
          ) : (
            <Reveal
              immediate
              variants={stagger}
              className="grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3"
            >
              {featured.map((artist, i) => (
                <RevealItem key={artist.id}>
                  <ArtistCard artist={artist} priority={i < 3} />
                </RevealItem>
              ))}
            </Reveal>
          )}
        </div>
      </Container>
    </Section>
  );
}
