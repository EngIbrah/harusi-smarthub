import { createClient } from "@/lib/supabase/server";
import { formatTSHShort } from "@/lib/utils";
import { StatCard, Card, Badge, SectionHeader } from "@/components/ui";
import { 
  Users, 
  Store, 
  CalendarCheck, 
  Clock, 
  ArrowRight, 
  TrendingUp,
  AlertCircle
} from "lucide-react";
import Link from "next/link";

export default async function AdminPage() {
  const supabase = await createClient();

  // Parallel data fetching for speed
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
    // Fetching categories with a count of related vendors
    supabase.from("categories").select("*, vendors(count)").eq("is_active", true).order("sort_order"),
  ]);

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      <SectionHeader 
        title="Platform Overview" 
        subtitle="Real-time performance metrics across Harusi SmartHub."
      />

      {/* KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Couples" 
          value={(totalUsers || 0).toLocaleString()} 
          icon={<Users className="w-6 h-6" />} 
          color="blue" 
          change="+12%" 
        />
        <StatCard 
          label="Active Vendors" 
          value={(totalVendors || 0).toLocaleString()} 
          icon={<Store className="w-6 h-6" />} 
          color="teal" 
          change="+5%" 
        />
        <StatCard 
          label="Total Bookings" 
          value={(totalBookings || 0).toLocaleString()} 
          icon={<CalendarCheck className="w-6 h-6" />} 
          color="purple" 
          change="+18%" 
        />
        <StatCard 
          label="Pending Approvals" 
          value={pendingVendors || 0} 
          icon={<Clock className="w-6 h-6" />} 
          color={pendingVendors ? "amber" : "emerald"} 
        />
      </div>

      {/* Urgent Action Alert */}
      {pendingVendors ? (
        <div className="bg-amber-500/10 border-2 border-amber-500/20 rounded-[2rem] p-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-amber-700">
            <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center text-white shadow-lg">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="font-black uppercase text-[10px] tracking-widest opacity-60">Verification Queue</p>
              <p className="font-bold text-sm">{pendingVendors} vendor inquiries require your review.</p>
            </div>
          </div>
          <Link href="/admin/vendors?status=pending" className="flex items-center gap-2 px-6 py-2.5 bg-amber-500 text-white rounded-xl font-bold text-xs hover:bg-amber-600 transition-all shadow-lg shadow-amber-500/20 group">
            Review Applications <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-8">
        
        {/* Recent Vendors List */}
        <Card className="p-8 lg:col-span-1">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-xl font-black text-brand-ebony">New Vendors</h3>
            <Link href="/admin/vendors" className="text-[10px] font-black uppercase text-brand-gold tracking-widest hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            {(recentVendors || []).map(v => (
              <div key={v.id} className="flex items-center justify-between group">
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-brand-cloud flex items-center justify-center text-brand-ebony font-black text-xs border border-brand-ebony/5 group-hover:bg-brand-gold group-hover:text-white transition-colors">
                    {v.business_name[0]}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-sm text-brand-ebony truncate leading-tight">{v.business_name}</p>
                    <p className="text-[10px] font-black text-brand-ebony/30 uppercase tracking-tighter mt-0.5">{v.category?.name || 'General'}</p>
                  </div>
                </div>
                <Badge variant={v.status === "active" ? "success" : v.status === "pending" ? "warning" : "danger"} className="scale-75 origin-right">
                  {v.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        {/* Categories Progress Bars */}
        <Card className="p-8 lg:col-span-2">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-xl font-black text-brand-ebony">Category Distribution</h3>
            <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-ebony/30 uppercase tracking-widest">
              <TrendingUp className="w-3 h-3" /> Supply Trends
            </div>
          </div>
          <div className="grid md:grid-cols-2 gap-x-10 gap-y-6">
            {(categories || []).map(c => {
              const count = (c as any).vendors?.[0]?.count || 0;
              const max = Math.max(...(categories || []).map((x: any) => x.vendors?.[0]?.count || 0), 1);
              return (
                <div key={c.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-[11px] font-black text-brand-ebony uppercase tracking-tight">{c.icon} {c.name}</span>
                    <span className="font-serif font-black text-brand-gold tabular-nums">{count}</span>
                  </div>
                  <div className="h-1.5 bg-brand-cloud rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-brand-gold to-amber-600 rounded-full transition-all duration-1000"
                      style={{ width: `${(count / max) * 100}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Recent Transactions / Bookings Table */}
        <Card className="p-8 lg:col-span-3">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif text-xl font-black text-brand-ebony">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto -mx-8 px-8">
            <table className="w-full">
              <thead>
                <tr className="text-[10px] font-black text-brand-ebony/30 uppercase tracking-[0.2em]">
                  <th className="text-left pb-4 font-black">Couple</th>
                  <th className="text-left pb-4 font-black">Service Provider</th>
                  <th className="text-left pb-4 font-black">Value</th>
                  <th className="text-left pb-4 font-black">Status</th>
                  <th className="text-right pb-4 font-black">Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-ebony/5">
                {(recentBookings || []).map(b => (
                  <tr key={b.id} className="group hover:bg-brand-cloud/30 transition-colors">
                    <td className="py-4 font-bold text-sm text-brand-ebony">{b.couple?.full_name || "Guest"}</td>
                    <td className="py-4 text-xs font-bold text-brand-ebony/60">{b.vendor?.business_name || "N/A"}</td>
                    <td className="py-4">
                      <span className="font-serif font-black text-brand-tanzanite tabular-nums">
                        {b.agreed_price ? formatTSHShort(b.agreed_price) : "—"}
                      </span>
                    </td>
                    <td className="py-4">
                      <Badge variant={b.status === "confirmed" ? "success" : b.status === "pending" ? "warning" : b.status === "cancelled" ? "danger" : "info"}>
                        {b.status}
                      </Badge>
                    </td>
                    <td className="py-4 text-right text-[10px] font-black text-brand-ebony/30 uppercase tabular-nums">
                      {new Date(b.created_at).toLocaleDateString()}
                    </td>
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