"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const CEL_BG = {
  background: "#1a1008",
  backgroundImage: `
    repeating-linear-gradient(0deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px),
    repeating-linear-gradient(90deg, transparent, transparent 40px, rgba(255,255,255,0.03) 40px, rgba(255,255,255,0.03) 41px)
  `,
};

const BINGO_COLORS = ["#f5c542","#e84040","#4db8ff","#50e878","#ff6b35"];

export default function RegisterPage() {
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
      await signUp(email, password);
      router.push("/host/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to create account");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden" style={CEL_BG}>
      {/* Halftone overlay */}
      <div className="fixed inset-0 pointer-events-none opacity-10"
        style={{ backgroundImage: `radial-gradient(circle, #50e878 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />

      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 h-4 bg-[#50e878]" />

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
        <div className="border-[3px] border-[#1a1a1a] bg-[#241808] p-6 space-y-5"
          style={{ boxShadow: "6px 6px 0px #1a1a1a" }}>
          <div className="border-b-[3px] border-[#1a1a1a] pb-4">
            <h1 className="font-black text-2xl uppercase text-white tracking-wide"
              style={{ fontFamily: "'Arial Black', Impact, sans-serif", WebkitTextStroke: "1px #1a1a1a", textShadow: "2px 2px 0px #1a1a1a" }}>
              CREATE ACCOUNT
            </h1>
            <p className="text-[#8a7a5a] text-sm font-bold uppercase tracking-wider mt-1">Start hosting bingo nights</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 border-[3px] border-[#e84040] bg-[#e84040]/20 text-[#ff8080] text-sm font-black uppercase"
                style={{ boxShadow: "3px 3px 0px #1a1a1a" }}>
                ⚠ {error}
              </div>
            )}
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-[#50e878]">Email</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com" required autoFocus />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-black uppercase tracking-widest text-[#50e878]">Password</label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="8+ characters" required minLength={8} />
            </div>
            <Button type="submit" variant="success" className="w-full" size="lg" disabled={loading}>
              {loading ? "CREATING ACCOUNT..." : "CREATE ACCOUNT →"}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm font-bold text-[#8a7a5a] uppercase tracking-wide">
          Already have an account?{" "}
          <Link href="/login" className="text-[#f5c542] hover:underline font-black">Sign in</Link>
        </p>
      </div>

      {/* Bottom bar */}
      <div className="absolute bottom-0 left-0 right-0 h-4 bg-[#50e878]" />
    </div>
  );
}
