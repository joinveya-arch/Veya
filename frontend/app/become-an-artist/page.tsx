import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, CalendarCheck, Wallet } from "lucide-react";
import { ARTIST_CTA_IMAGE, HERO_IMAGE } from "@/lib/images";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container, Section, SectionHead } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";
import { Faq } from "@/components/sections/faq";

export const metadata: Metadata = {
  title: "Become a VEYA artist",
  description:
    "Bring your portfolio, set your own packages, and let clients book you from a calendar — not a DM at midnight.",
};

const PILLARS = [
  {
    icon: Wallet,
    title: "No listing fee",
    copy: "You keep what you earn. We make money when you do, not before.",
  },
  {
    icon: CalendarCheck,
    title: "Your calendar, your rules",
    copy: "Open only the dates you want. Publish your own packages at your own prices.",
  },
  {
    icon: BadgeCheck,
    title: "A badge that means something",
    copy: "We verify by hand — ID, portfolio, past clients. That's why clients trust it.",
  },
] as const;

const STEPS = [
  {
    title: "Create your account",
    copy: "Name, email, city. Two minutes, and nothing is public yet.",
  },
  {
    title: "Build your profile",
    copy: "Upload your work, write your bio, publish your packages and prices.",
  },
  {
    title: "We verify you",
    copy: "A real person reviews your portfolio and history — usually within 48 hours.",
  },
  {
    title: "Start taking bookings",
    copy: "You appear in search. Clients book from your live calendar.",
  },
] as const;

export default function BecomeAnArtistPage() {
  return (
    <>
      <Navbar transparent />
      <main id="main">
        {/* Hero */}
        <section className="relative flex min-h-[78vh] items-end overflow-hidden pt-20">
          <div className="grain absolute inset-0">
            <Image
              src={HERO_IMAGE}
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover object-[72%_center]"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/90 via-burgundy-900/45 to-burgundy-900/30" />
            <div className="absolute inset-0 bg-gradient-to-r from-burgundy-900/80 via-burgundy-900/30 to-transparent" />
          </div>

          <Container size="wide" className="relative z-10 pb-24 pt-32">
            <Reveal immediate variants={stagger} className="max-w-[46rem]">
              <RevealItem>
                <p className="text-overline font-medium uppercase text-champagne-300">
                  For artists
                </p>
              </RevealItem>
              <RevealItem>
                <h1 className="mt-6 font-display text-display font-medium text-white">
                  Your work deserves better than a DM.
                </h1>
              </RevealItem>
              <RevealItem>
                <p className="mt-8 max-w-[34rem] text-[1.0625rem] leading-relaxed text-white/75">
                  Bring your portfolio, set your own packages, and let clients
                  book you from a calendar — instead of negotiating over
                  Instagram at midnight.
                </p>
              </RevealItem>
              <RevealItem>
                <div className="mt-12 flex flex-wrap gap-3">
                  <Button asChild variant="gold" size="lg">
                    <Link href="/signup?role=artist">
                      Apply to join
                      <ArrowRight aria-hidden />
                    </Link>
                  </Button>
                  <Button
                    asChild
                    size="lg"
                    variant="secondary"
                    className="border-white/25 bg-white/10 text-white backdrop-blur-md hover:bg-white/20 hover:text-white"
                  >
                    <Link href="/artists">See who&apos;s already here</Link>
                  </Button>
                </div>
              </RevealItem>
            </Reveal>
          </Container>
        </section>

        {/* Why */}
        <Section spacing="lg" tone="surface">
          <Container size="wide">
            <SectionHead
              overline="Why VEYA"
              title="Built for the way you actually work"
            />

            <Reveal
              variants={stagger}
              as="ul"
              className="mt-16 grid gap-x-8 gap-y-12 md:grid-cols-3"
            >
              {PILLARS.map(({ icon: Icon, title, copy }) => (
                <RevealItem as="li" key={title}>
                  <Icon
                    className="size-5 text-accent"
                    strokeWidth={1.5}
                    aria-hidden
                  />
                  <h3 className="mt-6 font-display text-h4 font-medium">
                    {title}
                  </h3>
                  <p className="mt-3 text-body text-foreground-secondary">
                    {copy}
                  </p>
                </RevealItem>
              ))}
            </Reveal>
          </Container>
        </Section>

        {/* How */}
        <Section spacing="lg">
          <Container size="wide">
            <div className="grid gap-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-24">
              <div className="lg:sticky lg:top-32 lg:self-start">
                <SectionHead
                  overline="Getting listed"
                  title="Four steps to your first booking"
                  description="Most artists are live within a week. The only thing that takes time is our review — and that's the part clients are paying for."
                />

                <div className="relative mt-12 hidden aspect-[4/3] overflow-hidden rounded-[var(--radius-image)] lg:block">
                  <Image
                    src={ARTIST_CTA_IMAGE}
                    alt=""
                    fill
                    sizes="40vw"
                    className="object-cover"
                  />
                </div>
              </div>

              <Reveal variants={stagger} as="ol">
                {STEPS.map((step, i) => (
                  <RevealItem
                    as="li"
                    key={step.title}
                    className="flex gap-6 border-t border-border py-9 first:border-t-0 first:pt-0"
                  >
                    <span className="tabular flex size-11 shrink-0 items-center justify-center rounded-full border border-border font-display text-caption font-medium">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <div className="space-y-2 pt-1.5">
                      <h3 className="font-display text-h4 font-medium">
                        {step.title}
                      </h3>
                      <p className="max-w-[34rem] text-body text-foreground-secondary">
                        {step.copy}
                      </p>
                    </div>
                  </RevealItem>
                ))}
              </Reveal>
            </div>
          </Container>
        </Section>

        {/* Closing CTA */}
        <Section spacing="lg" tone="surface">
          <Container size="narrow">
            <Reveal className="rounded-[var(--radius-card)] bg-burgundy-700 px-10 py-20 text-center md:px-16">
              <h2 className="mx-auto max-w-[20ch] font-display text-h1 font-medium text-white">
                Ready to be found?
              </h2>
              <p className="mx-auto mt-6 max-w-[34rem] text-body text-white/70">
                Applications take about two minutes. There&apos;s no fee, and no
                obligation to accept a single booking.
              </p>
              <Button asChild variant="gold" size="lg" className="mt-10">
                <Link href="/signup?role=artist">
                  Apply to join VEYA
                  <ArrowRight aria-hidden />
                </Link>
              </Button>
            </Reveal>
          </Container>
        </Section>

        <Faq />
      </main>
      <Footer />
    </>
  );
}
