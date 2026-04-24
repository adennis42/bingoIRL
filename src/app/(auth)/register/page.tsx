"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signUp } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { BingoLogo } from "@/components/bingo/BingoLogo";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: "#111" }}>
      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <Link href="/" className="flex justify-center mb-2">
          <BingoLogo size={40} />
        </Link>

        {/* Panel */}
        <div
          className="border-[3px] border-[#111] p-6 space-y-5"
          style={{ background: "#1a1a1a", boxShadow: "6px 6px 0px #111" }}
        >
          <div className="border-b-[3px] border-[#111] pb-4">
            <h1
              className="font-black text-2xl uppercase text-white tracking-wide"
              style={{ fontFamily: "'Arial Black', Impact, sans-serif", textShadow: "2px 2px 0px #111" }}
            >
              CREATE ACCOUNT
            </h1>
            <p className="text-[#666] text-sm font-bold uppercase tracking-wider mt-1">Start hosting bingo nights</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div
                className="p-3 border-[3px] border-[#e84040] text-[#ff8080] text-sm font-black uppercase"
                style={{ background: "#e8404022", boxShadow: "3px 3px 0px #111" }}
              >
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

        <p className="text-center text-sm font-bold text-[#666] uppercase tracking-wide">
          Already have an account?{" "}
          <Link href="/login" className="text-[#f5c542] hover:underline font-black">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
