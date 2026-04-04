"use client";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import type { UserRole } from "@/types";

export default function RegisterPage() {
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
    if (password.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email, password,
      options: { data: { full_name: fullName, role } },
    });
    if (error) { toast.error(error.message); setLoading(false); return; }
    toast.success("Account created! Signing you in…");
    setTimeout(() => {
      if (role === "vendor") router.push("/vendor/dashboard");
      else router.push("/dashboard");
    }, 1200);
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-serif text-3xl font-bold text-harusi-dark mb-2">Create your account</h1>
        <p className="text-harusi-muted text-sm">Join thousands of Tanzanians planning beautiful weddings.</p>
      </div>

      {/* Role selector */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {([
          { role: "couple", icon: "💍", title: "I'm a Couple", desc: "Plan & book my wedding" },
          { role: "vendor", icon: "🏪", title: "I'm a Vendor", desc: "List my services" },
        ] as const).map((opt) => (
          <button key={opt.role} type="button" onClick={() => setRole(opt.role)}
            className={cn(
              "p-4 rounded-2xl border-2 text-left transition-all duration-200",
              role === opt.role
                ? "border-amber-400 bg-amber-50 shadow-md shadow-amber-100"
                : "border-stone-200 hover:border-stone-300 bg-white"
            )}>
            <div className="text-2xl mb-2">{opt.icon}</div>
            <div className={cn("font-semibold text-sm", role === opt.role ? "text-amber-700" : "text-harusi-dark")}>{opt.title}</div>
            <div className="text-xs text-harusi-muted mt-0.5">{opt.desc}</div>
          </button>
        ))}
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <Input label="Full name" type="text" placeholder="Amara Mwangi" value={fullName} onChange={e => setFullName(e.target.value)} required />
        <Input label="Email address" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
        <Input label="Password" type="password" placeholder="Min. 8 characters" value={password} onChange={e => setPassword(e.target.value)} required />

        <p className="text-xs text-harusi-muted">
          By creating an account, you agree to our{" "}
          <a href="#" className="text-amber-600 hover:underline">Terms of Service</a> and{" "}
          <a href="#" className="text-amber-600 hover:underline">Privacy Policy</a>.
        </p>
        <Button type="submit" loading={loading} className="w-full" size="lg">
          {role === "vendor" ? "Create Vendor Account" : "Start Planning Free"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-harusi-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-amber-600 hover:text-amber-700 font-semibold">Sign in</Link>
      </p>
    </div>
  );
}
