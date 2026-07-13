import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Container } from "@/components/ui/layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main id="main" className="pt-20">
        <Container
          size="narrow"
          className="flex min-h-[60vh] flex-col items-center justify-center py-24 text-center"
        >
          <p className="text-overline font-medium uppercase text-accent">
            404
          </p>
          <h1 className="mt-6 text-h1">This page doesn&apos;t exist</h1>
          <p className="mt-5 max-w-[34rem] text-body text-foreground-secondary">
            The link may be old, or the artist may have moved on. Let&apos;s get
            you back to something useful.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/artists">Browse artists</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/">Back home</Link>
            </Button>
          </div>
        </Container>
      </main>
      <Footer />
    </>
  );
}
