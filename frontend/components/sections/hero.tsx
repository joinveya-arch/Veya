"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { HERO_IMAGE } from "@/lib/images";
import { fadeUp, staggerSlow } from "@/components/ui/motion";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";
import { SearchBar } from "./search-bar";

/**
 * Near-full-viewport editorial hero. The headline is set in two lines with
 * the emphasis word carried on the second — the eye lands on "trust", which
 * is the entire proposition.
 */
export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-end overflow-hidden pt-20">
      <div className="grain absolute inset-0">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover object-[72%_center]"
        />
        {/* Two scrims, not one. The vertical pass seats the navbar and the
            search bar; the horizontal pass darkens the left third so the
            headline holds AA contrast without dulling the photograph on
            the right, where the subject actually is. */}
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/90 via-burgundy-900/45 to-burgundy-900/30" />
        <div className="absolute inset-0 bg-gradient-to-r from-burgundy-900/80 via-burgundy-900/30 to-transparent" />
      </div>

      <Container size="wide" className="relative z-10 pb-20 pt-32 md:pb-28">
        <motion.div
          variants={staggerSlow}
          initial="hidden"
          animate="show"
          className="max-w-[52rem]"
        >
          <motion.p
            variants={fadeUp}
            className="text-overline font-medium uppercase text-champagne-300"
          >
            Verified beauty professionals
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="mt-6 font-display text-display font-medium text-white"
          >
            Find makeup artists
            <br />
            you can{" "}
            {/* The one flourish on the page: a gold rule drawn under the
                word the whole brand hangs on. General Sans ships no italic,
                so emphasis is carried by the rule rather than a faux
                oblique the browser would have to synthesise. */}
            <span className="relative inline-block">
              <span className="relative z-10">trust</span>
              <motion.span
                aria-hidden
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  delay: 0.95,
                  duration: 0.7,
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="absolute inset-x-0 bottom-[0.1em] z-0 h-[0.055em] origin-left bg-accent"
              />
            </span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="mt-8 max-w-[34rem] text-[1.0625rem] leading-relaxed text-white/75"
          >
            Discover, compare and book India&apos;s most trusted makeup artists
            and hairstylists — every one of them verified, reviewed and rated by
            real clients.
          </motion.p>

          <motion.div variants={fadeUp} className="mt-12 max-w-[46rem]">
            <SearchBar />
          </motion.div>

          <motion.div variants={fadeUp} className="mt-8">
            <Button
              asChild
              variant="link"
              className="h-auto p-0 text-caption text-white/70 decoration-white/25 hover:text-white hover:decoration-accent"
            >
              <Link href="/artists">
                Or browse all artists
                <ArrowRight className="size-4" aria-hidden />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
}
