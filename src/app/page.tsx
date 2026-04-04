"use client";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { WEDDING_IMAGES } from "@/lib/utils";
import { 
  Sparkles, 
  Store, 
  Bot, 
  ShieldCheck, 
  BarChart3, 
  ArrowRight, 
  Gem,
  MapPin
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-brand-cloud selection:bg-brand-tanzanite/10">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative min-h-[95vh] flex items-center overflow-hidden bg-brand-ebony">
        {/* Background collage with softer overlay */}
        <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 grid-rows-2 opacity-30">
          {WEDDING_IMAGES.slice(0, 8).map((src, i) => (
            <div key={i} className="relative overflow-hidden border-[0.5px] border-white/5">
              <Image 
                src={src} 
                alt="" 
                fill 
                className="object-cover grayscale-[20%] hover:grayscale-0 transition-all duration-700" 
                sizes="(max-width: 768px) 50vw, 25vw" 
              />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-brand-ebony/60 via-brand-ebony/90 to-brand-ebony" />

        {/* Brand Accent: Decorative Tanzanite Rings */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full pointer-events-none overflow-hidden">
          {[1, 2, 3].map((i) => (
            <div 
              key={i} 
              className="absolute rounded-full border border-brand-tanzanite/10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{ 
                width: `${300 + i * 200}px`, 
                height: `${300 + i * 200}px`,
                animation: `pulseSoft ${3 + i}s ease-in-out infinite` 
              }}
            />
          ))}
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-6 pt-20 text-center">
          {/* Refined Pill Badge */}
          <div className="inline-flex items-center gap-2 bg-white/5 backdrop-blur-md border border-white/10 rounded-full px-4 py-1.5 mb-8 animate-fade-in">
            <Gem className="w-3.5 h-3.5 text-brand-gold" />
            <span className="text-white/80 text-[10px] font-semibold tracking-[0.2em] uppercase">
              Tanzania's Premier Wedding Ecosystem
            </span>
          </div>

          <h1 className="font-serif leading-[0.9] mb-6 animate-fade-up">
            <span className="block text-5xl sm:text-7xl lg:text-9xl font-bold text-white tracking-tighter">
              Harusi
            </span>
            <span className="block text-5xl sm:text-7xl lg:text-9xl font-light text-gradient-gold tracking-tighter">
              SmartHub
            </span>
          </h1>

          <p className="text-white/60 text-base sm:text-lg lg:text-xl font-light max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-up [animation-delay:200ms]">
            Experience the art of effortless planning. From AI-guided budgeting to a curated marketplace of verified Tanzanian vendors.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-up [animation-delay:400ms]">
            <Link href="/register?role=couple"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-brand-tanzanite hover:bg-brand-tanzanite/90 text-white rounded-2xl font-semibold transition-all hover:-translate-y-1 shadow-xl shadow-brand-tanzanite/20">
              <Sparkles className="w-5 h-5" />
              Start Planning Free
            </Link>
            <Link href="/register?role=vendor"
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/20 text-white rounded-2xl font-semibold backdrop-blur-sm transition-all">
              <Store className="w-5 h-5" />
              List Your Service
            </Link>
          </div>
        </div>

        {/* Stats bar - Now more responsive */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/10 bg-black/20 backdrop-blur-md hidden sm:block">
          <div className="max-w-6xl mx-auto grid grid-cols-4 divide-x divide-white/10">
            {[
              ["500+", "Verified Vendors"],
              ["2,400+", "Happy Couples"],
              ["4.9★", "User Rating"],
              ["8 Cities", "In Tanzania"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="py-6 text-center">
                <div className="font-serif text-2xl font-bold text-brand-gold">{val}</div>
                <div className="text-[10px] text-white/40 uppercase tracking-widest mt-1">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES - "Everything you need" */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-bold text-brand-ebony mb-4">
              Designed for the <span className="italic font-light">modern couple</span>
            </h2>
            <p className="text-brand-ebony/60 text-lg leading-relaxed">
              Tailored specifically for Tanzanian weddings, our platform bridges the gap between tradition and digital efficiency.
            </p>
          </div>
          <div className="flex items-center gap-2 text-brand-tanzanite font-semibold group cursor-pointer">
            Explore all features <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: <Bot className="text-brand-tanzanite" />, title: "AI Budgeter", desc: "Get a customized financial breakdown based on guest count and local market rates." },
            { icon: <ShieldCheck className="text-brand-gold" />, title: "Verified Hub", desc: "Every vendor is vetted by our team to ensure reliability and quality for your big day." },
            { icon: <BarChart3 className="text-brand-sage" />, title: "Cost Tracking", desc: "Monitor payments and deposits in real-time. Avoid the 'Harusi debt' trap." },
            { icon: <MapPin className="text-brand-hibiscus" />, title: "Local Logistics", desc: "Find service providers in your specific city, from Mwanza to Dar es Salaam." },
          ].map((f, i) => (
            <div key={i} className="harusi-card p-8 group">
              <div className="w-12 h-12 rounded-xl bg-stone-50 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                {f.icon}
              </div>
              <h3 className="text-xl font-bold text-brand-ebony mb-3">{f.title}</h3>
              <p className="text-sm text-brand-ebony/60 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* IMAGE GRID - "Boutique Gallery" */}
      <section className="pb-32 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-12 gap-4 h-[600px] md:h-[700px]">
          <div className="col-span-12 md:col-span-8 relative rounded-3xl overflow-hidden group">
            <Image src={WEDDING_IMAGES[0]} alt="" fill className="object-cover group-hover:scale-105 transition-all duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-8 left-8">
              <span className="text-white/60 text-xs uppercase tracking-widest mb-2 block">Luxury Decor</span>
              <h4 className="text-white text-2xl font-serif">Arusha Botanical Gardens</h4>
            </div>
          </div>
          <div className="hidden md:flex md:col-span-4 flex-col gap-4">
            <div className="relative h-1/2 rounded-3xl overflow-hidden group">
              <Image src={WEDDING_IMAGES[1]} alt="" fill className="object-cover group-hover:scale-105 transition-all duration-700" />
            </div>
            <div className="relative h-1/2 rounded-3xl overflow-hidden group">
              <Image src={WEDDING_IMAGES[2]} alt="" fill className="object-cover group-hover:scale-105 transition-all duration-700" />
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="bg-brand-tanzanite py-24 px-6 text-center relative overflow-hidden mx-6 mb-12 rounded-[3rem]">
        <div className="absolute inset-0 opacity-10 bg-grain" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-4xl sm:text-6xl font-bold text-white mb-8">
            Ready to plan your <span className="text-brand-gold italic">perfect</span> day?
          </h2>
          <Link href="/register"
            className="inline-flex items-center gap-3 px-10 py-5 bg-white text-brand-tanzanite hover:bg-brand-gold hover:text-white rounded-2xl font-bold text-lg transition-all hover:-translate-y-1 shadow-2xl">
            Start Free Consultation <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-white border-t border-stone-200 py-16 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-brand-tanzanite flex items-center justify-center text-white font-serif font-bold text-xl">H</div>
            <span className="font-serif text-2xl font-bold text-brand-ebony">Harusi SmartHub</span>
          </div>
          <p className="text-brand-ebony/40 text-sm">© {new Date().getFullYear()} Harusi SmartHub. Proudly Tanzanian. 🇹🇿</p>
          <div className="flex gap-8">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="text-brand-ebony/60 hover:text-brand-tanzanite text-sm font-medium transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}