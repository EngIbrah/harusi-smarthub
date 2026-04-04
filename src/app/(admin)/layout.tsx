import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

const adminNav = [
  { href: "/admin",            label: "Overview",   icon: "📊" },
  { href: "/admin/vendors",    label: "Vendors",    icon: "🏪" },
  { href: "/admin/users",      label: "Users",      icon: "👥" },
  { href: "/admin/categories", label: "Categories", icon: "📂" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-harusi-dark border-r border-white/5 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-sm">💍</div>
            <span className="font-serif text-lg font-bold text-harusi-cream">
              Harusi <span className="text-gradient-gold">Admin</span>
            </span>
          </Link>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {adminNav.map(item => (
            <Link key={item.href} href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-stone-400 hover:text-stone-200 hover:bg-white/5 transition-all">
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/5">
          <form action="/auth/signout" method="post">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 transition-all">
              <span>🚪</span> Sign out
            </button>
          </form>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-harusi-dark border-b border-white/5 px-6 py-4 flex items-center justify-between md:hidden">
          <span className="font-serif text-lg font-bold text-harusi-cream">Harusi Admin</span>
        </header>
        <main className="flex-1 p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}
