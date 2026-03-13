"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Link from "next/link";

export default function HostDashboardPage() {
  const router = useRouter();
  const { user, loading, isHost } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isHost)) {
      router.push("/login");
    }
  }, [loading, user, isHost, router]);

  if (loading || !user || !isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-base bg-grid">
      {/* Ambient */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[400px] h-[400px] rounded-full bg-primary/8 blur-[100px]" />
      </div>

      <div className="relative max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-3xl font-black">Dashboard</h1>
            <p className="text-text-secondary text-sm mt-0.5">{user.email}</p>
          </div>
          <div className="flex gap-3">
            <Link href="/host/patterns">
              <Button variant="secondary" size="sm">🎨 Patterns</Button>
            </Link>
            <Link href="/host/create">
              <Button size="sm">＋ New Game</Button>
            </Link>
          </div>
        </div>

        {/* Empty state */}
        <div className="card p-12 text-center space-y-4">
          <div className="text-5xl">🎴</div>
          <div>
            <h2 className="font-display text-xl font-bold mb-1">No games yet</h2>
            <p className="text-text-secondary text-sm">Create your first game to get started.</p>
          </div>
          <Link href="/host/create">
            <Button className="mt-2">🎙️ Create Game</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
