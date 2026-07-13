import { api, qs } from "@/lib/api";
import type {
  ArtistProfile,
  AuthPayload,
  Availability,
  Booking,
  BookingStatus,
  PortfolioImage,
  Review,
  Role,
  Service,
  User,
} from "@/types";

/* ---------------------------------------------------------------- auth */

export const authService = {
  register: (body: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role?: Role;
  }) => api.post<User>("/auth/register", body),

  login: (body: { email: string; password: string }) =>
    api.post<AuthPayload>("/auth/login", body),

  me: () => api.get<User>("/auth/me"),
};

/* ------------------------------------------------------------- artists */

export const artistService = {
  list: (params: { city?: string; minExperience?: number } = {}) =>
    api.get<ArtistProfile[]>(`/artists${qs(params)}`),

  byId: (id: string) => api.get<ArtistProfile>(`/artists/${id}`),

  portfolio: (id: string) =>
    api.get<PortfolioImage[]>(`/artists/${id}/portfolio`),

  reviews: (id: string) => api.get<Review[]>(`/artists/${id}/reviews`),

  availability: (id: string) =>
    api.get<Availability[]>(`/artists/${id}/availability`),

  /* --- artist-owned --- */
  me: () => api.get<ArtistProfile>("/artists/profile/me"),

  createProfile: (body: {
    city: string;
    experience: number;
    bio?: string;
    instagram?: string;
  }) => api.post<ArtistProfile>("/artists/profile", body),

  updateProfile: (body: {
    city?: string;
    experience?: number;
    bio?: string;
    instagram?: string;
  }) => api.put<ArtistProfile>("/artists/profile", body),

  uploadProfileImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api.upload<ArtistProfile>("/artists/profile/image", form);
  },

  addPortfolioImage: (file: File) => {
    const form = new FormData();
    form.append("image", file);
    return api.upload<PortfolioImage>("/artists/portfolio", form);
  },

  setAvailability: (dates: string[]) =>
    api.post<Availability[]>("/artists/availability", { dates }),

  removeAvailability: (dates: string[]) =>
    api.delete<{ count: number }>("/artists/availability", { dates }),
};

/* ------------------------------------------------------------ services */

export const serviceService = {
  byArtist: (artistId: string) =>
    api.get<Service[]>(`/services/artist/${artistId}`),

  byId: (id: string) => api.get<Service>(`/services/${id}`),

  create: (body: {
    title: string;
    description?: string;
    price: number;
    duration: number;
  }) => api.post<Service>("/services", body),

  update: (
    id: string,
    body: {
      title?: string;
      description?: string;
      price?: number;
      duration?: number;
    },
  ) => api.put<Service>(`/services/${id}`, body),

  remove: (id: string) => api.delete<null>(`/services/${id}`),
};

/* ------------------------------------------------------------ bookings */

export const bookingService = {
  create: (body: { serviceId: string; bookingDate: string }) =>
    api.post<Booking>("/bookings", body),

  mine: () => api.get<Booking[]>("/bookings/me"),

  updateStatus: (id: string, status: Exclude<BookingStatus, "PENDING">) =>
    api.patch<Booking>(`/bookings/${id}/status`, { status }),
};

/* ------------------------------------------------------------- reviews */

export const reviewService = {
  create: (body: { bookingId: string; rating: number; comment?: string }) =>
    api.post<Review>("/reviews", body),
};

/* --------------------------------------------------------------- admin */

export const adminService = {
  bookings: () => api.get<Booking[]>("/admin/bookings"),

  verifyArtist: (id: string, verified: boolean) =>
    api.patch<ArtistProfile>(`/admin/artists/${id}/verify`, { verified }),
};
