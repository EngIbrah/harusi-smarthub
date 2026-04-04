import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar"; // Import the client sidebar

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  
  // 1. Check Auth
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // 2. Check Role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/dashboard");

  return (
    <div className="min-h-screen flex bg-stone-50">
      {/* Client Sidebar */}
      <AdminSidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        {/* Mobile Header (Hidden on Desktop) */}
        <header className="bg-brand-ebony border-b border-white/5 px-6 py-4 flex items-center justify-between md:hidden shrink-0">
          <span className="font-serif text-lg font-bold text-brand-cloud">Harusi Admin</span>
          <div className="w-8 h-8 rounded-lg bg-brand-gold flex items-center justify-center">💍</div>
        </header>

        {/* This is where your page data (Overview, Vendors, etc.) is rendered */}
        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
}