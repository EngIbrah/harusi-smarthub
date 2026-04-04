import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single();

  let query = supabase.from("bookings").select("*, vendor:vendors(*, category:categories(*)), couple:profiles(*)").order("created_at", { ascending: false });

  if (profile?.role === "couple") query = query.eq("couple_id", user.id);
  else if (profile?.role === "vendor") {
    const { data: v } = await supabase.from("vendors").select("id").eq("profile_id", user.id).single();
    if (v) query = query.eq("vendor_id", v.id);
  }

  const { data, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ bookings: data });
}

export async function POST(req: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { data, error } = await supabase
    .from("bookings")
    .insert({ ...body, couple_id: user.id })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ booking: data }, { status: 201 });
}
