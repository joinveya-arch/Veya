/**
 * Editorial photography for marketing surfaces, plus deterministic
 * placeholders for artists who haven't uploaded a portrait yet.
 *
 * Placeholders are keyed off the artist's id so the same person always
 * resolves to the same image. A card that reshuffles its photo between
 * renders destroys any sense that these are real people.
 */

const UNSPLASH = "https://images.unsplash.com/photo-";

const src = (id: string, w: number, q = 80) =>
  `${UNSPLASH}${id}?auto=format&fit=crop&w=${w}&q=${q}`;

/**
 * Dark, sharp, an artist's hands mid-work — craft, not a stock smile. The
 * subject sits right of centre, which is what lets the headline occupy the
 * darkened left third at full contrast.
 */
export const HERO_IMAGE = src("1638959882708-9503b1cd595f", 2000, 85);

/** Portrait-oriented bridal and beauty work — artist card fallbacks. */
const PORTRAITS = [
  "1684868268327-7e5590bcfbd6",
  "1610173827043-9db50e0d8ef9",
  "1631549424057-403e75d68e2f",
  "1600685890506-593fdf55949b",
  "1684868682581-4cac3af5b8d4",
  "1631549423034-ceb712f24ab2",
  "1641699862936-be9f49b1c38d",
  "1630084775816-7abb7383ded5",
  "1709477542149-f4e0e21d590b",
  "1709477542170-f11ee7d471a0",
];

/** Stable hash → an artist always resolves to the same portrait. */
function hash(seed: string): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (h << 5) - h + seed.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function artistImage(id: string, uploaded?: string | null): string {
  if (uploaded) return uploaded;
  return src(PORTRAITS[hash(id) % PORTRAITS.length], 900);
}

/** A distinct run of images per artist, so no two galleries look alike. */
export function portfolioFallback(id: string, count = 6): string[] {
  const start = hash(id) % PORTRAITS.length;
  return Array.from({ length: count }, (_, i) =>
    src(PORTRAITS[(start + i) % PORTRAITS.length], 1000),
  );
}

export const CATEGORY_IMAGES = {
  bridal: src("1684868264466-4c4fcf0a5b37", 1200),
  party: src("1487412947147-5cebf100ffc2", 1200),
  editorial: src("1613966802194-d46a163af70d", 1200),
  hair: src("1602549179763-ce6c9df961b7", 1200),
} as const;

/** The photograph beside the "become an artist" panel: a working kit. */
export const ARTIST_CTA_IMAGE = src("1665072123924-5e52cd934d2e", 1200);
