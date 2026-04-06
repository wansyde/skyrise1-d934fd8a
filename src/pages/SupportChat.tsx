import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft, Check, Plus, MessageSquare, Clock, CheckCircle2, AlertCircle, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
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
  image_url?: string | null;
  created_at: string;
  _optimistic?: boolean;
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  open: { label: "Open", icon: <AlertCircle className="h-3.5 w-3.5" />, color: "text-amber-500 bg-amber-500/10" },
  in_progress: { label: "In Progress", icon: <Clock className="h-3.5 w-3.5" />, color: "text-blue-500 bg-blue-500/10" },
  closed: { label: "Closed", icon: <CheckCircle2 className="h-3.5 w-3.5" />, color: "text-emerald-500 bg-emerald-500/10" },
};

const SUBJECTS = ["Withdrawal Issue", "Task Issue", "Account Issue", "Other"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

const SupportChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [view, setView] = useState<"list" | "chat" | "new">("list");
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [newSubject, setNewSubject] = useState("Other");
  const [newInitialMessage, setNewInitialMessage] = useState("");
  const [creating, setCreating] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);
  const [attachPreview, setAttachPreview] = useState<string | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user) return;
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("support_tickets")
        .select("*")
        .eq("user_id", user.id)
        .order("updated_at", { ascending: false });
      if (data) setTickets(data as Ticket[]);
      setLoading(false);
    };
    load();
    const channel = supabase
      .channel("user-tickets")
      .on("postgres_changes", { event: "*", schema: "public", table: "support_tickets", filter: `user_id=eq.${user.id}` }, () => { load(); })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    if (!selectedTicket) return;
    const load = async () => {
      const { data } = await supabase
        .from("ticket_messages")
        .select("*")
        .eq("ticket_id", selectedTicket.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as TicketMessage[]);
    };
    load();
    const channel = supabase
      .channel(`ticket-msgs-${selectedTicket.id}`)
      .on("postgres_changes", {
        event: "INSERT", schema: "public", table: "ticket_messages",
        filter: `ticket_id=eq.${selectedTicket.id}`
      }, (payload) => {
        const newMsg = payload.new as TicketMessage;
        setMessages((prev) => {
          const optIdx = prev.findIndex(m => m._optimistic && m.message === newMsg.message && m.sender_type === newMsg.sender_type);
          if (optIdx !== -1) { const u = [...prev]; u[optIdx] = newMsg; return u; }
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [selectedTicket]);

  const scrollToBottom = useCallback(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);
  useEffect(() => { scrollToBottom(); }, [messages, scrollToBottom]);

  useEffect(() => {
    if (selectedTicket) {
      const updated = tickets.find(t => t.id === selectedTicket.id);
      if (updated) setSelectedTicket(updated);
    }
  }, [tickets]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > MAX_FILE_SIZE) {
      toast.error("File too large. Maximum size is 5MB");
      return;
    }
    if (!file.type.startsWith("image/") && file.type !== "application/pdf") {
      toast.error("Only images and PDFs are supported");
      return;
    }
    setAttachedFile(file);
    if (file.type.startsWith("image/")) {
      setAttachPreview(URL.createObjectURL(file));
    } else {
      setAttachPreview(null);
    }
  };

  const clearAttachment = () => {
    setAttachedFile(null);
    if (attachPreview) URL.revokeObjectURL(attachPreview);
    setAttachPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const ext = file.name.split(".").pop();
    const path = `${user!.id}/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from("support-attachments").upload(path, file);
    if (error) { toast.error("Upload failed"); return null; }
    const { data: { publicUrl } } = supabase.storage.from("support-attachments").getPublicUrl(path);
    return publicUrl;
  };

  const createTicket = async () => {
    if (!newInitialMessage.trim() || creating) return;
    setCreating(true);
    const { data: ticketData, error: ticketError } = await supabase
      .from("support_tickets")
      .insert([{ user_id: user!.id, subject: newSubject, ticket_number: "TEMP" }])
      .select()
      .single();
    if (ticketError || !ticketData) {
      toast.error("Failed to create ticket");
      setCreating(false);
      return;
    }
    await supabase.from("ticket_messages").insert({
      ticket_id: ticketData.id,
      sender_type: "user",
      message: newInitialMessage.trim(),
    });
    setSelectedTicket(ticketData as Ticket);
    setNewInitialMessage("");
    setNewSubject("Other");
    setView("chat");
    setCreating(false);
    toast.success("Ticket created");
  };

  const sendMessage = async () => {
    if ((!newMessage.trim() && !attachedFile) || sending || !selectedTicket || selectedTicket.status === "closed") return;
    const text = newMessage.trim();
    const file = attachedFile;
    setNewMessage("");
    clearAttachment();
    setSending(true);

    let imageUrl: string | null = null;
    if (file) {
      imageUrl = await uploadFile(file);
      if (!imageUrl && !text) { setSending(false); return; }
    }

    const optimisticMsg: TicketMessage = {
      id: `opt-${Date.now()}`,
      ticket_id: selectedTicket.id,
      sender_type: "user",
      message: text,
      image_url: imageUrl,
      created_at: new Date().toISOString(),
      _optimistic: true,
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const insertData: any = {
      ticket_id: selectedTicket.id,
      sender_type: "user",
      message: text || "(attachment)",
    };
    if (imageUrl) insertData.image_url = imageUrl;

    const { error } = await supabase.from("ticket_messages").insert(insertData);
    if (error) {
      toast.error("Send failed");
      setMessages((prev) => prev.filter(m => m.id !== optimisticMsg.id));
    }
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  const [lastMessages, setLastMessages] = useState<Record<string, string>>({});
  useEffect(() => {
    if (tickets.length === 0) return;
    const loadPreviews = async () => {
      const previews: Record<string, string> = {};
      for (const t of tickets) {
        const { data } = await supabase
          .from("ticket_messages")
          .select("message, sender_type")
          .eq("ticket_id", t.id)
          .order("created_at", { ascending: false })
          .limit(1);
        if (data?.[0]) {
          previews[t.id] = (data[0].sender_type === "admin" ? "Support: " : "") + data[0].message;
        }
      }
      setLastMessages(previews);
    };
    loadPreviews();
  }, [tickets]);

  // Fullscreen image overlay
  const ImageOverlay = () => fullscreenImage ? (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4"
      onClick={() => setFullscreenImage(null)}
    >
      <button className="absolute top-4 right-4 text-white" onClick={() => setFullscreenImage(null)}>
        <X className="h-6 w-6" />
      </button>
      <img src={fullscreenImage} alt="Attachment" className="max-w-full max-h-full object-contain rounded-lg" />
    </motion.div>
  ) : null;

  const MessageBubble = ({ msg }: { msg: TicketMessage }) => {
    const isUser = msg.sender_type === "user";
    return (
      <motion.div
        key={msg.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      >
        <div className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${
          isUser ? "bg-primary text-primary-foreground rounded-br-md" : "bg-muted text-foreground rounded-bl-md"
        }`}>
          {msg.image_url && (
            <button onClick={() => setFullscreenImage(msg.image_url!)} className="block mb-1.5 rounded-lg overflow-hidden">
              <img src={msg.image_url} alt="Attachment" className="max-w-[200px] max-h-[200px] object-cover rounded-lg" loading="lazy" />
            </button>
          )}
          {msg.message && msg.message !== "(attachment)" && <p className="break-words">{msg.message}</p>}
          <div className={`flex items-center gap-1 mt-1 ${isUser ? "justify-end" : ""}`}>
            <span className={`text-[10px] ${isUser ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
              {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
            </span>
            {isUser && <Check className={`h-3 w-3 ${msg._optimistic ? "text-primary-foreground/30" : "text-primary-foreground/60"}`} />}
          </div>
        </div>
      </motion.div>
    );
  };

  // NEW TICKET VIEW
  if (view === "new") {
    return (
      <AppLayout>
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 shrink-0">
            <button onClick={() => setView("list")} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold">New Support Ticket</h1>
          </div>
          <div className="flex-1 px-4 py-6 space-y-5">
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Subject</label>
              <Select value={newSubject} onValueChange={setNewSubject}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {SUBJECTS.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-1.5 block">Describe your issue</label>
              <textarea
                value={newInitialMessage}
                onChange={(e) => setNewInitialMessage(e.target.value)}
                placeholder="Please describe what you need help with..."
                className="w-full min-h-[120px] rounded-xl border border-border/40 bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              />
            </div>
            <Button onClick={createTicket} disabled={!newInitialMessage.trim() || creating} className="w-full">
              {creating ? "Creating..." : "Submit Ticket"}
            </Button>
          </div>
        </div>
      </AppLayout>
    );
  }

  // CHAT VIEW
  if (view === "chat" && selectedTicket) {
    const isClosed = selectedTicket.status === "closed";
    const sc = statusConfig[selectedTicket.status] || statusConfig.open;

    return (
      <AppLayout>
        <AnimatePresence>{fullscreenImage && <ImageOverlay />}</AnimatePresence>
        <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto">
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40 shrink-0">
            <button onClick={() => { setView("list"); setSelectedTicket(null); clearAttachment(); }} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-semibold truncate">{selectedTicket.ticket_number}</h1>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium ${sc.color}`}>
                  {sc.icon} {sc.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground truncate">{selectedTicket.subject}</p>
            </div>
          </div>

          {isClosed && (
            <div className="px-4 py-2.5 bg-emerald-500/5 border-b border-emerald-500/10 shrink-0">
              <p className="text-xs text-emerald-600 font-medium text-center">This ticket has been closed</p>
            </div>
          )}

          <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && (
              <div className="text-center text-muted-foreground text-sm py-12">Loading messages...</div>
            )}
            <AnimatePresence initial={false}>
              {messages.map((msg) => <MessageBubble key={msg.id} msg={msg} />)}
            </AnimatePresence>
            <div ref={bottomRef} />
          </div>

          {isClosed ? (
            <div className="px-4 py-4 border-t border-border/40 bg-muted/20 shrink-0">
              <p className="text-xs text-muted-foreground text-center">Ticket closed — create a new ticket for further assistance</p>
            </div>
          ) : (
            <div className="px-4 py-3 pb-6 border-t border-border/40 bg-background shrink-0">
              {attachedFile && (
                <div className="flex items-center gap-2 mb-2 p-2 bg-muted/50 rounded-lg">
                  {attachPreview ? (
                    <img src={attachPreview} alt="Preview" className="h-12 w-12 object-cover rounded" />
                  ) : (
                    <div className="h-12 w-12 bg-muted rounded flex items-center justify-center">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <span className="text-xs text-muted-foreground flex-1 truncate">{attachedFile.name}</span>
                  <button onClick={clearAttachment} className="text-muted-foreground hover:text-foreground">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
              <div className="flex gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*,.pdf"
                  className="hidden"
                  onChange={handleFileSelect}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  className="shrink-0"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={sending}
                >
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Type a message..."
                  className="text-base flex-1"
                  disabled={sending}
                />
                <Button onClick={sendMessage} size="icon" disabled={(!newMessage.trim() && !attachedFile) || sending} className="shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </AppLayout>
    );
  }

  // TICKET LIST VIEW
  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border/40 shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-base font-semibold">Support Tickets</h1>
          </div>
          <Button onClick={() => setView("new")} size="sm" className="gap-1.5 text-xs">
            <Plus className="h-3.5 w-3.5" /> New Ticket
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="text-center text-muted-foreground text-sm py-12">Loading...</div>
          ) : tickets.length === 0 ? (
            <div className="text-center py-16 px-4">
              <MessageSquare className="h-10 w-10 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-sm text-muted-foreground mb-4">No support tickets yet</p>
              <Button onClick={() => setView("new")} size="sm" className="gap-1.5">
                <Plus className="h-3.5 w-3.5" /> Create Your First Ticket
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-border/30">
              {tickets.map((ticket) => {
                const sc = statusConfig[ticket.status] || statusConfig.open;
                return (
                  <button
                    key={ticket.id}
                    onClick={() => { setSelectedTicket(ticket); setView("chat"); }}
                    className="w-full flex items-start gap-3 px-4 py-3.5 hover:bg-muted/30 transition-colors text-left"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="text-xs font-mono text-muted-foreground">{ticket.ticket_number}</span>
                        <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${sc.color}`}>
                          {sc.icon} {sc.label}
                        </span>
                      </div>
                      <p className="text-sm font-medium truncate">{ticket.subject}</p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {lastMessages[ticket.id] || "..."}
                      </p>
                    </div>
                    <span className="text-[10px] text-muted-foreground whitespace-nowrap mt-1">
                      {new Date(ticket.updated_at).toLocaleDateString()}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default SupportChat;
