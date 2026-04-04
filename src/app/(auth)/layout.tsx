import Image from "next/image";
import Link from "next/link";
import { WEDDING_IMAGES } from "@/lib/utils";
import { Gem } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex selection:bg-brand-tanzanite/10">
      {/* LEFT: FORM SIDE */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 bg-brand-cloud relative overflow-hidden">
        {/* Subtle background texture for the form side */}
        <div className="absolute inset-0 opacity-[0.03] bg-grain pointer-events-none" aria-hidden="true" />

        <div className="w-full max-w-md relative z-10">
          {/* REFINED BRAND LOGO (Matching Navbar) */}
          <Link href="/" className="flex items-center gap-4 mb-16 group w-fit">
            <div className="relative w-12 h-12 flex items-center justify-center transition-all duration-500">
              <div className="absolute inset-0 rounded-2xl bg-brand-tanzanite shadow-lg shadow-brand-tanzanite/20 group-hover:scale-105 transition-transform" />
              <Gem className="relative z-10 w-6 h-6 text-white drop-shadow-md" strokeWidth={1.5} />
            </div>
            <div className="flex flex-col justify-center -space-y-1">
              <span className="font-serif text-2xl font-bold text-brand-ebony tracking-tight leading-none">
                Harusi
              </span>
              <span className="text-[10px] font-bold text-brand-tanzanite uppercase tracking-[0.3em] pl-0.5">
                SmartHub
              </span>
            </div>
          </Link>

          {/* MAIN FORM CONTENT */}
          <div className="harusi-card p-0 bg-transparent border-none shadow-none">
            {children}
          </div>
        </div>

        {/* Footer info for mobile */}
        <div className="absolute bottom-8 text-center md:hidden">
          <p className="text-brand-ebony/40 text-[10px] uppercase tracking-widest font-bold">
            © {new Date().getFullYear()} Harusi SmartHub 🇹🇿
          </p>
        </div>
      </div>

      {/* RIGHT: PHOTO SIDE (Hidden on mobile) */}
      <div className="hidden lg:block w-[45%] relative overflow-hidden bg-brand-ebony">
        <Image
          src={WEDDING_IMAGES[0]}
          alt="Elegant Tanzanian Wedding"
          fill
          className="object-cover grayscale-[15%] brightness-90 hover:grayscale-0 transition-all duration-1000"
          sizes="45vw"
          priority
        />
        
        {/* Overlays for depth and readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand-ebony via-brand-ebony/20 to-transparent opacity-80" />
        <div className="absolute inset-0 bg-brand-tanzanite/10 mix-blend-overlay" />

        {/* Brand Narrative */}
        <div className="absolute bottom-20 left-16 right-16">
          <div className="w-12 h-1 bg-brand-gold mb-8 rounded-full" />
          <blockquote className="font-serif text-4xl font-light text-white leading-[1.2] mb-6">
            "Planning the beginning of your <span className="italic text-brand-gold font-medium">forever</span> should be as beautiful as the day itself."
          </blockquote>
          <div className="flex items-center gap-4 text-white/60">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-brand-ebony bg-stone-400" />
              ))}
            </div>
            <p className="text-sm font-medium tracking-wide">
              Joined by 2,400+ couples in Tanzania
            </p>
          </div>
        </div>

        {/* Decorative corner element */}
        <div className="absolute top-0 right-0 p-12 opacity-20">
          <Gem className="w-32 h-32 text-brand-gold -rotate-12" strokeWidth={0.5} />
        </div>
      </div>
    </div>
  );
}