/** Mirrors backend/prisma/schema.prisma. Keep in sync. */

export type Role = "CUSTOMER" | "ARTIST" | "ADMIN";
export type BookingStatus =
  | "PENDING"
  | "CONFIRMED"
  | "CANCELLED"
  | "COMPLETED";
export type AvailabilityStatus = "AVAILABLE" | "UNAVAILABLE";

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

/** The `user` relation the API selects alongside an artist profile. */
export interface ArtistUser {
  name: string;
  email: string;
  phone?: string | null;
  role: Role;
}

export interface ArtistProfile {
  id: string;
  userId: string;
  bio?: string | null;
  city: string;
  experience: number;
  instagram?: string | null;
  verified: boolean;
  profileImage?: string | null;
  rating: number;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
  user?: ArtistUser;
  services?: Service[];
  portfolioImages?: PortfolioImage[];
}

export interface Service {
  id: string;
  artistId: string;
  title: string;
  description?: string | null;
  /** Prisma Decimal serialises as a string over JSON. */
  price: string | number;
  duration: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioImage {
  id: string;
  artistId: string;
  imageUrl: string;
  createdAt: string;
}

export interface Availability {
  id: string;
  artistId: string;
  date: string;
  status: AvailabilityStatus;
}

export interface Booking {
  id: string;
  customerId: string;
  artistId: string;
  serviceId: string;
  bookingDate: string;
  bookingStatus: BookingStatus;
  createdAt: string;
  updatedAt: string;
  customer?: Pick<User, "name" | "email">;
  artist?: ArtistProfile;
  service?: Service;
  review?: Review | null;
}

export interface Review {
  id: string;
  bookingId: string;
  customerId: string;
  artistId: string;
  rating: number;
  comment?: string | null;
  createdAt: string;
  customer?: Pick<User, "name">;
}

/** Every endpoint wraps its payload in this envelope. */
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface AuthPayload {
  token: string;
  user: User;
}

export interface ArtistFilters {
  city?: string;
  minExperience?: number;
  /** Client-side refinements — the API filters on city + experience only. */
  minRating?: number;
  maxPrice?: number;
  verifiedOnly?: boolean;
  sort?: "recommended" | "rating" | "price-asc" | "price-desc" | "experience";
}
