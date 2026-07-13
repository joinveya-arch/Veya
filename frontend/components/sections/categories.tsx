import Image from "next/image";
import Link from "next/link";
import { CATEGORY_IMAGES } from "@/lib/images";
import { Container, Section, SectionHead } from "@/components/ui/layout";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";

interface Category {
  slug: string;
  title: string;
  copy: string;
  image: string;
  /** The lead tile spans two columns on desktop. */
  wide?: boolean;
}

const CATEGORIES: Category[] = [
  {
    slug: "bridal",
    title: "Bridal",
    copy: "The day everything is measured against.",
    image: CATEGORY_IMAGES.bridal,
    // An even 4-across grid reads as a card wall, not an editorial spread.
    wide: true,
  },
  {
    slug: "party",
    title: "Party & event",
    copy: "Evening looks that hold up under any light.",
    image: CATEGORY_IMAGES.party,
  },
  {
    slug: "editorial",
    title: "Editorial",
    copy: "Camera-ready, for shoots and campaigns.",
    image: CATEGORY_IMAGES.editorial,
  },
  {
    slug: "hair",
    title: "Hairstyling",
    copy: "Cuts, colour and occasion styling.",
    image: CATEGORY_IMAGES.hair,
  },
];

export function Categories() {
  return (
    <Section spacing="lg" tone="surface">
      <Container size="wide">
        <SectionHead
          overline="Browse by occasion"
          title="What are you getting ready for?"
        />

        <Reveal
          variants={stagger}
          className="mt-16 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
        >
          {CATEGORIES.map((category) => (
            <RevealItem
              key={category.slug}
              className={category.wide ? "lg:col-span-2" : undefined}
            >
              <Link
                href={`/artists?service=${category.slug}`}
                className="group relative block h-full overflow-hidden rounded-[var(--radius-image)]"
              >
                <div
                  className={
                    category.wide
                      ? "relative aspect-[16/10] lg:aspect-[16/9]"
                      : "relative aspect-[16/10] lg:aspect-[4/5]"
                  }
                >
                  <Image
                    src={category.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-[700ms] ease-[var(--ease-out-soft)] group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/80 via-burgundy-900/15 to-transparent" />
                </div>

                <div className="absolute inset-x-0 bottom-0 p-7">
                  <h3 className="font-display text-h3 font-medium text-white">
                    {category.title}
                  </h3>
                  {/* Copy is held back until hover — at rest the tile is
                      photograph and title, nothing more. */}
                  <p className="mt-1 max-w-[22rem] text-caption text-white/0 transition-colors duration-300 ease-[var(--ease-out-soft)] group-hover:text-white/80">
                    {category.copy}
                  </p>
                </div>
              </Link>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
