"use client";
import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Card, Badge, StatCard, StarRating, Spinner, SectionHeader } from "@/components/ui";
import { formatTSH, formatTSHShort, generateBudget, BUDGET_LABELS, VENDOR_PLACEHOLDER_IMAGES, cn } from "@/lib/utils";
import { toast } from "sonner";
import type { Vendor, Category, BudgetAllocation } from "@/types";

const CATEGORIES_ALL = "All";

export default function PlannerPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const supabase = createClient();

  const [mode, setMode] = useState<"ai" | "manual">(
    (searchParams.get("mode") as "ai" | "manual") || "ai"
  );
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
      if (plan.allocation_json && Object.keys(plan.allocation_json).length) setAllocation(plan.allocation_json);
    }
  }

  function handleGenerateBudget() {
    if (!budgetNum) { toast.error("Please enter your total budget first"); return; }
    const alloc = generateBudget(budgetNum);
    setAllocation(alloc);
    toast.success("Budget plan generated!");
  }

  function toggleVendor(vendor: Vendor) {
    setSelected(prev =>
      prev.find(v => v.id === vendor.id)
        ? prev.filter(v => v.id !== vendor.id)
        : [...prev, vendor]
    );
  }

  async function savePlan() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }
    if (!budgetNum) { toast.error("Please set a budget first"); return; }
    setSavingPlan(true);
    try {
      const planData = {
        couple_id: user.id,
        title: "My Wedding",
        total_budget: budgetNum,
        guest_count: parseInt(guestCount) || 150,
        wedding_date: weddingDate || null,
        mode,
        allocation_json: allocation || {},
        is_active: true,
      };

      let savedPlanId = planId;
      if (planId) {
        await supabase.from("wedding_plans").update(planData).eq("id", planId);
      } else {
        const { data: p } = await supabase.from("wedding_plans").insert(planData).select().single();
        savedPlanId = p?.id;
        setPlanId(savedPlanId || null);
      }

      // Save bookings for selected vendors
      if (savedPlanId && selected.length) {
        const bookingData = selected.map(v => ({
          plan_id: savedPlanId,
          vendor_id: v.id,
          couple_id: user.id,
          agreed_price: v.base_price,
          status: "pending" as const,
        }));
        await supabase.from("bookings").upsert(bookingData, { onConflict: "plan_id,vendor_id" });
      }
      toast.success("Plan saved successfully!");
      router.push("/dashboard");
    } catch {
      toast.error("Failed to save plan. Please try again.");
    } finally {
      setSavingPlan(false);
    }
  }

  const filteredVendors = activeCategory === CATEGORIES_ALL
    ? vendors
    : vendors.filter(v => v.category?.name === activeCategory);

  return (
    <div className="animate-fade-in">
      {/* Page header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="font-serif text-3xl font-bold text-harusi-dark">Wedding Planner</h1>
          <p className="text-harusi-muted mt-1 text-sm">Build your perfect wedding step by step.</p>
        </div>
        {/* Mode toggle */}
        <div className="flex bg-stone-100 rounded-xl p-1 gap-1">
          {(["ai", "manual"] as const).map((m) => (
            <button key={m} onClick={() => setMode(m)}
              className={cn("px-5 py-2 rounded-lg text-sm font-semibold transition-all duration-200",
                mode === m ? "bg-harusi-dark text-white shadow-sm" : "text-harusi-muted hover:text-harusi-dark"
              )}>
              {m === "ai" ? "✨ AI Mode" : "🎯 Manual"}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_320px] gap-8 items-start">
        {/* LEFT */}
        <div className="space-y-6">
          {/* Budget & settings */}
          <Card className="p-6">
            <h3 className="font-serif text-lg font-semibold text-harusi-dark mb-5">
              {mode === "ai" ? "🧮 Set Your Budget" : "💰 Budget Tracker"}
            </h3>
            <div className="grid sm:grid-cols-3 gap-4">
              <Input label="Total Budget (TSH)" type="number" placeholder="e.g. 10000000" value={budget} onChange={e => setBudget(e.target.value)} />
              <Input label="Guest Count" type="number" placeholder="e.g. 200" value={guestCount} onChange={e => setGuestCount(e.target.value)} />
              <Input label="Wedding Date" type="date" value={weddingDate} onChange={e => setWeddingDate(e.target.value)} />
            </div>
            {mode === "ai" && (
              <div className="mt-4">
                <Button onClick={handleGenerateBudget} disabled={!budgetNum}>
                  Generate AI Plan ✨
                </Button>
              </div>
            )}
          </Card>

          {/* AI Allocation */}
          {mode === "ai" && allocation && (
            <Card className="p-6">
              <h3 className="font-serif text-lg font-semibold text-harusi-dark mb-5">📋 Recommended Budget Allocation</h3>
              <div className="space-y-4">
                {(Object.entries(allocation) as [keyof BudgetAllocation, number][]).map(([key, amt]) => {
                  const meta = BUDGET_LABELS[key];
                  const pctOfTotal = budgetNum > 0 ? Math.round((amt / budgetNum) * 100) : 0;
                  return (
                    <div key={key} className="flex items-center gap-4">
                      <span className="text-xl w-7 text-center flex-shrink-0">{meta.icon}</span>
                      <div className="flex-1">
                        <div className="flex justify-between mb-1.5">
                          <span className="text-sm font-semibold text-harusi-dark">{meta.label}</span>
                          <span className="text-sm font-bold text-amber-700 tabular-nums">{formatTSH(amt)}</span>
                        </div>
                        <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pctOfTotal}%`, background: meta.color }} />
                        </div>
                        <div className="text-xs text-harusi-muted mt-1">{pctOfTotal}% of total budget</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Vendor marketplace */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-serif text-lg font-semibold text-harusi-dark">🛍️ Vendor Marketplace</h3>
              <span className="text-xs text-harusi-muted">{filteredVendors.length} vendors</span>
            </div>
            {/* Category filters */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-5 scrollbar-hide">
              {[CATEGORIES_ALL, ...categories.map(c => c.name)].map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "px-4 py-1.5 rounded-full border text-xs font-semibold whitespace-nowrap transition-all duration-200",
                    activeCategory === cat
                      ? "border-amber-400 bg-amber-50 text-amber-700"
                      : "border-stone-200 text-harusi-muted hover:border-stone-300"
                  )}>
                  {cat}
                </button>
              ))}
            </div>

            {loadingVendors ? (
              <div className="flex justify-center py-12"><Spinner size="lg" /></div>
            ) : filteredVendors.length === 0 ? (
              <div className="text-center py-12 text-harusi-muted text-sm">No vendors found in this category.</div>
            ) : (
              <div className="grid gap-4">
                {filteredVendors.map(vendor => {
                  const isSelected = !!selected.find(v => v.id === vendor.id);
                  const cat = vendor.category?.slug || "venue";
                  const imgSrc = vendor.cover_image || vendor.images?.[0] || VENDOR_PLACEHOLDER_IMAGES[cat] || VENDOR_PLACEHOLDER_IMAGES.venue;
                  return (
                    <div key={vendor.id}
                      className={cn(
                        "rounded-2xl border-2 overflow-hidden transition-all duration-200",
                        isSelected ? "border-amber-400 shadow-md shadow-amber-100" : "border-transparent shadow-sm hover:shadow-md"
                      )}>
                      <div className="flex gap-0">
                        <div className="relative w-28 sm:w-36 flex-shrink-0">
                          <Image src={imgSrc} alt={vendor.business_name} fill className="object-cover" sizes="144px" />
                        </div>
                        <div className="flex-1 p-4 bg-white">
                          <div className="flex items-start justify-between gap-2 flex-wrap">
                            <div>
                              <h4 className="font-semibold text-harusi-dark text-sm">{vendor.business_name}</h4>
                              <div className="flex items-center gap-2 mt-1 flex-wrap">
                                <StarRating rating={vendor.rating_avg} />
                                <span className="text-xs text-harusi-muted">{vendor.rating_avg?.toFixed(1)} ({vendor.rating_count})</span>
                                <Badge variant="default" className="text-[10px]">{vendor.category?.name}</Badge>
                                {vendor.is_verified && <Badge variant="gold" className="text-[10px]">✓ Verified</Badge>}
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <div className="text-xs text-harusi-muted">From</div>
                              <div className="font-serif font-bold text-amber-700 text-base tabular-nums">{formatTSHShort(vendor.base_price)}</div>
                            </div>
                          </div>
                          {vendor.description && (
                            <p className="text-xs text-harusi-muted mt-2 line-clamp-2 leading-relaxed">{vendor.description}</p>
                          )}
                          <div className="flex items-center justify-between mt-3 gap-2">
                            <span className="text-xs text-stone-400">📍 {vendor.location}</span>
                            <button onClick={() => toggleVendor(vendor)}
                              className={cn(
                                "px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-200",
                                isSelected
                                  ? "bg-amber-500 text-white hover:bg-amber-600"
                                  : "bg-stone-100 text-harusi-dark hover:bg-amber-50 hover:text-amber-700"
                              )}>
                              {isSelected ? "✓ Selected" : "+ Select"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT – Summary panel */}
        <div className="sticky top-24 space-y-4">
          <div className="bg-harusi-dark rounded-2xl p-6 text-harusi-cream">
            <h3 className="font-serif text-lg font-semibold mb-5">📊 Budget Summary</h3>
            {/* Stats */}
            <div className="space-y-3 mb-5">
              {[
                { label: "Total Budget", val: formatTSH(budgetNum), color: "text-amber-400" },
                { label: "Selected Cost", val: formatTSH(totalSelected), color: "text-harusi-cream" },
                { label: remaining < 0 ? "Over Budget" : "Remaining", val: formatTSH(Math.abs(remaining)), color: isOver ? "text-red-400" : "text-emerald-400" },
              ].map(row => (
                <div key={row.label} className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <span className="text-xs text-stone-400">{row.label}</span>
                  <span className={cn("font-serif font-bold text-sm tabular-nums", row.color)}>{row.val}</span>
                </div>
              ))}
            </div>

            {/* Progress */}
            {budgetNum > 0 && (
              <div className="mb-5">
                <div className="flex justify-between mb-1.5 text-xs">
                  <span className="text-stone-500">Budget used</span>
                  <span className={isOver ? "text-red-400" : "text-emerald-400"}>{pct}%</span>
                </div>
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isOver ? "bg-red-400" : "bg-gradient-to-r from-amber-400 to-amber-600"}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            )}

            {isOver && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 mb-5 text-xs text-red-300">
                ⚠️ You're <span className="font-bold">{formatTSH(Math.abs(remaining))}</span> over budget. Consider removing some vendors.
              </div>
            )}

            {/* Selected vendors */}
            {selected.length > 0 && (
              <div className="mb-5">
                <div className="text-xs text-stone-500 uppercase tracking-wide mb-2">Selected ({selected.length})</div>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selected.map(v => (
                    <div key={v.id} className="flex justify-between items-center py-1.5 border-b border-white/5">
                      <span className="text-xs text-stone-300 truncate flex-1 mr-2">{v.business_name}</span>
                      <span className="text-xs text-amber-400 font-bold tabular-nums flex-shrink-0">{formatTSHShort(v.base_price)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {selected.length === 0 && (
              <div className="text-center py-4 text-stone-500 text-xs mb-5">
                <div className="text-3xl mb-2">🎯</div>
                Select vendors from the marketplace to see your breakdown here.
              </div>
            )}

            <Button onClick={savePlan} loading={savingPlan} className="w-full" size="lg">
              Save Wedding Plan
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
