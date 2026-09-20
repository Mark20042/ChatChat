"use client";

import { useState } from "react";
import { UserPlus, X, Search, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";

interface User {
  id: number;
  user_name: string;
  email: string;
}

interface Group {
  id: number;
  name: string;
  creator_id: number;
  members: User[];
}

interface AddMembersModalProps {
  isOpen: boolean;
  group: Group | null;
  allUsers: User[];
  onClose: () => void;
  onAddMembers: (groupId: number, selectedUserIds: number[]) => Promise<void>;
}

export default function AddMembersModal({
  isOpen,
  group,
  allUsers,
  onClose,
  onAddMembers,
}: AddMembersModalProps) {
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);

  if (!isOpen || !group) return null;

  // Filter out existing members
  const existingMemberIds = new Set(group.members?.map((m) => m.id) || []);
  const availableUsers = allUsers.filter(
    (u) => !existingMemberIds.has(u.id) && u.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleUserSelection = (userId: number) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserIds.length === 0) return;

    setLoading(true);
    try {
      await onAddMembers(group.id, selectedUserIds);
      setSelectedUserIds([]);
      setSearchQuery("");
      onClose();
    } catch (err) {
      console.error("Failed to add members:", err);
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
              <UserPlus className="h-4 w-4" />
            </div>
            <span>Add Members</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden p-6 space-y-4">
          {/* Target Group Info */}
          <div className="text-xs text-slate-500 dark:text-zinc-400">
            Adding new members to <span className="font-bold text-slate-800 dark:text-zinc-200">{group.name}</span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search contacts to add..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 text-xs h-9 bg-slate-50 dark:bg-zinc-800/60 border-slate-200 dark:border-zinc-700 rounded-xl"
            />
          </div>

          {/* User Selection List */}
          <div className="flex-1 overflow-y-auto space-y-1.5 max-h-56 pr-1 border border-slate-100 dark:border-zinc-800 rounded-2xl p-2 bg-slate-50/50 dark:bg-zinc-900/30">
            {availableUsers.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                {searchQuery ? "No contacts match search." : "All registered contacts are already in this group."}
              </div>
            ) : (
              availableUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <button
                    key={user.id}
                    type="button"
                    onClick={() => toggleUserSelection(user.id)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium"
                        : "hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-zinc-300"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback
                          className={`text-xs font-bold ${
                            isSelected
                              ? "bg-white/20 text-white dark:bg-zinc-900 dark:text-zinc-100"
                              : "bg-slate-200 dark:bg-zinc-700 text-slate-700 dark:text-zinc-200"
                          }`}
                        >
                          {user.user_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col">
                        <span className="text-xs font-semibold">{user.user_name}</span>
                        <span className="text-[10px] opacity-75">{user.email}</span>
                      </div>
                    </div>
                    <div
                      className={`h-5 w-5 rounded-md flex items-center justify-center border transition ${
                        isSelected
                          ? "bg-emerald-500 border-emerald-500 text-white"
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

          {/* Selected Count Indicator */}
          {selectedUserIds.length > 0 && (
            <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {selectedUserIds.length} contact{selectedUserIds.length > 1 ? "s" : ""} selected to add
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
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
              type="submit"
              disabled={loading || selectedUserIds.length === 0}
              className="flex-1 rounded-xl h-10 text-xs font-semibold bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-zinc-200"
            >
              {loading ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> Adding...
                </>
              ) : (
                <>
                  <UserPlus className="h-3.5 w-3.5 mr-1.5" /> Add Members
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
