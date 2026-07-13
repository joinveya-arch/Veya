"use client";

import { useEffect } from "react";
import { Container } from "@/components/ui/layout";
import { ErrorState } from "@/components/ui/states";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Swap for a real reporter (Sentry et al.) before launch.
    console.error(error);
  }, [error]);

  return (
    <main id="main" className="flex min-h-screen items-center">
      <Container size="narrow">
        <ErrorState
          title="Something went wrong on our side"
          description="This isn't you. Try again, and if it keeps happening we'd like to hear about it."
          onRetry={reset}
        />
      </Container>
    </main>
  );
}
