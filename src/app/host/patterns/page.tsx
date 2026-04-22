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
    <div className="min-h-screen bg-base">
      <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
        <div className="flex items-center justify-between">
          <BackButton href="/host/dashboard" />
          <Button size="sm" onClick={handleStartCreate}>＋ New Pattern</Button>
        </div>

        <div>
          <h1 className="font-display text-2xl font-black">Custom Patterns</h1>
          <p className="text-text-secondary text-sm mt-1">Design your own bingo winning patterns.</p>
        </div>

        {error && (
          <div className="p-3 bg-warn/10 border border-warn/40 rounded-xl text-warn text-sm">{error}</div>
        )}

        {patterns.length === 0 ? (
          <div className="card p-10 text-center space-y-4">
            <div className="text-4xl"></div>
            <div>
              <p className="font-sans font-semibold text-lg">No custom patterns yet</p>
              <p className="text-text-secondary text-sm mt-1">Create a pattern to use in your games.</p>
            </div>
            <Button onClick={handleStartCreate}>Create First Pattern</Button>
          </div>
        ) : (
          <div className="space-y-3">
            {patterns.map((pattern) => (
              <div key={pattern.id} className="card p-4">
                <div className="flex items-center gap-4">
                  <PatternVisualizer pattern={pattern} size="sm" />
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{pattern.name}</p>
                    {pattern.description && (
                      <p className="text-text-secondary text-xs mt-0.5 truncate">{pattern.description}</p>
                    )}
                    <p className="text-text-disabled text-xs mt-0.5">{pattern.cells.length} cells</p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={() => handleStartEdit(pattern)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteClick(pattern.id)}>✕</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
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
