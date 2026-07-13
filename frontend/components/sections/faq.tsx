"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Container, Section, SectionHead } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/motion";

const FAQS = [
  {
    q: "What does “verified” actually mean on VEYA?",
    a: "It means a person at VEYA has checked government ID, confirmed the portfolio is the artist's own work, and spoken to past clients. It is not an automated badge, and we remove it if standards slip.",
  },
  {
    q: "How far in advance should I book?",
    a: "For bridal, six to ten weeks is comfortable — the best artists fill peak wedding dates months out. For party and editorial work, a week is usually plenty.",
  },
  {
    q: "Can I have a trial before the day?",
    a: "Most bridal artists offer one, and list it as a separate package on their profile. Book it as its own appointment so the artist can hold the time.",
  },
  {
    q: "What happens if my artist cancels?",
    a: "You are refunded in full, and we personally help you rebook from artists with the same date free. Cancellations are rare and count against an artist's standing.",
  },
  {
    q: "Are the prices on profiles final?",
    a: "Yes. The package price is what you pay. Travel outside the artist's home city is the one thing quoted separately, and it's shown before you confirm.",
  },
] as const;

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <Section spacing="lg" tone="soft">
      <Container size="narrow">
        <SectionHead overline="Questions" title="Before you book" align="center" />

        <Reveal className="mt-16">
          <dl>
            {FAQS.map((faq, i) => {
              const isOpen = open === i;
              return (
                <div key={faq.q} className="border-b border-border first:border-t">
                  <dt>
                    <button
                      onClick={() => setOpen(isOpen ? null : i)}
                      aria-expanded={isOpen}
                      aria-controls={`faq-${i}`}
                      className="flex w-full items-start justify-between gap-8 py-7 text-left"
                    >
                      <span
                        className={cn(
                          "font-display text-h4 font-medium transition-colors duration-200",
                          isOpen ? "text-foreground" : "text-foreground-secondary",
                        )}
                      >
                        {faq.q}
                      </span>
                      <Plus
                        className={cn(
                          "mt-1 size-5 shrink-0 text-foreground-muted transition-transform duration-300 ease-[var(--ease-out-soft)]",
                          isOpen && "rotate-45 text-accent",
                        )}
                        strokeWidth={1.5}
                        aria-hidden
                      />
                    </button>
                  </dt>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.dd
                        id={`faq-${i}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="overflow-hidden"
                      >
                        <p className="max-w-[46rem] pb-8 pr-12 text-body text-foreground-secondary">
                          {faq.a}
                        </p>
                      </motion.dd>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </dl>
        </Reveal>
      </Container>
    </Section>
  );
}
