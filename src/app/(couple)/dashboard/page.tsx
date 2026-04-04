import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { formatTSH, formatTSHShort, VENDOR_PLACEHOLDER_IMAGES, cn } from "@/lib/utils"; // Added cn
import { StatCard, Badge, Card, StarRating, Empty } from "@/components/ui";
import { Sparkles, Calendar, LayoutDashboard, ArrowRight, Lightbulb, Wallet } from "lucide-react";

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
  const progressPercent = Math.min(100, Math.round((totalSpent / (plan?.total_budget || 1)) * 100));

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      
      {/* 1. WELCOME HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-brand-ebony/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
             {/* Fixed: variant="outline" was not valid. Using "default" with custom border classes */}
             <Badge variant="default" className="border border-brand-gold/30 text-brand-gold bg-brand-gold/5 text-[10px] uppercase tracking-widest font-bold px-2 py-0.5 shadow-none">
               Couple Dashboard
             </Badge>
          </div>
          <h1 className="font-serif text-4xl font-bold text-brand-ebony tracking-tight">
            Habari, {profile?.full_name?.split(" ")[0] || "Rafiki"}
          </h1>
          <p className="text-brand-ebony/50 mt-1 text-sm font-medium">
            {plan 
              ? `Current Plan: ${plan.title} • ${plan.wedding_date ? new Date(plan.wedding_date).toLocaleDateString("en-TZ", { dateStyle: "long" }) : "Date TBD"}` 
              : "Let's start organizing your dream wedding."}
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/planner" className="group flex items-center gap-2 px-5 py-3 bg-brand-tanzanite text-white rounded-2xl font-bold text-sm shadow-xl shadow-brand-tanzanite/20 hover:bg-brand-tanzanite/90 transition-all">
            {plan ? (
              <><span>Manage Plan</span><ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" /></>
            ) : (
              <><span>Create My Plan</span><Sparkles className="w-4 h-4" /></>
            )}
          </Link>
          <Link href="/marketplace" className="px-5 py-3 bg-white border border-brand-ebony/10 text-brand-ebony rounded-2xl font-bold text-sm hover:border-brand-gold transition-all shadow-sm">
            Find Vendors
          </Link>
        </div>
      </div>

      {!plan ? (
        /* NO PLAN YET STATE */
        <Card className="p-16 text-center border-dashed border-brand-ebony/10 bg-white/40 backdrop-blur-sm">
          <div className="w-20 h-20 bg-brand-gold/10 rounded-full flex items-center justify-center mx-auto mb-6 text-4xl">💍</div>
          <h3 className="font-serif text-3xl font-bold text-brand-ebony mb-3 tracking-tight">Your story starts here</h3>
          <p className="text-brand-ebony/60 mb-8 max-w-md mx-auto text-base leading-relaxed">
            Use our AI-guided assistant to build a budget and timeline in seconds, or craft your plan manually.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <Link href="/planner?mode=ai" className="px-8 py-4 bg-brand-ebony text-white rounded-2xl font-bold text-sm shadow-2xl hover:bg-black transition-all flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand-gold" />
              Build with AI
            </Link>
            <Link href="/planner?mode=manual" className="px-8 py-4 bg-white border border-brand-ebony/10 rounded-2xl font-bold text-sm hover:border-brand-ebony transition-all">
              Manual Setup
            </Link>
          </div>
        </Card>
      ) : (
        <>
          {/* 2. KPI STAT CARDS */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard label="Total Budget" value={formatTSHShort(plan.total_budget)} icon={<Wallet className="w-5 h-5"/>} />
            <StatCard label="Amount Spent" value={formatTSHShort(totalSpent)} icon={<LayoutDashboard className="w-5 h-5"/>} />
            <StatCard 
              label={isOver ? "Over Budget" : "Remaining"} 
              value={formatTSHShort(Math.abs(remaining))} 
              icon={<Calendar className="w-5 h-5"/>} 
            />
            <StatCard label="Active Bookings" value={bookings?.length || 0} icon={<ArrowRight className="w-5 h-5"/>} />
          </div>

          {/* 3. BUDGET PROGRESS CARD */}
          <Card className="p-8 border-none bg-brand-ebony text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold/10 blur-3xl rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="font-serif text-2xl font-bold tracking-tight">Budget Utilization</h3>
                  <p className="text-xs text-white/40 mt-1 uppercase tracking-widest font-bold">
                    {plan.mode === "ai" ? "AI Optimized" : "Manual Plan"} • {plan.guest_count} Expected Guests
                  </p>
                </div>
                <div className="text-right">
                   <div className={cn("text-3xl font-bold", isOver ? "text-red-400" : "text-brand-gold")}>
                    {progressPercent}%
                   </div>
                   <p className="text-[10px] text-white/40 uppercase font-bold tracking-tighter">Budget Used</p>
                </div>
              </div>
              
              <div className="h-4 bg-white/10 rounded-full overflow-hidden border border-white/5">
                <div
                  className={cn(
                    "h-full rounded-full transition-all duration-1000",
                    isOver ? "bg-red-500" : "bg-gradient-to-r from-brand-gold via-brand-gold/80 to-brand-gold"
                  )}
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              
              <div className="flex justify-between mt-4">
                <div className="flex flex-col">
                  <span className="text-[10px] text-white/40 uppercase font-bold">Total Spent</span>
                  <span className="text-lg font-bold">{formatTSH(totalSpent)}</span>
                </div>
                <div className="flex flex-col items-end text-right">
                  <span className="text-[10px] text-white/40 uppercase font-bold">{isOver ? "Deficit" : "Available Balance"}</span>
                  <span className={cn("text-lg font-bold", isOver ? "text-red-400" : "text-emerald-400")}>
                    {isOver ? `-${formatTSH(Math.abs(remaining))}` : formatTSH(remaining)}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </>
      )}

      {/* 4. RECENT BOOKINGS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-serif text-2xl font-bold text-brand-ebony">My Vendors</h2>
            <p className="text-sm text-brand-ebony/50">Keep track of your confirmed bookings and services.</p>
          </div>
          <Link href="/bookings" className="group flex items-center gap-2 text-xs font-bold text-brand-tanzanite uppercase tracking-widest">
            View All Bookings
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {!bookings?.length ? (
          <Empty 
            icon="🤝" 
            title="No vendors booked yet" 
            description="Start building your dream team by exploring our verified marketplace." 
            action={<Link href="/marketplace" className="px-6 py-3 bg-brand-tanzanite text-white rounded-xl font-bold text-sm">Find Your Venue First</Link>} 
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {bookings.map((b) => {
              const cat = b.vendor?.category?.slug || "venue";
              return (
                <Card key={b.id} className="p-4 flex flex-col sm:flex-row sm:items-center gap-5 hover:border-brand-gold/30 hover:shadow-xl hover:shadow-brand-ebony/5 transition-all duration-300 group">
                  <div className="relative w-full sm:w-20 h-24 sm:h-20 rounded-2xl overflow-hidden flex-shrink-0 bg-brand-cloud">
                    <Image 
                      src={b.vendor?.cover_image || VENDOR_PLACEHOLDER_IMAGES[cat] || VENDOR_PLACEHOLDER_IMAGES.venue} 
                      alt={b.vendor?.business_name || ""} 
                      fill 
                      className="object-cover group-hover:scale-110 transition-transform duration-700" 
                      sizes="80px" 
                    />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h4 className="font-bold text-lg text-brand-ebony truncate group-hover:text-brand-tanzanite transition-colors">
                          {b.vendor?.business_name}
                        </h4>
                        <div className="flex items-center gap-2 mt-0.5">
                           <Badge variant="default" className="bg-brand-ebony/5 text-brand-ebony/60 text-[9px] font-bold py-0 uppercase shadow-none">
                            {b.vendor?.category?.name}
                          </Badge>
                          <div className="flex items-center gap-1">
                            <StarRating rating={b.vendor?.rating_avg || 0} size="sm" />
                            <span className="text-[10px] text-brand-ebony/40 font-bold">({b.vendor?.rating_count || 0})</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0 hidden sm:block">
                        <div className="font-serif font-bold text-brand-ebony text-lg leading-none">
                          {formatTSH(b.agreed_price || b.vendor?.base_price || 0)}
                        </div>
                        {/* Status logic matches Badge variant types */}
                        <Badge 
                          variant={b.status === "confirmed" ? "success" : b.status === "cancelled" ? "danger" : "warning"} 
                          className="mt-2 text-[9px] uppercase tracking-tighter"
                        >
                          {b.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {/* 5. BRANDED TIPS CARD */}
      <Card className="p-8 bg-brand-tanzanite text-white border-none shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:rotate-12 transition-transform duration-1000">
          <Lightbulb className="w-32 h-32" />
        </div>
        
        <h3 className="font-serif text-2xl font-bold mb-6 flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-brand-gold" />
          Pro Planning Tips
        </h3>
        
        <div className="grid sm:grid-cols-2 gap-6 relative z-10">
          {[
            "Book your venue at least 6 months in advance for peak seasons.",
            "Always include a 10% contingency buffer for miscellaneous TSH expenses.",
            "Compare at least 3 vendors in the marketplace before finalizing.",
            "Confirm guest dietary needs through your digital RSVP portal.",
          ].map((tip, i) => (
            <div key={i} className="flex gap-4 items-start bg-white/5 p-4 rounded-2xl border border-white/5 hover:bg-white/10 transition-colors">
              <span className="w-8 h-8 rounded-full bg-brand-gold text-brand-ebony text-sm font-bold flex items-center justify-center flex-shrink-0">
                {i + 1}
              </span>
              <p className="text-white/80 text-sm leading-relaxed font-medium">{tip}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}