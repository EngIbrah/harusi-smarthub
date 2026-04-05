import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // 1. Auth Check
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { budget, guestCount, priority, weddingDate } = await request.json();

    // 2. Fetch Active Vendors
    const { data: vendors, error: dbError } = await supabase
      .from("vendors")
      .select(`
        id, 
        business_name, 
        base_price, 
        rating_avg, 
        location, 
        categories(name)
      `)
      .eq("status", "active")
      .order("rating_avg", { ascending: false });

    if (dbError) throw dbError;

    // 3. Prepare Context for AI
    const validVendors = vendors || [];
    const avgPrice = validVendors.length > 0 
      ? validVendors.reduce((acc, v) => acc + (v.base_price || 0), 0) / validVendors.length 
      : 5000000;
    
    // Flatten vendor data so Gemini doesn't get confused by nested objects
    const vendorContext = validVendors.slice(0, 20).map(v => ({
      id: v.id,
      name: v.business_name,
      price: v.base_price,
      rating: v.rating_avg,
      category: Array.isArray(v.categories) ? v.categories[0]?.name : (v.categories as any)?.name
    }));

    // 4. Initialize Gemini (Using Flash for Free Tier Stability)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.5-flash", 
      generationConfig: { responseMimeType: "application/json" }
    });
    
    const prompt = `
      You are an elite Tanzanian Wedding Strategist for 'Harusi SmartHub'. 
      User Context:
      - Budget: TSh ${budget}
      - Guests: ${guestCount}
      - Priority: ${priority}
      - Date: ${weddingDate || 'Not specified'}
      - Market Average: TSh ${avgPrice.toLocaleString()}
      
      Available Inventory: ${JSON.stringify(vendorContext)}

      Task:
      1. Create a detailed budget allocation.
      2. Analyze if this budget is 'Luxury', 'Mid-range', or 'Budget-friendly' for ${guestCount} guests in Tanzania.
      3. Recommend 3 Vendor IDs from the inventory that fit the budget and priority.
      4. Provide a 'Savings Insight' and a 'Strategy Tip' (mentioning Send-offs, Kitchen Parties, or crate management).

      Return ONLY this JSON structure:
      {
        "allocation": { "venue": 0, "catering": 0, "decor": 0, "photography": 0, "attire": 0, "other": 0 },
        "recommended_ids": ["uuid"],
        "market_analysis": "string",
        "savings_insight": "string",
        "strategy_tip": "string"
      }
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // 5. Robust JSON Parsing
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("AI failed to return valid JSON");
    
    const aiResponse = JSON.parse(jsonMatch[0]);
    return NextResponse.json(aiResponse);

  } catch (error: any) {
    console.error("AI Strategy Error:", error);
    
    // Specific handling for the 429 Rate Limit error
    if (error.status === 429) {
      return NextResponse.json(
        { error: "AI is busy. Please wait 30 seconds." }, 
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || "Failed to generate strategy" }, 
      { status: 500 }
    );
  }
}