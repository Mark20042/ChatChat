"use client";

import { useState } from "react";
import { X, Users, Check, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  user_name: string;
  email: string;
}

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  users: User[];
  currentUser: User | null;
  onCreateGroup: (name: string, selectedUserIds: number[]) => Promise<void>;
}

export default function CreateGroupModal({
  isOpen,
  onClose,
  users,
  currentUser,
  onCreateGroup,
}: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  // Filter out current user from selection list
  const availableUsers = users.filter(
    (u) =>
      u.id !== currentUser?.id &&
      u.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName.trim() || selectedUserIds.length === 0) return;

    setLoading(true);
    try {
      await onCreateGroup(groupName.trim(), selectedUserIds);
      setGroupName("");
      setSelectedUserIds([]);
      onClose();
    } catch (err) {
      console.error("Failed to create group:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-zinc-100">
            <div className="h-8 w-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <span>Create New Group</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 flex flex-col flex-1 overflow-hidden gap-4">
          {/* Group Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1.5 uppercase tracking-wider">
              Group Name
            </label>
            <Input
              placeholder="e.g. Project Alpha, Design Team..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="w-full rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
              required
            />
          </div>

          {/* Member Selection List */}
          <div className="flex-1 flex flex-col overflow-hidden min-h-[180px]">
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 uppercase tracking-wider">
                Select Members ({selectedUserIds.length})
              </label>
            </div>

            <Input
              placeholder="Search contacts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full mb-2 h-9 text-xs rounded-xl bg-slate-50 dark:bg-zinc-800 border-slate-200 dark:border-zinc-700"
            />

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {availableUsers.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400">
                  No available contacts found.
                </div>
              ) : (
                availableUsers.map((user) => {
                  const isSelected = selectedUserIds.includes(user.id);
                  return (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => toggleUserSelection(user.id)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                        isSelected
                          ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium"
                          : "hover:bg-slate-100 dark:hover:bg-zinc-800/70 text-slate-800 dark:text-zinc-200"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{user.user_name}</span>
                        <span className="text-[11px] opacity-75">{user.email}</span>
                      </div>
                      <div
                        className={`h-5 w-5 rounded-lg border flex items-center justify-center transition ${
                          isSelected
                            ? "bg-white text-zinc-950 border-white dark:bg-zinc-950 dark:text-zinc-100 dark:border-zinc-950"
                            : "border-slate-300 dark:border-zinc-700"
                        }`}
                      >
                        {isSelected && <Check className="h-3.5 w-3.5 stroke-[3]" />}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-200 dark:border-zinc-800 mt-auto">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1 rounded-xl"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading || !groupName.trim() || selectedUserIds.length === 0}
              className="flex-1 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200 font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> Creating...
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4 mr-1" /> Create Group
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
