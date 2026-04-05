"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Card, Badge, StarRating, Spinner } from "@/components/ui";
import { formatTSHShort, VENDOR_PLACEHOLDER_IMAGES, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sparkles, Target, ShoppingBag, TrendingDown, Star, Zap, Info, Quote } from "lucide-react";
import type { Vendor, Category, BudgetAllocation } from "@/types";

const CATEGORIES_ALL = "All Vendors";

function PlannerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  // --- ALL YOUR ORIGINAL STATE ---
  const [mode, setMode] = useState<"ai" | "manual">((searchParams.get("mode") as "ai" | "manual") || "ai");
  const [budget, setBudget] = useState("10000000"); 
  const [guestCount, setGuestCount] = useState("200");
  const [weddingDate, setWeddingDate] = useState("");
  const [priority, setPriority] = useState("balanced");
  const [allocation, setAllocation] = useState<BudgetAllocation | null>(null);
  const [aiInsight, setAiInsight] = useState<{
    market_analysis: string;
    savings_insight: string;
    strategy_tip: string;
    recommended_ids: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES_ALL);
  const [selected, setSelected] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  // --- DERIVED VALUES ---
  const totalSelected = selected.reduce((s, v) => s + v.base_price, 0);
  const budgetNum = parseFloat(budget) || 0;
  const remaining = budgetNum - totalSelected;
  const isOver = remaining < 0 && budgetNum > 0;
  const pct = budgetNum > 0 ? Math.min(100, Math.round((totalSelected / budgetNum) * 100)) : 0;

  useEffect(() => {
    async function initializePage() {
      await loadVendors();
      await loadExistingPlan();
    }
    initializePage();
  }, []);

  async function loadVendors() {
    const { data: cats } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
    setCategories(cats || []);
    const { data: vs } = await supabase.from("vendors").select("*, category:categories(*)").eq("status", "active").order("rating_avg", { ascending: false });
    setVendors(vs || []);
    setLoadingVendors(false);
  }

  async function loadExistingPlan() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: plan } = await supabase.from("wedding_plans").select("*").eq("couple_id", user.id).eq("is_active", true).maybeSingle();
      if (plan) {
        setPlanId(plan.id);
        setBudget(String(plan.total_budget));
        setGuestCount(String(plan.guest_count));
        if (plan.wedding_date) setWeddingDate(plan.wedding_date);
        if (plan.allocation_json) setAllocation(plan.allocation_json);
      }
    } catch (err) { console.error(err); }
  }

  async function handleGenerateAIPlan() {
    if (!budget) return toast.error("Please enter a budget");
    setIsGenerating(true);
    try {
      const res = await fetch("/api/budget", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ budget: Number(budget), guestCount: Number(guestCount), priority, weddingDate }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setAiInsight(data);
      if (data.allocation) setAllocation(data.allocation);
      toast.success("AI Strategy Generated!");
    } catch (err: any) { toast.error(err.message); } finally { setIsGenerating(false); }
  }

  function toggleVendor(vendor: Vendor) {
    setSelected(prev => prev.find(v => v.id === vendor.id) ? prev.filter(v => v.id !== vendor.id) : [...prev, vendor]);
  }

  async function savePlan() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setSavingPlan(true);
    try {
      const planData = { 
        couple_id: user.id, total_budget: budgetNum, guest_count: parseInt(guestCount), 
        wedding_date: weddingDate || null, mode, allocation_json: allocation || {}, 
        is_active: true, ai_strategy_notes: aiInsight?.strategy_tip || null 
      };
      if (planId) { await supabase.from("wedding_plans").update(planData).eq("id", planId); }
      else { const { data: p } = await supabase.from("wedding_plans").insert(planData).select().maybeSingle(); setPlanId(p?.id || null); }
      toast.success("Plan Synced!");
    } catch { toast.error("Sync failed"); } finally { setSavingPlan(false); }
  }

  const filteredVendors = activeCategory === CATEGORIES_ALL ? vendors : vendors.filter(v => v.category?.name === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in duration-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-brand-ebony/5 pb-8">
        <div>
          <Badge variant="default" className="mb-2 bg-transparent border border-brand-gold/30 text-brand-gold font-bold tracking-widest text-[10px] uppercase">
            Harusi AI Strategist v2.5
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ebony">Design Your Wedding</h1>
        </div>

        <div className="flex bg-brand-cloud p-1 rounded-2xl border border-brand-ebony/5 self-start shadow-sm">
          {(["ai", "manual"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={cn("flex items-center gap-2 px-6 py-2 rounded-xl text-xs font-bold transition-all",
                mode === m ? "bg-white text-brand-ebony shadow-md" : "text-brand-ebony/40")}>
              {m === "ai" ? <Sparkles className="w-3 h-3 text-brand-gold" /> : <Target className="w-3 h-3" />}
              {m === "ai" ? "AI STRATEGIST" : "MANUAL"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
        <div className="space-y-8 min-w-0">
          
          {/* PARAMETERS CARD */}
          <Card className="p-6 border-none shadow-xl bg-white/80 backdrop-blur-md">
             <h3 className="font-serif text-xl font-bold text-brand-ebony mb-6">Planning Parameters</h3>
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-brand-ebony/40 uppercase tracking-widest">Total Budget</label>
                   <Input type="number" value={budget} onChange={e => setBudget(e.target.value)} className="bg-brand-cloud border-none h-12 font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-brand-ebony/40 uppercase tracking-widest">Guests</label>
                   <Input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} className="bg-brand-cloud border-none h-12 font-bold" />
                </div>
                <div className="space-y-2 lg:col-span-2">
                   <label className="text-[10px] font-bold text-brand-ebony/40 uppercase tracking-widest px-1">Primary Priority</label>
                   <div className="flex gap-2">
                     {["balanced", "premium", "budget"].map((p) => (
                        <button key={p} onClick={() => setPriority(p)} className={cn("flex-1 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest border transition-all", priority === p ? "bg-brand-ebony text-white border-brand-ebony" : "bg-white text-brand-ebony/40 border-brand-ebony/5 hover:border-brand-ebony/20")}>
                           {p}
                        </button>
                     ))}
                   </div>
                </div>
             </div>
             {mode === "ai" && (
               <Button onClick={handleGenerateAIPlan} disabled={isGenerating} className="w-full mt-8 h-14 bg-brand-tanzanite hover:bg-brand-tanzanite/90 rounded-2xl shadow-lg shadow-brand-tanzanite/20">
                 {isGenerating ? <Spinner className="mr-2" /> : <Sparkles className="w-4 h-4 mr-2" />}
                 Generate AI Allocation
               </Button>
             )}
          </Card>

          {/* CATEGORY TABS */}
          <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
            <button
              onClick={() => setActiveCategory(CATEGORIES_ALL)}
              className={cn("px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
                activeCategory === CATEGORIES_ALL ? "bg-brand-ebony text-white border-brand-ebony" : "bg-white text-brand-ebony/40 border-brand-ebony/5")}
            >
              All Vendors
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.name)}
                className={cn("px-6 py-3 rounded-2xl text-xs font-bold whitespace-nowrap transition-all border",
                  activeCategory === cat.name ? "bg-brand-ebony text-white border-brand-ebony" : "bg-white text-brand-ebony/40 border-brand-ebony/5")}
              >
                {cat.name}
              </button>
            ))}
          </div>

          {/* VENDOR GRID (THE PART YOU WERE MISSING) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {loadingVendors ? (
              Array(4).fill(0).map((_, i) => <Card key={i} className="h-64 animate-pulse bg-brand-cloud border-none"><div /></Card>)
            ) : (
              filteredVendors.map(vendor => {
                const isSelected = selected.some(v => v.id === vendor.id);
                return (
                  <Card key={vendor.id} className={cn("group overflow-hidden border-none shadow-md transition-all cursor-pointer", isSelected ? "ring-2 ring-brand-tanzanite bg-brand-tanzanite/5" : "hover:shadow-xl bg-white")}>
                    <div className="relative h-48" onClick={() => toggleVendor(vendor)}>
                      <Image 
                        src={vendor.cover_image || vendor.images?.[0] || VENDOR_PLACEHOLDER_IMAGES[0]} 
                        alt={vendor.business_name} 
                        fill 
                        className="object-cover transition-transform group-hover:scale-110" 
                      />
                      <div className="absolute top-3 right-3">
                         <Badge className={isSelected ? "bg-brand-tanzanite" : "bg-white/80 backdrop-blur text-brand-ebony"}>
                           {isSelected ? "Selected" : "Add to Plan"}
                         </Badge>
                      </div>
                    </div>
                    <div className="p-5" onClick={() => toggleVendor(vendor)}>
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-bold text-brand-ebony group-hover:text-brand-tanzanite transition-colors">{vendor.business_name}</h4>
                        <div className="flex items-center text-brand-gold">
                           <Star className="w-3 h-3 fill-current" />
                           <span className="text-xs font-bold ml-1">{vendor.rating_avg}</span>
                        </div>
                      </div>
                      <p className="text-xs text-brand-ebony/60 font-bold mb-4">{formatTSHShort(vendor.base_price)} base</p>
                    </div>
                  </Card>
                );
              })
            )}
          </div>
        </div>

        {/* SIDEBAR SUMMARY */}
        <aside className="space-y-6">
           <Card className="p-6 bg-brand-ebony text-white rounded-[32px]">
              <h4 className="text-[10px] uppercase tracking-[0.2em] font-bold text-white/40 mb-6">Investment Summary</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-end">
                    <span className="text-white/60 text-sm">Spent</span>
                    <span className="text-2xl font-serif font-bold">{formatTSHShort(totalSelected)}</span>
                 </div>
                 <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className={cn("h-full transition-all duration-1000", isOver ? "bg-red-500" : "bg-brand-gold")} style={{ width: `${pct}%` }} />
                 </div>
                 <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className={isOver ? "text-red-400" : "text-brand-gold"}>{pct}% Utilized</span>
                    <span className="text-white/40">{formatTSHShort(remaining)} Remaining</span>
                 </div>
              </div>
              <Button onClick={savePlan} disabled={savingPlan} className="w-full mt-8 bg-white text-brand-ebony hover:bg-white/90 h-14 rounded-2xl font-bold">
                 {savingPlan ? "Syncing..." : "Sync Plan to Cloud"}
              </Button>
           </Card>
        </aside>
      </div>
    </div>
  );
}

// 2. THE EXPORT WITH SUSPENSE (REQUIRED BY VERCEL)
export default function PlannerPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Spinner size="lg" />
        <p className="text-brand-ebony/40 font-medium tracking-widest uppercase text-[10px]">Initializing Planner...</p>
      </div>
    }>
      <PlannerContent />
    </Suspense>
  );
}
