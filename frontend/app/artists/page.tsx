import { Suspense } from "react";
import type { Metadata } from "next";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArtistGridSkeleton } from "@/components/ui/states";
import { Container } from "@/components/ui/layout";
import { ArtistBrowser } from "@/components/artist/artist-browser";

export const metadata: Metadata = {
  title: "Browse artists",
  description:
    "Compare verified makeup artists and hairstylists by city, budget, experience and rating.",
};

export default function ArtistsPage() {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-20">
        {/* useSearchParams needs a Suspense boundary to stay statically
            renderable at the route level. */}
        <Suspense
          fallback={
            <Container size="wide" className="py-16">
              <ArtistGridSkeleton count={9} />
            </Container>
          }
        >
          <ArtistBrowser />
        </Suspense>
      </main>
      <Footer />
    </>
  );
}
