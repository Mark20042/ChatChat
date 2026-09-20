"use client";

import { useState } from "react";
import { LogOut, X, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface LeaveGroupModalProps {
  isOpen: boolean;
  groupName: string;
  onClose: () => void;
  onConfirmLeave: () => Promise<void>;
}

export default function LeaveGroupModal({
  isOpen,
  groupName,
  onClose,
  onConfirmLeave,
}: LeaveGroupModalProps) {
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await onConfirmLeave();
      onClose();
    } catch (err) {
      console.error("Failed to leave group:", err);
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
        <div className="mx-auto mb-4 h-14 w-14 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center shadow-inner border border-amber-200 dark:border-amber-900/50">
          <LogOut className="h-7 w-7 stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">
          Leave Group?
        </h3>

        {/* Target Group Badge */}
        <div className="mx-auto mb-3 px-3 py-1 bg-slate-100 dark:bg-zinc-800 rounded-lg text-xs font-semibold text-slate-700 dark:text-zinc-300 max-w-[240px] truncate">
          {groupName}
        </div>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-zinc-400 mb-6 leading-relaxed">
          You will no longer be able to send or receive messages in this group.
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
            className="flex-1 rounded-xl h-10 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 dark:bg-amber-600 dark:hover:bg-amber-700"
          >
            {loading ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Leaving...
              </>
            ) : (
              <>
                <LogOut className="h-3.5 w-3.5 mr-1.5" /> Leave Group
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
