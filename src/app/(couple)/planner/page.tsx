"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Card, Badge, StarRating, Spinner } from "@/components/ui";
import { formatTSHShort, VENDOR_PLACEHOLDER_IMAGES, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sparkles, Target, ShoppingBag, TrendingDown, Star, Zap, Info, Quote } from "lucide-react";
import type { Vendor, Category, BudgetAllocation } from "@/types";

const CATEGORIES_ALL = "All Vendors";

export default function PlannerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  // Core State
  const [mode, setMode] = useState<"ai" | "manual">((searchParams.get("mode") as "ai" | "manual") || "ai");
  const [budget, setBudget] = useState("10000000"); 
  const [guestCount, setGuestCount] = useState("200");
  const [weddingDate, setWeddingDate] = useState("");
  const [priority, setPriority] = useState("balanced");
  
  // AI State
  const [allocation, setAllocation] = useState<BudgetAllocation | null>(null);
  const [aiInsight, setAiInsight] = useState<{
    market_analysis: string;
    savings_insight: string;
    strategy_tip: string;
    recommended_ids: string[];
  } | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Vendor Data State
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES_ALL);
  const [selected, setSelected] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  // Derived Values
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

      setAiInsight({
        recommended_ids: data.recommended_ids || [],
        market_analysis: data.market_analysis || "Analysis pending...",
        savings_insight: data.savings_insight || "0 TSh",
        strategy_tip: data.strategy_tip || "No tips available yet."
      });
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
      
      {/* HEADER */}
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
          
          {/* INPUT CARD */}
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
                     {["balanced", "photography", "catering", "decor"].map(p => (
                       <button key={p} onClick={() => setPriority(p)} className={cn("flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-tighter border transition-all", 
                        priority === p ? "bg-brand-ebony text-white" : "bg-brand-cloud text-brand-ebony/40 border-transparent")}>
                         {p}
                       </button>
                     ))}
                   </div>
                </div>
             </div>
             {mode === "ai" && (
               <Button onClick={handleGenerateAIPlan} loading={isGenerating} disabled={!budgetNum} className="mt-6 w-full sm:w-auto px-8 bg-brand-ebony text-white rounded-xl font-bold h-12">
                 <Sparkles className="w-4 h-4 mr-2 text-brand-gold" /> Optimize with AI
               </Button>
             )}
          </Card>

          {/* IMPROVED AI INSIGHT PANEL */}
          {aiInsight && (
            <div className="space-y-4 animate-in slide-in-from-bottom-4 duration-700">
               <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-brand-gold fill-brand-gold" />
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-brand-ebony/60">Market Intelligence Report</h3>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* MAIN ANALYSIS */}
                  <Card className="md:col-span-2 p-6 bg-brand-ebony text-white border-none shadow-xl relative overflow-hidden flex flex-col justify-center min-h-[140px]">
                     <Quote className="absolute -top-2 -left-2 w-16 h-16 text-white/5" />
                     <p className="text-lg font-serif italic leading-relaxed relative z-10">"{aiInsight.market_analysis}"</p>
                  </Card>

                  {/* SAVINGS CARD */}
                  <Card className="p-6 bg-brand-gold/10 border-2 border-dashed border-brand-gold/30 flex flex-col items-center justify-center text-center">
                     <TrendingDown className="w-6 h-6 text-brand-gold mb-2" />
                     <span className="text-[9px] font-black uppercase text-brand-gold/60 tracking-widest">Potential Savings</span>
                     <p className="text-sm font-bold text-brand-ebony mt-1">{aiInsight.savings_insight}</p>
                  </Card>

                  {/* STRATEGY TIP CARD */}
                  <Card className="md:col-span-3 p-5 bg-brand-cloud border-none flex items-start gap-4">
                     <div className="w-10 h-10 rounded-full bg-brand-gold/20 flex items-center justify-center shrink-0">
                        <Star className="w-5 h-5 text-brand-gold" />
                     </div>
                     <div>
                        <h4 className="text-[10px] font-black uppercase text-brand-ebony tracking-widest mb-1">Harusi Strategy Tip</h4>
                        <p className="text-xs text-brand-ebony/60 leading-relaxed">{aiInsight.strategy_tip}</p>
                     </div>
                  </Card>
               </div>
            </div>
          )}

          {/* ALLOCATION BARS */}
          {allocation && (
            <Card className="p-8 border-none bg-brand-cloud/50 shadow-inner rounded-3xl">
              <h3 className="font-serif text-xl font-bold mb-8 text-brand-ebony">Suggested Fund Distribution</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-8">
                {Object.entries(allocation).map(([key, amt]) => {
                  const pctOfTotal = budgetNum > 0 ? Math.round((Number(amt) / budgetNum) * 100) : 0;
                  return (
                    <div key={key} className="space-y-3">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-black uppercase tracking-widest text-brand-ebony/50">{key.replace('_', ' ')}</span>
                        <span className="text-xs font-bold text-brand-ebony">{formatTSHShort(Number(amt))}</span>
                      </div>
                      <div className="h-2 bg-brand-ebony/5 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-brand-gold transition-all duration-1000 ease-out" style={{ width: `${pctOfTotal}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* VENDORS GRID */}
          <div className="space-y-6 pt-4">
            <div className="flex items-center justify-between">
              <h3 className="font-serif text-2xl font-bold text-brand-ebony flex items-center gap-2">
                <ShoppingBag className="w-6 h-6 text-brand-gold" /> Recommended Team
              </h3>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
              {[CATEGORIES_ALL, ...categories.map(c => c.name)].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={cn("px-6 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest border transition-all whitespace-nowrap",
                    activeCategory === cat ? "bg-brand-ebony border-brand-ebony text-white shadow-lg" : "border-brand-ebony/10 text-brand-ebony/40 hover:border-brand-gold")}>
                  {cat}
                </button>
              ))}
            </div>

            {loadingVendors ? <Spinner size="lg" className="mx-auto block mt-10" /> : (
              <div className="grid gap-6">
                {filteredVendors.map(v => {
                  const isSelected = !!selected.find(sel => sel.id === v.id);
                  const isAiRecommended = aiInsight?.recommended_ids?.includes(v.id);
                  
                  return (
                    <Card key={v.id} className={cn("group overflow-hidden border-2 transition-all p-0 relative rounded-3xl", 
                      isSelected ? "border-brand-gold shadow-2xl scale-[1.01]" : "border-transparent bg-white shadow-sm hover:shadow-md")}>
                      
                      {isAiRecommended && (
                        <div className="absolute top-4 left-4 z-20">
                          <Badge className="bg-brand-gold text-brand-ebony border-none text-[8px] font-black tracking-widest px-3 py-1">
                            <Sparkles className="w-2 h-2 mr-1 inline" /> GEMINI CHOICE
                          </Badge>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row min-h-[200px]">
                        <div className="relative w-full sm:w-64 overflow-hidden">
                          <Image 
                            src={v.cover_image || VENDOR_PLACEHOLDER_IMAGES[v.category?.slug || 'venue']} 
                            alt={v.business_name} fill 
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, 256px"
                          />
                        </div>
                        <div className="p-8 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <h4 className="font-bold text-xl text-brand-ebony">{v.business_name}</h4>
                              <p className="text-lg font-serif font-bold text-brand-gold">{formatTSHShort(v.base_price)}</p>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                              <StarRating rating={v.rating_avg} size="sm" />
                              <span className="text-[10px] font-bold text-brand-ebony/30 uppercase tracking-widest">📍 {v.location}</span>
                            </div>
                            <p className="text-xs text-brand-ebony/50 leading-relaxed line-clamp-2">{v.description}</p>
                          </div>
                          
                          <div className="flex items-center justify-end mt-6">
                            <button onClick={() => toggleVendor(v)} className={cn("px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all", 
                              isSelected ? "bg-brand-ebony text-white" : "bg-brand-cloud text-brand-ebony hover:bg-brand-gold hover:text-white")}>
                              {isSelected ? "✓ Selected" : "+ Add to Plan"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* SIDEBAR SUMMARY */}
        <div className="relative">
          <div className="xl:sticky xl:top-24 space-y-6">
            <Card className="p-8 border-none bg-brand-ebony text-white shadow-2xl overflow-hidden rounded-[2.5rem]">
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-gold/10 blur-3xl rounded-full" />
              <h3 className="font-serif text-2xl font-bold mb-8">Live Summary</h3>
              
              <div className="space-y-4 mb-10">
                <div className="flex justify-between p-5 bg-white/5 rounded-3xl border border-white/5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Total Selected</span>
                  <span className="font-serif font-bold text-brand-gold text-lg">{formatTSHShort(totalSelected)}</span>
                </div>
                <div className={cn("flex justify-between p-5 rounded-3xl border", isOver ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20")}>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{remaining < 0 ? "Deficit" : "Balance"}</span>
                  <span className={cn("font-serif font-bold text-lg", isOver ? "text-red-400" : "text-emerald-400")}>{formatTSHShort(Math.abs(remaining))}</span>
                </div>
              </div>

              <div className="space-y-3 mb-10">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest px-1">
                  <span className="text-white/40">Budget Utilization</span>
                  <span className={isOver ? "text-red-400" : "text-brand-gold"}>{pct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-1000 ease-in-out", isOver ? "bg-red-500" : "bg-brand-gold")} style={{ width: `${pct}%` }} />
                </div>
              </div>

              <Button onClick={savePlan} loading={savingPlan} className="w-full py-8 bg-brand-gold text-brand-ebony font-black uppercase tracking-widest rounded-3xl hover:scale-[1.02] transition-transform shadow-xl shadow-brand-gold/5 border-none">
                Synchronize Plan
              </Button>
              
              <p className="text-[9px] text-center mt-6 text-white/20 font-bold uppercase tracking-widest flex items-center justify-center gap-2">
                <Info className="w-3 h-3" /> Auto-saved to Cloud
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}