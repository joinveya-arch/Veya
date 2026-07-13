import { Container, Section, SectionHead } from "@/components/ui/layout";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";

const STEPS = [
  {
    title: "Search your city",
    copy: "Filter by occasion, budget, experience and availability. Only verified artists are shown.",
  },
  {
    title: "Compare the work",
    copy: "Full portfolios, published packages and reviews written by clients who actually booked.",
  },
  {
    title: "Book the date",
    copy: "Pick a slot from the artist's live calendar. You'll have confirmation in writing.",
  },
] as const;

export function HowItWorks() {
  return (
    <Section spacing="lg" tone="soft">
      <Container size="wide">
        <SectionHead
          overline="How it works"
          title="Three steps. No phone tag."
          align="center"
        />

        <Reveal
          variants={stagger}
          as="ol"
          className="mt-20 grid gap-12 md:grid-cols-3 md:gap-8"
        >
          {STEPS.map((step, i) => (
            <RevealItem key={step.title} as="li" className="relative">
              {/* Hairline connecting the steps. Ends before the last item
                  so the sequence reads as finished, not truncated. */}
              {i < STEPS.length - 1 && (
                <span
                  aria-hidden
                  className="rule absolute left-0 right-0 top-[1.4rem] hidden translate-x-[3.5rem] md:block"
                />
              )}

              <div className="relative">
                <span className="tabular flex size-11 items-center justify-center rounded-full border border-border bg-surface font-display text-caption font-medium text-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>

              <h3 className="mt-8 font-display text-h4 font-medium">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[22rem] text-body text-foreground-secondary">
                {step.copy}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
