import Link from "next/link";
import { Instagram } from "lucide-react";
import { Container } from "@/components/ui/layout";
import { Logo } from "./logo";

const COLUMNS = [
  {
    heading: "Discover",
    links: [
      { href: "/artists", label: "All artists" },
      { href: "/artists?service=bridal", label: "Bridal makeup" },
      { href: "/artists?service=party", label: "Party & event" },
      { href: "/artists?service=hair", label: "Hairstyling" },
    ],
  },
  {
    heading: "For artists",
    links: [
      { href: "/become-an-artist", label: "Join VEYA" },
      { href: "/signup?role=artist", label: "Create an account" },
      { href: "/artist", label: "Artist dashboard" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/trust", label: "Trust & safety" },
      { href: "/contact", label: "Contact" },
      { href: "/privacy", label: "Privacy" },
    ],
  },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface-soft">
      <Container size="wide" className="py-20 md:py-28">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_2fr]">
          <div className="max-w-[24rem]">
            <Logo />
            <p className="mt-6 text-body text-foreground-secondary">
              Find makeup artists you can trust. Every artist on VEYA is
              verified, reviewed and rated by real clients.
            </p>
            <a
              href="https://instagram.com/veya"
              target="_blank"
              rel="noreferrer noopener"
              aria-label="VEYA on Instagram"
              className="mt-8 inline-flex size-10 items-center justify-center rounded-full border border-border text-foreground-secondary transition-colors duration-200 hover:border-border-strong hover:text-foreground"
            >
              <Instagram className="size-[1.125rem]" aria-hidden />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
            {COLUMNS.map((column) => (
              <nav key={column.heading} aria-label={column.heading}>
                <h2 className="text-overline font-medium uppercase text-foreground-muted">
                  {column.heading}
                </h2>
                <ul className="mt-6 space-y-3.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-caption text-foreground-secondary transition-colors duration-200 hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-4 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-caption text-foreground-muted">
            © {new Date().getFullYear()} VEYA. All rights reserved.
          </p>
          <p className="text-caption text-foreground-muted">
            Made with care in India.
          </p>
        </div>
      </Container>
    </footer>
  );
}
