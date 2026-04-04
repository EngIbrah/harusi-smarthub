"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge, Card, SectionHeader, Button, Input, Spinner } from "@/components/ui";
import { formatTSHShort } from "@/lib/utils";
import { toast } from "sonner";
import { 
  CheckCircle, 
  Trash2, 
  Search, 
  MapPin, 
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Store
} from "lucide-react";

const TABS = ["all", "pending", "active", "suspended"] as const;

export default function AdminVendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [tab, setTab] = useState<typeof TABS[number]>("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  // Memoized loader to prevent unnecessary re-renders
  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("vendors")
      .select("*, category:categories(*), profile:profiles(full_name, phone)")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error("Database connection failed");
    } else {
      setVendors(data || []);
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  // Combined status handler for Approve, Suspend, and Reactivate
  async function updateStatus(id: string, status: string) {
    const isActive = status === "active";
    const { error } = await supabase
      .from("vendors")
      .update({ 
        status, 
        is_verified: isActive // Automatically verify if active, unverify if suspended
      })
      .eq("id", id);

    if (error) {
      toast.error(error.message);
    } else {
      const message = status === "active" ? "Vendor is now Live" : "Vendor access restricted";
      toast.success(message);
      load();
    }
  }

  async function deleteVendor(id: string) {
    if (!confirm("CRITICAL: This will permanently remove the vendor and their listings. Proceed?")) return;
    
    const { error } = await supabase.from("vendors").delete().eq("id", id);
    if (error) {
      toast.error("Could not delete record");
    } else {
      toast.success("Vendor purged from registry");
      load();
    }
  }

  // Multi-layer filtering
  const filtered = vendors.filter(v => {
    const matchesTab = tab === "all" ? true : v.status === tab;
    const matchesSearch = 
      v.business_name.toLowerCase().includes(search.toLowerCase()) || 
      v.profile?.full_name?.toLowerCase().includes(search.toLowerCase());
    return matchesTab && matchesSearch;
  });

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      <SectionHeader 
        title="Vendor Registry" 
        subtitle="Manage the lifecycle of service providers on the Harusi platform." 
      />

      {/* Filter & Search Bar */}
      <Card className="p-2 border-none bg-brand-cloud/40 shadow-none">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-brand-ebony/5 w-full md:w-auto overflow-x-auto">
            {TABS.map(t => (
              <button 
                key={t} 
                onClick={() => setTab(t)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap ${
                  tab === t 
                    ? "bg-brand-ebony text-white shadow-lg" 
                    : "text-brand-ebony/40 hover:text-brand-ebony hover:bg-brand-ebony/5"
                }`}
              >
                {t} <span className="ml-2 opacity-40 italic">{vendors.filter(v => t === "all" ? true : v.status === t).length}</span>
              </button>
            ))}
          </div>
          
          <div className="flex-1 w-full">
            <Input 
              placeholder="Search by business name or owner..." 
              value={search}
              onChange={e => setSearch(e.target.value)}
              icon={<Search className="w-4 h-4" />}
              className="bg-white border-none shadow-sm h-[52px]"
            />
          </div>
        </div>
      </Card>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Spinner size="lg" className="text-brand-gold" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-ebony/20">Accessing Secure Records</p>
        </div>
      ) : (
        <Card className="border-none shadow-xl shadow-brand-ebony/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-ebony text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                  <th className="py-5 px-8">Business Entity</th>
                  <th className="py-5 px-6">Classification</th>
                  <th className="py-5 px-6">Direct Contact</th>
                  <th className="py-5 px-6 text-right">Base Rate</th>
                  <th className="py-5 px-6">Status</th>
                  <th className="py-5 px-8 text-right">Quick Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-ebony/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <Store className="w-12 h-12 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-ebony">No entries in this segment</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(v => (
                  <tr key={v.id} className="group hover:bg-brand-cloud/40 transition-all duration-300">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-brand-ebony flex items-center justify-center text-brand-gold font-black shadow-lg shadow-brand-ebony/10 transition-transform group-hover:scale-110">
                          {v.business_name[0]}
                        </div>
                        <div>
                          <p className="font-bold text-brand-ebony leading-none mb-1.5">{v.business_name}</p>
                          <div className="flex items-center gap-1.5 text-[10px] font-black text-brand-ebony/30 uppercase tracking-tighter">
                            <MapPin className="w-3 h-3 text-brand-gold" /> {v.location || "Region Unspecified"}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2">
                        <span className="text-lg grayscale group-hover:grayscale-0 transition-all">{v.category?.icon}</span>
                        <span className="text-[10px] font-black uppercase tracking-tight text-brand-ebony/60">{v.category?.name}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-brand-ebony">{v.profile?.full_name}</span>
                        <span className="text-[10px] font-black text-brand-ebony/30 uppercase tabular-nums tracking-widest">{v.profile?.phone || "No Mobile"}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6 text-right">
                      <span className="font-serif font-black text-brand-tanzanite tracking-tighter">
                        {v.base_price ? formatTSHShort(v.base_price) : "TSh 0"}
                      </span>
                    </td>
                    <td className="py-5 px-6">
                      <Badge variant={v.status === "active" ? "success" : v.status === "pending" ? "warning" : "danger"}>
                        {v.is_verified && <ShieldCheck className="w-3 h-3 mr-1.5 inline" />} {v.status}
                      </Badge>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        
                        {/* Approval Flow */}
                        {v.status === "pending" && (
                          <Button variant="primary" size="sm" onClick={() => updateStatus(v.id, "active")} className="rounded-xl h-9">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </Button>
                        )}

                        {/* Suspension Flow */}
                        {v.status === "active" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateStatus(v.id, "suspended")} 
                            className="rounded-xl h-9 border-amber-200 text-amber-700 hover:bg-amber-50"
                          >
                            <AlertTriangle className="w-3.5 h-3.5" /> Suspend
                          </Button>
                        )}

                        {/* Reactivation Flow */}
                        {v.status === "suspended" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateStatus(v.id, "active")} 
                            className="rounded-xl h-9 border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                          >
                            <RotateCcw className="w-3.5 h-3.5" /> Reactivate
                          </Button>
                        )}

                        {/* Hard Delete */}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => deleteVendor(v.id)} 
                          className="rounded-xl h-9 w-9 p-0 text-red-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}