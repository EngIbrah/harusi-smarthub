import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { formatTSH, formatTSHShort, cn } from "@/lib/utils";
import { StatCard, Badge, Card, SectionHeader, Empty } from "@/components/ui";
import { CheckCircle2, Circle, Lightbulb, TrendingUp, Users, Calendar } from "lucide-react";

const STATUS_CONFIG = {
  pending:   { label: "Pending",   variant: "warning" as const },
  confirmed: { label: "Confirmed", variant: "success" as const },
  completed: { label: "Completed", variant: "info"    as const },
  cancelled: { label: "Cancelled", variant: "danger"  as const },
};

export default async function VendorDashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: vendor } = await supabase
    .from("vendors")
    .select("*, category:categories(*)")
    .eq("profile_id", user.id)
    .maybeSingle();

  if (!vendor) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="w-20 h-20 bg-brand-gold/10 rounded-3xl flex items-center justify-center text-4xl mb-6">🏪</div>
        <h2 className="font-serif text-3xl font-bold text-brand-ebony mb-3">Grow Your Business</h2>
        <p className="text-brand-ebony/60 mb-8 max-w-sm mx-auto">Create your professional profile to join the marketplace and start connecting with couples.</p>
        <Link href="/vendor/profile" className="px-8 py-4 bg-brand-tanzanite text-white rounded-2xl font-bold shadow-xl shadow-brand-tanzanite/20 hover:scale-105 transition-all">
          Create Vendor Profile
        </Link>
      </div>
    );
  }

  const { data: bookings } = await supabase
    .from("bookings")
    .select("*, couple:profiles(*), plan:wedding_plans(*)")
    .eq("vendor_id", vendor.id)
    .order("created_at", { ascending: false });

  const completed = bookings?.filter(b => b.status === "completed") || [];
  const pending   = bookings?.filter(b => b.status === "pending")   || [];
  const confirmed = bookings?.filter(b => b.status === "confirmed") || [];
  
  const totalEarnings = completed.reduce((s, b) => s + (b.agreed_price || 0), 0);
  const pendingEarnings = [...pending, ...confirmed].reduce((s, b) => s + (b.agreed_price || 0), 0);

  return (
    <div className="animate-in fade-in duration-700 space-y-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="font-serif text-4xl font-bold text-brand-ebony">{vendor.business_name}</h1>
            <div className="flex gap-2">
                {vendor.is_verified && <Badge variant="gold" className="rounded-full px-3 py-1 font-bold">Verified</Badge>}
                <Badge variant={vendor.status === "active" ? "success" : "warning"} className="rounded-full px-3 py-1 font-bold uppercase text-[10px]">
                    {vendor.status}
                </Badge>
            </div>
          </div>
          <p className="text-brand-ebony/50 flex items-center gap-2 font-medium">
            <span className="text-lg">{vendor.category?.icon}</span> 
            {vendor.category?.name} <span className="text-brand-gold">•</span> 📍 {vendor.location}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/vendor/profile" className="px-5 py-2.5 border border-brand-ebony/10 text-brand-ebony rounded-xl font-bold text-sm hover:bg-brand-cloud transition-all">
            Edit Profile
          </Link>
          <Link href="/vendor/bookings" className="px-5 py-2.5 bg-brand-tanzanite text-white rounded-xl font-bold text-sm shadow-lg shadow-brand-tanzanite/20 hover:opacity-90 transition-all">
            View Bookings
          </Link>
        </div>
      </div>

      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard label="Earnings" value={formatTSHShort(totalEarnings)} icon={<TrendingUp className="w-5 h-5"/>} color="emerald" />
        <StatCard label="Jobs Done" value={completed.length} icon={<CheckCircle2 className="w-5 h-5"/>} color="brand-tanzanite" />
        <StatCard label="Requests" value={pending.length} icon={<Calendar className="w-5 h-5"/>} color="gold" />
        <StatCard label="Rating" value={`${(vendor.rating_avg || 0).toFixed(1)} ★`} icon={<Users className="w-5 h-5"/>} color="indigo" />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
            {/* Recent Bookings List */}
            <section>
                <SectionHeader
                    title="Recent Activity"
                    subtitle="Manage your latest incoming requests."
                    action={<Link href="/vendor/bookings" className="text-xs font-bold text-brand-tanzanite uppercase tracking-widest hover:underline">View All</Link>}
                />
                {!bookings?.length ? (
                    <Empty icon="📋" title="No bookings yet" description="Your incoming requests will appear here once couples find you in the marketplace." />
                ) : (
                    <div className="space-y-4 mt-6">
                    {bookings.slice(0, 5).map(b => {
                        const cfg = STATUS_CONFIG[b.status as keyof typeof STATUS_CONFIG];
                        return (
                        <Card key={b.id} className="p-5 hover:shadow-xl hover:shadow-brand-ebony/5 transition-all border-brand-ebony/5">
                            <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-brand-cloud flex items-center justify-center text-brand-tanzanite font-black text-lg border border-brand-ebony/5">
                                {b.couple?.full_name?.[0]?.toUpperCase() || "C"}
                                </div>
                                <div>
                                <h4 className="font-bold text-brand-ebony">{b.couple?.full_name || "Wedding Client"}</h4>
                                <div className="text-[11px] text-brand-ebony/40 font-bold uppercase tracking-tight flex items-center gap-2 mt-1">
                                    <span>{b.event_date ? new Date(b.event_date).toLocaleDateString("en-TZ", { month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBD"}</span>
                                    {b.plan?.guest_count && <span>• {b.plan.guest_count} Guests</span>}
                                </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="font-serif font-black text-brand-tanzanite text-lg">{formatTSH(b.agreed_price || 0)}</div>
                                <Badge variant={cfg.variant} className="mt-1 text-[9px] font-bold uppercase px-2">{cfg.label}</Badge>
                            </div>
                            </div>
                        </Card>
                        );
                    })}
                    </div>
                )}
            </section>
        </div>

        {/* Sidebar Cards */}
        <div className="space-y-6">
            {/* Pending Income */}
            {pendingEarnings > 0 && (
                <div className="bg-gradient-to-br from-brand-gold/20 to-brand-gold/5 border border-brand-gold/20 rounded-3xl p-6 relative overflow-hidden group">
                   <div className="relative z-10">
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-gold mb-1">Projected Revenue</p>
                        <h4 className="text-2xl font-serif font-black text-brand-ebony tabular-nums mb-1">{formatTSH(pendingEarnings)}</h4>
                        <p className="text-xs text-brand-ebony/50 font-medium leading-tight">From confirmed and pending bookings.</p>
                   </div>
                   <TrendingUp className="absolute -right-4 -bottom-4 w-24 h-24 text-brand-gold/10 group-hover:scale-110 transition-transform" />
                </div>
            )}

            {/* Trust Profile / Gamification */}
            <Card className="p-8 bg-brand-ebony border-0 shadow-2xl shadow-brand-ebony/20 rounded-3xl">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="font-serif text-xl font-bold text-brand-cloud">Trust Score</h3>
                    <div className="w-8 h-8 rounded-full bg-brand-gold flex items-center justify-center text-sm font-bold text-brand-ebony">
                        {Math.round(([
                            true, !!vendor.category_id, (vendor.images?.length || 0) > 0, vendor.is_verified, completed.length > 0, completed.length >= 5
                        ].filter(Boolean).length / 6) * 100)}%
                    </div>
                </div>
                <div className="space-y-4">
                    {[
                        { label: "Profile Created", done: true },
                        { label: "Category Assigned", done: !!vendor.category_id },
                        { label: "Portfolio Uploaded", done: (vendor.images?.length || 0) > 0 },
                        { label: "Admin Verified", done: vendor.is_verified },
                        { label: "First Booking", done: completed.length > 0 },
                    ].map(item => (
                        <div key={item.label} className="flex items-center gap-3">
                            {item.done ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                            ) : (
                                <Circle className="w-4 h-4 text-white/20" />
                            )}
                            <span className={cn("text-xs font-medium transition-colors", item.done ? "text-white" : "text-white/40")}>
                                {item.label}
                            </span>
                        </div>
                    ))}
                </div>
                <div className="mt-8 pt-6 border-t border-white/10">
                    <div className="flex gap-3 items-start bg-white/5 p-4 rounded-2xl">
                        <Lightbulb className="w-5 h-5 text-brand-gold shrink-0 mt-0.5" />
                        <p className="text-[11px] text-brand-cloud/70 leading-relaxed italic">
                            Complete your profile to unlock verified status and qualify for our financial partner micro-loans.
                        </p>
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
}