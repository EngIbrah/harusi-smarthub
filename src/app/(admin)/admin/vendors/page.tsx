"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { formatTSH } from "@/lib/utils";
import { toast } from "sonner";
import type { Vendor, VendorStatus } from "@/types";

const TABS = ["all", "pending", "active", "suspended"] as const;

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [tab, setTab] = useState<typeof TABS[number]>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase
      .from("vendors")
      .select("*, category:categories(*), profile:profiles(full_name, phone)")
      .order("created_at", { ascending: false });
    setVendors(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: VendorStatus) {
    const { error } = await supabase.from("vendors").update({ status, is_verified: status === "active" }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Vendor ${status}`); load(); }
  }

  async function deleteVendor(id: string) {
    if (!confirm("Permanently delete this vendor?")) return;
    await supabase.from("vendors").delete().eq("id", id);
    toast.success("Vendor deleted");
    load();
  }

  const filtered = vendors.filter(v => {
    if (tab !== "all" && v.status !== tab) return false;
    if (search && !v.business_name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Vendor Management" subtitle="Approve, suspend, and manage vendors." />

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${tab === t ? "bg-white text-harusi-dark shadow-sm" : "text-harusi-muted hover:text-harusi-dark"}`}>
              {t} ({vendors.filter(v => t === "all" ? true : v.status === t).length})
            </button>
          ))}
        </div>
        <input
          placeholder="Search vendors…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><div className="animate-spin rounded-full border-2 border-amber-400 border-t-transparent w-8 h-8" /></div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-stone-100 bg-stone-50/50">
                <tr>
                  {["Business", "Category", "Owner", "Base Price", "Rating", "Status", "Actions"].map(h => (
                    <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-harusi-muted uppercase tracking-wide whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr><td colSpan={7} className="text-center py-12 text-harusi-muted text-sm">No vendors found.</td></tr>
                ) : filtered.map(v => (
                  <tr key={v.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-harusi-dark">{v.business_name}</div>
                      <div className="text-xs text-stone-400">📍 {v.location}</div>
                    </td>
                    <td className="py-3 px-4 text-harusi-muted text-xs">{v.category?.icon} {v.category?.name}</td>
                    <td className="py-3 px-4 text-harusi-muted text-xs">{v.profile?.full_name}</td>
                    <td className="py-3 px-4 font-serif font-bold text-amber-700 text-sm tabular-nums">{formatTSH(v.base_price)}</td>
                    <td className="py-3 px-4">
                      <span className="text-amber-500">★</span>
                      <span className="text-sm text-harusi-dark font-medium ml-0.5">{(v.rating_avg || 0).toFixed(1)}</span>
                      <span className="text-xs text-stone-400 ml-1">({v.rating_count || 0})</span>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={v.status === "active" ? "success" : v.status === "pending" ? "warning" : "danger"} className="text-[10px]">
                        {v.is_verified && "✓ "}{v.status}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-1.5">
                        {v.status === "pending" && (
                          <button onClick={() => updateStatus(v.id, "active")} className="px-2.5 py-1 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all">Approve</button>
                        )}
                        {v.status === "active" && (
                          <button onClick={() => updateStatus(v.id, "suspended")} className="px-2.5 py-1 bg-amber-100 text-amber-700 text-xs font-bold rounded-lg hover:bg-amber-200 transition-all">Suspend</button>
                        )}
                        {v.status === "suspended" && (
                          <button onClick={() => updateStatus(v.id, "active")} className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-lg hover:bg-emerald-200 transition-all">Restore</button>
                        )}
                        <button onClick={() => deleteVendor(v.id)} className="px-2.5 py-1 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200 transition-all">Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
