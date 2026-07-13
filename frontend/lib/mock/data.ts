/**
 * Demo dataset for the static (backend-free) build.
 *
 * This exists so VEYA can be deployed to a static host — GitHub Pages — with
 * no API behind it. It is only ever loaded when NEXT_PUBLIC_USE_MOCK is set;
 * a normal build against the real Express backend never imports it.
 *
 * Every shape here mirrors the API contract in `types/` exactly, so swapping
 * the real backend back in is a config change, not a rewrite.
 */

import type {
  ArtistProfile,
  Availability,
  Booking,
  PortfolioImage,
  Review,
  Service,
  User,
} from "@/types";

const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Jaipur",
  "Hyderabad",
  "Pune",
  "Chennai",
];

const NAMES = [
  "Aditi Raghunathan",
  "Meher Kapoor",
  "Sanya Bhatia",
  "Ritika Malhotra",
  "Kavya Iyer",
  "Nandini Shah",
  "Zoya Qureshi",
  "Ira Menon",
  "Tara Sethi",
  "Anjali Verma",
  "Simran Gill",
  "Devika Nair",
];

const BIOS = [
  "Fifteen years behind the chair, most of them on wedding mornings. I work in natural light wherever possible, and I don't leave until you've looked at yourself twice.",
  "Trained in Paris, based in Mumbai. My work leans editorial — clean skin, a considered eye, nothing that fights the camera.",
  "I specialise in skin. Everything else is built on top of it. Expect a long consultation and a very short list of products.",
  "Bridal and engagement work across North India. I keep my calendar deliberately small, so no client is ever a rush job.",
];

const SERVICE_TEMPLATES = [
  {
    title: "Bridal Signature",
    description:
      "Full bridal makeup and hair for the ceremony, including draping and one touch-up visit.",
    price: 38000,
    duration: 240,
  },
  {
    title: "Bridal Trial",
    description:
      "A full run-through of the wedding-day look, booked as its own appointment.",
    price: 9000,
    duration: 120,
  },
  {
    title: "Engagement / Reception",
    description:
      "An evening look built to hold up under stage and camera lighting.",
    price: 22000,
    duration: 150,
  },
  {
    title: "Party & Event",
    description: "A polished look for cocktails, sangeet or an evening event.",
    price: 12000,
    duration: 90,
  },
  {
    title: "Editorial & Shoot",
    description:
      "Camera-ready makeup for lookbooks, campaigns and portraits.",
    price: 15000,
    duration: 120,
  },
  {
    title: "Hairstyling only",
    description: "Occasion styling — blowouts, updos and set curls.",
    price: 6500,
    duration: 60,
  },
];

/** Stable, readable ids — they end up in the pre-rendered URLs. */
const id = (n: number) =>
  `00000000-0000-4000-8000-${String(n).padStart(12, "0")}`;

const iso = (d: Date) => d.toISOString();
const daysFromNow = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  d.setHours(0, 0, 0, 0);
  return d;
};

/* --------------------------------------------------------------- artists */

export const MOCK_ARTISTS: ArtistProfile[] = NAMES.map((name, i) => {
  const artistId = id(i + 1);
  const serviceCount = 2 + (i % 4);

  const services: Service[] = Array.from({ length: serviceCount }, (_, s) => {
    const t = SERVICE_TEMPLATES[(i + s) % SERVICE_TEMPLATES.length];
    return {
      id: `${artistId}-svc-${s}`,
      artistId,
      title: t.title,
      description: t.description,
      // Spread prices across artists so budget filters and sorting bite.
      price: String(t.price + ((i * 1700) % 9000) - 3000),
      duration: t.duration,
      createdAt: iso(new Date()),
      updatedAt: iso(new Date()),
    };
  });

  return {
    id: artistId,
    userId: `${artistId}-user`,
    bio: BIOS[i % BIOS.length],
    city: CITIES[i % CITIES.length],
    experience: 2 + ((i * 3) % 14),
    instagram: `@${name.split(" ")[0].toLowerCase()}.studio`,
    // A few unverified profiles, so the admin queue isn't empty.
    verified: i % 4 !== 3,
    profileImage: null,
    rating: Number((3.9 + ((i * 7) % 11) / 10).toFixed(1)),
    reviewCount: 8 + ((i * 17) % 180),
    createdAt: iso(new Date(2024, i % 12, 3)),
    updatedAt: iso(new Date()),
    user: {
      name,
      email: `${name.split(" ")[0].toLowerCase()}@veya.in`,
      phone: "+919800000000",
      role: "ARTIST",
    },
    services,
  };
});

export const MOCK_ARTIST_IDS = MOCK_ARTISTS.map((a) => a.id);

/* --------------------------------------------------------------- reviews */

const REVIEW_TEXT = [
  "She arrived before the light did and stayed until the last photograph. The look was exactly what we'd agreed at the trial — nothing was improvised on the day.",
  "I have very reactive skin and had written off wearing makeup at all. She spent forty minutes on prep alone. Zero irritation, and it held for fourteen hours.",
  "Booked her for the reception on short notice. Professional, warm, and genuinely good at reading what suits you rather than what's trending.",
  "The trial is worth every rupee. We changed two things, and the wedding morning was completely calm as a result.",
  "Beautiful work, and completely unflustered when the schedule slipped by two hours. That mattered more than I expected it to.",
];

const REVIEWERS = [
  "Ananya R.",
  "Ishita M.",
  "Priya K.",
  "Rhea S.",
  "Naina B.",
  "Aarushi T.",
];

export function mockReviews(artistId: string): Review[] {
  const seed = Math.max(MOCK_ARTIST_IDS.indexOf(artistId), 0);
  return Array.from({ length: 4 }, (_, i) => ({
    id: `${artistId}-rev-${i}`,
    bookingId: `${artistId}-bk-${i}`,
    customerId: `cust-${i}`,
    artistId,
    rating: 5 - ((seed + i) % 2),
    comment: REVIEW_TEXT[(seed + i) % REVIEW_TEXT.length],
    createdAt: iso(new Date(Date.now() - (i + 1) * 86_400_000 * 12)),
    customer: { name: REVIEWERS[(seed + i) % REVIEWERS.length] },
  }));
}

/* ---------------------------------------------------------- availability */

export function mockAvailability(artistId: string): Availability[] {
  const seed = Math.max(MOCK_ARTIST_IDS.indexOf(artistId), 0) + 1;
  const out: Availability[] = [];
  for (let d = 2; d < 70; d++) {
    // Deterministic but irregular — a fully open calendar looks fake.
    if ((d * seed) % 3 === 0) continue;
    out.push({
      id: `${artistId}-av-${d}`,
      artistId,
      date: iso(daysFromNow(d)),
      status: "AVAILABLE",
    });
  }
  return out;
}

export function mockPortfolio(artistId: string): PortfolioImage[] {
  // Empty imageUrls make PortfolioGrid fall back to its deterministic set.
  return Array.from({ length: 8 }, (_, i) => ({
    id: `${artistId}-img-${i}`,
    artistId,
    imageUrl: "",
    createdAt: iso(new Date()),
  }));
}

/* ----------------------------------------------------------------- users */

export const MOCK_USER: User = {
  id: "cust-1",
  name: "Ananya Rao",
  email: "demo@veya.in",
  phone: "+919812345678",
  role: "CUSTOMER",
  createdAt: iso(new Date(2025, 2, 14)),
  updatedAt: iso(new Date()),
};

/* -------------------------------------------------------------- bookings */

export function seedBookings(): Booking[] {
  const [first, second] = MOCK_ARTISTS;
  return [
    {
      id: "bk-seed-1",
      customerId: MOCK_USER.id,
      artistId: second.id,
      serviceId: second.services![0].id,
      bookingDate: iso(daysFromNow(9)),
      bookingStatus: "CONFIRMED",
      createdAt: iso(new Date()),
      updatedAt: iso(new Date()),
      artist: second,
      service: second.services![0],
      customer: { name: MOCK_USER.name, email: MOCK_USER.email },
    },
    {
      // A completed booking, so the review flow is reachable in the demo.
      id: "bk-seed-2",
      customerId: MOCK_USER.id,
      artistId: first.id,
      serviceId: first.services![0].id,
      bookingDate: iso(daysFromNow(-20)),
      bookingStatus: "COMPLETED",
      createdAt: iso(daysFromNow(-40)),
      updatedAt: iso(new Date()),
      artist: first,
      service: first.services![0],
      customer: { name: MOCK_USER.name, email: MOCK_USER.email },
    },
  ];
}
