"use client";

import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ImagePlus } from "lucide-react";
import { useAuth } from "@/providers/auth-provider";
import {
  isMissingProfile,
  useMyArtistProfile,
  useUploadProfileImage,
  useUpsertProfile,
} from "@/hooks/use-artist-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ARTIST_NAV } from "@/components/dashboard/nav";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { Separator } from "@/components/ui/controls";
import { ErrorState, Skeleton } from "@/components/ui/states";
import type { ArtistProfile } from "@/types";

/* Mirrors backend/src/validators/artist.validator.ts. */
const INSTAGRAM = /^@?[a-zA-Z0-9._]{1,30}$/;

const schema = z.object({
  city: z.string().trim().min(2, "City name must be at least 2 characters"),
  experience: z
    .number({ invalid_type_error: "Experience is required" })
    .int("Experience must be a whole number of years")
    .min(0, "Experience cannot be negative"),
  bio: z
    .string()
    .trim()
    .max(1000, "Bio must not exceed 1000 characters")
    .optional(),
  instagram: z
    .string()
    .trim()
    .regex(INSTAGRAM, "That doesn't look like an Instagram handle")
    .optional()
    .or(z.literal("")),
});

type Values = z.infer<typeof schema>;

export default function ArtistProfilePage() {
  const profile = useMyArtistProfile();

  const missing = profile.isError && isMissingProfile(profile.error);
  const exists = Boolean(profile.data);

  return (
    <DashboardShell
      role="ARTIST"
      nav={ARTIST_NAV}
      title="Profile"
      description={
        missing
          ? "Tell clients who you are. This is what they see before they book you."
          : "Everything here is public. Keep it current — a stale profile costs bookings."
      }
    >
      {profile.isPending ? (
        <div className="max-w-[38rem] space-y-6">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : profile.isError && !missing ? (
        <ErrorState
          title="We couldn't load your profile"
          onRetry={() => profile.refetch()}
        />
      ) : (
        <div className="max-w-[38rem] space-y-12">
          {exists && profile.data && <Portrait profile={profile.data} />}
          <ProfileForm profile={profile.data ?? null} exists={exists} />
        </div>
      )}
    </DashboardShell>
  );
}

/* -------------------------------------------------------------- portrait */

function Portrait({ profile }: { profile: ArtistProfile }) {
  const { user } = useAuth();
  const upload = useUploadProfileImage();
  const inputRef = useRef<HTMLInputElement>(null);

  function onPick(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    upload.mutate(file);
  }

  return (
    <section className="flex flex-wrap items-center gap-6">
      <Avatar
        size="2xl"
        src={profile.profileImage}
        name={user?.name ?? "Artist"}
      />
      <div className="min-w-0">
        <h2 className="font-display text-h4 font-medium">Your portrait</h2>
        <p className="mt-1 max-w-[24rem] text-caption text-foreground-secondary">
          A clear, well-lit photograph of you — not of your work. The portfolio
          carries the work.
        </p>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          disabled={upload.isPending}
          onChange={onPick}
        />
        <Button
          type="button"
          size="sm"
          variant="secondary"
          className="mt-4"
          loading={upload.isPending}
          onClick={() => inputRef.current?.click()}
        >
          <ImagePlus aria-hidden />
          {profile.profileImage ? "Replace portrait" : "Upload a portrait"}
        </Button>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ form */

function ProfileForm({
  profile,
  exists,
}: {
  profile: ArtistProfile | null;
  exists: boolean;
}) {
  const upsert = useUpsertProfile(exists);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      city: profile?.city ?? "",
      experience: profile?.experience,
      bio: profile?.bio ?? "",
      instagram: profile?.instagram ?? "",
    },
  });

  // The query resolves after first paint, so the form has to catch up.
  useEffect(() => {
    if (!profile) return;
    reset({
      city: profile.city,
      experience: profile.experience,
      bio: profile.bio ?? "",
      instagram: profile.instagram ?? "",
    });
  }, [profile, reset]);

  async function onSubmit(values: Values) {
    await upsert.mutateAsync({
      city: values.city,
      experience: values.experience,
      bio: values.bio?.trim() || undefined,
      instagram: values.instagram?.trim() || undefined,
    });
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
      {exists && <Separator />}

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="City"
          htmlFor="profile-city"
          required
          error={errors.city?.message}
        >
          <Input
            id="profile-city"
            autoComplete="address-level2"
            placeholder="Mumbai"
            invalid={Boolean(errors.city)}
            {...register("city")}
          />
        </Field>

        <Field
          label="Experience"
          htmlFor="profile-experience"
          hint="years"
          required
          error={errors.experience?.message}
        >
          <Input
            id="profile-experience"
            type="number"
            inputMode="numeric"
            min={0}
            step={1}
            placeholder="6"
            className="tabular"
            invalid={Boolean(errors.experience)}
            {...register("experience", { valueAsNumber: true })}
          />
        </Field>
      </div>

      <Field
        label="Bio"
        htmlFor="profile-bio"
        hint="Optional · up to 1000 characters"
        error={errors.bio?.message}
      >
        <Textarea
          id="profile-bio"
          className="min-h-[10rem]"
          placeholder="Who you work with, what you're known for, how you like to work on the day."
          invalid={Boolean(errors.bio)}
          {...register("bio")}
        />
      </Field>

      <Field
        label="Instagram"
        htmlFor="profile-instagram"
        hint="Optional"
        error={errors.instagram?.message}
      >
        <Input
          id="profile-instagram"
          placeholder="@yourhandle"
          autoComplete="off"
          invalid={Boolean(errors.instagram)}
          {...register("instagram")}
        />
      </Field>

      <div className="flex items-center gap-4 pt-2">
        <Button type="submit" loading={upsert.isPending}>
          {exists ? "Save changes" : "Create profile"}
        </Button>
        {exists && isDirty && !upsert.isPending && (
          <p className="text-caption text-foreground-muted">
            You have unsaved changes.
          </p>
        )}
      </div>
    </form>
  );
}
