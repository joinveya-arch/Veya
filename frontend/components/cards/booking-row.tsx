"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, MapPin } from "lucide-react";
import { cn, formatDate, formatDuration, formatPrice } from "@/lib/utils";
import { artistImage } from "@/lib/images";
import { BOOKING_STATUS_META } from "@/lib/constants";
import { Badge } from "@/components/ui/badge";
import type { Booking } from "@/types";

/**
 * One booking, rendered the same way for customers, artists and admins —
 * only the `perspective` changes which counterparty is named and which
 * actions are offered.
 */
export function BookingRow({
  booking,
  perspective,
  actions,
}: {
  booking: Booking;
  perspective: "customer" | "artist" | "admin";
  actions?: React.ReactNode;
}) {
  const status = BOOKING_STATUS_META[booking.bookingStatus];
  const artist = booking.artist;
  const service = booking.service;

  const artistName = artist?.user?.name ?? "VEYA Artist";
  const clientName = booking.customer?.name ?? "Client";

  // A customer cares who the artist is; an artist cares who the client is.
  // An admin needs BOTH — the headline names the client, and the artist is
  // named on the line beneath (see `subtitle`).
  const counterparty =
    perspective === "customer" ? artistName : clientName;

  const subtitle =
    perspective === "admin"
      ? `${service?.title ?? "Service"} · with ${artistName}`
      : (service?.title ?? "Service");

  const date = new Date(booking.bookingDate);
  const isPast = date.getTime() < Date.now();

  return (
    <article className="flex flex-col gap-6 border-b border-border py-7 sm:flex-row sm:items-center">
      {perspective !== "artist" && artist && (
        <Link
          href={`/artists/${artist.id}`}
          className="relative size-20 shrink-0 overflow-hidden rounded-[var(--radius-image)] bg-surface-sunken"
        >
          <Image
            src={artistImage(artist.id, artist.profileImage)}
            alt=""
            fill
            sizes="80px"
            className="object-cover"
          />
        </Link>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-display text-h4 font-medium text-foreground">
            {perspective === "customer" && artist ? (
              <Link
                href={`/artists/${artist.id}`}
                className="transition-colors hover:text-accent"
              >
                {counterparty}
              </Link>
            ) : (
              counterparty
            )}
          </h3>
          <Badge variant={status.variant} size="sm">
            {status.label}
          </Badge>
        </div>

        <p className="mt-1.5 text-caption text-foreground-secondary">
          {subtitle}
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-caption text-foreground-muted">
          <span className={cn("tabular", isPast && "line-through")}>
            {formatDate(date, {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
          {service && (
            <span className="tabular flex items-center gap-1.5">
              <Clock className="size-3.5" aria-hidden />
              {formatDuration(service.duration)}
            </span>
          )}
          {artist?.city && (
            <span className="flex items-center gap-1.5">
              <MapPin className="size-3.5" aria-hidden />
              {artist.city}
            </span>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-6 sm:flex-col sm:items-end sm:gap-3">
        {service && (
          <p className="tabular font-display text-h4 font-medium text-foreground">
            {formatPrice(service.price)}
          </p>
        )}
        {actions && <div className="flex gap-2">{actions}</div>}
      </div>
    </article>
  );
}
