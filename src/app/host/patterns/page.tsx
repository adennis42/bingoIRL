"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useCustomPatterns } from "@/lib/hooks/useCustomPatterns";
import {
  createCustomPattern,
  updateCustomPattern,
  deleteCustomPattern,
} from "@/lib/firebase/firestore";
import { PatternEditModal } from "@/components/host/PatternEditModal";
import { PatternVisualizer } from "@/components/bingo/PatternVisualizer";
import { ConfirmModal } from "@/components/shared/ConfirmModal";
import { Breadcrumbs } from "@/components/shared/Breadcrumbs";
import { BackButton } from "@/components/shared/BackButton";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import type { CustomPattern } from "@/types";

export default function PatternsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { patterns, loading } = useCustomPatterns(user?.uid);
  const [showPatternModal, setShowPatternModal] = useState(false);
  const [editingPattern, setEditingPattern] = useState<CustomPattern | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const handleStartCreate = () => {
    setEditingPattern(null);
    setShowPatternModal(true);
    setError("");
  };

  const handleStartEdit = (pattern: CustomPattern) => {
    setEditingPattern(pattern);
    setShowPatternModal(true);
    setError("");
  };

  const handleSavePattern = async (
    name: string,
    description: string | undefined,
    cells: number[][]
  ) => {
    if (!user) return;

    setSaving(true);
    setError("");

    try {
      if (editingPattern) {
        await updateCustomPattern(user.uid, editingPattern.id, {
          name,
          description,
          cells,
        });
      } else {
        await createCustomPattern(user.uid, {
          name,
          description,
          cells,
        });
      }
      // Close modal on success
      setShowPatternModal(false);
      setEditingPattern(null);
      setError("");
    } catch (err: any) {
      const errorMessage = err.message || "Failed to save pattern";
      setError(errorMessage);
      // Don't re-throw - error is displayed in the page
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteClick = (patternId: string) => {
    setDeleteConfirmId(patternId);
  };

  const confirmDelete = async () => {
    if (!user || !deleteConfirmId) return;
    setDeleting(true);
    try {
      await deleteCustomPattern(user.uid, deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (err: any) {
      setError(err.message || "Failed to delete pattern");
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <Breadcrumbs items={[{ label: "Custom Patterns" }]} />
        <BackButton href="/host/dashboard" />
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-bold">Custom Patterns</h1>
          <Button onClick={handleStartCreate}>Create New Pattern</Button>
        </div>

        {error && (
          <div className="p-4 bg-warn/10 border border-warn rounded-2xl text-warn text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Patterns</h2>
          {patterns.length === 0 ? (
            <div className="bg-surface border border-border rounded-2xl p-8 text-center">
              <p className="text-text-secondary mb-4">
                You haven&apos;t created any custom patterns yet.
              </p>
              <Button onClick={handleStartCreate}>Create Your First Pattern</Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {patterns.map((pattern) => (
                <div
                  key={pattern.id}
                  className="bg-surface border border-border rounded-2xl p-6 space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold">{pattern.name}</h3>
                      {pattern.description && (
                        <p className="text-sm text-text-secondary mt-1">
                          {pattern.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleStartEdit(pattern)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDeleteClick(pattern.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <PatternVisualizer pattern={pattern} size="sm" />
                  <p className="text-xs text-text-secondary">
                    {pattern.cells.length} cells selected
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <PatternEditModal
        isOpen={showPatternModal}
        onClose={() => {
          setShowPatternModal(false);
          setEditingPattern(null);
          setError("");
        }}
        onSave={handleSavePattern}
        pattern={editingPattern}
        loading={saving}
      />

      <ConfirmModal
        isOpen={deleteConfirmId !== null}
        onClose={() => setDeleteConfirmId(null)}
        onConfirm={confirmDelete}
        title="Delete Pattern"
        message="Are you sure you want to delete this pattern? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        variant="destructive"
        loading={deleting}
      />
    </div>
  );
}
