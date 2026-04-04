import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import type { BudgetAllocation } from "@/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTSH(amount: number): string {
  return `TSH ${amount.toLocaleString("en-TZ")}`;
}

export function formatTSHShort(amount: number): string {
  if (amount >= 1_000_000) return `TSH ${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `TSH ${(amount / 1_000).toFixed(0)}K`;
  return `TSH ${amount}`;
}

export function generateBudget(total: number): BudgetAllocation {
  return {
    venue:          Math.round(total * 0.22),
    catering:       Math.round(total * 0.35),
    decoration:     Math.round(total * 0.12),
    photography:    Math.round(total * 0.10),
    entertainment:  Math.round(total * 0.08),
    flowers:        Math.round(total * 0.06),
    other:          Math.round(total * 0.07),
  };
}

export const BUDGET_LABELS: Record<keyof BudgetAllocation, { label: string; icon: string; color: string }> = {
  venue:         { label: "Venue Rental",    icon: "🏛️", color: "#6366F1" },
  catering:      { label: "Catering & Food", icon: "🍽️", color: "#F59E0B" },
  decoration:    { label: "Decoration",      icon: "✨", color: "#EC4899" },
  photography:   { label: "Photography",     icon: "📸", color: "#14B8A6" },
  entertainment: { label: "Entertainment",   icon: "🎵", color: "#8B5CF6" },
  flowers:       { label: "Flowers",         icon: "🌸", color: "#F97316" },
  other:         { label: "Miscellaneous",   icon: "📦", color: "#6B7280" },
};

export function slugify(str: string): string {
  return str.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
}

export const WEDDING_IMAGES = [
  "https://images.unsplash.com/photo-1519741497674-611481863552?w=800&q=80",
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?w=800&q=80",
  "https://images.unsplash.com/photo-1583939003579-730e3918a45a?w=800&q=80",
  "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?w=800&q=80",
  "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=800&q=80",
  "https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=800&q=80",
  "https://images.unsplash.com/photo-1525772764200-be829a350797?w=800&q=80",
  "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?w=800&q=80",
];

export const VENDOR_PLACEHOLDER_IMAGES: Record<string, string> = {
  venue:        "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?w=600&q=75",
  catering:     "https://images.unsplash.com/photo-1555244162-803834f70033?w=600&q=75",
  photography:  "https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=75",
  decoration:   "https://images.unsplash.com/photo-1478146059778-26028b07395a?w=600&q=75",
  "mc-dj":      "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600&q=75",
  flowers:      "https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=600&q=75",
  makeup:       "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=75",
  transport:    "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?w=600&q=75",
};
