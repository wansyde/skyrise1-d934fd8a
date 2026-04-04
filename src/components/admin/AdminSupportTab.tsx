import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, Search, ArrowLeft, Settings, AlertCircle, Clock, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface Ticket {
  id: string;
  ticket_number: string;
  user_id: string;
  subject: string;
  status: string;
  created_at: string;
  updated_at: string;
}

interface TicketMessage {
  id: string;
  ticket_id: string;
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

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  open: { label: "Open", icon: <AlertCircle className="h-3.5 w-3.5" />, color: "text-amber-500 bg-amber-500/10" },
  in_progress: { label: "In Progress", icon: <Clock className="h-3.5 w-3.5" />, color: "text-blue-500 bg-blue-500/10" },
  closed: { label: "Closed", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-emerald-500 bg-emerald-500/10" },
};

const AdminSupportTab = () => {
  const [view, setView] = useState<"list" | "chat" | "settings">("list");
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [chatMessages, setChatMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [whatsappNumber, setWhatsappNumber] = useState("");
  const [savingSettings, setSavingSettings] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();

  // Load WhatsApp number
  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("support_settings").select("value").eq("key", "whatsapp_number").single();
      if (data) setWhatsappNumber(data.value);
    };
    load();
  }, []);

  // Get all tickets
  const { data: tickets } = useQuery({
    queryKey: ["admin-support-tickets"],
    queryFn: async () => {
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .order("updated_at", { ascending: false });
      return (data || []) as Ticket[];
    },
    refetchInterval: 5000,
  });

  // Get profiles
  const { data: profiles } = useQuery({
    queryKey: ["admin-profiles-support"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("user_id, username, email, phone");
      return (data || []) as UserProfile[];
    },
  });

  const getProfile = (userId: string) => profiles?.find((p) => p.user_id === userId);

  // Load chat for selected ticket
  useEffect(() => {
    if (!selectedTicket) return;
    const load = async () => {
      const { data } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });
      if (data) setChatMessages(data as TicketMessage[]);
    };
    load();

    const channel = supabase
      .channel(`admin-ticket-${selectedTicket.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "ticket_messages",
        filter: `ticket_id=eq.${selectedTicket.id}`
      }, (payload) => {
        setChatMessages((prev) => {
          if (prev.some(m => m.id === (payload.new as TicketMessage).id)) return prev;
          return [...prev, payload.new as TicketMessage];
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  // Refresh selected ticket from list
  useEffect(() => {
    if (selectedTicket && tickets) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets]);

  const sendReply = async () => {
    if (!newMessage.trim() || !selectedTicket || sending) return;
    setSending(true);
    const { error } = await supabase.from("ticket_messages").insert({
      ticket_id: selectedTicket.id,
      sender_type: "admin",
      message: newMessage.trim(),
    });
    if (error) { toast.error("Failed"); setSending(false); return; }

    // Auto-set to in_progress if open
    if (selectedTicket.status === "open") {
      await supabase.from("support_tickets").update({ status: "in_progress" }).eq("id", selectedTicket.id);
      queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    }

    setNewMessage("");
    setSending(false);
  };

  const changeStatus = async (newStatus: string) => {
    if (!selectedTicket) return;
    const { error } = await supabase.from("support_tickets").update({ status: newStatus }).eq("id", selectedTicket.id);
    if (error) { toast.error("Failed"); return; }
    queryClient.invalidateQueries({ queryKey: ["admin-support-tickets"] });
    toast.success("Updated");
  };

  const saveWhatsapp = async () => {
    setSavingSettings(true);
    const cleanNumber = whatsappNumber.trim().replace(/[^0-9+]/g, "").replace("+", "");
    const { error } = await supabase
      .from("support_settings")
      .upsert({ key: "whatsapp_number", value: cleanNumber, updated_at: new Date().toISOString() }, { onConflict: "key" });
    if (error) { toast.error("Failed"); setSavingSettings(false); return; }
    setWhatsappNumber(cleanNumber);
    toast.success("Saved");
    setSavingSettings(false);
  };

  // SETTINGS VIEW
  if (view === "settings") {
    return (
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <button onClick={() => setView("list")} className="text-muted-foreground hover:text-foreground"><ArrowLeft className="h-5 w-5" /></button>
          <h3 className="text-lg font-semibold">Support Settings</h3>
        </div>
        <div className="bg-card border border-border/40 rounded-xl p-5 max-w-md space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-1 block">WhatsApp Number</label>
            <Input value={whatsappNumber} onChange={(e) => setWhatsappNumber(e.target.value)} placeholder="+1234567890" />
            <p className="text-xs text-muted-foreground mt-1">Include country code.</p>
          </div>
          <Button onClick={saveWhatsapp} disabled={savingSettings}>{savingSettings ? "Saving..." : "Save"}</Button>
        </div>
      </div>
    );
  }

  // CHAT VIEW
  if (view === "chat" && selectedTicket) {
    const userProfile = getProfile(selectedTicket.user_id);
    const isClosed = selectedTicket.status === "closed";
    const sc = statusConfig[selectedTicket.status] || statusConfig.open;

    return (
      <div className="flex flex-col h-[600px]">
        <div className="flex items-center gap-3 pb-3 border-b border-border/40">
          <button onClick={() => { setView("list"); setSelectedTicket(null); }} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p className="font-semibold text-sm">{selectedTicket.ticket_number}</p>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.color}`}>
                {sc.icon} {sc.label}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {userProfile?.username || userProfile?.email || selectedTicket.user_id.slice(0, 8)} · {selectedTicket.subject}
            </p>
          </div>
          <Select value={selectedTicket.status} onValueChange={changeStatus}>
            <SelectTrigger className="w-[130px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {chatMessages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_type === "admin" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
                msg.sender_type === "admin"
                  ? "bg-primary text-primary-foreground rounded-br-md"
                  : "bg-muted text-foreground rounded-bl-md"
              }`}>
                <p className="break-words">{msg.message}</p>
                <p className={`text-[10px] mt-1 ${msg.sender_type === "admin" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {isClosed ? (
          <div className="pt-3 border-t border-border/40 text-center">
            <p className="text-xs text-muted-foreground">Ticket closed. Change status to reply.</p>
          </div>
        ) : (
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
        )}
      </div>
    );
  }

  // LIST VIEW
  const filtered = (tickets || []).filter((t) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (!searchQuery) return true;
    const p = getProfile(t.user_id);
    const q = searchQuery.toLowerCase();
    return t.ticket_number.toLowerCase().includes(q) || (p?.username || "").toLowerCase().includes(q) || (p?.email || "").toLowerCase().includes(q);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search tickets..." className="pl-9" />
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[120px] h-9 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={() => setView("settings")} className="gap-1.5">
            <Settings className="h-3.5 w-3.5" /> Settings
          </Button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center text-muted-foreground py-12 text-sm">No tickets found.</div>
      ) : (
        <div className="space-y-1">
          {filtered.map((t) => {
            const p = getProfile(t.user_id);
            const sc = statusConfig[t.status] || statusConfig.open;
            return (
              <button
                key={t.id}
                onClick={() => { setSelectedTicket(t); setView("chat"); }}
                className="w-full flex items-start gap-3 px-4 py-3 rounded-xl hover:bg-muted/40 transition-colors text-left"
              >
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm shrink-0">
                  {(p?.username || p?.email || "?")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-mono text-muted-foreground">{t.ticket_number}</span>
                    <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${sc.color}`}>
                      {sc.icon} {sc.label}
                    </span>
                  </div>
                  <p className="text-sm font-medium truncate">{p?.username || p?.email || t.user_id.slice(0, 8)}</p>
                  <p className="text-xs text-muted-foreground truncate">{t.subject}</p>
                </div>
                <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                  {new Date(t.updated_at).toLocaleDateString()}
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
