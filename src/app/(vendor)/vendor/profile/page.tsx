"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Textarea, Select, Card, SectionHeader } from "@/components/ui";
import { toast } from "sonner";
import type { Category, Vendor } from "@/types";
import { Loader2, Store, MapPin, Banknote } from "lucide-react"; // Icons for a pro feel

export default function VendorProfilePage() {
  const [vendor, setVendor] = useState<Partial<Vendor>>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [{ data: cats }, { data: v }] = await Promise.all([
        supabase.from("categories").select("*").eq("is_active", true).order("sort_order"),
        supabase.from("vendors").select("*").eq("profile_id", user.id).maybeSingle(), // Use maybeSingle to avoid 406 errors if empty
      ]);

      setCategories(cats || []);
      if (v) setVendor(v);
    } catch (error) {
      console.error("Error loading profile:", error);
      toast.error("Failed to load profile data.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        toast.error("You must be logged in to save.");
        return;
    }

    setSaving(true);
    
    // Clean payload
    const payload = {
      profile_id: user.id,
      business_name: vendor.business_name?.trim() || "",
      category_id: vendor.category_id || "",
      description: vendor.description?.trim() || "",
      base_price: Number(vendor.base_price) || 0,
      location: vendor.location?.trim() || "Dar es Salaam",
      years_experience: Number(vendor.years_experience) || 0,
    };

    // Basic Validation
    if (!payload.business_name || !payload.category_id) {
        toast.error("Business Name and Category are required.");
        setSaving(false);
        return;
    }

    const { data, error } = vendor.id 
      ? await supabase.from("vendors").update(payload).eq("id", vendor.id).select().single()
      : await supabase.from("vendors").insert({ ...payload, status: "pending" }).select().single();

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(vendor.id ? "Profile updated!" : "Profile created! Pending admin approval.");
      if (data) setVendor(data);
    }
    
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
        <p className="text-sm font-medium text-brand-ebony/50 uppercase tracking-widest">Loading Profile...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader 
        title="Business Profile" 
        subtitle="Manage your marketplace presence and how couples discover your services." 
      />
      
      <form onSubmit={handleSave} className="space-y-8 mt-8">
        {/* 1. CORE INFO */}
        <Card className="p-8 border-brand-ebony/5 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-brand-gold/10 rounded-lg">
                <Store className="w-5 h-5 text-brand-gold" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-ebony">General Information</h3>
          </div>

          <div className="grid gap-6">
            <Input 
              label="Business Name" 
              placeholder="e.g. Elegant Events Catering" 
              value={vendor.business_name || ""} 
              onChange={e => setVendor(p => ({ ...p, business_name: e.target.value }))} 
              required 
            />

            <Select 
              label="Category" 
              value={vendor.category_id || ""} 
              onChange={e => setVendor(p => ({ ...p, category_id: e.target.value }))} 
              required
            >
              <option value="">Select your specialty…</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Textarea 
              label="Business Description" 
              placeholder="Tell your story. What makes your services unique for a wedding?" 
              rows={5} 
              value={vendor.description || ""} 
              onChange={e => setVendor(p => ({ ...p, description: e.target.value }))} 
            />
          </div>
        </Card>

        {/* 2. PRICING & LOGISTICS */}
        <Card className="p-8 border-brand-ebony/5 shadow-sm space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 bg-emerald-50 rounded-lg">
                <Banknote className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-serif text-xl font-bold text-brand-ebony">Pricing & Logistics</h3>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div className="relative">
                <Input 
                  label="Base Starting Price (TSH)" 
                  type="number" 
                  placeholder="e.g. 1500000" 
                  value={vendor.base_price || ""} 
                  onChange={e => setVendor(p => ({ ...p, base_price: Number(e.target.value) }))} 
                  required 
                />
                <span className="absolute right-3 top-[38px] text-[10px] font-bold text-brand-ebony/30 uppercase">TSH</span>
            </div>

            <Input 
              label="Years of Experience" 
              type="number" 
              placeholder="e.g. 5" 
              value={vendor.years_experience || ""} 
              onChange={e => setVendor(p => ({ ...p, years_experience: Number(e.target.value) }))} 
            />
          </div>

          <div className="relative">
            <Input 
              label="Primary Location" 
              placeholder="e.g. Dar es Salaam, Masaki" 
              value={vendor.location || ""} 
              onChange={e => setVendor(p => ({ ...p, location: e.target.value }))} 
            />
            <MapPin className="absolute right-3 top-[38px] w-4 h-4 text-brand-ebony/20" />
          </div>
        </Card>

        <div className="pt-4">
          <Button 
            type="submit" 
            disabled={saving}
            size="lg" 
            className="w-full bg-brand-tanzanite hover:bg-brand-tanzanite/90 text-white py-6 text-lg font-bold rounded-2xl shadow-xl shadow-brand-tanzanite/20 transition-all"
          >
            {saving ? (
                <span className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Saving...</span>
            ) : (
                vendor.id ? "Update Professional Profile" : "Create Professional Profile"
            )}
          </Button>
          
          {!vendor.id && (
            <div className="mt-4 p-4 bg-brand-gold/5 rounded-xl border border-brand-gold/10 flex items-start gap-3">
              <div className="text-brand-gold text-lg">✨</div>
              <p className="text-[11px] text-brand-ebony/60 leading-relaxed italic">
                <strong>Note:</strong> New profiles are reviewed by our team to ensure quality. 
                Your services will appear in the marketplace once approved (usually within 24 hours).
              </p>
            </div>
          )}
        </div>
      </form>
    </div>
  );
}