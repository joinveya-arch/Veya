"use client";

import { useMutation, useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { adminService, artistService } from "@/services";
import type { ArtistProfile, Review } from "@/types";

/**
 * The admin surface is deliberately thin because the API is: there are
 * exactly two admin endpoints (GET /admin/bookings, PATCH
 * /admin/artists/:id/verify). Everything else on these pages is derived
 * from those two plus the public artist list — honestly, and never faked.
 */

/* -------------------------------------------------------------- reads */

/** Every booking on the platform, with customer + artist + service joined. */
export function useAdminBookings() {
  return useQuery({
    queryKey: ["admin", "bookings"],
    queryFn: adminService.bookings,
  });
}

/** The public artist list is the only roster the API exposes. */
export function useAdminArtists() {
  return useQuery({
    queryKey: ["admin", "artists"],
    queryFn: () => artistService.list(),
  });
}

/* ---------------------------------------------------------- mutations */

export function useVerifyArtist() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, verified }: { id: string; verified: boolean; name?: string }) =>
      adminService.verifyArtist(id, verified),
    onSuccess: (_artist, { id, verified, name }) => {
      // The roster lives under both keys, and the public profile caches
      // its own copy of `verified`.
      queryClient.invalidateQueries({ queryKey: ["admin"] });
      queryClient.invalidateQueries({ queryKey: ["artists"] });
      queryClient.invalidateQueries({ queryKey: ["artist", id] });

      const who = name ?? "That artist";
      toast.success(
        verified
          ? `${who} is now verified.`
          : `Verification removed from ${who}.`,
      );
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't update that artist."),
  });
}

/* ------------------------------------------------------------ reviews */

export interface AdminReview {
  review: Review;
  artist: ArtistProfile;
}

/**
 * Reviews across the whole platform.
 *
 * This is an N+1 by necessity: the backend exposes reviews only per
 * artist (GET /artists/:id/reviews) and has no global reviews endpoint,
 * so the roster is fetched first and then one request is issued per
 * artist and the results flattened. A `GET /admin/reviews` endpoint would
 * replace this entire hook with a single `useQuery`.
 */
export function useAdminReviews() {
  const artistsQuery = useAdminArtists();
  const artists = artistsQuery.data ?? [];

  const reviewQueries = useQueries({
    queries: artists.map((artist) => ({
      // Shares a key with useArtistReviews, so a profile page visit warms
      // this list and vice versa — the one upside of the N+1.
      queryKey: ["artist", artist.id, "reviews"],
      queryFn: () => artistService.reviews(artist.id),
    })),
  });

  const isPending =
    artistsQuery.isPending || reviewQueries.some((query) => query.isPending);
  const isError =
    artistsQuery.isError || reviewQueries.some((query) => query.isError);

  const reviews: AdminReview[] = artists
    .flatMap((artist, index) =>
      (reviewQueries[index]?.data ?? []).map<AdminReview>((review) => ({
        review,
        artist,
      })),
    )
    .sort(
      (a, b) =>
        new Date(b.review.createdAt).getTime() -
        new Date(a.review.createdAt).getTime(),
    );

  const refetch = () => {
    void artistsQuery.refetch();
    reviewQueries.forEach((query) => void query.refetch());
  };

  return { reviews, artists, isPending, isError, refetch };
}

/* -------------------------------------------------------------- users */

export interface DerivedUser {
  id: string;
  name: string;
  email: string;
  bookingCount: number;
  /** ISO date of their most recent booking. */
  latestBooking: string;
}

/**
 * There is no `GET /admin/users`. Rather than invent one — or, worse,
 * invent users — this derives the distinct customers who actually appear
 * in `GET /admin/bookings`. It is an honest subset: a registered customer
 * who has never booked is invisible here, and the page says so.
 */
export function useDerivedUsers() {
  const query = useAdminBookings();
  const bookings = query.data ?? [];

  const byCustomer = new Map<string, DerivedUser>();

  for (const booking of bookings) {
    const customer = booking.customer;
    if (!customer) continue;

    const id = booking.customerId || customer.email;
    const existing = byCustomer.get(id);

    if (existing) {
      existing.bookingCount += 1;
      if (booking.bookingDate > existing.latestBooking) {
        existing.latestBooking = booking.bookingDate;
      }
    } else {
      byCustomer.set(id, {
        id,
        name: customer.name,
        email: customer.email,
        bookingCount: 1,
        latestBooking: booking.bookingDate,
      });
    }
  }

  const users = [...byCustomer.values()].sort(
    (a, b) =>
      b.bookingCount - a.bookingCount || a.name.localeCompare(b.name),
  );

  return { ...query, users, bookingCount: bookings.length };
}
