"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";
import { 
  Menu, 
  X, 
  LogOut, 
  User, 
  ChevronDown, 
  LayoutDashboard, 
  CalendarDays, 
  ShoppingBag, 
  BookmarkCheck,
  ShieldEllipsis,
  Settings,
  Store,
  Gem
} from "lucide-react";

// Navigation Links Configuration
const coupleLinks = [
  { href: "/dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { href: "/planner",     label: "Planner",     icon: CalendarDays },
  { href: "/marketplace", label: "Marketplace", icon: ShoppingBag },
  { href: "/bookings",    label: "Bookings",    icon: BookmarkCheck },
];

const vendorLinks = [
  { href: "/vendor/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/vendor/services",  label: "Services",  icon: Settings },
  { href: "/vendor/bookings",  label: "Bookings",  icon: BookmarkCheck },
  { href: "/vendor/profile",   label: "Profile",   icon: User },
];

const adminLinks = [
  { href: "/admin",           label: "Overview",   icon: ShieldEllipsis },
  { href: "/admin/vendors",   label: "Vendors",    icon: Store },
  { href: "/admin/users",     label: "Users",      icon: User },
];

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setProfile(data);
      }
    };
    fetchUser();
    
    // Auto-close menus when the route changes
    setIsMobileMenuOpen(false);
    setIsUserDropdownOpen(false);
  }, [pathname, supabase]);

  const links = profile?.role === "admin" 
    ? adminLinks 
    : profile?.role === "vendor" 
      ? vendorLinks 
      : coupleLinks;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.refresh();
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-[100] w-full border-b border-white/10 bg-brand-ebony/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
         {/* 3. The Icon - Enhanced Golden Radiance */}
<div className="relative z-10 flex items-center justify-center">
  {/* The Glow Layer (Sits behind the icon) */}
  <div className="absolute inset-0 blur-[10px] bg-brand-gold/40 animate-pulse rounded-full" />
  
  <Gem 
    className="w-7 h-7 text-[#FFD700] transition-all duration-500 group-hover:scale-110 group-hover:rotate-[15deg] drop-shadow-[0_0_12px_rgba(255,215,0,0.8)] drop-shadow-[0_0_2px_white]" 
    strokeWidth={1.8}
  />
  
  {/* Decorative "Sparkle" - Increased brightness */}
  <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full blur-[1px] animate-ping opacity-75" />
  <div className="absolute -top-1 -right-1 w-1.5 h-1.5 bg-white rounded-full shadow-[0_0_10px_#fff]" />
</div>


          {/* DESKTOP NAVIGATION (Only visible if logged in) */}
          {profile && (
            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
              {links.map((l) => {
                const Icon = l.icon;
                const isActive = pathname === l.href || pathname.startsWith(l.href + "/");
                return (
                  <Link
                    key={l.href}
                    href={l.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                      isActive 
                        ? "bg-brand-tanzanite text-white shadow-md" 
                        : "text-white/60 hover:text-white hover:bg-white/5"
                    )}
                  >
                    <Icon className="w-4 h-4" />
                    {l.label}
                  </Link>
                );
              })}
            </div>
          )}

          {/* RIGHT SIDE: AUTH / USER MENU */}
          <div className="flex items-center gap-3">
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  className="flex items-center gap-2 p-1 pr-3 rounded-full bg-white/5 border border-white/10 hover:border-brand-gold/50 transition-all"
                >
                  <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-brand-ebony font-bold text-xs">
                    {profile.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <ChevronDown className={cn("w-4 h-4 text-white/40 transition-transform", isUserDropdownOpen && "rotate-180")} />
                </button>

                {/* USER DROPDOWN MENU */}
                {isUserDropdownOpen && (
                  <div className="absolute right-0 top-full mt-3 w-64 bg-brand-ebony border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-fade-in z-50">
                    <div className="p-4 bg-white/5 border-b border-white/5">
                      <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Authenticated as</p>
                      <p className="text-sm text-white font-medium truncate mt-1">{profile.full_name}</p>
                      <div className="mt-2">
                        <span className="text-[9px] px-2 py-0.5 rounded-full bg-brand-gold/20 text-brand-gold font-bold uppercase">
                          {profile.role}
                        </span>
                      </div>
                    </div>
                    <div className="p-2">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-brand-hibiscus hover:bg-brand-hibiscus/10 rounded-xl transition-colors"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="px-5 py-2.5 text-sm font-medium text-white/70 hover:text-white transition-colors">
                  Login
                </Link>
                <Link href="/register" className="hidden sm:block px-5 py-2.5 text-sm font-bold bg-brand-tanzanite text-white rounded-xl hover:bg-brand-tanzanite/90 transition-all shadow-lg shadow-brand-tanzanite/20">
                  Join Free
                </Link>
              </div>
            )}

            {/* MOBILE MENU TOGGLE */}
            <button 
              className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* MOBILE MENU DRAWER */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-full left-0 w-full bg-brand-ebony border-b border-white/10 animate-fade-up shadow-2xl">
          <div className="p-4 space-y-2">
            {profile ? (
              <>
                {links.map((l) => (
                  <Link
                    key={l.href}
                    href={l.href}
                    className="flex items-center gap-4 p-4 rounded-xl text-white/70 hover:bg-white/5 hover:text-white transition-all"
                  >
                    <l.icon className="w-5 h-5 text-brand-gold" />
                    <span className="font-medium text-lg">{l.label}</span>
                  </Link>
                ))}
                <div className="pt-2 border-t border-white/5">
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-4 p-4 text-brand-hibiscus"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-bold text-lg">Sign Out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col gap-3 p-2">
                <Link href="/login" className="w-full py-4 text-center text-white font-medium border border-white/10 rounded-xl">Login</Link>
                <Link href="/register" className="w-full py-4 text-center bg-brand-tanzanite text-white font-bold rounded-xl shadow-lg">Register</Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}