import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, ArrowLeft, Settings } from "lucide-react";
import { toast } from "sonner";

interface Message {
  id: string;
  user_id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

interface UserProfile {
  user_id: string;
  username: string | null;
  email: string;
  phone: string | null;
}

const AdminSupportTab = () => {
  const [view, setView] = useState<"list" | "chat" | "settings">("list");
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Load WhatsApp number
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("support_settings")
        .select("value")
        .eq("key", "whatsapp_number")
        .single();
      if (data) setWhatsappNumber(data.value);
    };
    load();
  }, []);

  // Get all conversations (distinct user_ids with messages)
  const { data: conversations } = useQuery({
    queryKey: ["admin-support-conversations"],
    queryFn: async () => {
      const { data } = await supabase
        .from("support_messages")
        .select("user_id, created_at, message, sender_type")
        .order("created_at", { ascending: false });
      if (!data) return [];
      // Group by user_id, get latest message
      const map = new Map<string, { user_id: string; last_message: string; last_time: string; sender_type: string }>();
      for (const msg of data) {
        if (!map.has(msg.user_id)) {
          map.set(msg.user_id, { user_id: msg.user_id, last_message: msg.message, last_time: msg.created_at, sender_type: msg.sender_type });
        }
      }
      return Array.from(map.values());
    },
    refetchInterval: 5000,
  });

  // Get profiles for display
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-support"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, username, email, phone");
      return (data || []) as UserProfile[];
    },
  });

  const getProfile = (userId: string) => profiles?.find((p) => p.user_id === userId);

  // Load chat for selected user
  useEffect(() => {
    if (!selectedUserId) return;
    const load = async () => {
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("user_id", selectedUserId)
        .order("created_at", { ascending: true });
      if (data) setChatMessages(data as Message[]);
    };
    load();

    const channel = supabase
      .channel("admin-support-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${selectedUserId}` },
        (payload) => {
          setChatMessages((prev) => [...prev, payload.new as Message]);
          queryClient.invalidateQueries({ queryKey: ["admin-support-conversations"] });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  const sendReply = async () => {
    if (!newMessage.trim() || !selectedUserId || sending) return;
    setSending(true);
    const { error } = await supabase.from("support_messages").insert({
      user_id: selectedUserId,
      sender_type: "admin",
      message: newMessage.trim(),
    });
    if (error) { toast.error("Failed to send"); setSending(false); return; }
    setNewMessage("");
    setSending(false);
  };

  const saveWhatsapp = async () => {
    setSavingSettings(true);
    const { error } = await supabase
      .from("support_settings")
      .update({ value: whatsappNumber.trim(), updated_at: new Date().toISOString() })
      .eq("key", "whatsapp_number");
    if (error) { toast.error("Failed to save"); setSavingSettings(false); return; }
    toast.success("WhatsApp number updated");
    setSavingSettings(false);
  };

  // Settings view
  if (view === "settings") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setView("list")} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h3 className="text-lg font-semibold">Support Settings</h3>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-5 max-w-md space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">WhatsApp Number</label>
            <Input
              value={whatsappNumber}
              onChange={(e) => setWhatsappNumber(e.target.value)}
              placeholder="+1234567890"
            />
            <p className="text-xs text-muted-foreground mt-1">Include country code. This appears on the floating support button.</p>
          </div>
          <Button onClick={saveWhatsapp} disabled={savingSettings}>
            {savingSettings ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </div>
    );
  }

  // Chat view
  if (view === "chat" && selectedUserId) {
    const userProfile = getProfile(selectedUserId);
    return (
      <div className="flex flex-col h-[600px]">
        <div className="flex items-center gap-3 pb-3 border-b border-border/40">
          <button onClick={() => { setView("list"); setSelectedUserId(null); }} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <p className="font-semibold text-sm">{userProfile?.username || userProfile?.email || selectedUserId.slice(0, 8)}</p>
            <p className="text-xs text-muted-foreground">{userProfile?.phone || "No WhatsApp"}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                  msg.sender_type === "admin"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                <p className="break-words">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${msg.sender_type === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        <div className="pt-3 border-t border-border/40 flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendReply(); } }}
            placeholder="Type a reply..."
            disabled={sending}
          />
          <Button onClick={sendReply} size="icon" disabled={!newMessage.trim() || sending}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  // List view
  const filtered = (conversations || []).filter((c) => {
    if (!searchQuery) return true;
    const p = getProfile(c.user_id);
    const q = searchQuery.toLowerCase();
    return (p?.username || "").toLowerCase().includes(q) || (p?.email || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search conversations..."
            className="pl-9"
          />
        </div>
        <Button variant="outline" size="sm" onClick={() => setView("settings")} className="gap-1.5">
          <Settings className="h-3.5 w-3.5" /> Settings
        </Button>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 text-sm">No conversations yet.</div>
      ) : (
        <div className="space-y-1">
          {filtered.map((c) => {
            const p = getProfile(c.user_id);
            return (
              <button
                key={c.user_id}
                onClick={() => { setSelectedUserId(c.user_id); setView("chat"); }}
                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-muted/40 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                  {(p?.username || p?.email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{p?.username || p?.email || c.user_id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground truncate">
                    {c.sender_type === "admin" ? "You: " : ""}{c.last_message}
                  </p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                  {new Date(c.last_time).toLocaleDateString()}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AdminSupportTab;
