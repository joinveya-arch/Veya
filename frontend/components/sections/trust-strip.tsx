import { Container } from "@/components/ui/layout";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";

const STATS = [
  { value: "500+", label: "Verified artists" },
  { value: "12,000+", label: "Bookings completed" },
  { value: "4.9", label: "Average rating" },
  { value: "24", label: "Cities" },
] as const;

/**
 * Sits directly under the hero and carries the social proof before any
 * feature copy. Numbers are set in the display face at h2 so they read as
 * statements, not as a metrics dashboard.
 */
export function TrustStrip() {
  return (
    <div className="border-b border-border bg-surface">
      <Container size="wide" className="py-14 md:py-16">
        <Reveal
          variants={stagger}
          className="grid grid-cols-2 gap-y-10 md:grid-cols-4"
        >
          {STATS.map((stat) => (
            <RevealItem
              key={stat.label}
              className="border-l border-border pl-6 md:pl-8"
            >
              <p className="tabular font-display text-h2 font-medium text-foreground">
                {stat.value}
              </p>
              <p className="mt-1.5 text-caption text-foreground-secondary">
                {stat.label}
              </p>
            </RevealItem>
          ))}
        </Reveal>
      </Container>
    </div>
  );
}
