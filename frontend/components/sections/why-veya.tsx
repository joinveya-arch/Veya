import { BadgeCheck, MessagesSquare, ShieldCheck, Sparkles } from "lucide-react";
import { Container, Section, SectionHead } from "@/components/ui/layout";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";

const PILLARS = [
  {
    icon: BadgeCheck,
    title: "Verified, not just listed",
    copy: "Every artist submits identity, portfolio and work history. We review each one by hand before they appear.",
  },
  {
    icon: MessagesSquare,
    title: "Reviews from real bookings",
    copy: "Only clients who completed a booking can leave a review. No purchased ratings, no anonymous noise.",
  },
  {
    icon: ShieldCheck,
    title: "Transparent pricing",
    copy: "Published packages with the price on them. What you see at booking is what you pay on the day.",
  },
  {
    icon: Sparkles,
    title: "Curated, not crowded",
    copy: "We would rather show you twelve artists worth booking than four hundred you have to sift through.",
  },
] as const;

export function WhyVeya() {
  return (
    <Section spacing="lg">
      <Container size="wide">
        <div className="grid gap-16 lg:grid-cols-[0.85fr_1.15fr] lg:gap-24">
          <SectionHead
            overline="Why VEYA"
            title="Trust, built into the product"
            description="Booking someone for the most photographed day of your life shouldn't feel like a gamble. So we removed the guesswork."
            className="lg:sticky lg:top-32 lg:self-start"
          />

          <Reveal variants={stagger} as="ul" className="space-y-0">
            {PILLARS.map(({ icon: Icon, title, copy }) => (
              <RevealItem
                key={title}
                as="li"
                className="flex gap-6 border-t border-border py-9 first:border-t-0 first:pt-0"
              >
                <Icon
                  className="mt-1 size-5 shrink-0 text-accent"
                  strokeWidth={1.5}
                  aria-hidden
                />
                <div className="space-y-2">
                  <h3 className="font-display text-h4 font-medium">{title}</h3>
                  <p className="max-w-[34rem] text-body text-foreground-secondary">
                    {copy}
                  </p>
                </div>
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
