"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button, Input, Textarea, Card, Badge, Modal, SectionHeader, Empty } from "@/components/ui";
import { toast } from "sonner";
import type { Category } from "@/types";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [saving, setSaving] = useState(false);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("categories").select("*").order("sort_order");
    setCategories(data || []);
  }

  function openAdd() { setEditing({ name: "", slug: "", icon: "🎊", description: "", sort_order: categories.length + 1, is_active: true }); setModalOpen(true); }
  function openEdit(c: Category) { setEditing(c); setModalOpen(true); }

  async function handleSave() {
    if (!editing?.name || !editing.slug) { toast.error("Name and slug required"); return; }
    setSaving(true);
    const payload = { name: editing.name, slug: editing.slug.toLowerCase().replace(/\s+/g, "-"), icon: editing.icon || "🎊", description: editing.description || null, sort_order: editing.sort_order || 0, is_active: editing.is_active ?? true };
    if (editing.id) {
      const { error } = await supabase.from("categories").update(payload).eq("id", editing.id);
      if (error) toast.error(error.message); else toast.success("Category updated!");
    } else {
      const { error } = await supabase.from("categories").insert(payload);
      if (error) toast.error(error.message); else toast.success("Category created!");
    }
    setModalOpen(false); setEditing(null); load(); setSaving(false);
  }

  async function toggleActive(c: Category) {
    await supabase.from("categories").update({ is_active: !c.is_active }).eq("id", c.id);
    toast.success(c.is_active ? "Category hidden" : "Category shown");
    load();
  }

  return (
    <div className="max-w-3xl animate-fade-in">
      <SectionHeader
        title="Categories"
        subtitle="Manage vendor categories shown on the marketplace."
        action={<Button onClick={openAdd} size="sm">+ Add Category</Button>}
      />

      {!categories.length ? (
        <Empty icon="📂" title="No categories yet" action={<Button onClick={openAdd}>Add First Category</Button>} />
      ) : (
        <div className="space-y-3">
          {categories.map(c => (
            <Card key={c.id} className="p-5 flex items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-3xl">{c.icon}</span>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold text-harusi-dark">{c.name}</h4>
                    <Badge variant={c.is_active ? "success" : "default"} className="text-[10px]">{c.is_active ? "Active" : "Hidden"}</Badge>
                  </div>
                  <div className="text-xs text-harusi-muted mt-0.5">/{c.slug} · Sort: {c.sort_order}</div>
                  {c.description && <div className="text-xs text-stone-400 mt-0.5">{c.description}</div>}
                </div>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => toggleActive(c)} className="px-3 py-1.5 text-xs font-semibold border border-stone-200 rounded-lg hover:bg-stone-50 transition-all">{c.is_active ? "Hide" : "Show"}</button>
                <button onClick={() => openEdit(c)} className="px-3 py-1.5 text-xs font-semibold border border-stone-200 rounded-lg hover:bg-stone-50 transition-all">Edit</button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} title={editing?.id ? "Edit Category" : "Add Category"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input label="Icon (emoji)" placeholder="🎊" value={editing?.icon || ""} onChange={e => setEditing(p => ({ ...p, icon: e.target.value }))} />
            <Input label="Sort Order" type="number" value={editing?.sort_order || ""} onChange={e => setEditing(p => ({ ...p, sort_order: Number(e.target.value) }))} />
          </div>
          <Input label="Category Name" placeholder="e.g. Catering" value={editing?.name || ""} onChange={e => setEditing(p => ({ ...p, name: e.target.value, slug: p?.id ? p.slug : e.target.value.toLowerCase().replace(/\s+/g, "-") }))} required />
          <Input label="Slug (URL)" placeholder="e.g. catering" value={editing?.slug || ""} onChange={e => setEditing(p => ({ ...p, slug: e.target.value }))} required />
          <Textarea label="Description" placeholder="Brief description of this category" rows={2} value={editing?.description || ""} onChange={e => setEditing(p => ({ ...p, description: e.target.value }))} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleSave} loading={saving} className="flex-1">Save Category</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
