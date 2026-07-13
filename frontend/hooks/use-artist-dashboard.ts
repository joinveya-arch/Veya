"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ApiError } from "@/lib/api";
import { artistService, serviceService } from "@/services";
import type { ArtistProfile, Service } from "@/types";

/* ----------------------------------------------------------------- keys */

export const artistDashboardKeys = {
  me: ["artist", "me"] as const,
  services: (artistId: string) => ["services", "artist", artistId] as const,
};

/**
 * An artist who hasn't onboarded yet has no profile row, and the API says so
 * with a 404. That is a legitimate state — not a failure — so callers branch
 * on it rather than showing an error.
 */
export function isMissingProfile(error: unknown): boolean {
  return error instanceof ApiError && error.status === 404;
}

/* -------------------------------------------------------------- queries */

export function useMyArtistProfile() {
  return useQuery<ArtistProfile, ApiError>({
    queryKey: artistDashboardKeys.me,
    queryFn: artistService.me,
    // Retrying a 404 just delays the "create your profile" prompt.
    retry: (failureCount, error) =>
      !isMissingProfile(error) && failureCount < 2,
  });
}

/** The signed-in artist's packages. Waits until we know their profile id. */
export function useMyServices(artistId: string | undefined) {
  return useQuery<Service[], ApiError>({
    queryKey: artistDashboardKeys.services(artistId ?? ""),
    queryFn: () => serviceService.byArtist(artistId!),
    enabled: Boolean(artistId),
  });
}

/* ------------------------------------------------------------ mutations */

/**
 * Create-or-update, decided by whether a profile already exists. The two
 * endpoints take the same body, so the caller shouldn't have to care.
 */
export function useUpsertProfile(exists: boolean) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: {
      city: string;
      experience: number;
      bio?: string;
      instagram?: string;
    }) =>
      exists
        ? artistService.updateProfile(body)
        : artistService.createProfile(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist"] });
      toast.success(exists ? "Profile updated." : "Profile created.");
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't save your profile."),
  });
}

export function useUploadProfileImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => artistService.uploadProfileImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist"] });
      toast.success("Portrait updated.");
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't upload that image."),
  });
}

export function useAddPortfolioImage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => artistService.addPortfolioImage(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist"] });
      toast.success("Image added to your portfolio.");
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't upload that image."),
  });
}

export function useCreateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: serviceService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["artist"] });
      toast.success("Package published.");
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't publish that package."),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      ...body
    }: {
      id: string;
      title?: string;
      description?: string;
      price?: number;
      duration?: number;
    }) => serviceService.update(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["artist"] });
      toast.success("Package updated.");
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't update that package."),
  });
}

export function useDeleteService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => serviceService.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      queryClient.invalidateQueries({ queryKey: ["artist"] });
      toast.success("Package removed.");
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't remove that package."),
  });
}

export function useSetAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dates: string[]) => artistService.setAvailability(dates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist"] });
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't open those dates."),
  });
}

export function useRemoveAvailability() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (dates: string[]) => artistService.removeAvailability(dates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artist"] });
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't close those dates."),
  });
}
