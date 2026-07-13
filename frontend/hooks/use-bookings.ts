"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { bookingService, reviewService } from "@/services";
import { ApiError } from "@/lib/api";
import type { BookingStatus } from "@/types";

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings", "me"],
    queryFn: bookingService.mine,
  });
}

export function useCreateBooking() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: bookingService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't complete that booking."),
  });
}

export function useUpdateBookingStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      status,
    }: {
      id: string;
      status: Exclude<BookingStatus, "PENDING">;
    }) => bookingService.updateStatus(id, status),
    onSuccess: (_data, { status }) => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      toast.success(`Booking ${status.toLowerCase()}.`);
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't update that booking."),
  });
}

export function useCreateReview() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: reviewService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      queryClient.invalidateQueries({ queryKey: ["artist"] });
      toast.success("Thank you — your review is live.");
    },
    onError: (error: ApiError) =>
      toast.error(error.message || "We couldn't post that review."),
  });
}
