"use client";
import { useState, useCallback } from "react";
import type { Vendor, BudgetAllocation } from "@/types";
import { generateBudget } from "@/lib/utils";

export function useBudget(initialBudget = 0) {
  const [budget, setBudget]       = useState(initialBudget);
  const [selected, setSelected]   = useState<Vendor[]>([]);
  const [allocation, setAllocation] = useState<BudgetAllocation | null>(null);

  const totalCost  = selected.reduce((s, v) => s + v.base_price, 0);
  const remaining  = budget - totalCost;
  const isOver     = remaining < 0 && budget > 0;
  const pct        = budget > 0 ? Math.min(100, Math.round((totalCost / budget) * 100)) : 0;

  const toggleVendor = useCallback((vendor: Vendor) => {
    setSelected(prev =>
      prev.find(v => v.id === vendor.id)
        ? prev.filter(v => v.id !== vendor.id)
        : [...prev, vendor]
    );
  }, []);

  const generateAllocation = useCallback((total: number) => {
    const alloc = generateBudget(total);
    setAllocation(alloc);
    return alloc;
  }, []);

  const reset = useCallback(() => {
    setSelected([]);
    setAllocation(null);
  }, []);

  return { budget, setBudget, selected, setSelected, allocation, setAllocation, totalCost, remaining, isOver, pct, toggleVendor, generateAllocation, reset };
}
