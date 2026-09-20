"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/axios";
import { getEcho } from "@/lib/echo";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import EmojiPicker from "emoji-picker-react";
import CreateGroupModal from "@/components/CreateGroupModal";
import DeleteGroupModal from "@/components/DeleteGroupModal";
import GroupDetailsModal from "@/components/GroupDetailsModal";
import LeaveGroupModal from "@/components/LeaveGroupModal";
import AddMembersModal from "@/components/AddMembersModal";

import {
  Send,
  LogOut,
  MessageSquare,
  Search,
  Users,
  Loader2,
  Check,
  CheckCheck,
  Home,
  X,
  Smile,
  Plus,
  Trash2,
  Info,
  UserPlus,
} from "lucide-react";

interface User {
  id: number;
  user_name: string;
  email: string;
}

interface Message {
  id?: number;
  sender_id: number;
  receiver_id?: number;
  group_id?: number;
  text: string;
  created_at?: string;
  sender?: User;
}

interface Group {
  id: number;
  name: string;
  creator_id: number;
  members: User[];
  created_at?: string;
}

export default function DashboardPage() {
  const router = useRouter();

  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [unreadMessages, setUnreadMessages] = useState<{ [userId: number]: number }>({});
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedGroup, setSelectedGroup] = useState<Group | null>(null);

  const [showCreateGroupModal, setShowCreateGroupModal] = useState(false);
  const [showDeleteGroupModal, setShowDeleteGroupModal] = useState(false);
  const [showLeaveGroupModal, setShowLeaveGroupModal] = useState(false);
  const [showAddMembersModal, setShowAddMembersModal] = useState(false);
  const [showGroupDetailsModal, setShowGroupDetailsModal] = useState(false);
  const [addMembersSource, setAddMembersSource] = useState<"header" | "details" | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [now, setNow] = useState(Date.now());
  const [lastDelivery, setLastDelivery] = useState<{
    latencyMs: number;
    text: string;
    receiverId?: number;
    timestamp: number;
  } | null>(null);

  // GIF Picker States
  const [showGifPicker, setShowGifPicker] = useState(false);
  const [gifSearchQuery, setGifSearchQuery] = useState("");
  const [gifs, setGifs] = useState<string[]>([]);
  const [loadingGifs, setLoadingGifs] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);
  const selectedUserRef = useRef<User | null>(null);
  const selectedGroupRef = useRef<Group | null>(null);

  const isGifUrl = (text: string) => {
    return (
      /^https?:\/\/.*?\.(gif|webp|png|jpg)(\?.*)?$/i.test(text.trim()) ||
      text.includes("giphy.com") ||
      text.includes("tenor.com")
    );
  };

  const fetchGifs = async (query = "") => {
    setLoadingGifs(true);
    try {
      const apiKey = process.env.NEXT_PUBLIC_GIPHY_API_KEY || "glT4tyw2hFikn7e7i9nBWW7zR3y28F5G";

      const endpoint = query
        ? `https://api.giphy.com/v1/gifs/search?api_key=${apiKey}&q=${encodeURIComponent(query)}&limit=12`
        : `https://api.giphy.com/v1/gifs/trending?api_key=${apiKey}&limit=12`;

      const res = await fetch(endpoint);
      const data = await res.json();
      const urls = data.data.map((item: any) => item.images.fixed_height.url);
      setGifs(urls);
    } catch (err) {
      console.error("Failed to fetch GIFs:", err);
      setGifs([]);
    } finally {
      setLoadingGifs(false);
    }
  };

  useEffect(() => {
    if (showGifPicker) {
      fetchGifs(gifSearchQuery);
    }
  }, [showGifPicker]);

  const handleSelectGif = async (gifUrl: string) => {
    setShowGifPicker(false);
    if ((!selectedUser && !selectedGroup) || !currentUser) return;

    const tempId = Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: selectedUser ? selectedUser.id : undefined,
      group_id: selectedGroup ? selectedGroup.id : undefined,
      text: gifUrl,
      created_at: new Date().toISOString(),
      sender: currentUser,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      let response;
      if (selectedUser) {
        response = await api.post("/messages", { receiver_id: selectedUser.id, text: gifUrl });
      } else if (selectedGroup) {
        response = await api.post(`/groups/${selectedGroup.id}/messages`, { text: gifUrl });
      }

      if (response?.data) {
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? response.data : msg)));
      }
    } catch (err) {
      console.error("Failed to send GIF:", err);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  // Helper: format relative time
  const formatRelativeTime = (dateStr?: string) => {
    if (!dateStr) return "";
    const diff = Math.max(0, now - new Date(dateStr).getTime());
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 5) return "just now";
    if (seconds < 60) return `${seconds}s ago`;
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
  };

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 10000);
    return () => clearInterval(interval);
  }, []);

  //  Fetch Current Logged-in User, Users, and Groups
  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchInitialData = async () => {
      try {
        const [meRes, usersRes, groupsRes] = await Promise.all([
          api.get("/me"),
          api.get("/users"),
          api.get("/groups"),
        ]);

        setCurrentUser(meRes.data);
        setUsers(usersRes.data);
        setGroups(groupsRes.data);
      } catch (err: any) {
        console.error("Authentication check failed:", err);
        if (err.response?.status === 401) {
          localStorage.removeItem("token");
        }
        router.push("/login");
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchInitialData();
  }, [router]);

  //  Fetch Messages when a user is selected
  useEffect(() => {
    if (!selectedUser) return;
    setSelectedGroup(null); // Clear active group

    setUnreadMessages((prev) => ({
      ...prev,
      [selectedUser.id]: 0,
    }));

    const fetchMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await api.get(`/messages/${selectedUser.id}`);
        setMessages(response.data);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [selectedUser]);

  //  Fetch Messages when a group is selected
  useEffect(() => {
    if (!selectedGroup) return;
    setSelectedUser(null); // Clear active user

    const fetchGroupMessages = async () => {
      setLoadingMessages(true);
      try {
        const response = await api.get(`/groups/${selectedGroup.id}/messages`);
        setMessages(response.data);
      } catch (err) {
        console.error("Failed to load group messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    };

    fetchGroupMessages();
  }, [selectedGroup]);

  //  1-on-1 WebSocket Listener
  useEffect(() => {
    selectedUserRef.current = selectedUser;
  }, [selectedUser]);

  useEffect(() => {
    const echo = getEcho();
    if (typeof window !== "undefined" && echo && currentUser) {
      const channel = echo.channel("chat");

      channel.listen(".MessageSent", (event: { message: Message }) => {
        const activeUser = selectedUserRef.current;
        const incomingSenderId = event.message.sender_id;

        if (
          event.message.receiver_id === currentUser.id &&
          (!activeUser || activeUser.id !== incomingSenderId)
        ) {
          setUnreadMessages((prev) => ({
            ...prev,
            [incomingSenderId]: (prev[incomingSenderId] || 0) + 1,
          }));
        }

        if (
          activeUser &&
          (incomingSenderId === activeUser.id || event.message.receiver_id === activeUser.id)
        ) {
          setMessages((prev) => {
            const existsByRealId = prev.some((m) => m.id && m.id === event.message.id);
            if (existsByRealId) return prev;

            const optimisticIndex = prev.findIndex(
              (m) =>
                m.id &&
                m.id > 1000000000000 &&
                m.sender_id === event.message.sender_id &&
                m.receiver_id === event.message.receiver_id &&
                m.text === event.message.text
            );

            if (optimisticIndex !== -1) {
              const updated = [...prev];
              updated[optimisticIndex] = event.message;
              return updated;
            }

            return [...prev, event.message];
          });
        }
      });

      return () => {
        channel.stopListening(".MessageSent");
      };
    }
  }, [currentUser]);

  //  Group WebSocket Listener
  useEffect(() => {
    selectedGroupRef.current = selectedGroup;
  }, [selectedGroup]);

  useEffect(() => {
    const echo = getEcho();

    if (typeof window !== "undefined" && echo && selectedGroup) {
      const channel = echo.private(`group.${selectedGroup.id}`);

      channel.listen(".GroupMessageSent", (event: { message: Message }) => {
        setMessages((prev) => {
          const existsByRealId = prev.some((m) => m.id && m.id === event.message.id);
          if (existsByRealId) return prev;

          const optimisticIndex = prev.findIndex(
            (m) =>
              m.id &&
              m.id > 1000000000000 &&
              m.sender_id === event.message.sender_id &&
              m.text === event.message.text
          );

          if (optimisticIndex !== -1) {
            const updated = [...prev];
            updated[optimisticIndex] = event.message;
            return updated;
          }

          return [...prev, event.message];
        });
      });

      channel.listen(".GroupDeleted", (event: { group_id: number }) => {
        setGroups((prev) => prev.filter((g) => g.id !== event.group_id));
        if (selectedGroupRef.current?.id === event.group_id) {
          setSelectedGroup(null);
          setMessages([]);
        }
      });

      return () => {
        channel.stopListening(".GroupMessageSent");
        channel.stopListening(".GroupDeleted");
      };
    }
  }, [selectedGroup]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (!scrollRef.current) return;

    const raf = requestAnimationFrame(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    });
    return () => {
      cancelAnimationFrame(raf);
    };
  }, [messages, selectedUser, selectedGroup]);

  // Send Message Handler
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || (!selectedUser && !selectedGroup) || !currentUser) return;

    const textToSend = newMessage;
    setNewMessage("");

    const tempId = Date.now();
    const optimisticMsg: Message = {
      id: tempId,
      sender_id: currentUser.id,
      receiver_id: selectedUser ? selectedUser.id : undefined,
      group_id: selectedGroup ? selectedGroup.id : undefined,
      text: textToSend,
      created_at: new Date().toISOString(),
      sender: currentUser,
    };

    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      let response;
      if (selectedUser) {
        response = await api.post("/messages", {
          receiver_id: selectedUser.id,
          text: textToSend,
        });
      } else if (selectedGroup) {
        response = await api.post(`/groups/${selectedGroup.id}/messages`, {
          text: textToSend,
        });
      }

      if (response?.data) {
        setMessages((prev) => prev.map((msg) => (msg.id === tempId ? response.data : msg)));
      }
    } catch (err) {
      console.error("Failed to send message:", err);
      setMessages((prev) => prev.filter((msg) => msg.id !== tempId));
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    try {
      await api.post("/logout");
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      localStorage.removeItem("token");
      router.push("/login");
    }
  };

  // Create Group Handler
  const handleCreateGroup = async (name: string, selectedUserIds: number[]) => {
    const res = await api.post("/groups", {
      name,
      user_ids: selectedUserIds,
    });
    setGroups((prev) => [...prev, res.data]);
    setSelectedGroup(res.data);
    setSelectedUser(null);
  };

  // Confirm and Execute Delete Group (Creator Only)
  const confirmDeleteGroup = async () => {
    if (!selectedGroup) return;
    const groupId = selectedGroup.id;

    try {
      await api.delete(`/groups/${groupId}`);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setSelectedGroup(null);
      setMessages([]);
    } catch (err: any) {
      console.error("Failed to delete group:", err);
      alert(err.response?.data?.message || "Failed to delete group.");
    }
  };

  // Confirm and Execute Leave Group (Members Only)
  const confirmLeaveGroup = async () => {
    if (!selectedGroup) return;
    const groupId = selectedGroup.id;

    try {
      await api.post(`/groups/${groupId}/leave`);
      setGroups((prev) => prev.filter((g) => g.id !== groupId));
      setSelectedGroup(null);
      setMessages([]);
    } catch (err: any) {
      console.error("Failed to leave group:", err);
      alert(err.response?.data?.message || "Failed to leave group.");
    }
  };

  // Add Members Handler (Creator Only)
  const handleAddMembers = async (groupId: number, selectedUserIds: number[]) => {
    try {
      const res = await api.post(`/groups/${groupId}/members`, {
        user_ids: selectedUserIds,
      });

      setGroups((prev) => prev.map((g) => (g.id === groupId ? res.data : g)));
      setSelectedGroup(res.data);
    } catch (err: any) {
      console.error("Failed to add members:", err);
      alert(err.response?.data?.message || "Failed to add members.");
    }
  };

  const filteredUsers = users.filter((u) =>
    u.user_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredGroups = groups.filter((g) =>
    g.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const selectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedGroup(null);
    setUnreadMessages((prev) => ({
      ...prev,
      [user.id]: 0,
    }));
  };

  const selectGroup = (group: Group) => {
    setSelectedGroup(group);
    setSelectedUser(null);
  };

  const activeTargetName = selectedUser?.user_name || selectedGroup?.name || "";

  return (
    <div className="flex h-screen w-full bg-slate-100 dark:bg-slate-950 overflow-hidden">
      {/* SIDEBAR */}
      <aside className="w-80 border-r bg-white dark:bg-slate-900 flex flex-col h-full">
        {/* Sidebar Header with Branding */}
        <div className="border-b border-zinc-800 bg-zinc-950 px-4 py-3 text-white">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 font-bold text-white"
              title="Back to home"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/20 backdrop-blur-sm">
                <MessageSquare className="h-4 w-4" />
              </div>
              <span>ChatChat</span>
            </button>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Log out"
              className="h-8 w-8 text-white/80 hover:text-white hover:bg-white/15"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
          <div className="mt-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9 border-2 border-white/30">
                <AvatarFallback className="bg-white/20 text-white font-bold text-xs">
                  {currentUser?.user_name?.slice(0, 2).toUpperCase() || "ME"}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="text-sm font-semibold leading-tight text-white">
                  {currentUser?.user_name || "Loading..."}
                </span>
                <span className="text-xs text-white/70 truncate">{currentUser?.email}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar & Create Group Button */}
        <div className="p-3 border-b flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8 text-sm h-9 bg-slate-50 dark:bg-slate-800"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            size="sm"
            onClick={() => setShowCreateGroupModal(true)}
            className="h-9 px-2.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 font-semibold text-xs flex items-center gap-1 shrink-0"
            title="Create New Group"
          >
            <Plus className="h-4 w-4" />
            <span className="hidden sm:inline">Group</span>
          </Button>
        </div>

        {/* User & Group List Feed */}
        <ScrollArea className="flex-1 p-2 space-y-4">
          {/* GROUPS SECTION */}
          {filteredGroups.length > 0 && (
            <div className="mb-3">
              <div className="px-3 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                <Users className="h-3.5 w-3.5" /> Groups ({filteredGroups.length})
              </div>
              {filteredGroups.map((group) => {
                const isSelected = selectedGroup?.id === group.id;
                return (
                  <button
                    key={group.id}
                    onClick={() => selectGroup(group)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all mb-1 ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-zinc-800 text-zinc-100 font-bold text-xs">
                        {group.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 overflow-hidden">
                      <span className="text-sm font-semibold truncate block">{group.name}</span>
                      <span className="text-[11px] text-muted-foreground truncate block">
                        {group.members?.length || 0} members
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* DIRECT MESSAGES SECTION */}
          <div>
            <div className="px-3 py-1 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
              Direct Messages
            </div>
            {loadingUsers ? (
              <div className="flex items-center justify-center p-6 text-xs text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading contacts...
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="p-4 text-center text-xs text-muted-foreground">
                No contacts found.
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUser?.id === user.id;
                const unreadCount = unreadMessages[user.id] || 0;
                return (
                  <button
                    key={user.id}
                    onClick={() => selectUser(user)}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all mb-1 ${
                      isSelected
                        ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                        : "hover:bg-slate-100 dark:hover:bg-slate-800"
                    }`}
                  >
                    <div className="relative">
                      <Avatar className="h-9 w-9">
                        <AvatarFallback
                          className={`text-xs font-semibold ${
                            isSelected
                              ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950"
                              : "bg-slate-200 dark:bg-slate-700"
                          }`}
                        >
                          {user.user_name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex justify-between items-center">
                        <span className="text-sm truncate">{user.user_name}</span>
                        {unreadCount > 0 && !isSelected && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 px-1.5 text-[10px] font-bold shadow-sm">
                            {unreadCount > 99 ? "99+" : unreadCount}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground truncate block">
                        {user.email}
                      </span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </aside>

      {/* MAIN CHAT AREA */}
      <main className="flex-1 flex flex-col h-full bg-slate-50 dark:bg-slate-950">
        {selectedUser || selectedGroup ? (
          <>
            {/* Chat Top Header */}
            <div className="h-16 border-b bg-white dark:bg-slate-900 px-6 flex items-center justify-between shadow-sm">
              <button
                type="button"
                onClick={() => {
                  if (selectedGroup) {
                    setShowGroupDetailsModal(true);
                  }
                }}
                className={`flex items-center gap-3 p-1.5 -ml-1.5 rounded-xl text-left transition-colors ${
                  selectedGroup ? "hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer" : ""
                }`}
                title={selectedGroup ? "Click to view Group Info & Members" : undefined}
              >
                <div className="relative">
                  <Avatar className="h-9 w-9">
                    <AvatarFallback className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 font-semibold text-xs">
                      {activeTargetName.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {selectedUser && (
                    <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-white bg-emerald-500 dark:border-slate-900" />
                  )}
                </div>
                <div>
                  <h2 className="text-sm font-semibold leading-none flex items-center gap-1.5">
                    {activeTargetName}
                    {selectedGroup && (
                      <span className="text-[10px] bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-zinc-400 px-1.5 py-0.5 rounded font-normal border border-slate-200 dark:border-zinc-700">
                        Info
                      </span>
                    )}
                  </h2>
                  <span className="text-[11px] text-muted-foreground mt-0.5 block">
                    {selectedUser
                      ? "Active now"
                      : `${selectedGroup?.members?.length || 0} members • Click for info`}
                  </span>
                </div>
              </button>

              <div className="flex items-center gap-2">
                {selectedGroup && currentUser?.id === selectedGroup.creator_id && (
                  <button
                    onClick={() => {
                      setAddMembersSource("header");
                      setShowAddMembersModal(true);
                    }}
                    className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-zinc-900 dark:text-zinc-100  dark:hover:bg-zinc-700 transition-colors"
                    title="Add members to group (Creator only)"
                  >
                    <UserPlus className="h-3.5 w-3.5" />
                    Add Member
                  </button>
                )}
                {selectedGroup &&
                  (currentUser?.id === selectedGroup.creator_id ? (
                    <button
                      onClick={() => setShowDeleteGroupModal(true)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                      title="Collapse and delete group (Creator only)"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Group
                    </button>
                  ) : (
                    <button
                      onClick={() => setShowLeaveGroupModal(true)}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-amber-600  transition-colors"
                      title="Leave this group"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Leave Group
                    </button>
                  ))}
                <button
                  onClick={() => {
                    setSelectedUser(null);
                    setSelectedGroup(null);
                  }}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-slate-500 transition-colors hover:bg-slate-100 hover:text-zinc-900 dark:text-slate-400 dark:hover:bg-slate-800"
                  title="Close conversation"
                >
                  <X className="h-3.5 w-3.5" />
                  Close
                </button>
              </div>
            </div>

            {/* Chat Messages Feed */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50 dark:bg-slate-950"
            >
              {loadingMessages ? (
                <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" /> Loading chat history...
                </div>
              ) : messages.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-muted-foreground">
                  <MessageSquare className="h-10 w-10 mb-2 opacity-20" />
                  <p className="text-sm">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.sender_id === currentUser?.id;
                  const senderName = msg.sender?.user_name || "User";
                  const isSystemNotification =
                    msg.text.includes("left the group") || msg.text.includes("added ");

                  if (isSystemNotification) {
                    return (
                      <div
                        key={msg.id || index}
                        className="flex justify-center my-2 animate-in fade-in zoom-in-95 duration-150"
                      >
                        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 text-[11px] font-semibold text-slate-600 dark:text-zinc-400 ">
                          {msg.text.includes("left") ? (
                            <LogOut className="h-3 w-3 text-amber-500" />
                          ) : (
                            <UserPlus className="h-3 w-3 text-emerald-500" />
                          )}
                          <span>{msg.text}</span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={msg.id || index}
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                    >
                      {/* Show sender name for group chat if message from others */}
                      {selectedGroup && !isMe && (
                        <span className="text-[11px] font-semibold text-slate-500 mb-1 ml-1">
                          {senderName}
                        </span>
                      )}

                      <div
                        className={`max-w-md rounded-2xl px-4 py-2.5 text-sm shadow-sm transition-all ${
                          isMe
                            ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded-br-md rounded-bl-2xl font-normal"
                            : "bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-md rounded-br-2xl"
                        }`}
                      >
                        {isGifUrl(msg.text) ? (
                          <img
                            src={msg.text}
                            alt="GIF"
                            onLoad={() => {
                              if (scrollRef.current) {
                                scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                              }
                            }}
                            className="rounded-xl max-w-[280px] max-h-[260px] w-auto h-auto object-contain shadow-sm my-1 transition-transform cursor-pointer"
                          />
                        ) : (
                          <p className="text-sm leading-relaxed">{msg.text}</p>
                        )}
                      </div>
                      <div
                        className={`mt-1 flex items-center gap-1 text-[10px] text-slate-400 ${
                          isMe ? "flex-row" : "flex-row-reverse"
                        }`}
                      >
                        <span>{formatRelativeTime(msg.created_at)}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Input Message Form */}
            <div className="border-t bg-white dark:bg-slate-900 px-4 py-3">
              <form
                onSubmit={handleSendMessage}
                className="flex items-center gap-2 max-w-4xl mx-auto"
              >
                <div className="flex items-center gap-1 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-3 flex-1 h-11 focus-within:ring-2 focus-within:ring-zinc-400/40 focus-within:border-zinc-500 transition relative">
                  {/* GIF Picker Popup */}
                  {showGifPicker && (
                    <div className="absolute bottom-14 right-12 z-50 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col h-96 animate-in fade-in zoom-in-95 duration-100">
                      <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex flex-col gap-2 bg-slate-50 dark:bg-slate-800/50">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
                            GIFs
                          </span>
                          <button
                            type="button"
                            onClick={() => setShowGifPicker(false)}
                            className="h-6 w-6 rounded-full flex items-center justify-center text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                        <Search className="absolute left-5 top-11 h-3.5 w-3.5 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search GIFs on Giphy..."
                          value={gifSearchQuery}
                          onChange={(e) => {
                            setGifSearchQuery(e.target.value);
                            fetchGifs(e.target.value);
                          }}
                          className="w-full pl-8 pr-3 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-zinc-400/40"
                        />
                      </div>
                      <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-2">
                        {loadingGifs ? (
                          <div className="col-span-2 flex items-center justify-center p-8 text-xs text-slate-400">
                            <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading GIFs...
                          </div>
                        ) : gifs.length === 0 ? (
                          <div className="col-span-2 text-center p-8 text-xs text-slate-400">
                            No GIFs found.
                          </div>
                        ) : (
                          gifs.map((url, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => handleSelectGif(url)}
                              className="group relative h-28 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all shadow-sm border border-slate-200 dark:border-slate-700 shrink-0"
                            >
                              <img
                                src={url}
                                alt="GIF"
                                className="w-full h-full object-cover rounded-xl"
                              />
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                  )}

                  <Input
                    placeholder={`Message ${activeTargetName}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="flex-1 text-sm h-full border-0 bg-transparent shadow-none focus-visible:ring-0 px-2"
                  />
                  {showEmojiPicker && (
                    <div className="absolute bottom-14 right-4 z-50 shadow-2xl rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 animate-in fade-in zoom-in-95 duration-100">
                      <div className="flex justify-between items-center px-3 py-2 bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
                        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                          Choose an Emoji
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowEmojiPicker(false)}
                          className="h-6 w-6 rounded-full flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                      <EmojiPicker
                        onEmojiClick={(emojiData) => {
                          setNewMessage((prev) => prev + emojiData.emoji);
                        }}
                      />
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setShowGifPicker((prev) => !prev);
                      setShowEmojiPicker(false);
                    }}
                    className="px-1.5 py-0.5 rounded-md border border-slate-300 dark:border-slate-700 text-[10px] font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                  >
                    GIF
                  </button>
                  <Smile
                    onClick={() => setShowEmojiPicker((prev) => !prev)}
                    className="h-4 w-4 text-slate-400 shrink-0 cursor-pointer"
                  />
                </div>
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-2xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-950 text-white shadow-sm"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </>
        ) : (
          /* Empty Active State */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="relative mb-6">
              <div className="h-20 w-20 rounded-2xl bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 flex items-center justify-center shadow-lg border border-zinc-800">
                <MessageSquare className="h-10 w-10" />
              </div>
            </div>
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              Welcome to ChatChat
            </h3>
            <p className="text-sm max-w-sm mt-2 text-slate-500 dark:text-slate-400">
              Choose a contact or group from the sidebar to start a real-time conversation.
            </p>
            <button
              onClick={() => router.push("/")}
              className="mt-6 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-100 hover:text-zinc-900 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              <Home className="h-3.5 w-3.5" />
              Back to home
            </button>
          </div>
        )}
      </main>

      {/* CREATE GROUP MODAL */}
      <CreateGroupModal
        isOpen={showCreateGroupModal}
        onClose={() => setShowCreateGroupModal(false)}
        users={users}
        currentUser={currentUser}
        onCreateGroup={handleCreateGroup}
      />

      {/* CUSTOM DELETE GROUP CONFIRMATION MODAL */}
      <DeleteGroupModal
        isOpen={showDeleteGroupModal}
        groupName={selectedGroup?.name || ""}
        onClose={() => setShowDeleteGroupModal(false)}
        onConfirmDelete={confirmDeleteGroup}
      />

      {/* CUSTOM LEAVE GROUP CONFIRMATION MODAL */}
      <LeaveGroupModal
        isOpen={showLeaveGroupModal}
        groupName={selectedGroup?.name || ""}
        onClose={() => setShowLeaveGroupModal(false)}
        onConfirmLeave={confirmLeaveGroup}
      />

      {/* ADD MEMBERS MODAL (CREATOR ONLY) */}
      <AddMembersModal
        isOpen={showAddMembersModal}
        group={selectedGroup}
        allUsers={users}
        onClose={() => {
          setShowAddMembersModal(false);
          if (addMembersSource === "details") {
            setShowGroupDetailsModal(true);
          }
          setAddMembersSource(null);
        }}
        onAddMembers={handleAddMembers}
      />

      {/* GROUP DETAILS & MEMBERS MODAL */}
      <GroupDetailsModal
        isOpen={showGroupDetailsModal}
        onClose={() => setShowGroupDetailsModal(false)}
        group={selectedGroup}
        currentUserId={currentUser?.id}
        onOpenAddMembers={() => {
          setAddMembersSource("details");
          setShowGroupDetailsModal(false);
          setShowAddMembersModal(true);
        }}
      />
    </div>
  );
}
