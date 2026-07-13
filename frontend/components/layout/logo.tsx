import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Wordmark. Wide tracking and a light weight — the letterforms carry the
 * luxury cue, so nothing else is needed. The gold stop after the mark is
 * the only decorative element in the entire chrome.
 */
export function Logo({
  className,
  href = "/",
  onLight = true,
}: {
  className?: string;
  href?: string;
  /** False when sitting on top of dark hero photography. */
  onLight?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label="VEYA — home"
      className={cn(
        "group inline-flex items-baseline gap-[3px] font-display text-[1.375rem] font-medium leading-none tracking-[0.24em]",
        onLight ? "text-foreground" : "text-white",
        className,
      )}
    >
      <span>VEYA</span>
      <span
        aria-hidden
        className="size-[5px] rounded-full bg-accent transition-transform duration-300 ease-[var(--ease-out-soft)] group-hover:scale-125"
      />
    </Link>
  );
}
