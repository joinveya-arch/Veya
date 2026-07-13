"use client";

import { cn, formatDate } from "@/lib/utils";
import { useAuth } from "@/providers/auth-provider";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { CUSTOMER_NAV } from "@/components/dashboard/nav";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/controls";
import { Reveal, RevealItem, stagger } from "@/components/ui/motion";
import type { User } from "@/types";

const ROLE_LABEL: Record<User["role"], string> = {
  CUSTOMER: "Client",
  ARTIST: "Artist",
  ADMIN: "Administrator",
};

/**
 * Read-only by design. The API exposes no customer profile-update endpoint,
 * and a Save button that quietly does nothing is worse than no Save button.
 */
export default function ProfilePage() {
  const { user, logout } = useAuth();

  return (
    <DashboardShell
      role="CUSTOMER"
      nav={CUSTOMER_NAV}
      title="Profile"
      description="The details we hold for you, and how to sign out of this device."
    >
      {user ? <ProfileDetails user={user} onSignOut={logout} /> : null}
    </DashboardShell>
  );
}

function ProfileDetails({
  user,
  onSignOut,
}: {
  user: User;
  onSignOut: () => void;
}) {
  return (
    <Reveal variants={stagger} immediate className="max-w-[46rem] space-y-10">
      <RevealItem>
        <Card padding="lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <Avatar name={user.name} size="xl" />
            <div className="min-w-0">
              <h2 className="font-display text-h3 font-medium text-foreground">
                {user.name}
              </h2>
              <p className="mt-1 text-body text-foreground-secondary">
                {user.email}
              </p>
            </div>
          </div>

          <Separator className="my-8" />

          <dl className="space-y-0">
            <Detail label="Full name" value={user.name} />
            <Detail label="Email" value={user.email} />
            <Detail
              label="Phone"
              value={user.phone ?? "Not added"}
              muted={!user.phone}
              tabular={Boolean(user.phone)}
            />
            <Detail label="Account type" value={ROLE_LABEL[user.role]} />
            <Detail
              label="Member since"
              value={formatDate(user.createdAt, {
                month: "long",
                year: "numeric",
              })}
              tabular
              last
            />
          </dl>
        </Card>
      </RevealItem>

      <RevealItem>
        <Card padding="lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="max-w-[28rem]">
              <h2 className="font-display text-h4 font-medium text-foreground">
                Editing your details
              </h2>
              <p className="mt-2 text-caption text-foreground-secondary">
                Self-service editing isn&rsquo;t live yet. Until it is, write to{" "}
                <a
                  href="mailto:care@veya.in"
                  className="text-foreground underline decoration-border-strong underline-offset-4 transition-colors hover:decoration-accent"
                >
                  care@veya.in
                </a>{" "}
                and we&rsquo;ll update anything on this page for you.
              </p>
            </div>
            <Button variant="secondary" disabled className="shrink-0">
              Edit profile
            </Button>
          </div>
        </Card>
      </RevealItem>

      <RevealItem>
        <Card padding="lg">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-[28rem]">
              <h2 className="font-display text-h4 font-medium text-foreground">
                Sign out
              </h2>
              <p className="mt-2 text-caption text-foreground-secondary">
                You&rsquo;ll be signed out on this device. Your bookings and
                saved artists stay exactly as they are.
              </p>
            </div>
            <Button variant="secondary" onClick={onSignOut} className="shrink-0">
              Sign out
            </Button>
          </div>
        </Card>
      </RevealItem>
    </Reveal>
  );
}

function Detail({
  label,
  value,
  muted,
  tabular,
  last,
}: {
  label: string;
  value: string;
  muted?: boolean;
  tabular?: boolean;
  last?: boolean;
}) {
  return (
    <div
      className={cn(
        "grid gap-1 py-4 sm:grid-cols-[12rem_1fr] sm:gap-6",
        !last && "border-b border-border",
      )}
    >
      <dt className="text-caption text-foreground-muted">{label}</dt>
      <dd
        className={cn(
          "text-body",
          tabular && "tabular",
          muted ? "text-foreground-muted" : "text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
