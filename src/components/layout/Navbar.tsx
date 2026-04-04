"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import type { Profile } from "@/types";

const coupleLinks = [
  { href: "/dashboard",   label: "Dashboard" },
  { href: "/planner",     label: "Planner" },
  { href: "/marketplace", label: "Marketplace" },
  { href: "/bookings",    label: "Bookings" },
];
const vendorLinks = [
  { href: "/vendor/dashboard", label: "Dashboard" },
  { href: "/vendor/services",  label: "Services" },
  { href: "/vendor/bookings",  label: "Bookings" },
  { href: "/vendor/profile",   label: "Profile" },
];
const adminLinks = [
  { href: "/admin",             label: "Overview" },
  { href: "/admin/vendors",     label: "Vendors" },
  { href: "/admin/users",       label: "Users" },
  { href: "/admin/categories",  label: "Categories" },
];

export default function Navbar() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data: { user } }) => {
      if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
        setProfile(data);
      }
    });
  }, []);

  const links = profile?.role === "admin" ? adminLinks : profile?.role === "vendor" ? vendorLinks : coupleLinks;

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav className="sticky top-0 z-50 border-b border-harusi-border" style={{ background: "rgba(28,25,23,0.97)", backdropFilter: "blur(12px)" }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-base shadow-lg">
              💍
            </div>
            <span className="font-serif text-xl font-bold text-harusi-cream">
              Harusi <span className="text-gradient-gold">SmartHub</span>
            </span>
          </Link>

          {/* Desktop links */}
          {profile && (
            <div className="hidden md:flex items-center gap-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className={cn(
                    "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
                    pathname === l.href || pathname.startsWith(l.href + "/")
                      ? "bg-amber-500/15 text-amber-400"
                      : "text-stone-400 hover:text-stone-200 hover:bg-white/5"
                  )}
                >
                  {l.label}
                </Link>
              ))}
            </div>
          )}

          {/* Right side */}
          <div className="flex items-center gap-3">
            {profile ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all"
                >
                  <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white text-xs font-bold">
                    {profile.full_name?.[0]?.toUpperCase() || "U"}
                  </div>
                  <span className="hidden sm:block text-sm text-stone-300 font-medium max-w-[120px] truncate">
                    {profile.full_name || "Account"}
                  </span>
                  <span className="text-stone-500 text-xs">▾</span>
                </button>
                {menuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 bg-harusi-dark border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">
                    <div className="px-4 py-3 border-b border-white/5">
                      <div className="text-xs text-stone-500 uppercase tracking-wide">Signed in as</div>
                      <div className="text-sm text-stone-200 font-medium truncate mt-0.5">{profile.full_name}</div>
                      <div className="mt-1">
                        <span className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-semibold uppercase tracking-wide",
                          profile.role === "admin"  ? "bg-purple-500/20 text-purple-300" :
                          profile.role === "vendor" ? "bg-teal-500/20 text-teal-300" :
                          "bg-amber-500/20 text-amber-300"
                        )}>{profile.role}</span>
                      </div>
                    </div>
                    <div className="py-1">
                      {/* Mobile links */}
                      <div className="md:hidden border-b border-white/5 pb-1 mb-1">
                        {links.map((l) => (
                          <Link key={l.href} href={l.href} onClick={() => setMenuOpen(false)}
                            className="block px-4 py-2 text-sm text-stone-300 hover:bg-white/5 hover:text-white transition-colors"
                          >{l.label}</Link>
                        ))}
                      </div>
                      <button
                        onClick={handleSignOut}
                        className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition-colors"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link href="/login" className="px-4 py-2 text-sm font-medium text-stone-300 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                  Sign in
                </Link>
                <Link href="/register" className="px-4 py-2 text-sm font-semibold bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-lg hover:from-amber-500 hover:to-amber-700 transition-all shadow-md shadow-amber-500/20">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
