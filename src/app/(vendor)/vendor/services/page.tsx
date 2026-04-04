"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Textarea, Card, Badge, Modal, SectionHeader, Empty } from "@/components/ui";
import { formatTSH, cn } from "@/lib/utils";
import { toast } from "sonner";
import { Package, Plus, Pencil, Trash2, Power, Loader2 } from "lucide-react";
import type { Service, Vendor } from "@/types";

export default function VendorServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Service> | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: v } = await supabase
        .from("vendors")
        .select("*")
        .eq("profile_id", user.id)
        .maybeSingle();

      setVendor(v);

      if (v) {
        const { data: s } = await supabase
          .from("services")
          .select("*")
          .eq("vendor_id", v.id)
          .order("created_at", { ascending: false });
        setServices(s || []);
      }
    } catch (err) {
      console.error("Load error:", err);
    } finally {
      setLoading(false);
    }
  }

  function openAdd() {
    setEditing({ name: "", price: 0, description: "", is_active: true });
    setModalOpen(true);
  }

  function openEdit(s: Service) {
    setEditing(s);
    setModalOpen(true);
  }

  async function handleSave() {
    if (!vendor || !editing?.name || !editing.price) {
      toast.error("Service name and price are required");
      return;
    }
    setSaving(true);
    
    const payload = {
      vendor_id: vendor.id,
      name: editing.name.trim(),
      price: Number(editing.price),
      description: editing.description?.trim() || null,
      is_active: editing.is_active ?? true
    };

    const { error } = editing.id
      ? await supabase.from("services").update(payload).eq("id", editing.id)
      : await supabase.from("services").insert(payload);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editing.id ? "Package updated" : "Package added!");
      setModalOpen(false);
      setEditing(null);
      load();
    }
    setSaving(false);
  }

  async function toggleActive(s: Service) {
    const { error } = await supabase
      .from("services")
      .update({ is_active: !s.is_active })
      .eq("id", s.id);
    
    if (!error) {
      toast.success(s.is_active ? "Package paused" : "Package activated");
      load();
    }
  }

  async function deleteService(id: string) {
    if (!confirm("Are you sure you want to delete this package? This action cannot be undone.")) return;
    const { error } = await supabase.from("services").delete().eq("id", id);
    if (!error) {
      toast.success("Package removed");
      load();
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
        <p className="text-sm font-medium text-brand-ebony/50 uppercase tracking-widest">Loading Packages...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader
        title="Service Packages"
        subtitle="Manage the specific offerings and pricing tiers for your business."
        action={
          vendor && (
            <Button onClick={openAdd} className="bg-brand-tanzanite hover:bg-brand-tanzanite/90 shadow-lg shadow-brand-tanzanite/20 rounded-xl">
              <Plus className="w-4 h-4 mr-2" /> Add Package
            </Button>
          )
        }
      />

      <div className="mt-8">
        {!vendor ? (
          <Card className="p-8 border-brand-gold/20 bg-brand-gold/5 flex flex-col items-center text-center">
             <div className="w-12 h-12 bg-brand-gold/10 rounded-2xl flex items-center justify-center text-2xl mb-4 text-brand-gold">⚠️</div>
             <h3 className="font-serif text-xl font-bold text-brand-ebony mb-2">Profile Missing</h3>
             <p className="text-brand-ebony/60 text-sm mb-6 max-w-xs">
               You need to complete your vendor profile information before defining your services.
             </p>
             <Button asChild variant="outline" className="border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white">
                <a href="/vendor/profile">Setup Profile First</a>
             </Button>
          </Card>
        ) : !services.length ? (
          <Empty 
            icon={<Package className="w-12 h-12 text-brand-ebony/20" />} 
            title="No packages listed" 
            description="Create different pricing tiers or service bundles to help couples understand your value."
            action={<Button onClick={openAdd} variant="outline" className="rounded-xl px-8">Create Your First Package</Button>}
          />
        ) : (
          <div className="grid gap-4">
            {services.map(s => (
              <Card key={s.id} className={cn(
                "group p-6 flex flex-col sm:flex-row items-start justify-between gap-6 transition-all duration-300 border-brand-ebony/5 hover:shadow-xl hover:shadow-brand-ebony/5",
                !s.is_active && "bg-brand-cloud/40 opacity-75"
              )}>
                <div className="flex-1 space-y-3">
                  <div className="flex items-center gap-3">
                    <h4 className="font-bold text-brand-ebony text-lg leading-tight group-hover:text-brand-tanzanite transition-colors">{s.name}</h4>
                    <Badge variant={s.is_active ? "success" : "default"} className="rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wider shadow-none">
                      {s.is_active ? "Active" : "Paused"}
                    </Badge>
                  </div>
                  {s.description && (
                    <p className="text-xs text-brand-ebony/50 leading-relaxed font-medium line-clamp-2 italic">
                      "{s.description}"
                    </p>
                  )}
                  <div className="font-serif font-black text-brand-tanzanite text-xl tabular-nums">
                    {formatTSH(s.price)}
                  </div>
                </div>

                <div className="flex sm:flex-col gap-2 w-full sm:w-auto">
                  <button 
                    onClick={() => toggleActive(s)} 
                    className="flex-1 flex items-center justify-center gap-2 px-4 py-2 text-[11px] font-bold uppercase tracking-widest border border-brand-ebony/10 rounded-xl hover:bg-brand-cloud transition-all"
                  >
                    <Power className="w-3.5 h-3.5" /> {s.is_active ? "Pause" : "Activate"}
                  </button>
                  <div className="flex gap-2 flex-1">
                    <button 
                      onClick={() => openEdit(s)} 
                      className="flex-1 p-2 flex items-center justify-center border border-brand-ebony/10 rounded-xl hover:bg-brand-cloud text-brand-ebony/60 transition-all"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteService(s.id)} 
                      className="flex-1 p-2 flex items-center justify-center border border-red-100 rounded-xl hover:bg-red-50 text-red-400 transition-all"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Modal 
        open={modalOpen} 
        onClose={() => { setModalOpen(false); setEditing(null); }} 
        title={editing?.id ? "Edit Package" : "Create New Package"}
      >
        <div className="space-y-6 pt-4">
          <Input 
            label="Package Name" 
            placeholder="e.g. Platinum Buffet (300 Guests)" 
            value={editing?.name || ""} 
            onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} 
            required 
          />
          
          <div className="relative">
            <Input 
              label="Price (TSH)" 
              type="number" 
              placeholder="e.g. 1800000" 
              value={editing?.price || ""} 
              onChange={e => setEditing(p => ({ ...p, price: Number(e.target.value) }))} 
              required 
            />
            <span className="absolute right-3 top-[38px] text-[10px] font-black text-brand-ebony/30">TSH</span>
          </div>

          <Textarea 
            label="What's included?" 
            placeholder="List the specific services, items, or hours included in this price..." 
            rows={4} 
            value={editing?.description || ""} 
            onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} 
          />
          
          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1 font-bold text-brand-ebony/60">
              Discard
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={saving} 
              className="flex-1 bg-brand-tanzanite font-bold text-white shadow-lg shadow-brand-tanzanite/20"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : (editing?.id ? "Update Package" : "Publish Package")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}