import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(_req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();
  if (profile?.role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const [
    { count: couples },
    { count: vendors },
    { count: pendingVendors },
    { count: bookings },
    { count: confirmedBookings },
    { count: activePlans },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("role", "couple"),
    supabase.from("vendors").select("*", { count: "exact", head: true }),
    supabase.from("vendors").select("*", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("bookings").select("*", { count: "exact", head: true }),
    supabase.from("bookings").select("*", { count: "exact", head: true }).in("status", ["confirmed", "completed"]),
    supabase.from("wedding_plans").select("*", { count: "exact", head: true }).eq("is_active", true),
    supabase.from("bookings")
      .select("*, vendor:vendors(business_name), couple:profiles(full_name)")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  return NextResponse.json({
    stats: {
      couples: couples || 0,
      vendors: vendors || 0,
      pendingVendors: pendingVendors || 0,
      bookings: bookings || 0,
      confirmedBookings: confirmedBookings || 0,
      activePlans: activePlans || 0,
    },
    recentActivity,
  });
}
