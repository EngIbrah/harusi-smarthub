"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Card, Badge, StarRating, Spinner, SectionHeader } from "@/components/ui";
import { formatTSH, formatTSHShort, generateBudget, BUDGET_LABELS, VENDOR_PLACEHOLDER_IMAGES, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Sparkles, Target, Wallet, ShoppingBag, CheckCircle2, AlertCircle, Calendar } from "lucide-react";
import type { Vendor, Category, BudgetAllocation } from "@/types";

const CATEGORIES_ALL = "All Vendors";

export default function PlannerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"ai" | "manual">((searchParams.get("mode") as "ai" | "manual") || "ai");
  const [budget, setBudget] = useState("");
  const [guestCount, setGuestCount] = useState("150");
  const [weddingDate, setWeddingDate] = useState("");
  const [allocation, setAllocation] = useState<BudgetAllocation | null>(null);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState(CATEGORIES_ALL);
  const [selected, setSelected] = useState<Vendor[]>([]);
  const [loadingVendors, setLoadingVendors] = useState(true);
  const [savingPlan, setSavingPlan] = useState(false);
  const [planId, setPlanId] = useState<string | null>(null);

  const totalSelected = selected.reduce((s, v) => s + v.base_price, 0);
  const budgetNum = parseFloat(budget) || 0;
  const remaining = budgetNum - totalSelected;
  const isOver = remaining < 0 && budgetNum > 0;
  const pct = budgetNum > 0 ? Math.min(100, Math.round((totalSelected / budgetNum) * 100)) : 0;

  useEffect(() => {
    loadVendors();
    loadExistingPlan();
  }, []);

  async function loadVendors() {
    const { data: cats } = await supabase.from("categories").select("*").eq("is_active", true).order("sort_order");
    setCategories(cats || []);
    const { data: vs } = await supabase.from("vendors").select("*, category:categories(*)").eq("status", "active").order("rating_avg", { ascending: false });
    setVendors(vs || []);
    setLoadingVendors(false);
  }

  async function loadExistingPlan() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: plan } = await supabase.from("wedding_plans").select("*").eq("couple_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(1).single();
    if (plan) {
      setPlanId(plan.id);
      setBudget(String(plan.total_budget));
      setGuestCount(String(plan.guest_count));
      if (plan.wedding_date) setWeddingDate(plan.wedding_date);
      if (plan.allocation_json) setAllocation(plan.allocation_json);
    }
  }

  function handleGenerateBudget() {
    if (!budgetNum) { toast.error("Please enter budget"); return; }
    setAllocation(generateBudget(budgetNum));
    toast.success("AI Model Generated!");
  }

  function toggleVendor(vendor: Vendor) {
    setSelected(prev => prev.find(v => v.id === vendor.id) ? prev.filter(v => v.id !== vendor.id) : [...prev, vendor]);
  }

  async function savePlan() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    setSavingPlan(true);
    try {
      const planData = { couple_id: user.id, total_budget: budgetNum, guest_count: parseInt(guestCount), wedding_date: weddingDate || null, mode, allocation_json: allocation || {}, is_active: true };
      let savedPlanId = planId;
      if (planId) { await supabase.from("wedding_plans").update(planData).eq("id", planId); }
      else { const { data: p } = await supabase.from("wedding_plans").insert(planData).select().single(); savedPlanId = p?.id; setPlanId(savedPlanId || null); }
      toast.success("Plan Synced!");
      router.push("/dashboard");
    } catch { toast.error("Sync failed"); } finally { setSavingPlan(false); }
  }

  const filteredVendors = activeCategory === CATEGORIES_ALL ? vendors : vendors.filter(v => v.category?.name === activeCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 animate-in fade-in duration-700">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8 border-b border-brand-ebony/5 pb-8">
        <div>
          <Badge variant="default" className="mb-2 bg-transparent border border-brand-gold/30 text-brand-gold font-bold tracking-widest text-[10px] uppercase">
            Planner v2.0
          </Badge>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-brand-ebony">Design Your Wedding</h1>
        </div>

        <div className="flex bg-brand-cloud p-1 rounded-2xl border border-brand-ebony/5 self-start">
          {(["ai", "manual"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={cn("flex items-center gap-2 px-4 sm:px-6 py-2 rounded-xl text-xs font-bold transition-all",
                mode === m ? "bg-white text-brand-ebony shadow-lg" : "text-brand-ebony/40")}>
              {m === "ai" ? <Sparkles className="w-3 h-3 text-brand-gold" /> : <Target className="w-3 h-3" />}
              {m === "ai" ? "AI MODE" : "MANUAL"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8 items-start">
        
        {/* LEFT: CONTENT */}
        <div className="space-y-8 min-w-0">
          <Card className="p-6 sm:p-8 border-none shadow-xl bg-white/80 backdrop-blur-md">
             <h3 className="font-serif text-xl font-bold text-brand-ebony mb-6">Budget Foundation</h3>
             <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-brand-ebony/40 uppercase tracking-widest px-1">Total Budget</label>
                   <Input type="number" placeholder="TSH" value={budget} onChange={e => setBudget(e.target.value)} className="bg-brand-cloud border-none h-12 font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-brand-ebony/40 uppercase tracking-widest px-1">Guests</label>
                   <Input type="number" value={guestCount} onChange={e => setGuestCount(e.target.value)} className="bg-brand-cloud border-none h-12 font-bold" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] font-bold text-brand-ebony/40 uppercase tracking-widest px-1">Date</label>
                   <Input type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} className="bg-brand-cloud border-none h-12 font-bold" />
                </div>
             </div>
             {mode === "ai" && (
               <Button onClick={handleGenerateBudget} disabled={!budgetNum} className="mt-6 w-full sm:w-auto px-8 bg-brand-ebony text-white rounded-xl font-bold">
                 <Sparkles className="w-4 h-4 mr-2 text-brand-gold" /> Generate AI Plan
               </Button>
             )}
          </Card>

          {mode === "ai" && allocation && (
            <Card className="p-6 sm:p-8 border-none bg-brand-ebony text-white shadow-2xl">
              <h3 className="font-serif text-xl font-bold mb-6 text-brand-gold">AI Allocation Strategy</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {(Object.entries(allocation) as [keyof BudgetAllocation, number][]).map(([key, amt]) => {
                  const meta = BUDGET_LABELS[key];
                  const pctOfTotal = budgetNum > 0 ? Math.round((amt / budgetNum) * 100) : 0;
                  return (
                    <div key={key} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/50">{meta.label}</span>
                        <span className="text-xs font-bold text-brand-gold">{formatTSHShort(amt)}</span>
                      </div>
                      <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-brand-gold transition-all duration-1000" style={{ width: `${pctOfTotal}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* MARKETPLACE */}
          <div className="space-y-6">
            <h3 className="font-serif text-2xl font-bold text-brand-ebony flex items-center gap-2 px-1">
              <ShoppingBag className="w-6 h-6 text-brand-tanzanite" /> Build Your Team
            </h3>
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
              {[CATEGORIES_ALL, ...categories.map(c => c.name)].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={cn("px-5 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all whitespace-nowrap",
                    activeCategory === cat ? "bg-brand-tanzanite border-brand-tanzanite text-white shadow-lg shadow-brand-tanzanite/20" : "border-brand-ebony/10 text-brand-ebony/40")}>
                  {cat}
                </button>
              ))}
            </div>

            {loadingVendors ? <Spinner size="lg" className="mx-auto block mt-10" /> : (
              <div className="grid gap-6">
                {filteredVendors.map(v => {
                  const isSelected = !!selected.find(sel => sel.id === v.id);
                  return (
                    <Card key={v.id} className={cn("group overflow-hidden border-2 transition-all p-0", isSelected ? "border-brand-gold shadow-xl" : "border-transparent hover:border-brand-ebony/5")}>
                      <div className="flex flex-col sm:flex-row h-full">
                        <div className="relative w-full sm:w-44 h-48 sm:h-auto overflow-hidden">
                          <Image src={v.cover_image || VENDOR_PLACEHOLDER_IMAGES[v.category?.slug || 'venue']} alt="" fill className="object-cover group-hover:scale-105 transition-transform" />
                        </div>
                        <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start">
                              <h4 className="font-bold text-lg text-brand-ebony">{v.business_name}</h4>
                              <div className="text-right">
                                <p className="text-[10px] font-bold text-brand-tanzanite">{formatTSHShort(v.base_price)}</p>
                              </div>
                            </div>
                            <StarRating rating={v.rating_avg} size="sm" />
                            <p className="text-xs text-brand-ebony/50 mt-2 line-clamp-2">{v.description}</p>
                          </div>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-[10px] font-bold text-brand-ebony/30">📍 {v.location}</span>
                            <button onClick={() => toggleVendor(v)} className={cn("px-4 py-2 rounded-lg text-xs font-bold transition-all", isSelected ? "bg-brand-ebony text-white" : "bg-brand-cloud text-brand-ebony hover:bg-brand-gold")}>
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

        {/* RIGHT: SUMMARY (STICKY) */}
        <div className="relative">
          <div className="xl:sticky xl:top-24 space-y-6">
            <Card className="p-8 border-none bg-brand-ebony text-white shadow-2xl overflow-hidden rounded-3xl">
              <div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand-gold/5 blur-2xl" />
              <h3 className="font-serif text-2xl font-bold mb-8">Live Summary</h3>
              
              <div className="space-y-3 mb-8">
                <div className="flex justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                  <span className="text-[10px] font-bold text-white/30 uppercase tracking-widest">Selected Cost</span>
                  <span className="font-serif font-bold text-brand-gold">{formatTSHShort(totalSelected)}</span>
                </div>
                <div className={cn("flex justify-between p-4 rounded-2xl border", isOver ? "bg-red-500/10 border-red-500/20" : "bg-emerald-500/10 border-emerald-500/20")}>
                  <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{remaining < 0 ? "Deficit" : "Remaining"}</span>
                  <span className={cn("font-serif font-bold", isOver ? "text-red-400" : "text-emerald-400")}>{formatTSHShort(Math.abs(remaining))}</span>
                </div>
              </div>

              <div className="space-y-2 mb-8">
                <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-white/40">Utilization</span>
                  <span className={isOver ? "text-red-400" : "text-brand-gold"}>{pct}%</span>
                </div>
                <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div className={cn("h-full transition-all duration-1000", isOver ? "bg-red-500" : "bg-brand-gold")} style={{ width: `${pct}%` }} />
                </div>
              </div>

              <Button onClick={savePlan} loading={savingPlan} className="w-full py-6 bg-brand-gold text-brand-ebony font-black uppercase tracking-widest rounded-2xl hover:scale-[1.02] transition-transform">
                Synchronize Plan
              </Button>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}