import type { Metadata, Viewport } from "next";
import { Manrope } from "next/font/google";
import { Providers } from "@/providers";
import { DemoBanner } from "@/components/layout/demo-banner";
import "./globals.css";

/* Manrope carries body copy — humanist, exceptionally legible at 16px. */
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL("https://veya.in"),
  title: {
    default: "VEYA — Find Makeup Artists You Can Trust",
    template: "%s · VEYA",
  },
  description:
    "Discover, compare and book verified makeup artists and hairstylists. Every artist on VEYA is vetted, reviewed and rated by real clients.",
  openGraph: {
    title: "VEYA — Find Makeup Artists You Can Trust",
    description:
      "Discover, compare and book verified makeup artists and hairstylists.",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F7F3ED" },
    { media: "(prefers-color-scheme: dark)", color: "#131011" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={manrope.variable}>
      <head>
        {/* General Sans sets every headline. Fontshare has no next/font
            adapter, so it's linked — preconnect keeps it off the critical path. */}
        <link rel="preconnect" href="https://api.fontshare.com" />
        <link
          rel="stylesheet"
          href="https://api.fontshare.com/v2/css?f[]=general-sans@400,500,600&display=swap"
        />
      </head>
      <body className="min-h-screen antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[100] focus:rounded-[var(--radius-button)] focus:bg-primary focus:px-5 focus:py-3 focus:text-primary-foreground"
        >
          Skip to content
        </a>
        <Providers>
          {children}
          <DemoBanner />
        </Providers>
      </body>
    </html>
  );
}
