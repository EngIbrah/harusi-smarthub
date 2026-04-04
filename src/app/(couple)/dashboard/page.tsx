import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatTSH, formatTSHShort, VENDOR_PLACEHOLDER_IMAGES } from "@/lib/utils";
import { StatCard, Badge, Card, SectionHeader, StarRating, Empty } from "@/components/ui";

export default async function DashboardPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const [{ data: profile }, { data: plan }, { data: bookings }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("wedding_plans").select("*").eq("couple_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).single(),
    supabase.from("bookings").select("*, vendor:vendors(*, category:categories(*))").eq("couple_id", user.id).order("created_at", { ascending: false }).limit(5),
  ]);

  const totalSpent = bookings?.reduce((s, b) => s + (b.agreed_price || b.vendor?.base_price || 0), 0) || 0;
  const remaining = (plan?.total_budget || 0) - totalSpent;
  const isOver = remaining < 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-harusi-dark">
            Welcome back, {profile?.full_name?.split(" ")[0] || "there"} 👋
          </h1>
          <p className="text-harusi-muted mt-1 text-sm">
            {plan ? `Planning: ${plan.title} · ${plan.wedding_date ? new Date(plan.wedding_date).toLocaleDateString("en-TZ", { dateStyle: "long" }) : "Date TBD"}` : "Start your wedding plan today."}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/planner" className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-amber-700 transition-all">
            {plan ? "Edit Plan ✏️" : "Create Plan ✨"}
          </Link>
          <Link href="/marketplace" className="px-4 py-2.5 border border-stone-200 text-harusi-dark rounded-xl font-semibold text-sm hover:border-amber-400 hover:bg-amber-50 transition-all">
            Browse Vendors
          </Link>
        </div>
      </div>

      {!plan ? (
        /* No plan yet */
        <Card className="p-12 text-center border-dashed border-stone-200">
          <div className="text-6xl mb-4">💍</div>
          <h3 className="font-serif text-2xl font-semibold text-harusi-dark mb-3">Start your wedding plan</h3>
          <p className="text-harusi-muted mb-6 max-w-md mx-auto">Use our AI-guided planner or build manually. Set your budget, choose your vendors, and track everything in real-time.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href="/planner?mode=ai" className="px-6 py-3 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl font-semibold text-sm shadow-lg shadow-amber-500/20">✨ AI-Guided Plan</Link>
            <Link href="/planner?mode=manual" className="px-6 py-3 border border-stone-200 rounded-xl font-semibold text-sm hover:border-amber-400 transition-all">🎯 Manual Plan</Link>
          </div>
        </Card>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Budget" value={formatTSHShort(plan.total_budget)} icon="💰" color="amber" />
            <StatCard label="Amount Spent" value={formatTSHShort(totalSpent)} icon="🛍️" color="purple" />
            <StatCard label={isOver ? "Over Budget" : "Remaining"} value={formatTSHShort(Math.abs(remaining))} icon={isOver ? "⚠️" : "✅"} color={isOver ? "red" : "green"} />
            <StatCard label="Vendors Booked" value={bookings?.length || 0} icon="🤝" color="teal" />
          </div>

          {/* Budget progress */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-serif text-lg font-semibold text-harusi-dark">Budget Progress</h3>
                <p className="text-xs text-harusi-muted mt-0.5">{plan.mode === "ai" ? "AI-Guided Plan" : "Manual Plan"} · {plan.guest_count} guests</p>
              </div>
              <Badge variant={isOver ? "danger" : "success"} className="text-xs">
                {Math.min(100, Math.round((totalSpent / (plan.total_budget || 1)) * 100))}% used
              </Badge>
            </div>
            <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 ${isOver ? "bg-gradient-to-r from-red-400 to-red-600" : "bg-gradient-to-r from-amber-400 to-amber-600"}`}
                style={{ width: `${Math.min(100, (totalSpent / (plan.total_budget || 1)) * 100)}%` }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-harusi-muted">{formatTSH(totalSpent)} spent</span>
              <span className={`text-xs font-semibold ${isOver ? "text-red-500" : "text-emerald-600"}`}>
                {isOver ? `${formatTSH(Math.abs(remaining))} over` : `${formatTSH(remaining)} left`}
              </span>
            </div>
          </Card>
        </>
      )}

      {/* Recent Bookings */}
      <div>
        <SectionHeader
          title="Recent Bookings"
          subtitle="Your selected vendors and booking status"
          action={
            <Link href="/bookings" className="text-sm text-amber-600 hover:text-amber-700 font-semibold">View all →</Link>
          }
        />
        {!bookings?.length ? (
          <Empty icon="📅" title="No bookings yet" description="Browse our vendor marketplace and start selecting vendors for your big day." action={<Link href="/marketplace" className="px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl font-semibold text-sm">Browse Vendors</Link>} />
        ) : (
          <div className="grid gap-4">
            {bookings.map((b) => {
              const cat = b.vendor?.category?.slug || "venue";
              return (
                <Card key={b.id} className="p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
                  <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
                    <Image src={b.vendor?.cover_image || VENDOR_PLACEHOLDER_IMAGES[cat] || VENDOR_PLACEHOLDER_IMAGES.venue} alt={b.vendor?.business_name || ""} fill className="object-cover" sizes="56px" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="font-semibold text-sm text-harusi-dark truncate">{b.vendor?.business_name}</h4>
                      <Badge variant="default" className="text-[10px]">{b.vendor?.category?.name}</Badge>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <StarRating rating={b.vendor?.rating_avg || 0} />
                      <span className="text-xs text-harusi-muted ml-1">({b.vendor?.rating_count || 0})</span>
                    </div>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <div className="font-serif font-bold text-amber-700 text-sm">{formatTSH(b.agreed_price || b.vendor?.base_price || 0)}</div>
                    <Badge variant={b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "warning"} className="mt-1 text-[10px]">
                      {b.status}
                    </Badge>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick tips */}
      <Card className="p-6 bg-harusi-dark border-0">
        <h3 className="font-serif text-lg font-semibold text-harusi-cream mb-4">💡 Planning Tips</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            "Book your venue at least 6 months in advance.",
            "Allocate 10–15% of budget as a contingency buffer.",
            "Compare at least 3 caterers before deciding.",
            "Ask vendors about off-peak or weekday discounts.",
          ].map((tip, i) => (
            <div key={i} className="flex gap-3 items-start">
              <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-400 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
              <span className="text-stone-400 text-xs leading-relaxed">{tip}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
