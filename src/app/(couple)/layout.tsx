import Navbar from "@/components/layout/Navbar";
import { Gem } from "lucide-react";

export default function CoupleLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-brand-cloud relative overflow-hidden">
      {/* 1. BRANDED BACKGROUND ELEMENTS */}
      {/* Subtle Tanzanite glow in the top-right */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-brand-tanzanite/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 pointer-events-none" />
      
      {/* Subtle Gold glow in the bottom-left */}
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-brand-gold/5 blur-[100px] rounded-full translate-y-1/4 -translate-x-1/4 pointer-events-none" />

      {/* 2. NAVIGATION */}
      <Navbar />

      {/* 3. MAIN CONTENT AREA */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* DASHBOARD HEADER DECOR (Optional but adds class) */}
        <div className="flex items-center gap-2 mb-8 opacity-20">
          <Gem className="w-5 h-5 text-brand-ebony" />
          <div className="h-px flex-1 bg-gradient-to-r from-brand-ebony to-transparent" />
        </div>

        {/* PAGE CONTENT */}
        <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
          {children}
        </div>
      </main>

      {/* 4. FOOTER / STATUS BAR (Optional) */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        <div className="pt-8 border-t border-brand-ebony/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-[10px] font-bold text-brand-ebony/30 uppercase tracking-[0.2em]">
            Harusi SmartHub Dashboard 🇹🇿
          </p>
          <div className="flex items-center gap-6">
            <span className="text-[10px] font-bold text-brand-tanzanite uppercase tracking-widest cursor-help hover:opacity-100 transition-opacity">
              Planning Guide
            </span>
            <span className="text-[10px] font-bold text-brand-ebony/30 uppercase tracking-widest cursor-help">
              Support
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}