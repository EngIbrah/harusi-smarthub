"use client";

import { useState, Suspense } from "react"; // Added Suspense
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Users, Store, ArrowRight, CheckCircle2 } from "lucide-react";
import type { UserRole } from "@/types";

// 1. Move your logic into this internal component
function RegisterForm() {
  const searchParams = useSearchParams();
  const [role, setRole] = useState<UserRole>((searchParams.get("role") as UserRole) || "couple");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  
  const router = useRouter();
  const supabase = createClient();

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) { 
      toast.error("Password must be at least 8 characters"); 
      return; 
    }
    
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { 
          full_name: fullName, 
          role: role 
        } 
      },
    });

    if (error) { 
      toast.error(error.message); 
      setLoading(false); 
      return; 
    }

    toast.success("Account created! Welcome to Harusi SmartHub.");
    
    setTimeout(() => {
      router.push(role === "vendor" ? "/vendor/dashboard" : "/dashboard");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-serif text-4xl font-bold text-brand-ebony mb-3 tracking-tight">
          Begin your journey
        </h1>
        <p className="text-brand-ebony/60 text-sm leading-relaxed max-w-[320px]">
          Join the community of Tanzanians celebrating love with smarter planning.
        </p>
      </div>

      {/* ROLE SELECTOR */}
      <div className="grid grid-cols-2 gap-4 mb-10">
        {( [
          { role: "couple", icon: Users, title: "Couple", desc: "Plan & Book" },
          { role: "vendor", icon: Store, title: "Vendor", desc: "Grow Business" },
        ] as const).map((opt) => {
          const Icon = opt.icon;
          const isActive = role === opt.role;
          return (
            <button
              key={opt.role}
              type="button"
              onClick={() => setRole(opt.role)}
              className={cn(
                "relative group p-5 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden",
                isActive
                  ? "border-brand-tanzanite bg-white shadow-xl shadow-brand-tanzanite/10"
                  : "border-brand-ebony/5 bg-white/50 hover:border-brand-ebony/20"
              )}
            >
              {isActive && (
                <div className="absolute top-2 right-2">
                  <CheckCircle2 className="w-4 h-4 text-brand-tanzanite" />
                </div>
              )}
              <div className={cn(
                "w-10 h-10 rounded-xl flex items-center justify-center mb-4 transition-colors",
                isActive ? "bg-brand-tanzanite text-white" : "bg-brand-ebony/5 text-brand-ebony/40 group-hover:text-brand-ebony"
              )}>
                <Icon className="w-5 h-5" />
              </div>
              <div className={cn("font-bold text-sm", isActive ? "text-brand-ebony" : "text-brand-ebony/60")}>
                {opt.title}
              </div>
              <div className="text-[10px] text-brand-ebony/40 uppercase tracking-widest font-bold mt-1">
                {opt.desc}
              </div>
            </button>
          );
        })}
      </div>

      {/* REGISTRATION FORM */}
      <form onSubmit={handleRegister} className="space-y-5">
        <div className="space-y-4">
          <Input 
            label="Full Name" 
            type="text" 
            placeholder="e.g. Juma Kapuya" 
            value={fullName} 
            onChange={e => setFullName(e.target.value)} 
            required 
            className="bg-white/50 focus:bg-white"
          />
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="juma@example.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="bg-white/50 focus:bg-white"
          />
          <Input 
            label="Create Password" 
            type="password" 
            placeholder="Min. 8 characters" 
            value={password} 
            onChange={e => setPassword(e.target.value)} 
            required 
            className="bg-white/50 focus:bg-white"
          />
        </div>

        <div className="pt-2">
          <p className="text-[11px] text-brand-ebony/50 leading-relaxed">
            By creating an account, you agree to our{" "}
            <Link href="/terms" className="text-brand-tanzanite font-bold hover:underline">Terms</Link> and{" "}
            <Link href="/privacy" className="text-brand-tanzanite font-bold hover:underline">Privacy Policy</Link>.
          </p>
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className={cn(
            "w-full h-14 rounded-2xl text-base font-bold shadow-lg transition-all",
            role === "vendor" 
              ? "bg-brand-ebony text-white hover:bg-black" 
              : "bg-brand-tanzanite text-white hover:bg-brand-tanzanite/90 shadow-brand-tanzanite/20"
          )}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating account...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              {role === "vendor" ? "Join as Vendor" : "Start Planning My Wedding"}
              <ArrowRight className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-brand-ebony/60">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-tanzanite hover:text-brand-tanzanite/80 font-bold transition-colors">
          Sign in here
        </Link>
      </p>
    </div>
  );
}

// 2. Export the page wrapped in Suspense
export default function RegisterPage() {
  return (
    <Suspense fallback={<div>Loading form...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
