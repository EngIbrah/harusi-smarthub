import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatTSH, formatTSHShort } from "@/lib/utils";
import { StatCard, Badge, Card, SectionHeader, Empty } from "@/components/ui";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   variant: "warning" as const, action: true },
  confirmed: { label: "Confirmed", variant: "success" as const, action: false },
  completed: { label: "Completed", variant: "info"    as const, action: false },
  cancelled: { label: "Cancelled", variant: "danger"  as const, action: false },
};

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*, category:categories(*)")
    .eq("profile_id", user.id)
    .single();

  if (!vendor) {
    return (
      <div className="text-center py-20">
        <div className="text-6xl mb-4">🏪</div>
        <h2 className="font-serif text-2xl font-semibold text-harusi-dark mb-3">Complete Your Vendor Profile</h2>
        <p className="text-harusi-muted mb-6 max-w-md mx-auto">Set up your business profile to start receiving bookings from couples.</p>
        <Link href="/vendor/profile" className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20">
          Create Profile
        </Link>
      </div>
    );
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, couple:profiles(*), plan:wedding_plans(*)")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  const completed  = bookings?.filter(b => b.status === "completed") || [];
  const pending    = bookings?.filter(b => b.status === "pending")   || [];
  const confirmed  = bookings?.filter(b => b.status === "confirmed") || [];
  const totalEarnings = completed.reduce((s, b) => s + (b.agreed_price || 0), 0);
  const pendingEarnings = [...pending, ...confirmed].reduce((s, b) => s + (b.agreed_price || 0), 0);

  return (
    <div className="animate-fade-in space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="font-serif text-3xl font-bold text-harusi-dark">{vendor.business_name}</h1>
            {vendor.is_verified && <Badge variant="gold">✓ Verified</Badge>}
            <Badge variant={vendor.status === "active" ? "success" : "warning"}>{vendor.status}</Badge>
          </div>
          <p className="text-harusi-muted text-sm">{vendor.category?.icon} {vendor.category?.name} · 📍 {vendor.location}</p>
        </div>
        <div className="flex gap-3">
          <Link href="/vendor/profile" className="px-4 py-2.5 border border-stone-200 text-harusi-dark rounded-xl font-semibold text-sm hover:border-amber-400 transition-all">Edit Profile</Link>
          <Link href="/vendor/services" className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-amber-500/20">+ Add Service</Link>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Earnings" value={formatTSHShort(totalEarnings)} icon="💵" color="green" />
        <StatCard label="Jobs Completed" value={completed.length} icon="✅" color="teal" />
        <StatCard label="Pending Requests" value={pending.length} icon="⏳" color="amber" />
        <StatCard label="Avg Rating" value={`${(vendor.rating_avg || 0).toFixed(1)} ★`} icon="⭐" color="purple" />
      </div>

      {/* Pending Income alert */}
      {pendingEarnings > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 flex items-center justify-between gap-4">
          <div>
            <div className="font-semibold text-amber-800 text-sm">💰 Pending Income</div>
            <div className="text-xs text-amber-600 mt-0.5">Earnings from confirmed & pending bookings</div>
          </div>
          <div className="font-serif font-bold text-amber-700 text-xl tabular-nums">{formatTSH(pendingEarnings)}</div>
        </div>
      )}

      {/* Trust Profile */}
      <Card className="p-6 bg-harusi-dark border-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg font-semibold text-harusi-cream">🏆 Trust Profile</h3>
          <Badge variant={vendor.is_verified ? "gold" : "warning"}>{vendor.is_verified ? "Verified" : "Pending Verification"}</Badge>
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { label: "Business Profile Created", done: true },
            { label: "Category Assigned", done: !!vendor.category_id },
            { label: "Portfolio Images Uploaded", done: (vendor.images?.length || 0) > 0 },
            { label: "Identity Verified by Admin", done: vendor.is_verified },
            { label: "First Booking Completed", done: completed.length > 0 },
            { label: "5+ Bookings Completed", done: completed.length >= 5 },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-3 p-2.5 bg-white/5 rounded-lg">
              <span className={`text-sm ${item.done ? "text-emerald-400" : "text-stone-600"}`}>{item.done ? "✓" : "○"}</span>
              <span className={`text-xs ${item.done ? "text-stone-300" : "text-stone-500"}`}>{item.label}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
          <p className="text-xs text-amber-300">💡 Complete your profile to unlock financial inclusion opportunities and microloans.</p>
        </div>
      </Card>

      {/* Recent bookings */}
      <div>
        <SectionHeader
          title="Recent Bookings"
          subtitle="Manage incoming requests from couples."
          action={<Link href="/vendor/bookings" className="text-sm text-amber-600 font-semibold">View all →</Link>}
        />
        {!bookings?.length ? (
          <Empty icon="📋" title="No bookings yet" description="When couples book your services, they'll appear here." />
        ) : (
          <div className="grid gap-4">
            {bookings.slice(0, 6).map(b => {
              const cfg = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG];
              return (
                <Card key={b.id} className="p-5 flex items-center justify-between gap-4 flex-wrap">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                      {b.couple?.full_name?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm text-harusi-dark">{b.couple?.full_name || "Anonymous Couple"}</h4>
                      <div className="text-xs text-harusi-muted mt-0.5">
                        {b.event_date ? `📅 ${new Date(b.event_date).toLocaleDateString("en-TZ", { dateStyle: "medium" })}` : "Date TBD"}
                        {b.plan?.guest_count ? ` · ${b.plan.guest_count} guests` : ""}
                      </div>
                      {b.notes && <p className="text-xs text-stone-400 mt-0.5 line-clamp-1">"{b.notes}"</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <div className="font-serif font-bold text-amber-700 tabular-nums">{formatTSH(b.agreed_price || 0)}</div>
                      <Badge variant={cfg.variant} className="mt-1 text-[10px]">{cfg.label}</Badge>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
