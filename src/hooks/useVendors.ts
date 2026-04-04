"use client";
import { useState, useEffect, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { Vendor } from "@/types";

interface UseVendorsOptions {
  categorySlug?: string;
  search?: string;
  limit?: number;
  autoLoad?: boolean;
}

export function useVendors({ categorySlug, search, limit = 50, autoLoad = true }: UseVendorsOptions = {}) {
  const [vendors, setVendors]   = useState<Vendor[]>([]);
  const [loading, setLoading]   = useState(autoLoad);
  const [error, setError]       = useState<string | null>(null);
  const supabase = createClient();

  const load = useCallback(async (opts?: UseVendorsOptions) => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("vendors")
        .select("*, category:categories(*)")
        .eq("status", "active")
        .order("rating_avg", { ascending: false })
        .limit(opts?.limit ?? limit);

      const cat = opts?.categorySlug ?? categorySlug;
      const q   = opts?.search ?? search;
      if (cat && cat !== "all") {
        const { data: catData } = await supabase.from("categories").select("id").eq("slug", cat).single();
        if (catData) query = query.eq("category_id", catData.id);
      }
      if (q) query = query.ilike("business_name", `%${q}%`);

      const { data, error: err } = await query;
      if (err) throw err;
      setVendors(data || []);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, [categorySlug, search, limit]);

  useEffect(() => { if (autoLoad) load(); }, [categorySlug, search]);

  return { vendors, loading, error, reload: load };
}
