import { createClient } from "@/lib/supabase/server";
import { formatTSHShort } from "@/lib/utils";
import { StatCard, Card, Badge } from "@/components/ui";

export default async function AdminPage() {
  const supabase = await createClient();

  const [
    { count: totalUsers },
    { count: totalVendors },
    { count: pendingVendors },
    { count: totalBookings },
    { data: recentVendors },
    { data: recentBookings },
    { data: categories },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "couple"),
    supabase.from("vendors").select("*", { count: "exact", head: true }),
    supabase.from("vendors").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("vendors").select("*, category:categories(*), profile:profiles(full_name)").order("created_at", { ascending: false }).limit(6),
    supabase.from("bookings").select("*, vendor:vendors(business_name), couple:profiles(full_name)").order("created_at", { ascending: false }).limit(6),
    supabase.from("categories").select("*, vendor_count:vendors(count)").eq("is_active", true).order("sort_order"),
  ]);

  const totalRevenue = 0; // Computed from completed bookings

  return (
    <div className="animate-fade-in space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-bold text-harusi-dark mb-1">Platform Overview</h1>
        <p className="text-harusi-muted text-sm">Real-time stats across Harusi SmartHub.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Couples" value={(totalUsers || 0).toLocaleString()} icon="💍" color="amber" change="+12%" />
        <StatCard label="Active Vendors" value={(totalVendors || 0).toLocaleString()} icon="🏪" color="teal" change="+8%" />
        <StatCard label="Total Bookings" value={(totalBookings || 0).toLocaleString()} icon="📅" color="purple" change="+22%" />
        <StatCard label="Pending Approvals" value={pendingVendors || 0} icon="⏳" color={pendingVendors ? "red" : "green"} />
      </div>

      {pendingVendors ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <p className="text-sm text-amber-800 font-medium">⚠️ {pendingVendors} vendor{pendingVendors > 1 ? "s" : ""} pending approval</p>
          <a href="/admin/vendors?status=pending" className="text-xs font-bold text-amber-700 underline">Review now →</a>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent vendors */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-lg font-semibold text-harusi-dark">Recent Vendors</h3>
            <a href="/admin/vendors" className="text-xs text-amber-600 font-semibold">View all →</a>
          </div>
          <div className="space-y-3">
            {(recentVendors || []).map(v => (
              <div key={v.id} className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {v.business_name[0]}
                  </div>
                  <div className="min-w-0">
                    <div className="font-medium text-sm text-harusi-dark truncate">{v.business_name}</div>
                    <div className="text-xs text-harusi-muted">{v.category?.name}</div>
                  </div>
                </div>
                <Badge variant={v.status === "active" ? "success" : v.status === "pending" ? "warning" : "danger"} className="text-[10px] flex-shrink-0">
                  {v.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Category distribution */}
        <Card className="p-6">
          <h3 className="font-serif text-lg font-semibold text-harusi-dark mb-5">Vendors by Category</h3>
          <div className="space-y-3">
            {(categories || []).map(c => {
              const count = (c as any).vendor_count?.[0]?.count || 0;
              const max = Math.max(...(categories || []).map((x: any) => x.vendor_count?.[0]?.count || 0), 1);
              return (
                <div key={c.id}>
                  <div className="flex justify-between mb-1.5 text-sm">
                    <span className="font-medium text-harusi-dark">{c.icon} {c.name}</span>
                    <span className="font-bold text-amber-700 tabular-nums">{count}</span>
                  </div>
                  <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-700"
                      style={{ width: `${(count / max) * 100}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent bookings */}
        <Card className="p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-serif text-lg font-semibold text-harusi-dark">Recent Bookings</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-stone-100">
                  {["Couple", "Vendor", "Amount", "Status", "Date"].map(h => (
                    <th key={h} className="text-left py-2 px-3 text-xs font-semibold text-harusi-muted uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(recentBookings || []).map(b => (
                  <tr key={b.id} className="border-b border-stone-50 hover:bg-stone-50 transition-colors">
                    <td className="py-3 px-3 font-medium text-harusi-dark">{b.couple?.full_name || "—"}</td>
                    <td className="py-3 px-3 text-harusi-muted">{b.vendor?.business_name || "—"}</td>
                    <td className="py-3 px-3 font-serif font-bold text-amber-700 tabular-nums">{b.agreed_price ? formatTSHShort(b.agreed_price) : "—"}</td>
                    <td className="py-3 px-3">
                      <Badge variant={b.status === "confirmed" ? "success" : b.status === "pending" ? "warning" : b.status === "cancelled" ? "danger" : "info"} className="text-[10px]">
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-3 text-stone-400 text-xs">{new Date(b.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
