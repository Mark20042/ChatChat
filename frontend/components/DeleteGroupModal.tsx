"use client";

import { useState } from "react";
import { AlertTriangle, X, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DeleteGroupModalProps {
  isOpen: boolean;
  groupName: string;
  onClose: () => void;
  onConfirmDelete: () => Promise<void>;
}

export default function DeleteGroupModal({
  isOpen,
  groupName,
  onClose,
  onConfirmDelete,
}: DeleteGroupModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirmDelete();
      onClose();
    } catch (err) {
      console.error("Failed to delete group:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-sm bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col p-6 text-center">
        {/* Close Button */}
        <div className="flex justify-end -mr-2 -mt-2 mb-1">
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-100 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Warning Icon Container */}
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-red-100 dark:bg-red-950/60 text-red-600 dark:text-red-400 flex items-center justify-center shadow-inner border border-red-200 dark:border-red-900/50">
          <AlertTriangle className="h-7 w-7 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
          Delete Group?
        </h3>

        {/* Target Group Badge */}
        <div className="mx-auto mb-3 px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 max-w-[240px] truncate">
          {groupName}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
          This will permanently collapse the group, delete all message history, and remove all members.
          <br />
          <span className="font-semibold text-red-500/90">This action cannot be undone.</span>
        </p>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={loading}
            className="flex-1 rounded-xl h-10 text-xs font-semibold border-slate-200 dark:border-zinc-800"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 rounded-xl h-10 text-xs font-semibold bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-600/20 dark:bg-red-600 dark:hover:bg-red-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete Group
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
