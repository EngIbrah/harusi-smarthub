"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge, SectionHeader } from "@/components/ui";
import { toast } from "sonner";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = ["couple", "vendor", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data } = await supabase.from("profiles").select("*").order("created_at", { ascending: false });
    setUsers(data || []);
    setLoading(false);
  }

  async function updateRole(id: string, role: UserRole) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Role updated"); load(); }
  }

  const filtered = users.filter(u => {
    if (roleFilter !== "all" && u.role !== roleFilter) return false;
    if (search && !(u.full_name || "").toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const roleVariant = (role: UserRole) => role === "admin" ? "danger" as const : role === "vendor" ? "info" as const : "success" as const;

  return (
    <div className="animate-fade-in">
      <SectionHeader title="User Management" subtitle="Manage all registered users and their roles." />

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-stone-100 rounded-xl p-1">
          {(["all", ...ROLES] as const).map(r => (
            <button key={r} onClick={() => setRoleFilter(r)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold capitalize transition-all ${roleFilter === r ? "bg-white text-harusi-dark shadow-sm" : "text-harusi-muted hover:text-harusi-dark"}`}>
              {r} ({r === "all" ? users.length : users.filter(u => u.role === r).length})
            </button>
          ))}
        </div>
        <input
          placeholder="Search by name…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="flex-1 px-4 py-2 rounded-xl border border-stone-200 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400"
        />
      </div>

      <div className="bg-white rounded-2xl border border-stone-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-stone-100 bg-stone-50/50">
              <tr>
                {["User", "Role", "Phone", "Joined", "Actions"].map(h => (
                  <th key={h} className="text-left py-3 px-4 text-xs font-semibold text-harusi-muted uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="text-center py-12"><div className="inline-block animate-spin rounded-full border-2 border-amber-400 border-t-transparent w-6 h-6" /></td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="text-center py-12 text-harusi-muted text-sm">No users found.</td></tr>
              ) : filtered.map(u => (
                <tr key={u.id} className="border-b border-stone-50 hover:bg-stone-50/50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {(u.full_name || "?")[0].toUpperCase()}
                      </div>
                      <span className="font-medium text-harusi-dark">{u.full_name || "—"}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={roleVariant(u.role)} className="text-[10px] capitalize">{u.role}</Badge>
                  </td>
                  <td className="py-3 px-4 text-stone-400 text-xs">{u.phone || "—"}</td>
                  <td className="py-3 px-4 text-stone-400 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <select
                      value={u.role}
                      onChange={e => updateRole(u.id, e.target.value as UserRole)}
                      className="text-xs border border-stone-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer"
                    >
                      {ROLES.map(r => <option key={r} value={r} className="capitalize">{r}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
