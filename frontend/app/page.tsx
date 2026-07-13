import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/sections/hero";
import { TrustStrip } from "@/components/sections/trust-strip";
import { FeaturedArtists } from "@/components/sections/featured-artists";
import { Categories } from "@/components/sections/categories";
import { WhyVeya } from "@/components/sections/why-veya";
import { HowItWorks } from "@/components/sections/how-it-works";
import { Testimonials } from "@/components/sections/testimonials";
import { BecomeArtistCta } from "@/components/sections/become-artist-cta";
import { Faq } from "@/components/sections/faq";

export default function LandingPage() {
  return (
    <>
      <Navbar transparent />
      <main id="main">
        <Hero />
        <TrustStrip />
        <FeaturedArtists />
        <Categories />
        <WhyVeya />
        <HowItWorks />
        <Testimonials />
        <BecomeArtistCta />
        <Faq />
      </main>
      <Footer />
    </>
  );
}
