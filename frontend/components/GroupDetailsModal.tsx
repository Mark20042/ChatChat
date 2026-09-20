"use client";

import { X, Users, ShieldCheck, Calendar, UserPlus } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

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
  created_at?: string;
}

interface GroupDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  group: Group | null;
  currentUserId?: number;
  onOpenAddMembers?: () => void;
}

export default function GroupDetailsModal({
  isOpen,
  onClose,
  group,
  currentUserId,
  onOpenAddMembers,
}: GroupDetailsModalProps) {
  if (!isOpen || !group) return null;

  // Find creator user from members list if present
  const creatorUser = group.members?.find((m) => m.id === group.creator_id);

  const formattedCreatedDate = group.created_at
    ? new Date(group.created_at).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Recently";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
          <div className="flex items-center gap-2.5 font-bold text-slate-900 dark:text-zinc-100">
            <div className="h-8 w-8 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
            <span>Group Info</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-8 w-8 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-zinc-800 transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6">
          {/* Group Overview Banner */}
          <div className="flex flex-col items-center text-center p-4 rounded-2xl bg-slate-50 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
            <Avatar className="h-16 w-16 mb-3 shadow-md border-2 border-white dark:border-zinc-700">
              <AvatarFallback className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold text-xl">
                {group.name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 leading-tight">
              {group.name}
            </h3>
            <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500 dark:text-zinc-400">
              <Calendar className="h-3.5 w-3.5" />
              <span>Created {formattedCreatedDate}</span>
            </div>
          </div>

          {/* Group Creator Card */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              Group Creator
            </span>
            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-zinc-800/40 border border-slate-200/60 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-semibold">
                    {creatorUser ? creatorUser.user_name.slice(0, 2).toUpperCase() : "CR"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {creatorUser?.user_name || "Group Creator"}
                  </span>
                  <span className="text-[11px] text-slate-400">
                    {creatorUser?.email || "Creator"}
                  </span>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20">
                <ShieldCheck className="h-3 w-3" /> Admin
              </span>
            </div>
          </div>

          {/* Group Members List */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Members ({group.members?.length || 0})
              </span>
              {currentUserId === group.creator_id && onOpenAddMembers && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddMembers();
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-900 dark:text-zinc-100 bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 px-2.5 py-1 rounded-lg transition"
                >
                  <UserPlus className="h-3 w-3" />
                  <span>Add Members</span>
                </button>
              )}
            </div>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {group.members && group.members.length > 0 ? (
                group.members.map((member) => {
                  const isCreator = member.id === group.creator_id;
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-slate-200 dark:bg-zinc-700 text-xs font-semibold text-slate-800 dark:text-zinc-200">
                            {member.user_name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                            {member.user_name}
                          </span>
                          <span className="text-[11px] text-slate-400">{member.email}</span>
                        </div>
                      </div>
                      {isCreator ? (
                        <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded-md">
                          Creator
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Member</span>
                      )}
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-4 text-xs text-slate-400">
                  No members loaded.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900/50">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs transition hover:bg-zinc-800 dark:hover:bg-zinc-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
