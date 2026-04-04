"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { toast } from "sonner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  async function handleLogin(e: React.FormEvent) {
    
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
      setLoading(false);
      return;
    }
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", (await supabase.auth.getUser()).data.user!.id).single();
    toast.success("Welcome back!");
    if (profile?.role === "admin")  router.push("/admin");
    else if (profile?.role === "vendor") router.push("/vendor/dashboard");
    else router.push("/dashboard");
  }

  async function handleGoogleLogin() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-harusi-dark mb-2">Welcome back</h1>
        <p className="text-harusi-muted text-sm">Sign in to continue planning your perfect day.</p>
      </div>

      <button onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 border border-stone-200 rounded-xl hover:bg-stone-50 transition-all text-sm font-medium text-harusi-dark mb-6">
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
        Continue with Google
      </button>

      <div className="relative mb-6">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-stone-200" /></div>
        <div className="relative flex justify-center"><span className="bg-harusi-cream px-3 text-xs text-stone-400 font-medium">or continue with email</span></div>
      </div>

      <form onSubmit={handleLogin} className="space-y-4">
        <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
        <div className="flex justify-end">
          <a href="#" className="text-xs text-amber-600 hover:text-amber-700 font-medium">Forgot password?</a>
        </div>
        <Button type="submit" loading={loading} className="w-full" size="lg">Sign in</Button>
      </form>

      <p className="mt-6 text-center text-sm text-harusi-muted">
        Don't have an account?{" "}
        <Link href="/register" className="text-amber-600 hover:text-amber-700 font-semibold">Create one free</Link>
      </p>
    </div>
  );
}
