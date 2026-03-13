"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signIn } from "@/lib/firebase/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
    <div className="min-h-screen bg-base bg-dots flex items-center justify-center px-4 py-12">
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-15%] left-[-5%] w-[350px] h-[350px] rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <div className="relative w-full max-w-sm space-y-8">
        <div className="text-center space-y-1">
          <Link href="/" className="inline-block mb-4">
            <div className="flex items-center justify-center gap-1.5">
              {["B","I","N","G","O"].map((l, i) => (
                <span
                  key={l}
                  className="w-8 h-8 rounded-lg flex items-center justify-center font-display font-black text-sm"
                  style={{
                    color: ["var(--col-b)","var(--col-i)","var(--col-n)","var(--col-g)","var(--col-o)"][i],
                    backgroundColor: `${["var(--col-b)","var(--col-i)","var(--col-n)","var(--col-g)","var(--col-o)"][i]}18`,
                  }}
                >
                  {l}
                </span>
              ))}
            </div>
          </Link>
          <h1 className="font-display text-3xl font-black">Welcome back</h1>
          <p className="text-text-secondary text-sm">Sign in to your host account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-warn/10 border border-warn/40 rounded-xl text-warn text-sm text-center">
              {error}
            </div>
          )}
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-text-secondary">Email</label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required autoFocus />
          </div>
          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-text-secondary">Password</label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
          </div>
          <Button type="submit" className="w-full" size="lg" disabled={loading}>
            {loading ? "Signing in…" : "Sign In →"}
          </Button>
        </form>

        <p className="text-center text-sm text-text-secondary">
          No account?{" "}
          <Link href="/register" className="text-primary hover:underline font-medium">Sign up free</Link>
        </p>
      </div>
    </div>
  );
}
