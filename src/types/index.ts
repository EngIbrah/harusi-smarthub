export type UserRole = "couple" | "vendor" | "admin";
export type VendorStatus = "pending" | "active" | "suspended";
export type BookingStatus = "pending" | "confirmed" | "cancelled" | "completed";
export type PlanMode = "ai" | "manual";

export interface Profile {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  icon: string;
  description: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
}

export interface Vendor {
  id: string;
  profile_id: string;
  category_id: string;
  business_name: string;
  description: string | null;
  base_price: number;
  location: string;
  images: string[];
  cover_image: string | null;
  is_verified: boolean;
  status: VendorStatus;
  rating_avg: number;
  rating_count: number;
  years_experience: number;
  social_links: Record<string, string>;
  created_at: string;
  updated_at: string;
  // Joined
  category?: Category;
  profile?: Profile;
}

export interface Service {
  id: string;
  vendor_id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface WeddingPlan {
  id: string;
  couple_id: string;
  title: string;
  wedding_date: string | null;
  guest_count: number;
  total_budget: number;
  mode: PlanMode;
  allocation_json: BudgetAllocation;
  notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface BudgetAllocation {
  venue: number;
  catering: number;
  decoration: number;
  photography: number;
  entertainment: number;
  flowers: number;
  other: number;
}

export interface Booking {
  id: string;
  plan_id: string;
  vendor_id: string;
  service_id: string | null;
  couple_id: string;
  status: BookingStatus;
  agreed_price: number | null;
  event_date: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  vendor?: Vendor;
  service?: Service;
  plan?: WeddingPlan;
}

export interface Review {
  id: string;
  booking_id: string;
  couple_id: string;
  vendor_id: string;
  rating: number;
  comment: string | null;
  created_at: string;
  // Joined
  profile?: Profile;
}

export interface AdminStats {
  total_users: number;
  total_vendors: number;
  total_bookings: number;
  total_revenue: number;
  pending_vendors: number;
  active_plans: number;
}
