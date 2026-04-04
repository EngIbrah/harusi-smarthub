"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { LogIn, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ 
        email, 
        password 
      });

      if (authError) throw authError;

      // Fetch role to determine redirect
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", authData.user.id)
        .single();

      if (profileError) throw profileError;

      toast.success("Welcome back to Harusi SmartHub!");
      
      // Role-based routing
      if (profile?.role === "admin") router.push("/admin");
      else if (profile?.role === "vendor") router.push("/vendor/dashboard");
      else router.push("/dashboard");
      
      router.refresh();
    } catch (error: any) {
      toast.error(error.message || "Invalid login credentials");
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { 
        redirectTo: `${window.location.origin}/auth/callback` 
      },
    });
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="mb-10 text-center sm:text-left">
        <h1 className="font-serif text-4xl font-bold text-brand-ebony mb-3 tracking-tight">
          Welcome back
        </h1>
        <p className="text-brand-ebony/60 text-sm leading-relaxed max-w-[300px]">
          Sign in to continue planning your perfect celebration.
        </p>
      </div>

      {/* Social Login */}
      <button 
        onClick={handleGoogleLogin}
        className="group w-full flex items-center justify-center gap-3 py-3.5 px-4 bg-white border border-brand-ebony/10 rounded-2xl hover:border-brand-tanzanite/30 hover:bg-brand-cloud transition-all duration-300 text-sm font-bold text-brand-ebony mb-8 shadow-sm"
      >
        <svg width="20" height="20" viewBox="0 0 48 48" className="group-hover:scale-110 transition-transform">
          <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
          <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
          <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
          <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
        </svg>
        Continue with Google
      </button>

      {/* Divider */}
      <div className="relative mb-8">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-brand-ebony/5" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-brand-cloud px-4 text-[10px] text-brand-ebony/30 font-bold uppercase tracking-[0.2em]">
            or use email
          </span>
        </div>
      </div>

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-5">
        <div className="space-y-4">
          <Input 
            label="Email Address" 
            type="email" 
            placeholder="name@example.com" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
            className="bg-white/50 focus:bg-white border-brand-ebony/10"
          />
          <div className="space-y-1">
            <Input 
              label="Password" 
              type="password" 
              placeholder="••••••••" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              className="bg-white/50 focus:bg-white border-brand-ebony/10"
            />
            <div className="flex justify-end">
              <Link 
                href="/forgot-password" 
                className="text-[11px] text-brand-tanzanite hover:text-brand-tanzanite/80 font-bold uppercase tracking-wider transition-colors"
              >
                Forgot password?
              </Link>
            </div>
          </div>
        </div>

        <Button 
          type="submit" 
          disabled={loading} 
          className="w-full h-14 bg-brand-tanzanite hover:bg-brand-tanzanite/90 text-white rounded-2xl text-base font-bold shadow-lg shadow-brand-tanzanite/20 transition-all active:scale-[0.98]"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Signing in...
            </div>
          ) : (
            <div className="flex items-center justify-center gap-2">
              Sign In to My Account
              <LogIn className="w-4 h-4" />
            </div>
          )}
        </Button>
      </form>

      {/* Footer */}
      <p className="mt-10 text-center text-sm text-brand-ebony/60 font-medium">
        New to the hub?{" "}
        <Link 
          href="/register" 
          className="text-brand-tanzanite hover:text-brand-tanzanite/80 font-bold transition-all hover:underline decoration-2 underline-offset-4"
        >
          Create an account free
        </Link>
      </p>
    </div>
  );
}