"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { IS_MOCK } from "@/lib/mock/adapter";

const DISMISSED_KEY = "veya.demo-notice-dismissed";

/**
 * Shown only in the static demo build. The deployed site runs on an in-memory
 * dataset with no backend, and sign-in accepts any password — saying so plainly
 * is the honest thing to do, and it's also the only way a visitor would know
 * how to reach the artist and admin views.
 *
 * Deliberately a floating card rather than a top bar: the navbar is fixed to
 * the top, and a bottom bar would collide with the artist profile's mobile
 * booking bar. Hidden below `lg` for the same reason.
 */
export function DemoBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!IS_MOCK) return;
    setVisible(window.localStorage.getItem(DISMISSED_KEY) !== "1");
  }, []);

  if (!visible) return null;

  return (
    <aside
      aria-label="Demo notice"
      className="fixed bottom-6 left-6 z-50 hidden max-w-[22rem] rounded-[var(--radius-card)] border border-border bg-surface p-5 shadow-[var(--shadow-lifted)] lg:block"
    >
      <button
        onClick={() => {
          window.localStorage.setItem(DISMISSED_KEY, "1");
          setVisible(false);
        }}
        aria-label="Dismiss demo notice"
        className="absolute right-3 top-3 rounded-full p-1.5 text-foreground-muted transition-colors hover:bg-surface-sunken hover:text-foreground"
      >
        <X className="size-4" aria-hidden />
      </button>

      <p className="text-overline font-medium uppercase text-accent">
        Live demo
      </p>
      <p className="mt-3 pr-6 text-caption text-foreground-secondary">
        Sample data, no backend — nothing here is saved. Sign in with{" "}
        <span className="font-medium text-foreground">any password</span>:
      </p>

      <dl className="mt-4 space-y-1.5 text-caption">
        {[
          ["Client", "any@email.com"],
          ["Artist", "artist@veya.in"],
          ["Admin", "admin@veya.in"],
        ].map(([role, email]) => (
          <div key={role} className="flex items-baseline justify-between gap-4">
            <dt className="text-foreground-muted">{role}</dt>
            <dd className="font-medium text-foreground">{email}</dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
