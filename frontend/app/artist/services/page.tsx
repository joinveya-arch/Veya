"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, Tag, UserRound } from "lucide-react";
import { formatDuration, formatPrice } from "@/lib/utils";
import {
  isMissingProfile,
  useCreateService,
  useDeleteService,
  useMyArtistProfile,
  useMyServices,
  useUpdateService,
} from "@/hooks/use-artist-dashboard";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { ARTIST_NAV } from "@/components/dashboard/nav";
import { Button } from "@/components/ui/button";
import { Field } from "@/components/ui/field";
import { Input, Textarea } from "@/components/ui/input";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/states";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Service } from "@/types";

/* Mirrors backend/src/validators/service.validator.ts. */
const schema = z.object({
  title: z.string().trim().min(3, "Title must be at least 3 characters"),
  description: z
    .string()
    .trim()
    .max(500, "Description must not exceed 500 characters")
    .optional(),
  price: z
    .number({ invalid_type_error: "Price is required" })
    .positive("Price must be greater than 0"),
  duration: z
    .number({ invalid_type_error: "Duration is required" })
    .int("Duration must be a whole number of minutes")
    .positive("Duration must be greater than 0"),
});

type Values = z.infer<typeof schema>;

export default function ArtistServicesPage() {
  const profile = useMyArtistProfile();
  const services = useMyServices(profile.data?.id);

  const [editing, setEditing] = useState<Service | null>(null);
  const [adding, setAdding] = useState(false);
  const [deleting, setDeleting] = useState<Service | null>(null);

  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const hasProfile = Boolean(profile.data);

  async function onCreate(values: Values) {
    await createService.mutateAsync({
      title: values.title,
      description: values.description || undefined,
      price: values.price,
      duration: values.duration,
    });
    setAdding(false);
  }

  async function onUpdate(values: Values) {
    if (!editing) return;
    await updateService.mutateAsync({
      id: editing.id,
      title: values.title,
      description: values.description || undefined,
      price: values.price,
      duration: values.duration,
    });
    setEditing(null);
  }

  async function onDelete() {
    if (!deleting) return;
    await deleteService.mutateAsync(deleting.id);
    setDeleting(null);
  }

  return (
    <DashboardShell
      role="ARTIST"
      nav={ARTIST_NAV}
      title="Services"
      description="The packages clients can book. Be specific about what's included — a clear package converts far better than an enquiry form."
      action={
        hasProfile ? (
          <Button onClick={() => setAdding(true)}>
            <Plus aria-hidden />
            Add package
          </Button>
        ) : undefined
      }
    >
      {profile.isPending ? (
        <ListSkeleton />
      ) : profile.isError && isMissingProfile(profile.error) ? (
        <EmptyState
          icon={<UserRound />}
          title="Complete your profile first"
          description="Packages hang off your artist profile, so we need that before you can publish one."
          action={
            <Button asChild>
              <Link href="/artist/profile">Complete your profile</Link>
            </Button>
          }
        />
      ) : profile.isError ? (
        <ErrorState
          title="We couldn't load your profile"
          onRetry={() => profile.refetch()}
        />
      ) : services.isPending ? (
        <ListSkeleton />
      ) : services.isError ? (
        <ErrorState
          title="We couldn't load your packages"
          onRetry={() => services.refetch()}
        />
      ) : (services.data ?? []).length === 0 ? (
        <EmptyState
          icon={<Tag />}
          title="No packages yet"
          description="Publish your first package — a title, a price and how long it takes. That's everything a client needs to book you."
          action={
            <Button onClick={() => setAdding(true)}>
              <Plus aria-hidden />
              Add package
            </Button>
          }
        />
      ) : (
        <ul className="border-t border-border">
          {(services.data ?? []).map((service) => (
            <li
              key={service.id}
              className="flex flex-col gap-4 border-b border-border py-7 sm:flex-row sm:items-baseline sm:justify-between sm:gap-10"
            >
              <div className="min-w-0">
                <h2 className="font-display text-h4 font-medium text-foreground">
                  {service.title}
                </h2>
                {service.description && (
                  <p className="mt-2 max-w-[38rem] text-caption text-foreground-secondary">
                    {service.description}
                  </p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-6 sm:flex-col sm:items-end sm:gap-3">
                <div className="sm:text-right">
                  <p className="tabular font-display text-h4 font-medium text-foreground">
                    {formatPrice(service.price)}
                  </p>
                  <p className="tabular mt-1 text-caption text-foreground-muted">
                    {formatDuration(service.duration)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="secondary"
                    onClick={() => setEditing(service)}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setDeleting(service)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}

      <ServiceDialog
        key={editing?.id ?? "new"}
        open={adding || Boolean(editing)}
        onOpenChange={(open) => {
          if (!open) {
            setAdding(false);
            setEditing(null);
          }
        }}
        service={editing}
        pending={createService.isPending || updateService.isPending}
        onSubmit={editing ? onUpdate : onCreate}
      />

      <Dialog
        open={Boolean(deleting)}
        onOpenChange={(open) => !open && setDeleting(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete this package?</DialogTitle>
            <DialogDescription>
              &ldquo;{deleting?.title}&rdquo; will no longer be bookable. Dates
              already booked against it are unaffected.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8">
            <Button variant="secondary" onClick={() => setDeleting(null)}>
              Keep it
            </Button>
            <Button
              variant="danger"
              onClick={onDelete}
              loading={deleteService.isPending}
            >
              Delete package
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </DashboardShell>
  );
}

/* ---------------------------------------------------------------- dialog */

function ServiceDialog({
  open,
  onOpenChange,
  service,
  pending,
  onSubmit,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  service: Service | null;
  pending: boolean;
  onSubmit: (values: Values) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: service
      ? {
          title: service.title,
          description: service.description ?? "",
          price: Number(service.price),
          duration: service.duration,
        }
      : { title: "", description: "" },
  });

  // Reopening the dialog for a different row must not carry the last row's
  // values across.
  useEffect(() => {
    if (!open) return;
    reset(
      service
        ? {
            title: service.title,
            description: service.description ?? "",
            price: Number(service.price),
            duration: service.duration,
          }
        : { title: "", description: "" },
    );
  }, [open, service, reset]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {service ? "Edit package" : "Add a package"}
          </DialogTitle>
          <DialogDescription>
            Everything here is shown on your public profile.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="mt-8 space-y-5"
          noValidate
        >
          <Field
            label="Title"
            htmlFor="service-title"
            required
            error={errors.title?.message}
          >
            <Input
              id="service-title"
              placeholder="Bridal makeup & hair"
              invalid={Boolean(errors.title)}
              {...register("title")}
            />
          </Field>

          <Field
            label="Description"
            htmlFor="service-description"
            hint="Optional"
            error={errors.description?.message}
          >
            <Textarea
              id="service-description"
              placeholder="What's included, how long it takes, what the client should prepare."
              invalid={Boolean(errors.description)}
              {...register("description")}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="Price"
              htmlFor="service-price"
              hint="₹"
              required
              error={errors.price?.message}
            >
              <Input
                id="service-price"
                type="number"
                inputMode="numeric"
                min={1}
                step={1}
                placeholder="25000"
                className="tabular"
                invalid={Boolean(errors.price)}
                {...register("price", { valueAsNumber: true })}
              />
            </Field>

            <Field
              label="Duration"
              htmlFor="service-duration"
              hint="minutes"
              required
              error={errors.duration?.message}
            >
              <Input
                id="service-duration"
                type="number"
                inputMode="numeric"
                min={1}
                step={5}
                placeholder="120"
                className="tabular"
                invalid={Boolean(errors.duration)}
                {...register("duration", { valueAsNumber: true })}
              />
            </Field>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="secondary"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" loading={pending}>
              {service ? "Save changes" : "Publish package"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <Skeleton key={i} className="h-24 w-full rounded-[var(--radius-card)]" />
      ))}
    </div>
  );
}
