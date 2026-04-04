import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateBudget } from "@/lib/utils";

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { budget, guestCount } = await request.json();
    if (!budget || isNaN(budget)) {
      return NextResponse.json({ error: "Valid budget required" }, { status: 400 });
    }

    // Smart allocation adjusted by guest count
    const guestMultiplier = guestCount > 300 ? 1.2 : guestCount > 150 ? 1.0 : 0.85;
    const adjustedBudget = Number(budget) * guestMultiplier;
    const allocation = generateBudget(adjustedBudget);

    // Get recommended vendors for each category
    const { data: vendors } = await supabase
      .from("vendors")
      .select("*, category:categories(*)")
      .eq("status", "active")
      .order("rating_avg", { ascending: false })
      .limit(20);

    const recommendations: Record<string, any[]> = {};
    if (vendors) {
      for (const v of vendors) {
        const cat = v.category?.slug || "other";
        if (!recommendations[cat]) recommendations[cat] = [];
        if (recommendations[cat].length < 3) {
          recommendations[cat].push({ id: v.id, name: v.business_name, price: v.base_price, rating: v.rating_avg });
        }
      }
    }

    return NextResponse.json({ allocation, recommendations, guestMultiplier });
  } catch (error) {
    console.error("Budget generation error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
