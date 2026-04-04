"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { 
  Button, 
  Input, 
  Textarea, 
  Card, 
  Badge, 
  Modal, 
  SectionHeader, 
  Empty,
  Spinner 
} from "@/components/ui";
import { toast } from "sonner";
import { 
  Edit3, 
  Eye, 
  EyeOff, 
  Plus, 
  Hash, 
  Layers,
  ArrowRight
} from "lucide-react";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  function openAdd() { 
    setEditing({ 
      name: "", 
      slug: "", 
      icon: "✨", 
      description: "", 
      sort_order: categories.length + 1, 
      is_active: true 
    }); 
    setModalOpen(true); 
  }

  function openEdit(c: Category) { 
    setEditing(c); 
    setModalOpen(true); 
  }

  async function handleSave() {
    if (!editing?.name || !editing.slug) { 
      toast.error("Name and slug are mandatory"); 
      return; 
    }
    
    setSaving(true);
    const payload = { 
      name: editing.name, 
      slug: editing.slug.toLowerCase().replace(/\s+/g, "-"), 
      icon: editing.icon || "✨", 
      description: editing.description || null, 
      sort_order: editing.sort_order || 0, 
      is_active: editing.is_active ?? true 
    };

    const { error } = editing.id 
      ? await supabase.from("categories").update(payload).eq("id", editing.id)
      : await supabase.from("categories").insert(payload);

    if (error) {
      toast.error(error.message);
    } else {
      toast.success(editing.id ? "Classification Updated" : "New Category Registered");
      setModalOpen(false);
      setEditing(null);
      load();
    }
    setSaving(false);
  }

  async function toggleActive(c: Category) {
    const { error } = await supabase.from("categories").update({ is_active: !c.is_active }).eq("id", c.id);
    if (!error) {
      toast.success(c.is_active ? "Category Hidden" : "Category Visible");
      load();
    }
  }

  return (
    <div className="max-w-4xl animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      <SectionHeader
        title="Marketplace Taxonomy"
        subtitle="Organize services into discoverable categories for couples."
        action={
          <Button onClick={openAdd} size="sm" className="rounded-xl">
            <Plus className="w-4 h-4 mr-2" /> New Category
          </Button>
        }
      />

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 space-y-4">
          <Spinner size="lg" className="text-brand-gold" />
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-ebony/20">Structuring Data</p>
        </div>
      ) : !categories.length ? (
        <Empty 
          icon={<Layers className="w-12 h-12" />} 
          title="No Categories Defined" 
          description="Categories are the backbone of your marketplace search."
          action={<Button onClick={openAdd}>Create First Entry</Button>} 
        />
      ) : (
        <div className="grid gap-3">
          {categories.map(c => (
            <Card key={c.id} className="p-2 border-none bg-white shadow-sm hover:shadow-md transition-all group overflow-hidden">
              <div className="flex items-center justify-between gap-4 p-3">
                <div className="flex items-center gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-brand-cloud flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-500">
                    {c.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h4 className="font-bold text-brand-ebony">{c.name}</h4>
                      <Badge variant={c.is_active ? "success" : "default"} className="text-[9px] uppercase tracking-tighter h-5">
                        {c.is_active ? "Live" : "Archived"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] font-black text-brand-ebony/30 uppercase tracking-widest">
                      <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {c.slug}</span>
                      <span className="w-1 h-1 rounded-full bg-brand-gold" />
                      <span>Order: {c.sort_order}</span>
                    </div>
                    {c.description && <p className="text-xs text-brand-ebony/50 mt-1 line-clamp-1">{c.description}</p>}
                  </div>
                </div>

                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleActive(c)} 
                    className="h-9 px-3 text-brand-ebony/60 hover:text-brand-ebony rounded-xl"
                  >
                    {c.is_active ? <EyeOff className="w-4 h-4 mr-2" /> : <Eye className="w-4 h-4 mr-2" />}
                    {c.is_active ? "Hide" : "Publish"}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => openEdit(c)} 
                    className="h-9 px-3 rounded-xl border-brand-ebony/5 text-brand-ebony hover:bg-brand-cloud"
                  >
                    <Edit3 className="w-4 h-4 mr-2" /> Edit
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal for Add/Edit */}
      <Modal 
        open={modalOpen} 
        onClose={() => { setModalOpen(false); setEditing(null); }} 
        title={editing?.id ? "Refine Category" : "Establish New Category"}
      >
        <div className="space-y-6 pt-2">
          <div className="grid grid-cols-2 gap-5">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-ebony/40 ml-1">Icon Representation</label>
              <Input 
                placeholder="🎉" 
                value={editing?.icon || ""} 
                onChange={e => setEditing(p => ({ ...p, icon: e.target.value }))} 
                className="text-2xl text-center h-14 bg-brand-cloud/50 border-none rounded-2xl"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-ebony/40 ml-1">Display Priority</label>
              <Input 
                type="number" 
                value={editing?.sort_order || ""} 
                onChange={e => setEditing(p => ({ ...p, sort_order: Number(e.target.value) }))}
                className="h-14 bg-brand-cloud/50 border-none rounded-2xl font-serif font-black text-xl"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-ebony/40 ml-1">Official Name</label>
            <Input 
              placeholder="e.g. Luxury Catering" 
              value={editing?.name || ""} 
              onChange={e => {
                const name = e.target.value;
                setEditing(p => ({ 
                  ...p, 
                  name, 
                  slug: p?.id ? p.slug : name.toLowerCase().replace(/\s+/g, "-") 
                }));
              }} 
              required 
              className="h-14 bg-brand-cloud/50 border-none rounded-2xl font-bold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-ebony/40 ml-1">URL Semantic Slug</label>
            <Input 
              placeholder="e.g. luxury-catering" 
              value={editing?.slug || ""} 
              onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))} 
              required 
              className="h-14 bg-brand-cloud/50 border-none rounded-2xl font-mono text-xs text-brand-gold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-brand-ebony/40 ml-1">Category Narrative</label>
            <Textarea 
              placeholder="Provide a brief summary for this category..." 
              rows={3} 
              value={editing?.description || ""} 
              onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} 
              className="bg-brand-cloud/50 border-none rounded-2xl p-4"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px]">
              Discard
            </Button>
            <Button onClick={handleSave} loading={saving} className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-brand-gold/20">
              Save Configuration <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}