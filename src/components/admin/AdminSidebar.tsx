"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DiamondLogo } from "@/components/ui/DiamondLogo";
import { LayoutDashboard, Store, Users, Tags, LogOut, ExternalLink } from "lucide-react";

const adminNav = [
  { href: "/admin",            label: "Overview",   icon: LayoutDashboard },
  { href: "/admin/vendors",    label: "Vendors",    icon: Store },
  { href: "/admin/users",      label: "Users",      icon: Users },
  { href: "/admin/categories", label: "Categories", icon: Tags },
];

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-72 flex-shrink-0 bg-brand-ebony border-r border-white/5 flex flex-col hidden md:flex h-screen sticky top-0 z-50">
      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative">
            <div className="absolute -inset-1 bg-brand-gold/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            <DiamondLogo className="w-10 h-10 relative z-10 drop-shadow-xl" />
          </div>
          <div className="flex flex-col">
            <span className="font-serif text-lg font-bold text-brand-cloud leading-tight">
              Harusi <span className="text-brand-gold">Admin</span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">Command Center</span>
          </div>
        </Link>
      </div>

      <nav className="flex-1 px-4 space-y-2">
        {adminNav.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={cn(
                "flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 group",
                isActive ? "bg-brand-gold text-brand-ebony shadow-xl shadow-brand-gold/10" : "text-white/40 hover:text-white hover:bg-white/5"
              )}>
              <item.icon className={cn("w-5 h-5", isActive ? "text-brand-ebony" : "text-white/20 group-hover:text-brand-gold")} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-6 space-y-2">
        <Link href="/" className="flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold text-white/40 hover:text-white hover:bg-white/5">
          <ExternalLink className="w-4 h-4" /> View Marketplace
        </Link>
        <form action="/auth/signout" method="post" className="pt-2 border-t border-white/5">
          <button className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-xs font-bold text-red-400/60 hover:text-red-400 hover:bg-red-500/10">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
      </div>
    </aside>
  );
}