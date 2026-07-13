import { Container, Section, SectionHead } from "@/components/ui/layout";
import { Card } from "@/components/ui/card";
import { Rating } from "@/components/ui/rating";
import { Avatar } from "@/components/ui/avatar";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";

const TESTIMONIALS = [
  {
    quote:
      "I'd been sent a dozen Instagram handles by well-meaning friends. VEYA was the first place I could see a full portfolio, a real price and reviews from people who had actually booked her.",
    name: "Ananya R.",
    context: "Bridal · Mumbai",
    rating: 5,
  },
  {
    quote:
      "The trial was on a Tuesday, the wedding on a Sunday, and both looked exactly like the pictures. That sounds like a low bar. It is not.",
    name: "Ishita M.",
    context: "Bridal · Jaipur",
    rating: 5,
  },
  {
    quote:
      "Booked for a shoot with four days' notice. Confirmed in writing within the hour, arrived early, and knew what she was doing.",
    name: "Priya K.",
    context: "Editorial · Bengaluru",
    rating: 5,
  },
] as const;

export function Testimonials() {
  return (
    <Section spacing="lg">
      <Container size="wide">
        <SectionHead
          overline="In their words"
          title="What clients tell us afterwards"
        />

        <Reveal
          variants={stagger}
          className="mt-16 grid gap-6 md:grid-cols-3"
        >
          {TESTIMONIALS.map((t) => (
            <RevealItem key={t.name}>
              <Card
                variant="surface"
                padding="lg"
                className="flex h-full flex-col justify-between gap-10"
              >
                <div className="space-y-6">
                  <Rating value={t.rating} variant="stars" size="sm" />
                  <blockquote className="font-display text-[1.1875rem] font-normal leading-[1.55] tracking-[-0.01em] text-foreground">
                    {t.quote}
                  </blockquote>
                </div>

                <figcaption className="flex items-center gap-3">
                  <Avatar name={t.name} size="md" />
                  <div>
                    <p className="text-caption font-medium text-foreground">
                      {t.name}
                    </p>
                    <p className="text-caption text-foreground-muted">
                      {t.context}
                    </p>
                  </div>
                </figcaption>
              </Card>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
