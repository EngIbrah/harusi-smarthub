"use client";
import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge, Card, SectionHeader, Empty } from "@/components/ui";
import { formatTSH } from "@/lib/utils";
import { toast } from "sonner";
import type { Booking, BookingStatus } from "@/types";

const TABS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_CONFIG = {
  pending:   { variant: "warning" as const },
  confirmed: { variant: "success" as const },
  completed: { variant: "info"    as const },
  cancelled: { variant: "danger"  as const },
};

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [tab, setTab] = useState<BookingStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { data: vendor } = await supabase.from("vendors").select("id").eq("profile_id", user.id).single();
    if (!vendor) { setLoading(false); return; }
    const { data } = await supabase
      .from("bookings")
      .select("*, couple:profiles(*), plan:wedding_plans(*)")
      .eq("vendor_id", vendor.id)
      .order("created_at", { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }

  async function updateStatus(id: string, status: BookingStatus) {
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success(`Booking ${status}`); load(); }
  }

  const visible = tab === "all" ? bookings : bookings.filter(b => b.status === tab);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full border-2 border-amber-400 border-t-transparent w-8 h-8" /></div>;

  return (
    <div className="animate-fade-in">
      <SectionHeader title="Booking Requests" subtitle="Manage incoming requests from couples." />

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-6">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all whitespace-nowrap ${tab === t.key ? "bg-harusi-dark text-white" : "bg-white border border-stone-200 text-harusi-muted hover:border-stone-300"}`}>
            {t.label}
            {t.key !== "all" && (
              <span className="ml-1.5 text-xs opacity-60">({bookings.filter(b => b.status === t.key).length})</span>
            )}
          </button>
        ))}
      </div>

      {!visible.length ? (
        <Empty icon="📋" title="No bookings here" description="Bookings matching this status will appear here." />
      ) : (
        <div className="space-y-4">
          {visible.map(b => {
            const cfg = STATUS_CONFIG[b.status as BookingStatus];
            return (
              <Card key={b.id} className="p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {b.couple?.full_name?.[0]?.toUpperCase() || "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3 flex-wrap">
                      <div>
                        <h4 className="font-semibold text-harusi-dark">{b.couple?.full_name || "Anonymous Couple"}</h4>
                        <p className="text-xs text-harusi-muted mt-0.5">{b.couple?.phone || b.couple?.email || "No contact info"}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="font-serif font-bold text-amber-700 tabular-nums">{formatTSH(b.agreed_price || 0)}</div>
                        <Badge variant={cfg.variant} className="mt-1 text-[10px]">{b.status}</Badge>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-3 mt-2 text-xs text-stone-400">
                      {b.event_date && <span>📅 {new Date(b.event_date).toLocaleDateString("en-TZ", { dateStyle: "medium" })}</span>}
                      {b.plan?.guest_count && <span>👥 {b.plan.guest_count} guests</span>}
                      <span>📨 {new Date(b.created_at).toLocaleDateString()}</span>
                    </div>
                    {b.notes && <p className="text-xs text-stone-500 mt-2 bg-stone-50 rounded-lg p-2.5 italic">"{b.notes}"</p>}

                    {b.status === "pending" && (
                      <div className="flex gap-2 mt-3">
                        <button onClick={() => updateStatus(b.id, "confirmed")} className="px-4 py-1.5 bg-emerald-500 text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-all">✓ Confirm</button>
                        <button onClick={() => updateStatus(b.id, "cancelled")} className="px-4 py-1.5 bg-red-100 text-red-600 text-xs font-bold rounded-lg hover:bg-red-200 transition-all">✕ Decline</button>
                      </div>
                    )}
                    {b.status === "confirmed" && (
                      <button onClick={() => updateStatus(b.id, "completed")} className="mt-3 px-4 py-1.5 bg-blue-500 text-white text-xs font-bold rounded-lg hover:bg-blue-600 transition-all">Mark as Completed</button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
