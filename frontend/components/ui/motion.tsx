"use client";

import * as React from "react";
import { motion, useInView, type Variants } from "framer-motion";
import { cn } from "@/lib/utils";

/**
 * The app's entire motion vocabulary. Every animated element pulls from
 * here, so timing and easing stay identical across pages — the surest way
 * to keep motion feeling like one hand made it.
 *
 * Rule: content arrives (fade + a short rise). It never bounces, spins,
 * or slides in from off-screen.
 */

const EASE = [0.22, 1, 0.36, 1] as const;

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: EASE },
  },
};

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.4, ease: EASE } },
};

export const scaleIn: Variants = {
  hidden: { opacity: 0, scale: 0.98 },
  show: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: EASE } },
};

export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.05 } },
};

/** Slower cascade for hero lines, where each word should land. */
export const staggerSlow: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.11 } },
};

type RevealTag = "div" | "section" | "ul" | "ol" | "li" | "header";

interface RevealProps extends React.HTMLAttributes<HTMLElement> {
  /** `stagger` orchestrates children; pair with <RevealItem>. */
  variants?: Variants;
  /** Animate on mount rather than on scroll — for above-the-fold content. */
  immediate?: boolean;
  delay?: number;
  as?: RevealTag;
}

/**
 * motion.div and motion.li disagree on their ref type, so indexing
 * motion[as] yields a union TS can't call. The element type is chosen by
 * us (never by user input), so widening to a single component type here
 * is safe and keeps every call site properly typed.
 */
type AnyMotion = React.ComponentType<
  React.HTMLAttributes<HTMLElement> & {
    ref?: React.Ref<HTMLElement>;
    variants?: Variants;
    initial?: string;
    animate?: string;
    transition?: { delay?: number };
  }
>;

/**
 * Resolved ONCE, at module scope. Reading `motion[as]` inside a render can
 * hand back a fresh component identity on every pass, which remounts the
 * subtree and resets each child's variant state — the parent would animate
 * while every child stayed pinned at `hidden`. Stable identities are what
 * make the parent→child variant propagation (and therefore stagger) work.
 */
const MOTION_TAGS: Record<RevealTag, AnyMotion> = {
  div: motion.div,
  section: motion.section,
  ul: motion.ul,
  ol: motion.ol,
  li: motion.li,
  header: motion.header,
} as unknown as Record<RevealTag, AnyMotion>;

const motionTag = (as: RevealTag) => MOTION_TAGS[as];

/**
 * Scroll-triggered reveal. `once` is deliberate: content that re-animates
 * every time it re-enters the viewport reads as a gimmick.
 *
 * Driven by the `useInView` hook + the `animate` prop rather than the
 * `whileInView` prop, because `animate` is a plain prop change and therefore
 * always propagates the variant label to children (which is what makes
 * stagger work).
 *
 * Crucially it FAILS OPEN. An IntersectionObserver does not deliver entries
 * while the document is hidden, and it may not fire at all in degraded
 * environments — so an element that is already on-screen when it mounts shows
 * immediately, without waiting for an observer. Content left invisible because
 * an observer never ran is an empty page, and an empty page is far worse than
 * an unanimated one. Only genuinely below-the-fold content waits for scroll.
 */
export function Reveal({
  children,
  className,
  variants = fadeUp,
  immediate,
  delay = 0,
  as = "div",
  ...props
}: RevealProps) {
  const Comp = motionTag(as);
  const ref = React.useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px 0px" });
  const [onScreenAtMount, setOnScreenAtMount] = React.useState(false);

  React.useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const { top } = el.getBoundingClientRect();
    if (top < window.innerHeight) setOnScreenAtMount(true);
  }, []);

  const show = immediate || onScreenAtMount || inView;

  return (
    <Comp
      ref={ref}
      className={cn(className)}
      variants={variants}
      initial="hidden"
      animate={show ? "show" : "hidden"}
      {...(delay ? { transition: { delay } } : {})}
      {...props}
    >
      {children}
    </Comp>
  );
}

export function RevealItem({
  children,
  className,
  variants = fadeUp,
  as = "div",
  ...props
}: RevealProps) {
  const Comp = motionTag(as);
  return (
    <Comp className={cn(className)} variants={variants} {...props}>
      {children}
    </Comp>
  );
}
