"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Textarea, Select, Card, SectionHeader } from "@/components/ui";
import { toast } from "sonner";
import type { Category, Vendor } from "@/types";

export default function VendorProfilePage() {
  const [vendor, setVendor] = useState<Partial<Vendor>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const [{ data: cats }, { data: v }] = await Promise.all([
      supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
      supabase.from("vendors").select("*").eq("profile_id", user.id).single(),
    ]);
    setCategories(cats || []);
    if (v) setVendor(v);
    setLoading(false);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    setSaving(true);
    const payload = {
      profile_id: user.id,
      business_name: vendor.business_name || "",
      category_id: vendor.category_id || "",
      description: vendor.description || "",
      base_price: Number(vendor.base_price) || 0,
      location: vendor.location || "Dar es Salaam",
      years_experience: Number(vendor.years_experience) || 0,
    };
    if (vendor.id) {
      const { error } = await supabase.from("vendors").update(payload).eq("id", vendor.id);
      if (error) toast.error(error.message);
      else toast.success("Profile updated!");
    } else {
      const { error } = await supabase.from("vendors").insert({ ...payload, status: "pending" });
      if (error) toast.error(error.message);
      else { toast.success("Profile created! Pending admin approval."); load(); }
    }
    setSaving(false);
  }

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full border-2 border-amber-400 border-t-transparent w-8 h-8" /></div>;

  return (
    <div className="max-w-2xl animate-fade-in">
      <SectionHeader title="Business Profile" subtitle="This is how couples see your business on the marketplace." />
      <form onSubmit={handleSave} className="space-y-6">
        <Card className="p-6 space-y-5">
          <h3 className="font-serif text-lg font-semibold text-harusi-dark">Business Information</h3>
          <Input label="Business Name" placeholder="e.g. Mama Upendo Catering" value={vendor.business_name || ""} onChange={e => setVendor(p => ({ ...p, business_name: e.target.value }))} required />
          <Select label="Category" value={vendor.category_id || ""} onChange={e => setVendor(p => ({ ...p, category_id: e.target.value }))} required>
            <option value="">Select a category…</option>
            {categories.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </Select>
          <Textarea label="Description" placeholder="Describe your services, specialties, and what makes you unique…" rows={4} value={vendor.description || ""} onChange={e => setVendor(p => ({ ...p, description: e.target.value }))} />
        </Card>
        <Card className="p-6 space-y-5">
          <h3 className="font-serif text-lg font-semibold text-harusi-dark">Pricing & Location</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Base Price (TSH)" type="number" placeholder="e.g. 1500000" value={vendor.base_price || ""} onChange={e => setVendor(p => ({ ...p, base_price: Number(e.target.value) }))} required />
            <Input label="Years of Experience" type="number" placeholder="e.g. 5" value={vendor.years_experience || ""} onChange={e => setVendor(p => ({ ...p, years_experience: Number(e.target.value) }))} />
          </div>
          <Input label="Location / City" placeholder="e.g. Dar es Salaam" value={vendor.location || ""} onChange={e => setVendor(p => ({ ...p, location: e.target.value }))} />
        </Card>
        <Button type="submit" loading={saving} size="lg" className="w-full">
          {vendor.id ? "Save Changes" : "Create Vendor Profile"}
        </Button>
        {!vendor.id && (
          <p className="text-xs text-center text-harusi-muted">Your profile will be reviewed by our team before going live.</p>
        )}
      </form>
    </div>
  );
}
