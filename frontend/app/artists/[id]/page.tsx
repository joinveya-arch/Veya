import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ArtistProfileView } from "@/components/artist/artist-profile-view";
import { MOCK_ARTIST_IDS } from "@/lib/mock/data";

/**
 * A static export has to know every path at build time. In demo mode we
 * pre-render one page per demo artist; against the real backend this is
 * ignored and the route stays dynamic, resolving any id at request time.
 */
export function generateStaticParams() {
  if (process.env.NEXT_PUBLIC_USE_MOCK !== "1") return [];
  return MOCK_ARTIST_IDS.map((id) => ({ id }));
}

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <>
      <Navbar />
      <main id="main" className="pt-20">
        <ArtistProfileView artistId={id} />
      </main>
      <Footer />
    </>
  );
}
