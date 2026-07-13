"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/layout";
import { Sheet, SheetClose, SheetContent, SheetTrigger } from "@/components/ui/dialog";
import { Logo } from "./logo";
import { ThemeToggle } from "./theme-toggle";
import { AccountMenu } from "./account-menu";

const LINKS = [
  { href: "/artists", label: "Artists" },
  { href: "/artists?service=bridal", label: "Bridal" },
  { href: "/become-an-artist", label: "For Artists" },
] as const;

/**
 * `transparent` lets the navbar sit over hero photography until the user
 * scrolls — the landing page passes it, every other page does not.
 */
export function Navbar({ transparent = false }: { transparent?: boolean }) {
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  const { user, isLoading } = useAuth();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const floating = transparent && !scrolled;

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 transition-[background-color,border-color,backdrop-filter] duration-300 ease-[var(--ease-out-soft)]",
        floating
          ? "border-b border-transparent bg-transparent"
          : "border-b border-border bg-background/85 backdrop-blur-xl",
      )}
    >
      <Container size="wide">
        <nav
          className="flex h-20 items-center justify-between gap-8"
          aria-label="Primary"
        >
          <Logo onLight={!floating} />

          <ul className="hidden items-center gap-9 lg:flex">
            {LINKS.map((link) => {
              const active = pathname === link.href.split("?")[0];
              return (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className={cn(
                      "relative py-2 text-caption font-medium transition-colors duration-200",
                      floating
                        ? "text-white/80 hover:text-white"
                        : "text-foreground-secondary hover:text-foreground",
                      active && !floating && "text-foreground",
                      // Hairline that draws in from the left on hover.
                      "after:absolute after:inset-x-0 after:-bottom-0.5 after:h-px after:origin-left after:scale-x-0 after:bg-accent",
                      "after:transition-transform after:duration-300 after:ease-[var(--ease-out-soft)] hover:after:scale-x-100",
                      active && "after:scale-x-100",
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center gap-2">
            <div className={cn(floating && "text-white [&_button]:text-white/80 [&_button:hover]:bg-white/10 [&_button:hover]:text-white")}>
              <ThemeToggle />
            </div>

            {/* Reserve the slot while the session rehydrates so the bar
                doesn't visibly swap Sign in → avatar on every load. */}
            {isLoading ? (
              <div className="hidden h-11 w-[9.5rem] md:block" aria-hidden />
            ) : user ? (
              <AccountMenu onDark={floating} />
            ) : (
              <div className="hidden items-center gap-2 md:flex">
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className={cn(
                    floating && "text-white/85 hover:bg-white/10 hover:text-white",
                  )}
                >
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  className={cn(
                    floating &&
                      "bg-white text-burgundy-700 hover:bg-white hover:brightness-95",
                  )}
                >
                  <Link href="/signup">Join VEYA</Link>
                </Button>
              </div>
            )}

            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className={cn(
                    "lg:hidden",
                    floating && "text-white hover:bg-white/10",
                  )}
                  aria-label="Open menu"
                >
                  <Menu aria-hidden />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="p-8">
                <Logo className="mb-12" />
                <ul className="space-y-1">
                  {LINKS.map((link) => (
                    <li key={link.label}>
                      <SheetClose asChild>
                        <Link
                          href={link.href}
                          className="block border-b border-border py-5 font-display text-h4 text-foreground transition-colors hover:text-accent"
                        >
                          {link.label}
                        </Link>
                      </SheetClose>
                    </li>
                  ))}
                </ul>
                {!user && !isLoading && (
                  <div className="mt-12 space-y-3">
                    <SheetClose asChild>
                      <Button asChild full size="lg">
                        <Link href="/signup">Join VEYA</Link>
                      </Button>
                    </SheetClose>
                    <SheetClose asChild>
                      <Button asChild full variant="secondary" size="lg">
                        <Link href="/login">Sign in</Link>
                      </Button>
                    </SheetClose>
                  </div>
                )}
              </SheetContent>
            </Sheet>
          </div>
        </nav>
      </Container>
    </header>
  );
}
