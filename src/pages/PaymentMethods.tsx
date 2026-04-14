import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ArrowLeft, Eye, EyeOff, Wallet, CheckCircle, Lock, Globe, Mail, User } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PaymentMethods = () => {
  const { user, profile, refreshProfile } = useAuth();
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [walletName, setWalletName] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [walletUsername, setWalletUsername] = useState("");
  const [network, setNetwork] = useState("");
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);

  const hasSaved = !!profile?.saved_wallet_address;

  useEffect(() => {
    if (authenticated && hasSaved) {
      setWalletName(profile?.saved_wallet_name || "");
      setWalletAddress(profile?.saved_wallet_address || "");
      setWalletUsername(profile?.saved_wallet_username || "");
      setNetwork(profile?.saved_wallet_network || "");
      setEmail(profile?.saved_wallet_email || "");
    }
  }, [authenticated, profile]);

  const handleAuthenticate = async () => {
    if (!password) {
      toast.error("Enter password");
      return;
    }
    const { data: isValid, error: verifyError } = await supabase.rpc("verify_withdraw_password", { _password: password });
    if (verifyError || !isValid) {
      toast.error("Incorrect password");
      return;
    }
    setAuthenticated(true);
    setPassword("");
  };

  const handleSave = async () => {
    if (!walletName.trim()) { toast.error("Wallet name required"); return; }
    if (!walletAddress.trim()) { toast.error("Address required"); return; }
    if (!walletUsername.trim()) { toast.error("Username required"); return; }
    if (!network.trim()) { toast.error("Network required"); return; }
    if (!email.trim()) { toast.error("Email required"); return; }

    setSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          saved_wallet_name: walletName.trim(),
          saved_wallet_address: walletAddress.trim(),
          saved_wallet_username: walletUsername.trim(),
          saved_wallet_network: network.trim(),
          saved_wallet_email: email.trim(),
          updated_at: new Date().toISOString(),
        } as any)
        .eq("user_id", user!.id);

      if (error) throw error;
      await refreshProfile();
      toast.success("Saved");
    } catch (e: any) {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <div className="flex flex-col min-h-[calc(100vh-5rem)]">
        {/* Header */}
        <div className="flex items-center h-14 px-4 border-b border-border">
          <Link to="/app/profile" className="mr-3 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <h1 className="flex-1 text-center text-base font-semibold tracking-tight pr-8">Payment Methods</h1>
        </div>

        <div className="flex-1 px-4 py-6">
          <AnimatePresence mode="wait">
            {!authenticated ? (
              <motion.div
                key="auth"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-6 max-w-sm mx-auto mt-8"
              >
                <div className="flex flex-col items-center gap-3 mb-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
                    <Lock className="h-6 w-6 text-primary" strokeWidth={1.5} />
                  </div>
                  <h2 className="text-lg font-semibold tracking-tight">Verify Identity</h2>
                  <p className="text-sm text-muted-foreground text-center leading-relaxed">
                    Enter your transaction password to access payment settings
                  </p>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-2">Transaction Password</label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="bg-transparent border-0 border-b border-border rounded-none h-12 text-sm pr-12 focus-visible:border-primary/50"
                      onKeyDown={(e) => e.key === "Enter" && handleAuthenticate()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-1/2 -translate-y-1/2 p-2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" strokeWidth={1.5} /> : <Eye className="h-4 w-4" strokeWidth={1.5} />}
                    </button>
                  </div>
                </div>

                <Button className="btn-press h-12 w-full text-sm" onClick={handleAuthenticate} disabled={!password}>
                  Continue
                </Button>
              </motion.div>
            ) : (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-5 max-w-sm mx-auto"
              >
                {hasSaved && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-primary/5 border border-primary/10">
                    <CheckCircle className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                    <span className="text-xs text-primary font-medium">Payment method on file</span>
                  </div>
                )}

                <div className="flex flex-col gap-5">
                  {/* Wallet Name */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Wallet Name
                    </label>
                    <Input
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      className="bg-transparent border-0 border-b border-border rounded-none h-11 text-sm focus-visible:border-primary/50"
                    />
                  </div>

                  {/* Wallet Address */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Wallet className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Wallet Address
                    </label>
                    <Input
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      className="bg-transparent border-0 border-b border-border rounded-none h-11 text-sm font-mono focus-visible:border-primary/50"
                    />
                  </div>

                  {/* Wallet Username */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <User className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Wallet Username
                    </label>
                    <Input
                      value={walletUsername}
                      onChange={(e) => setWalletUsername(e.target.value)}
                      className="bg-transparent border-0 border-b border-border rounded-none h-11 text-sm focus-visible:border-primary/50"
                    />
                  </div>

                  {/* Network */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Globe className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Network
                    </label>
                    <Select value={network} onValueChange={setNetwork}>
                      <SelectTrigger className="bg-transparent border-0 border-b border-border rounded-none h-11 text-sm focus-visible:border-primary/50 shadow-none">
                        <SelectValue placeholder="Select Network" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl shadow-lg border border-border/50">
                        <SelectItem value="Cash">Cash</SelectItem>
                        <SelectItem value="BTC">BTC</SelectItem>
                        <SelectItem value="TRC-20">TRC-20</SelectItem>
                        <SelectItem value="ERC-20">ERC-20</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
                      Email
                    </label>
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-0 border-b border-border rounded-none h-11 text-sm focus-visible:border-primary/50"
                    />
                  </div>
                </div>

                <Button
                  className="btn-press h-12 w-full text-sm mt-3"
                  disabled={saving || !walletName || !walletAddress || !walletUsername || !network || !email}
                  onClick={handleSave}
                >
                  {saving ? "Saving..." : hasSaved ? "Update Payment Method" : "Save Payment Method"}
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </AppLayout>
  );
};

export default PaymentMethods;
