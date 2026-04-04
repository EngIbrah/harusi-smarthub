import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");
    const q        = searchParams.get("q");
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const limit    = parseInt(searchParams.get("limit") || "50");

    let query = supabase
      .from("vendors")
      .select("*, category:categories(*)")
      .eq("status", "active")
      .order("rating_avg", { ascending: false })
      .limit(limit);

    if (category && category !== "all") query = query.eq("category_id", category);
    if (q)        query = query.ilike("business_name", `%${q}%`);
    if (minPrice) query = query.gte("base_price", Number(minPrice));
    if (maxPrice) query = query.lte("base_price", Number(maxPrice));

    const { data, error } = await query;
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    return NextResponse.json({ vendors: data });
  } catch {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
