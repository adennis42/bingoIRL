"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const BINGO_COLORS = ["#f5c542","#e84040","#4db8ff","#50e878","#ff6b35"];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
      router.push("/host/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={{ background: "#111" }}>
      {/* Halftone overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10"
        style={{ backgroundImage: `radial-gradient(circle, #f5c542 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-[#f5c542]" />

      <div className="relative z-10 w-full max-w-sm space-y-6">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-1.5 mb-2">
          {["B","I","N","G","O"].map((l, i) => (
            <div key={l} className="w-9 h-9 flex items-center justify-center font-black text-sm border-[3px] border-[#1a1a1a] text-[#1a1a1a]"
              style={{ background: BINGO_COLORS[i], boxShadow: "2px 2px 0px #1a1a1a" }}>
              {l}
            </div>
          ))}
        </Link>

        {/* Panel */}
        <div className="border-[3px] border-[#1a1a1a] bg-[#241808] p-6 space-y-5" style={{ boxShadow: "6px 6px 0px #1a1a1a" }}>
          {/* Header */}
          <div className="border-b-[3px] border-[#1a1a1a] pb-4">
            <h1 className="font-black text-2xl uppercase text-white tracking-wide"
              style={{ fontFamily: "'Arial Black', Impact, sans-serif", WebkitTextStroke: "1px #1a1a1a", textShadow: "2px 2px 0px #1a1a1a" }}>
              HOST LOGIN
            </h1>
            <p className="text-[#8a7a5a] text-sm font-bold uppercase tracking-wider mt-1">Sign in to manage your games</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border-[3px] border-[#e84040] bg-[#e84040]/20 text-[#ff8080] text-sm font-bold uppercase"
                style={{ boxShadow: "3px 3px 0px #1a1a1a" }}>
                ⚠ {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-[#f5c542]">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoFocus />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-[#f5c542]">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full" size="lg" disabled={loading}>
              {loading ? "SIGNING IN..." : "SIGN IN →"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm font-bold text-[#8a7a5a] uppercase tracking-wide">
          No account?{" "}
          <Link href="/register" className="text-[#f5c542] hover:underline font-black">Sign up free</Link>
        </p>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#e84040]" />
    </div>
  );
}
