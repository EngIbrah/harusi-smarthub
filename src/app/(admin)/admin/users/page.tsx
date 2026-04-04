"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge, Card, SectionHeader, Input, Spinner, Select } from "@/components/ui";
import { toast } from "sonner";
import { 
  Users, 
  Search, 
  Calendar, 
  Phone, 
  UserCircle,
  ShieldAlert,
  UserCheck,
  ShoppingBag
} from "lucide-react";
import type { UserRole } from "@/types";

const ROLES: UserRole[] = ["couple", "vendor", "admin"];

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) toast.error("Failed to sync user records");
    else setUsers(data || []);
    setLoading(false);
  }, [supabase]);

  useEffect(() => { load(); }, [load]);

  async function updateRole(id: string, role: UserRole) {
    const { error } = await supabase.from("profiles").update({ role }).eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Access level changed to ${role}`);
      load();
    }
  }

  const filtered = users.filter(u => {
    const matchesRole = roleFilter === "all" ? true : u.role === roleFilter;
    const matchesSearch = (u.full_name || "").toLowerCase().includes(search.toLowerCase()) ||
                          (u.phone || "").includes(search);
    return matchesRole && matchesSearch;
  });

  const getRoleIcon = (role: UserRole) => {
    switch (role) {
      case "admin": return <ShieldAlert className="w-3 h-3" />;
      case "vendor": return <ShoppingBag className="w-3 h-3" />;
      default: return <UserCheck className="w-3 h-3" />;
    }
  };

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 space-y-8">
      <SectionHeader 
        title="User Authority" 
        subtitle="Manage global user permissions and account classification." 
      />

      {/* Modern Filter Bar */}
      <Card className="p-2 border-none bg-brand-cloud/40 shadow-none">
        <div className="flex flex-col md:flex-row gap-4 items-center">
          <div className="flex p-1.5 bg-white rounded-2xl shadow-sm border border-brand-ebony/5 w-full md:w-auto">
            {(["all", ...ROLES] as const).map(r => (
              <button 
                key={r} 
                onClick={() => setRoleFilter(r)}
                className={`flex-1 md:flex-none px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 ${
                  roleFilter === r 
                    ? "bg-brand-ebony text-white shadow-lg" 
                    : "text-brand-ebony/40 hover:text-brand-ebony hover:bg-brand-ebony/5"
                }`}
              >
                {r} <span className="ml-2 opacity-40 italic">{r === "all" ? users.length : users.filter(u => u.role === r).length}</span>
              </button>
            ))}
          </div>
          
          <div className="flex-1 w-full">
            <Input 
              placeholder="Filter by name or phone number..." 
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
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-ebony/20">Decrypting Profile Registry</p>
        </div>
      ) : (
        <Card className="border-none shadow-xl shadow-brand-ebony/5 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-brand-ebony text-[10px] font-black text-white/40 uppercase tracking-[0.2em]">
                  <th className="py-5 px-8">Identity</th>
                  <th className="py-5 px-6">Classification</th>
                  <th className="py-5 px-6">Contact Details</th>
                  <th className="py-5 px-6">Registration Date</th>
                  <th className="py-5 px-8 text-right">Access Level</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-ebony/5">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-24 text-center">
                      <div className="flex flex-col items-center opacity-20">
                        <Users className="w-12 h-12 mb-4" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-ebony">Registry segment empty</p>
                      </div>
                    </td>
                  </tr>
                ) : filtered.map(u => (
                  <tr key={u.id} className="group hover:bg-brand-cloud/40 transition-all duration-300">
                    <td className="py-5 px-8">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-brand-ebony flex items-center justify-center text-brand-gold font-black shadow-lg shadow-brand-ebony/10 group-hover:scale-110 transition-transform">
                          {(u.full_name || "?")[0].toUpperCase()}
                        </div>
                        <div>
                          <p className="font-bold text-brand-ebony leading-none mb-1">{u.full_name || "Anonymous User"}</p>
                          <p className="text-[9px] font-black text-brand-ebony/20 uppercase tracking-widest">ID: {u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <Badge variant={u.role === "admin" ? "danger" : u.role === "vendor" ? "gold" : "info"}>
                        <span className="flex items-center gap-1.5">
                          {getRoleIcon(u.role)}
                          {u.role}
                        </span>
                      </Badge>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2 text-xs font-bold text-brand-ebony/60">
                        <Phone className="w-3 h-3 text-brand-gold/50" />
                        <span className="tabular-nums">{u.phone || "—"}</span>
                      </div>
                    </td>
                    <td className="py-5 px-6">
                      <div className="flex items-center gap-2 text-[10px] font-black text-brand-ebony/30 uppercase tracking-tighter">
                        <Calendar className="w-3 h-3" />
                        {new Date(u.created_at).toLocaleDateString(undefined, { dateStyle: 'medium' })}
                      </div>
                    </td>
                    <td className="py-5 px-8 text-right">
                      <div className="inline-block min-w-[120px]">
                        <Select
                          value={u.role}
                          onChange={e => updateRole(u.id, e.target.value as UserRole)}
                          className="h-9 text-[10px] font-black uppercase tracking-widest py-1 bg-white"
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </Select>
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