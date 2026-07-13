export const CITIES = [
  "Mumbai",
  "Delhi",
  "Bengaluru",
  "Hyderabad",
  "Chennai",
  "Pune",
  "Kolkata",
  "Jaipur",
  "Ahmedabad",
  "Chandigarh",
] as const;

export const SERVICE_TYPES = [
  { value: "bridal", label: "Bridal" },
  { value: "engagement", label: "Engagement" },
  { value: "party", label: "Party & event" },
  { value: "editorial", label: "Editorial & shoot" },
  { value: "hair", label: "Hairstyling" },
] as const;

export const EXPERIENCE_OPTIONS = [
  { value: 0, label: "Any experience" },
  { value: 2, label: "2+ years" },
  { value: 5, label: "5+ years" },
  { value: 8, label: "8+ years" },
] as const;

export const RATING_OPTIONS = [
  { value: 0, label: "Any rating" },
  { value: 4, label: "4.0+" },
  { value: 4.5, label: "4.5+" },
] as const;

export const SORT_OPTIONS = [
  { value: "recommended", label: "Recommended" },
  { value: "rating", label: "Highest rated" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "experience", label: "Most experienced" },
] as const;

/** Ceiling for the budget slider, in ₹. */
export const PRICE_MAX = 50_000;
export const PRICE_STEP = 1_000;

export const BOOKING_STATUS_META = {
  PENDING: { label: "Pending", variant: "warning" },
  CONFIRMED: { label: "Confirmed", variant: "success" },
  COMPLETED: { label: "Completed", variant: "neutral" },
  CANCELLED: { label: "Cancelled", variant: "error" },
} as const;
