"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { CalendarCheck, Info, UserRound } from "lucide-react";
import { formatDate, toDateKey } from "@/lib/utils";
import { useArtistAvailability } from "@/hooks/use-artists";
import {
  isMissingProfile,
  useMyArtistProfile,
  useRemoveAvailability,
  useSetAvailability,
} from "@/hooks/use-artist-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ARTIST_NAV } from "@/components/dashboard/nav";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Calendar } from "@/components/ui/calendar";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import type { Availability } from "@/types";

export default function ArtistAvailabilityPage() {
  const profile = useMyArtistProfile();

  return (
    <DashboardShell
      role="ARTIST"
      nav={ARTIST_NAV}
      title="Availability"
      description="Open the days you're free. Clients can only book a date you've opened — everything else is simply not selectable to them."
    >
      {profile.isPending ? (
        <Skeleton className="h-[28rem] w-full rounded-[var(--radius-card)]" />
      ) : profile.isError && isMissingProfile(profile.error) ? (
        <EmptyState
          icon={<UserRound />}
          title="Complete your profile first"
          description="Your calendar hangs off your artist profile, so we need that before you can open dates."
          action={
            <Button asChild>
              <Link href="/artist/profile">Complete your profile</Link>
            </Button>
          }
        />
      ) : profile.isError || !profile.data ? (
        <ErrorState
          title="We couldn't load your profile"
          onRetry={() => profile.refetch()}
        />
      ) : (
        <AvailabilityEditor artistId={profile.data.id} />
      )}
    </DashboardShell>
  );
}

function AvailabilityEditor({ artistId }: { artistId: string }) {
  const { data, isPending, isError, refetch } = useArtistAvailability(artistId);
  const setAvailability = useSetAvailability();
  const removeAvailability = useRemoveAvailability();

  const [selected, setSelected] = useState<Date[]>([]);

  /**
   * The server's own ISO string for each open day. Removal matches on the exact
   * stored instant, so we must send back what we were given rather than a date
   * we've re-derived from the calendar grid.
   */
  const open = useMemo(() => {
    const map = new Map<string, string>();
    for (const slot of (data ?? []) as Availability[]) {
      if (slot.status === "AVAILABLE") {
        map.set(toDateKey(new Date(slot.date)), slot.date);
      }
    }
    return map;
  }, [data]);

  // Seed the calendar once, when the server's answer first lands. A background
  // refetch must never wipe edits the artist hasn't saved yet.
  const seeded = useRef(false);
  useEffect(() => {
    if (!data || seeded.current) return;
    seeded.current = true;
    setSelected([...open.keys()].map((key) => new Date(`${key}T00:00:00`)));
  }, [data, open]);

  const selectedKeys = useMemo(
    () => new Set(selected.map(toDateKey)),
    [selected],
  );

  const added = useMemo(
    () => selected.filter((date) => !open.has(toDateKey(date))),
    [selected, open],
  );

  const removed = useMemo(
    () =>
      [...open.entries()]
        .filter(([key]) => !selectedKeys.has(key))
        .map(([, iso]) => iso),
    [open, selectedKeys],
  );

  const changes = added.length + removed.length;
  const saving = setAvailability.isPending || removeAvailability.isPending;

  // The API refuses slots in the past, so today is already too late to open.
  const tomorrow = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() + 1);
    return d;
  }, []);

  async function save() {
    try {
      if (added.length > 0) {
        await setAvailability.mutateAsync(
          added.map((date) => date.toISOString()),
        );
      }
      if (removed.length > 0) {
        await removeAvailability.mutateAsync(removed);
      }
      toast.success(
        changes === 1 ? "Calendar updated." : `${changes} dates updated.`,
      );
    } catch {
      // Both mutations already surface the server's message via a toast.
    }
  }

  function discard() {
    setSelected([...open.keys()].map((key) => new Date(`${key}T00:00:00`)));
  }

  if (isPending) {
    return <Skeleton className="h-[28rem] w-full rounded-[var(--radius-card)]" />;
  }

  if (isError) {
    return (
      <ErrorState
        title="We couldn't load your calendar"
        onRetry={() => refetch()}
      />
    );
  }

  const upcoming = [...selected]
    .sort((a, b) => a.getTime() - b.getTime())
    .slice(0, 8);

  return (
    <div className="grid gap-x-16 gap-y-10 lg:grid-cols-[minmax(0,22rem)_1fr]">
      <Card padding="md" className="h-fit">
        <Calendar
          mode="multiple"
          selected={selected}
          onSelect={(dates) => setSelected(dates ?? [])}
          disabled={{ before: tomorrow }}
          startMonth={new Date()}
        />
      </Card>

      <div className="min-w-0 space-y-8">
        <div className="flex items-start gap-3 rounded-[var(--radius-card)] bg-surface-soft px-6 py-5">
          <Info
            className="mt-0.5 size-4 shrink-0 text-foreground-muted"
            aria-hidden
          />
          <p className="text-caption text-foreground-secondary">
            Tap a day to open it, tap it again to close it. Nothing is sent until
            you save — so you can plan a whole month in one go. A day holding a
            live booking can&apos;t be closed.
          </p>
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-6 border-b border-border pb-4">
            <h2 className="font-display text-h4 font-medium">Open dates</h2>
            <p className="tabular text-caption text-foreground-muted">
              {selected.length} {selected.length === 1 ? "day" : "days"}
            </p>
          </div>

          {selected.length === 0 ? (
            <div className="flex flex-col items-start gap-2 py-8">
              <CalendarCheck
                className="size-5 text-foreground-muted"
                aria-hidden
              />
              <p className="text-body text-foreground-secondary">
                You haven&apos;t opened any dates. Until you do, clients can see
                your work but can&apos;t book you.
              </p>
            </div>
          ) : (
            <ul className="flex flex-wrap gap-2 pt-5">
              {upcoming.map((date) => (
                <li
                  key={toDateKey(date)}
                  className="tabular rounded-full border border-border px-3.5 py-1.5 text-caption text-foreground-secondary"
                >
                  {formatDate(date, {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                  })}
                </li>
              ))}
              {selected.length > upcoming.length && (
                <li className="tabular rounded-full px-3.5 py-1.5 text-caption text-foreground-muted">
                  +{selected.length - upcoming.length} more
                </li>
              )}
            </ul>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-4 border-t border-border pt-8">
          <Button onClick={save} loading={saving} disabled={changes === 0}>
            {changes === 0 ? (
              "Save changes"
            ) : (
              <span className="tabular">
                Save {changes} {changes === 1 ? "change" : "changes"}
              </span>
            )}
          </Button>
          {changes > 0 && !saving && (
            <>
              <Button variant="ghost" onClick={discard}>
                Discard
              </Button>
              <p className="tabular text-caption text-foreground-muted">
                {added.length > 0 && (
                  <span>
                    {added.length} to open
                    {removed.length > 0 && " · "}
                  </span>
                )}
                {removed.length > 0 && <span>{removed.length} to close</span>}
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
