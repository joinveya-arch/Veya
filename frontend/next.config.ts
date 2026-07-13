import type { NextConfig } from "next";

/**
 * Two build modes.
 *
 * Default — a normal Next server app talking to the Express backend.
 *
 * NEXT_PUBLIC_USE_MOCK=1 — a fully static export for GitHub Pages, with no
 * backend at all: requests are served from an in-memory dataset (see
 * lib/mock/), `/artists/[id]` is pre-rendered from the demo artist ids, and
 * image optimisation is off because it needs a server at request time.
 */
const isStaticDemo = process.env.NEXT_PUBLIC_USE_MOCK === "1";

// GitHub Pages serves a project repo from /<repo>, so every asset and route
// needs that prefix. Passed in by CI; empty for a local static build.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  ...(isStaticDemo
    ? {
        output: "export" as const,
        basePath,
        // Without this, Pages 404s every route that isn't a literal file.
        trailingSlash: true,
      }
    : {}),

  images: {
    // The optimiser is a server route, which a static export doesn't have.
    unoptimized: isStaticDemo,
    remotePatterns: [
      // Editorial photography on marketing surfaces.
      { protocol: "https", hostname: "images.unsplash.com" },
      // Artist-uploaded profile + portfolio images.
      { protocol: "https", hostname: "res.cloudinary.com" },
      // The backend's local /uploads fallback when Cloudinary is unconfigured.
      { protocol: "http", hostname: "localhost" },
    ],
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
