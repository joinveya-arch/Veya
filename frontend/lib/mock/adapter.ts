/**
 * In-browser stand-in for the VEYA API, used by the static demo build.
 *
 * It plugs in at the transport layer — `apiFetch` calls this instead of
 * `fetch` — so every service, hook and component above it is unchanged and
 * unaware. Writes mutate an in-memory store that survives client-side
 * navigation and resets on reload, which is the right behaviour for a demo.
 */

import type {
  ArtistProfile,
  Booking,
  BookingStatus,
  Review,
  Service,
} from "@/types";
import {
  MOCK_ARTISTS,
  MOCK_USER,
  mockAvailability,
  mockPortfolio,
  mockReviews,
  seedBookings,
} from "./data";

export const IS_MOCK = process.env.NEXT_PUBLIC_USE_MOCK === "1";

/** Mutable demo state. Deliberately module-scoped, not persisted. */
const artists: ArtistProfile[] = MOCK_ARTISTS.map((a) => ({ ...a }));
let bookings: Booking[] = seedBookings();
const reviews: Review[] = [];

/** The demo signs anyone in; the role is taken from the email prefix. */
function roleFor(email = ""): "CUSTOMER" | "ARTIST" | "ADMIN" {
  const local = email.toLowerCase();
  if (local.startsWith("artist")) return "ARTIST";
  if (local.startsWith("admin")) return "ADMIN";
  return "CUSTOMER";
}

/** Token doubles as the session: the role is encoded in it. */
const tokenFor = (email: string) => `veya-demo.${roleFor(email)}.${email}`;

function userFromToken(token: string | null) {
  if (!token) return MOCK_USER;
  const [, role, email] = token.split(".");
  return {
    ...MOCK_USER,
    role: (role as typeof MOCK_USER.role) ?? "CUSTOMER",
    email: email ?? MOCK_USER.email,
    // Artists see their own name in the greeting.
    name: role === "ARTIST" ? (artists[0].user?.name ?? MOCK_USER.name) : MOCK_USER.name,
  };
}

/** The artist profile the signed-in ARTIST owns. */
const ownArtist = () => artists[0];

class MockError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

interface MockRequest {
  path: string;
  method: string;
  body?: unknown;
  token: string | null;
}

/**
 * Routes a request to its demo payload. Throws MockError for the not-found
 * and forbidden cases, so error states stay reachable in the demo.
 */
export async function mockRequest<T>({
  path,
  method,
  body,
  token,
}: MockRequest): Promise<T> {
  // A touch of latency, so skeletons and spinners actually show themselves.
  await new Promise((r) => setTimeout(r, 220));

  const [rawPath, query = ""] = path.split("?");
  const params = new URLSearchParams(query);
  const payload = (body ?? {}) as Record<string, never>;
  const send = <R,>(data: R) => data as unknown as T;

  /* ---------------------------------------------------------------- auth */

  if (rawPath === "/auth/login" && method === "POST") {
    const email = String((payload as Record<string, unknown>).email ?? "");
    return send({ token: tokenFor(email), user: userFromToken(tokenFor(email)) });
  }

  if (rawPath === "/auth/register" && method === "POST") {
    const p = payload as Record<string, unknown>;
    return send({ ...MOCK_USER, ...p });
  }

  if (rawPath === "/auth/me") return send(userFromToken(token));

  if (rawPath === "/auth/forgot-password") return send({ sent: true });

  /* ------------------------------------------------------------- artists */

  if (rawPath === "/artists" && method === "GET") {
    const city = params.get("city");
    const minExperience = Number(params.get("minExperience") ?? 0);
    return send(
      artists.filter(
        (a) =>
          (!city || a.city.toLowerCase() === city.toLowerCase()) &&
          a.experience >= minExperience,
      ),
    );
  }

  if (rawPath === "/artists/profile/me") return send(ownArtist());

  if (rawPath === "/artists/profile" && (method === "POST" || method === "PUT")) {
    Object.assign(ownArtist(), payload);
    return send(ownArtist());
  }

  let m: RegExpMatchArray | null;

  if ((m = rawPath.match(/^\/artists\/([^/]+)\/portfolio$/)))
    return send(mockPortfolio(m[1]));

  if ((m = rawPath.match(/^\/artists\/([^/]+)\/reviews$/)))
    return send([
      ...reviews.filter((r) => r.artistId === m![1]),
      ...mockReviews(m[1]),
    ]);

  if ((m = rawPath.match(/^\/artists\/([^/]+)\/availability$/)))
    return send(mockAvailability(m[1]));

  if (rawPath === "/artists/availability") return send([]);

  if ((m = rawPath.match(/^\/artists\/([^/]+)$/))) {
    const artist = artists.find((a) => a.id === m![1]);
    if (!artist) throw new MockError("Artist profile not found", 404);
    return send(artist);
  }

  /* ------------------------------------------------------------ services */

  if ((m = rawPath.match(/^\/services\/artist\/([^/]+)$/))) {
    const artist = artists.find((a) => a.id === m![1]);
    return send(artist?.services ?? []);
  }

  if (rawPath === "/services" && method === "POST") {
    const p = payload as unknown as Omit<Service, "id" | "artistId">;
    const service: Service = {
      ...p,
      id: `svc-${Date.now()}`,
      artistId: ownArtist().id,
      price: String(p.price),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    ownArtist().services = [...(ownArtist().services ?? []), service];
    return send(service);
  }

  if ((m = rawPath.match(/^\/services\/([^/]+)$/))) {
    const list = ownArtist().services ?? [];
    const idx = list.findIndex((s) => s.id === m![1]);

    if (method === "PUT" && idx >= 0) {
      list[idx] = { ...list[idx], ...(payload as object) } as Service;
      return send(list[idx]);
    }
    if (method === "DELETE") {
      ownArtist().services = list.filter((s) => s.id !== m![1]);
      return send(null);
    }
    if (idx >= 0) return send(list[idx]);
    throw new MockError("Service not found", 404);
  }

  /* ------------------------------------------------------------ bookings */

  if (rawPath === "/bookings" && method === "POST") {
    const { serviceId, bookingDate } = payload as unknown as {
      serviceId: string;
      bookingDate: string;
    };
    const artist = artists.find((a) =>
      a.services?.some((s) => s.id === serviceId),
    );
    const service = artist?.services?.find((s) => s.id === serviceId);
    if (!artist || !service) throw new MockError("Service not found", 404);

    const booking: Booking = {
      id: `bk-${bookings.length + 1}`,
      customerId: MOCK_USER.id,
      artistId: artist.id,
      serviceId,
      bookingDate,
      bookingStatus: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      artist,
      service,
      customer: { name: MOCK_USER.name, email: MOCK_USER.email },
    };
    bookings = [booking, ...bookings];
    return send(booking);
  }

  if (rawPath === "/bookings/me") return send(bookings);

  if ((m = rawPath.match(/^\/bookings\/([^/]+)\/status$/)) && method === "PATCH") {
    const booking = bookings.find((b) => b.id === m![1]);
    if (!booking) throw new MockError("Booking not found", 404);
    booking.bookingStatus = (payload as unknown as { status: BookingStatus })
      .status;
    booking.updatedAt = new Date().toISOString();
    return send(booking);
  }

  /* ------------------------------------------------------------- reviews */

  if (rawPath === "/reviews" && method === "POST") {
    const p = payload as unknown as {
      bookingId: string;
      rating: number;
      comment?: string;
    };
    const booking = bookings.find((b) => b.id === p.bookingId);
    const review: Review = {
      id: `rev-${reviews.length + 1}`,
      bookingId: p.bookingId,
      customerId: MOCK_USER.id,
      artistId: booking?.artistId ?? "",
      rating: p.rating,
      comment: p.comment ?? null,
      createdAt: new Date().toISOString(),
      customer: { name: MOCK_USER.name },
    };
    reviews.unshift(review);
    if (booking) booking.review = review;
    return send(review);
  }

  /* --------------------------------------------------------------- admin */

  if (rawPath === "/admin/bookings") return send(bookings);

  if ((m = rawPath.match(/^\/admin\/artists\/([^/]+)\/verify$/))) {
    const artist = artists.find((a) => a.id === m![1]);
    if (!artist) throw new MockError("Artist profile not found", 404);
    artist.verified = Boolean(
      (payload as unknown as { verified: boolean }).verified,
    );
    return send(artist);
  }

  throw new MockError(`No demo route for ${method} ${rawPath}`, 404);
}

export { MockError };
