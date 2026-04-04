"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Textarea, Card, Badge, Modal, SectionHeader, Empty } from "@/components/ui";
import { formatTSH } from "@/lib/utils";
import { toast } from "sonner";
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: v } = await supabase.from("vendors").select("*").eq("profile_id", user.id).single();
    setVendor(v);
    if (v) {
      const { data: s } = await supabase.from("services").select("*").eq("vendor_id", v.id).order("created_at");
      setServices(s || []);
    }
    setLoading(false);
  }

  function openAdd()       { setEditing({ name: "", price: 0, description: "", is_active: true }); setModalOpen(true); }
  function openEdit(s: Service) { setEditing(s); setModalOpen(true); }

  async function handleSave() {
    if (!vendor || !editing?.name || !editing.price) { toast.error("Name and price are required"); return; }
    setSaving(true);
    const payload = { vendor_id: vendor.id, name: editing.name, price: Number(editing.price), description: editing.description || null, is_active: editing.is_active ?? true };
    if (editing.id) {
      const { error } = await supabase.from("services").update(payload).eq("id", editing.id);
      if (error) toast.error(error.message);
      else toast.success("Service updated!");
    } else {
      const { error } = await supabase.from("services").insert(payload);
      if (error) toast.error(error.message);
      else toast.success("Service added!");
    }
    setModalOpen(false);
    setEditing(null);
    load();
    setSaving(false);
  }

  async function toggleActive(s: Service) {
    await supabase.from("services").update({ is_active: !s.is_active }).eq("id", s.id);
    toast.success(s.is_active ? "Service paused" : "Service activated");
    load();
  }

  async function deleteService(id: string) {
    if (!confirm("Delete this service?")) return;
    await supabase.from("services").delete().eq("id", id);
    toast.success("Service deleted");
    load();
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full border-2 border-amber-400 border-t-transparent w-8 h-8" /></div>;

  return (
    <div className="max-w-3xl animate-fade-in">
      <SectionHeader
        title="Service Packages"
        subtitle="Define what you offer and at what price."
        action={<Button onClick={openAdd} size="sm">+ Add Service</Button>}
      />

      {!vendor ? (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-sm text-amber-800">
          You need to <a href="/vendor/profile" className="font-bold underline">create your vendor profile</a> first before adding services.
        </div>
      ) : !services.length ? (
        <Empty icon="📦" title="No services yet" description="Add your service packages to show couples what you offer."
          action={<Button onClick={openAdd}>Add First Service</Button>}
        />
      ) : (
        <div className="space-y-3">
          {services.map(s => (
            <Card key={s.id} className="p-5 flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-harusi-dark text-sm">{s.name}</h4>
                  <Badge variant={s.is_active ? "success" : "default"} className="text-[10px]">{s.is_active ? "Active" : "Paused"}</Badge>
                </div>
                {s.description && <p className="text-xs text-harusi-muted mt-1 leading-relaxed">{s.description}</p>}
                <div className="font-serif font-bold text-amber-700 text-base mt-2 tabular-nums">{formatTSH(s.price)}</div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(s)} className="px-3 py-1.5 text-xs font-semibold border border-stone-200 rounded-lg hover:bg-stone-50 transition-all">{s.is_active ? "Pause" : "Activate"}</button>
                <button onClick={() => openEdit(s)} className="px-3 py-1.5 text-xs font-semibold border border-stone-200 rounded-lg hover:bg-stone-50 transition-all">Edit</button>
                <button onClick={() => deleteService(s.id)} className="px-3 py-1.5 text-xs font-semibold border border-red-200 text-red-500 rounded-lg hover:bg-red-50 transition-all">Delete</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing?.id ? "Edit Service" : "Add Service"}>
        <div className="space-y-4">
          <Input label="Service Name" placeholder="e.g. Full Buffet Package" value={editing?.name || ""} onChange={e => setEditing(p => ({ ...p, name: e.target.value }))} required />
          <Input label="Price (TSH)" type="number" placeholder="e.g. 1800000" value={editing?.price || ""} onChange={e => setEditing(p => ({ ...p, price: Number(e.target.value) }))} required />
          <Textarea label="Description (optional)" placeholder="What's included in this package…" rows={3} value={editing?.description || ""} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Save Service</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
