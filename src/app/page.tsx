import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import { WEDDING_IMAGES } from "@/lib/utils";

export default function HomePage() {
  
  return (
    <div className="min-h-screen bg-harusi-cream">
      <Navbar />

      {/* HERO */}
      <section className="relative min-h-[92vh] flex items-center overflow-hidden bg-harusi-darker">
        {/* Background collage */}
        <div className="absolute inset-0 grid grid-cols-4 grid-rows-2 opacity-20">
          {WEDDING_IMAGES.slice(0, 8).map((src, i) => (
            <div key={i} className="relative overflow-hidden">
              <Image src={src} alt="" fill className="object-cover" sizes="25vw" />
            </div>
          ))}
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-harusi-darker via-harusi-darker/95 to-harusi-darker" />

        {/* Decorative rings */}
        {[1,2,3,4,5].map((i) => (
          <div key={i} className="absolute rounded-full border border-amber-500/10 pointer-events-none"
            style={{ width: `${200 + i * 130}px`, height: `${200 + i * 130}px`, top: "50%", left: "50%", transform: "translate(-50%, -50%)" }}
          />
        ))}

        {/* Accent dots */}
        <div className="absolute top-1/4 left-[15%] w-1.5 h-1.5 rounded-full bg-amber-400 opacity-60 animate-pulse-soft" />
        <div className="absolute top-1/3 right-[20%] w-1 h-1 rounded-full bg-amber-300 opacity-80 animate-pulse-soft" style={{ animationDelay: "1s" }} />
        <div className="absolute bottom-1/4 left-[25%] w-2 h-2 rounded-full bg-amber-500 opacity-30 animate-pulse-soft" style={{ animationDelay: "2s" }} />

        <div className="relative z-10 w-full max-w-5xl mx-auto px-6 text-center">
          {/* Pill badge */}
          <div className="inline-flex items-center gap-2 bg-amber-500/10 border border-amber-500/20 rounded-full px-5 py-2 mb-10 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-amber-300 text-xs font-semibold tracking-widest uppercase">Tanzania's #1 Wedding Platform</span>
          </div>

          <h1 className="font-serif leading-none mb-3 animate-fade-up" style={{ animationDelay: "0.1s" }}>
            <span className="block text-6xl sm:text-8xl font-bold text-harusi-cream tracking-tight">Harusi</span>
            <span className="block text-6xl sm:text-8xl font-light text-gradient-gold tracking-tight">SmartHub</span>
          </h1>

          <p className="text-stone-400 text-lg sm:text-xl font-light max-w-2xl mx-auto mt-8 mb-12 leading-relaxed animate-fade-up" style={{ animationDelay: "0.2s" }}>
            Plan your perfect wedding in Tanzania with AI-guided budgeting, verified local vendors, and real-time cost tracking — all beautifully organised.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-up" style={{ animationDelay: "0.3s" }}>
            <Link href="/register?role=couple"
              className="group px-8 py-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white rounded-2xl font-bold text-base shadow-2xl shadow-amber-500/25 hover:shadow-amber-500/40 transition-all duration-300 hover:-translate-y-0.5">
              <span className="mr-2">✨</span> Start Planning Free
            </Link>
            <Link href="/register?role=vendor"
              className="px-8 py-4 border border-amber-500/30 text-amber-300 hover:border-amber-500/60 hover:bg-amber-500/5 rounded-2xl font-bold text-base transition-all duration-300">
              <span className="mr-2">🏪</span> Join as Vendor
            </Link>
          </div>
        </div>

        {/* Stats bar */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-white/5 bg-white/[0.02]">
          <div className="max-w-4xl mx-auto flex flex-wrap justify-center">
            {[
              ["500+", "Verified Vendors"],
              ["2,400+", "Happy Couples"],
              ["4.9★", "Avg Rating"],
              ["8 Cities", "Across Tanzania"],
            ].map(([val, lbl]) => (
              <div key={lbl} className="px-8 py-5 text-center border-r border-white/5 last:border-none">
                <div className="font-serif text-xl font-bold text-amber-400 tabular-nums">{val}</div>
                <div className="text-xs text-stone-500 mt-1 tracking-wide">{lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-serif text-4xl font-semibold text-harusi-dark mb-4">Everything you need</h2>
          <p className="text-harusi-muted max-w-xl mx-auto">From budget to big day — one platform handles it all, built specifically for Tanzanian weddings.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: "🤖", title: "AI Budget Planning", desc: "Enter your budget and get a smart breakdown with vendor recommendations tailored to your guest count." },
            { icon: "🛍️", title: "Verified Marketplace", desc: "Browse 500+ local vendors with real ratings, verified profiles, and transparent pricing." },
            { icon: "📊", title: "Real-Time Tracking", desc: "Watch your budget update live as you add vendors. Instant alerts before you overspend." },
            { icon: "🏆", title: "Vendor Trust Profile", desc: "Build credibility through completed bookings — unlocking financial inclusion opportunities." },
          ].map((f) => (
            <div key={f.title} className="p-8 bg-white rounded-2xl border border-stone-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-5">{f.icon}</div>
              <h3 className="font-serif text-lg font-bold text-harusi-dark mb-3">{f.title}</h3>
              <p className="text-sm text-harusi-muted leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* WEDDING GALLERY */}
      <section className="pb-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="font-serif text-4xl font-semibold text-harusi-dark mb-4">Beautiful weddings planned here</h2>
          <p className="text-harusi-muted">Join thousands of couples who planned their perfect day with Harusi SmartHub.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {WEDDING_IMAGES.map((src, i) => (
            <div key={i} className={`relative rounded-2xl overflow-hidden ${i === 0 || i === 5 ? "row-span-2" : ""}`}
              style={{ height: i === 0 || i === 5 ? "360px" : "170px" }}>
              <Image src={src} alt="Wedding" fill className="object-cover hover:scale-105 transition-transform duration-500" sizes="(max-width: 768px) 50vw, 25vw" />
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-harusi-dark py-24 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 opacity-5 bg-grain" />
        <div className="relative z-10 max-w-2xl mx-auto">
          <div className="text-5xl mb-6">💍</div>
          <h2 className="font-serif text-4xl sm:text-5xl font-bold text-harusi-cream mb-6">
            Ready to plan your <span className="text-gradient-gold">perfect wedding?</span>
          </h2>
          <p className="text-stone-400 mb-10 text-lg">Start for free. No credit card required.</p>
          <Link href="/register"
            className="inline-flex items-center gap-2 px-10 py-4 bg-gradient-to-r from-amber-400 to-amber-600 hover:from-amber-500 hover:to-amber-700 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-amber-500/30 transition-all hover:-translate-y-0.5">
            Get Started Today →
          </Link>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-harusi-darker border-t border-white/5 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-sm">💍</div>
            <span className="font-serif text-lg font-bold text-stone-300">Harusi SmartHub</span>
          </div>
          <p className="text-stone-500 text-sm">© {new Date().getFullYear()} Harusi SmartHub. Built for Tanzania 🇹🇿</p>
          <div className="flex gap-6">
            {["Privacy", "Terms", "Contact"].map((l) => (
              <a key={l} href="#" className="text-stone-500 hover:text-stone-300 text-sm transition-colors">{l}</a>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}
