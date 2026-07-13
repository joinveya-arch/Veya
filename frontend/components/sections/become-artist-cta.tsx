import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ARTIST_CTA_IMAGE } from "@/lib/images";
import { Container, Section } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/ui/motion";

const BENEFITS = [
  "No listing fee — you keep what you earn",
  "Your calendar, your prices, your packages",
  "Verified badge once we've reviewed your work",
] as const;

export function BecomeArtistCta() {
  return (
    <Section spacing="lg">
      <Container size="wide">
        <Reveal className="overflow-hidden rounded-[var(--radius-card)] bg-burgundy-700">
          <div className="grid lg:grid-cols-2">
            <div className="order-2 p-10 md:p-16 lg:order-1 lg:py-24">
              <p className="text-overline font-medium uppercase text-champagne-300">
                For artists
              </p>
              <h2 className="mt-6 max-w-[20ch] font-display text-h1 font-medium text-white">
                Your work deserves better than a DM.
              </h2>
              <p className="mt-6 max-w-[36rem] text-body text-white/70">
                Bring your portfolio, set your own packages, and let clients book
                you from a calendar instead of negotiating over Instagram at
                midnight.
              </p>

              <ul className="mt-10 space-y-4">
                {BENEFITS.map((benefit) => (
                  <li
                    key={benefit}
                    className="flex items-start gap-3 border-t border-white/10 pt-4 text-caption text-white/80 first:border-t-0 first:pt-0"
                  >
                    <span
                      className="mt-[0.45rem] size-1 shrink-0 rounded-full bg-accent"
                      aria-hidden
                    />
                    {benefit}
                  </li>
                ))}
              </ul>

              <Button asChild variant="gold" size="lg" className="mt-12">
                <Link href="/become-an-artist">
                  Apply to join
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </div>

            <div className="relative order-1 min-h-[22rem] lg:order-2 lg:min-h-full">
              <Image
                src={ARTIST_CTA_IMAGE}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              {/* Feathers the photograph into the burgundy field rather than
                  letting it butt against a hard seam. */}
              <div
                className="absolute inset-0 bg-gradient-to-r from-burgundy-700 via-burgundy-700/30 to-transparent lg:bg-gradient-to-r"
                aria-hidden
              />
            </div>
          </div>
        </Reveal>
      </Container>
    </Section>
  );
}
