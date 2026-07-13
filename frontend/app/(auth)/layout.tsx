import Image from "next/image";
import Link from "next/link";
import { HERO_IMAGE } from "@/lib/images";
import { Logo } from "@/components/layout/logo";
import { ThemeToggle } from "@/components/layout/theme-toggle";

/**
 * Split canvas: form on the left, a single full-bleed photograph on the
 * right. The photo is the only ornament — no marketing copy competing with
 * the form, because someone on this screen already decided to sign up.
 */
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <div className="flex w-full flex-col px-6 py-8 md:px-12 lg:w-[52%] lg:px-20">
        <header className="flex items-center justify-between">
          <Logo />
          <ThemeToggle />
        </header>

        <main
          id="main"
          className="flex flex-1 items-center justify-center py-16"
        >
          <div className="w-full max-w-[26rem]">{children}</div>
        </main>

        <footer className="text-caption text-foreground-muted">
          <Link href="/" className="transition-colors hover:text-foreground">
            ← Back to VEYA
          </Link>
        </footer>
      </div>

      <div className="relative hidden lg:block lg:w-[48%]">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          sizes="48vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-burgundy-900/80 via-burgundy-900/20 to-transparent" />

        <blockquote className="absolute inset-x-0 bottom-0 p-14">
          <p className="max-w-[24rem] font-display text-h3 font-medium leading-snug text-white">
            &ldquo;The first place I could see a full portfolio, a real price,
            and reviews from people who had actually booked her.&rdquo;
          </p>
          <footer className="mt-6 text-caption text-white/60">
            Ananya R. — married in Mumbai, 2025
          </footer>
        </blockquote>
      </div>
    </div>
  );
}
