import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Message {
  id: string;
  user_id: string;
  sender_type: string;
  message: string;
  created_at: string;
}

const SupportChat = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [whatsapp, setWhatsapp] = useState(profile?.phone || "");
  const [whatsappSaved, setWhatsappSaved] = useState(!!profile?.phone);
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Load messages
  useEffect(() => {
    if (!user) return;
    const load = async () => {
      const { data } = await supabase
        .from("support_messages")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });
      if (data) setMessages(data as Message[]);
    };
    load();

    // Realtime subscription
    const channel = supabase
      .channel("support-chat")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "support_messages", filter: `user_id=eq.${user.id}` },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const saveWhatsapp = async () => {
    if (!whatsapp.trim()) { toast.error("Please enter your WhatsApp number"); return; }
    const { error } = await supabase
      .from("profiles")
      .update({ phone: whatsapp.trim() })
      .eq("user_id", user!.id);
    if (error) { toast.error("Failed to save"); return; }
    await refreshProfile();
    setWhatsappSaved(true);
    toast.success("WhatsApp number saved");
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    setSending(true);
    const { error } = await supabase.from("support_messages").insert({
      user_id: user!.id,
      sender_type: "user",
      message: newMessage.trim(),
    });
    if (error) { toast.error("Failed to send"); setSending(false); return; }
    setNewMessage("");
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  };

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-80px)] max-w-lg mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/40">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-base font-semibold">Customer Support</h1>
            <p className="text-xs text-muted-foreground">Support will respond shortly</p>
          </div>
        </div>

        {/* WhatsApp prompt */}
        {!whatsappSaved && (
          <div className="p-4 bg-muted/30 border-b border-border/30">
            <p className="text-sm text-muted-foreground mb-2">Enter your WhatsApp number to continue:</p>
            <div className="flex gap-2">
              <Input
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                placeholder="+1234567890"
                className="text-base"
              />
              <Button onClick={saveWhatsapp} size="sm">Save</Button>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.length === 0 && (
            <div className="text-center text-muted-foreground text-sm py-12">
              Start a conversation with our support team.
            </div>
          )}
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.sender_type === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] px-3.5 py-2 rounded-2xl text-sm ${
                    msg.sender_type === "user"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  <p className="break-words">{msg.message}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender_type === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        {whatsappSaved && (
          <div className="px-4 py-3 border-t border-border/40">
            <div className="flex gap-2">
              <Input
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..."
                className="text-base flex-1"
                disabled={sending}
              />
              <Button onClick={sendMessage} size="icon" disabled={!newMessage.trim() || sending}>
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default SupportChat;
