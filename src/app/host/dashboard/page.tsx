"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import Link from "next/link";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";

export default function HostDashboardPage() {
  const router = useRouter();
  const { user, loading, isHost } = useAuth();

  useEffect(() => {
    if (!loading && (!user || !isHost)) {
      router.push("/login");
    }
  }, [loading, user, isHost, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!user || !isHost) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs items={[]} />
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">Host Dashboard</h1>
          <div className="flex gap-4">
            <Link href="/host/patterns">
              <Button variant="secondary">Custom Patterns</Button>
            </Link>
            <Link href="/host/create">
              <Button>Create New Game</Button>
            </Link>
          </div>
        </div>

        <div className="bg-surface border border-border rounded-2xl p-8">
          <p className="text-text-secondary">
            Your games will appear here. Create your first game to get started!
          </p>
        </div>
      </div>
    </div>
  );
}
