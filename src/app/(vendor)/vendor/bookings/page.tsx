"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { Badge, Card, SectionHeader, Empty, Button } from "@/components/ui";
import { formatTSH, cn } from "@/lib/utils";
import { toast } from "sonner";
import { 
  Calendar, 
  Users, 
  Phone, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  MoreHorizontal,
  Loader2,
  MessageCircle
} from "lucide-react";
import type { Booking, BookingStatus } from "@/types";

const TABS: { key: BookingStatus | "all"; label: string }[] = [
  { key: "all",       label: "All" },
  { key: "pending",   label: "Pending" },
  { key: "confirmed", label: "Confirmed" },
  { key: "completed", label: "Completed" },
  { key: "cancelled", label: "Cancelled" },
];

const STATUS_CONFIG = {
  pending:   { variant: "warning" as const, icon: <Clock className="w-3 h-3" /> },
  confirmed: { variant: "success" as const, icon: <CheckCircle2 className="w-3 h-3" /> },
  completed: { variant: "info"    as const, icon: <CheckCircle2 className="w-3 h-3" /> },
  cancelled: { variant: "danger"  as const, icon: <XCircle className="w-3 h-3" /> },
};

export default function VendorBookingsPage() {
  const [bookings, setBookings] = useState<any[]>([]);
  const [tab, setTab] = useState<BookingStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => { load(); }, []);

  async function load() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    
    const { data: vendor } = await supabase.from("vendors").select("id").eq("profile_id", user.id).maybeSingle();
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
    if (status === "cancelled" && !confirm("Are you sure you want to decline this booking?")) return;
    
    setUpdatingId(id);
    const { error } = await supabase.from("bookings").update({ status }).eq("id", id);
    
    if (error) {
      toast.error(error.message);
    } else {
      toast.success(`Booking ${status} successfully`);
      load();
    }
    setUpdatingId(null);
  }

  const visible = tab === "all" ? bookings : bookings.filter(b => b.status === tab);

  if (loading) return (
    <div className="flex flex-col items-center justify-center py-24 space-y-4">
      <Loader2 className="w-10 h-10 animate-spin text-brand-gold" />
      <p className="text-sm font-bold text-brand-ebony/40 uppercase tracking-widest">Fetching Requests...</p>
    </div>
  );

  return (
    <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
      <SectionHeader 
        title="Booking Requests" 
        subtitle="Review and manage your wedding service inquiries." 
      />

      {/* Modern Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-8 no-scrollbar">
        {TABS.map(t => (
          <button 
            key={t.key} 
            onClick={() => setTab(t.key)}
            className={cn(
              "px-5 py-2.5 rounded-2xl text-xs font-bold transition-all whitespace-nowrap uppercase tracking-wider flex items-center gap-2 border",
              tab === t.key 
                ? "bg-brand-ebony border-brand-ebony text-white shadow-lg shadow-brand-ebony/20" 
                : "bg-white border-brand-ebony/5 text-brand-ebony/50 hover:border-brand-gold/30 hover:text-brand-ebony"
            )}
          >
            {t.label}
            <span className={cn(
              "px-2 py-0.5 rounded-full text-[10px]",
              tab === t.key ? "bg-white/20 text-white" : "bg-brand-cloud text-brand-ebony/40"
            )}>
              {bookings.filter(b => t.key === 'all' ? true : b.status === t.key).length}
            </span>
          </button>
        ))}
      </div>

      {!visible.length ? (
        <Empty 
          icon={<Calendar className="w-12 h-12 text-brand-ebony/10" />} 
          title="No bookings found" 
          description={tab === "all" ? "You haven't received any booking requests yet." : `There are no ${tab} requests right now.`} 
        />
      ) : (
        <div className="grid gap-6">
          {visible.map(b => {
            const cfg = STATUS_CONFIG[b.status as BookingStatus];
            const isUpdating = updatingId === b.id;

            return (
              <Card key={b.id} className="p-0 overflow-hidden border-brand-ebony/5 hover:shadow-xl hover:shadow-brand-ebony/5 transition-all">
                <div className="flex flex-col lg:flex-row">
                  {/* Status Sidebar (Desktop) / Header (Mobile) */}
                  <div className={cn(
                    "w-full lg:w-2 bg-stone-100",
                    b.status === 'pending' && "bg-amber-400",
                    b.status === 'confirmed' && "bg-emerald-500",
                    b.status === 'completed' && "bg-brand-tanzanite",
                    b.status === 'cancelled' && "bg-red-400"
                  )} />
                  
                  <div className="p-6 flex-1 flex flex-col md:flex-row gap-6">
                    {/* Couple Avatar & Info */}
                    <div className="flex items-start gap-4 flex-1">
                      <div className="w-14 h-14 rounded-2xl bg-brand-cloud flex items-center justify-center text-brand-tanzanite font-black text-xl border border-brand-ebony/5 shrink-0">
                        {b.couple?.full_name?.[0]?.toUpperCase() || "C"}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-brand-ebony text-lg truncate">{b.couple?.full_name || "Wedding Client"}</h4>
                          <Badge variant={cfg.variant} className="rounded-full px-2 py-0 text-[9px] font-black uppercase flex items-center gap-1">
                            {cfg.icon} {b.status}
                          </Badge>
                        </div>
                        <p className="text-xs font-medium text-brand-ebony/40 mb-3 flex items-center gap-1.5">
                          <Phone className="w-3 h-3" /> {b.couple?.phone || "No contact provided"}
                        </p>
                        
                        {/* Event Metadata */}
                        <div className="flex flex-wrap gap-4 py-3 border-y border-brand-ebony/5">
                          <div className="flex items-center gap-2 text-xs font-bold text-brand-ebony/70">
                            <Calendar className="w-3.5 h-3.5 text-brand-gold" />
                            {b.event_date ? new Date(b.event_date).toLocaleDateString("en-TZ", { month: 'short', day: 'numeric', year: 'numeric' }) : "Date TBD"}
                          </div>
                          {b.plan?.guest_count && (
                            <div className="flex items-center gap-2 text-xs font-bold text-brand-ebony/70">
                              <Users className="w-3.5 h-3.5 text-brand-gold" />
                              {b.plan.guest_count} Guests
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-xs font-bold text-brand-ebony/70">
                             <Clock className="w-3.5 h-3.5 text-brand-gold" />
                             Sent {new Date(b.created_at).toLocaleDateString()}
                          </div>
                        </div>

                        {b.notes && (
                          <div className="mt-4 p-3 bg-brand-cloud/50 rounded-xl">
                            <p className="text-[11px] text-brand-ebony/60 leading-relaxed italic italic">
                              "{b.notes}"
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Pricing & Actions */}
                    <div className="flex flex-col justify-between items-end gap-6 min-w-[180px]">
                      <div className="text-right">
                        <p className="text-[10px] font-black uppercase tracking-widest text-brand-ebony/30 mb-1">Agreed Price</p>
                        <div className="font-serif font-black text-2xl text-brand-tanzanite tabular-nums">
                          {formatTSH(b.agreed_price || 0)}
                        </div>
                      </div>

                      <div className="flex flex-wrap justify-end gap-2 w-full">
                        {b.status === "pending" && (
                          <>
                            <Button 
                              size="sm" 
                              onClick={() => updateStatus(b.id, "confirmed")} 
                              disabled={!!isUpdating}
                              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-bold flex-1 md:flex-none"
                            >
                              Confirm
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost" 
                              onClick={() => updateStatus(b.id, "cancelled")}
                              disabled={!!isUpdating}
                              className="text-red-500 hover:bg-red-50 rounded-xl font-bold flex-1 md:flex-none"
                            >
                              Decline
                            </Button>
                          </>
                        )}
                        
                        {b.status === "confirmed" && (
                          <Button 
                            size="sm" 
                            onClick={() => updateStatus(b.id, "completed")}
                            disabled={!!isUpdating}
                            className="bg-brand-tanzanite text-white rounded-xl font-bold w-full"
                          >
                            Mark Completed
                          </Button>
                        )}

                        {/* Communication Shortcut */}
                        {b.couple?.phone && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            className="rounded-xl border-brand-ebony/10 text-brand-ebony font-bold flex items-center gap-2 w-full md:w-auto"
                            asChild
                          >
                            <a href={`https://wa.me/${b.couple.phone.replace(/\D/g,'')}`} target="_blank" rel="noopener noreferrer">
                              <MessageCircle className="w-4 h-4 text-emerald-500" /> WhatsApp
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
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