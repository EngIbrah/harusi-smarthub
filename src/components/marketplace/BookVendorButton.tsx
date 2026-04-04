"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button, Modal, Input, Textarea } from "@/components/ui";
import { toast } from "sonner";

interface Props { vendorId: string; vendorName: string; basePrice: number; }

export default function BookVendorButton({ vendorId, vendorName, basePrice }: Props) {
  const [open, setOpen] = useState(false);
  const [eventDate, setEventDate] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleBook() {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push("/login"); return; }

    // Get or create active plan
    let { data: plan } = await supabase
      .from("wedding_plans")
      .select("id")
      .eq("couple_id", user.id)
      .eq("is_active", true)
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (!plan) {
      const { data: newPlan } = await supabase
        .from("wedding_plans")
        .insert({ couple_id: user.id, title: "My Wedding", total_budget: 0, mode: "manual" })
        .select()
        .single();
      plan = newPlan;
    }

    if (!plan) { toast.error("Could not create plan."); setLoading(false); return; }

    const { error } = await supabase.from("bookings").insert({
      plan_id: plan.id,
      vendor_id: vendorId,
      couple_id: user.id,
      agreed_price: basePrice,
      event_date: eventDate || null,
      notes: notes || null,
      status: "pending",
    });

    if (error) {
      toast.error("Booking failed. This vendor may already be booked.");
    } else {
      toast.success(`Booking request sent to ${vendorName}!`);
      setOpen(false);
      router.push("/bookings");
    }
    setLoading(false);
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="w-full py-3.5 bg-gradient-to-r from-amber-400 to-amber-600 text-white rounded-xl font-bold text-sm shadow-lg shadow-amber-500/20 hover:from-amber-500 hover:to-amber-700 transition-all"
      >
        Book This Vendor
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title={`Book ${vendorName}`}>
        <div className="space-y-4">
          <p className="text-sm text-harusi-muted">Send a booking request. The vendor will confirm availability.</p>
          <Input label="Wedding Date (optional)" type="date" value={eventDate} onChange={e => setEventDate(e.target.value)} />
          <Textarea label="Notes (optional)" placeholder="Any special requirements or questions..." rows={3} value={notes} onChange={e => setNotes(e.target.value)} />
          <div className="flex gap-3 pt-2">
            <Button variant="ghost" onClick={() => setOpen(false)} className="flex-1">Cancel</Button>
            <Button onClick={handleBook} loading={loading} className="flex-1">Send Request</Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
