import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, KeyRound, Lock, Eye, EyeOff, Copy, RefreshCw, Shield, User } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import DashboardLayout from "@/components/layout/DashboardLayout";

interface UserResult {
  user_id: string;
  username: string | null;
  email: string;
  vip_level: string;
  balance: number;
  full_name: string;
}

const generatePassword = (len = 14) => {
  const u = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const l = "abcdefghijklmnopqrstuvwxyz";
  const d = "0123456789";
  const s = "!@#$%&*";
  const all = u + l + d + s;
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  const pw = [u[arr[0] % u.length], l[arr[1] % l.length], d[arr[2] % d.length], s[arr[3] % s.length]];
  for (let i = 4; i < len; i++) pw.push(all[arr[i] % all.length]);
  for (let i = pw.length - 1; i > 0; i--) { const j = arr[i] % (i + 1); [pw[i], pw[j]] = [pw[j], pw[i]]; }
  return pw.join("");
};

const generatePin = (len = 6) => {
  const d = "0123456789";
  const arr = new Uint8Array(len);
  crypto.getRandomValues(arr);
  return Array.from(arr, b => d[b % d.length]).join("");
};

const AdminPasswords = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserResult | null>(null);

  // Login password
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPw, setShowLoginPw] = useState(false);
  const [resettingLogin, setResettingLogin] = useState(false);

  // Transaction password
  const [txPassword, setTxPassword] = useState("");
  const [showTxPw, setShowTxPw] = useState(false);
  const [resettingTx, setResettingTx] = useState(false);

  const searchUser = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const q = searchQuery.trim().toLowerCase();
      const { data, error } = await supabase
        .from("profiles")
        .select("user_id, username, email, vip_level, balance, full_name")
        .or(`email.ilike.%${q}%,username.ilike.%${q}%`)
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (!data) {
        toast.error("User not found");
        setSelectedUser(null);
        return;
      }
      setSelectedUser(data);
      setLoginPassword("");
      setTxPassword("");
    } catch (err: any) {
      toast.error(err.message || "Search failed");
    } finally {
      setSearching(false);
    }
  };

  const resetLoginPassword = async () => {
    if (!selectedUser || !loginPassword.trim()) return;
    if (loginPassword.length < 6) { toast.error("Password must be at least 6 characters"); return; }
    setResettingLogin(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const res = await supabase.functions.invoke("admin-user-control", {
        body: { action: "reset_password", user_id: selectedUser.user_id, new_password: loginPassword },
      });
      if (res.error) throw res.error;
      const result = res.data;
      if (result?.error) throw new Error(result.error);
      toast.success("Login password reset successfully");
      setLoginPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset login password");
    } finally {
      setResettingLogin(false);
    }
  };

  const resetTransactionPassword = async () => {
    if (!selectedUser || !txPassword.trim()) return;
    if (txPassword.length < 4) { toast.error("Password must be at least 4 characters"); return; }
    setResettingTx(true);
    try {
      const { data, error } = await supabase.rpc("admin_reset_withdraw_password", {
        _user_id: selectedUser.user_id,
        _new_password: txPassword,
      });
      if (error) throw error;
      const result = data as any;
      if (result?.error) throw new Error(result.error);
      toast.success("Transaction password reset successfully");
      setTxPassword("");
    } catch (err: any) {
      toast.error(err.message || "Failed to reset transaction password");
    } finally {
      setResettingTx(false);
    }
  };

  const generateAndSetLogin = () => {
    const pw = generatePassword(14);
    setLoginPassword(pw);
    setShowLoginPw(true);
  };

  const generateAndSetTx = () => {
    const pin = generatePin(6);
    setTxPassword(pin);
    setShowTxPw(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  return (
    <DashboardLayout>
      <div className="max-w-2xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Password Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Reset login and transaction passwords for users</p>
        </div>

        {/* Search */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Search className="h-4 w-4" />
            Find User
          </div>
          <div className="flex gap-2">
            <Input
              placeholder="Search by email or username..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && searchUser()}
            />
            <Button onClick={searchUser} disabled={searching} size="sm" className="shrink-0">
              {searching ? "..." : "Search"}
            </Button>
          </div>

          <AnimatePresence>
            {selectedUser && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="rounded-lg border border-border bg-muted/30 p-4 space-y-2"
              >
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-primary" />
                  <span className="font-medium">{selectedUser.username || selectedUser.email}</span>
                </div>
                <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm text-muted-foreground">
                  <span>Full Name: <span className="text-foreground">{selectedUser.full_name || "—"}</span></span>
                  <span>Email: <span className="text-foreground">{selectedUser.email}</span></span>
                  <span>VIP Level: <span className="text-foreground">{selectedUser.vip_level}</span></span>
                  <span>Balance: <span className="text-foreground">${selectedUser.balance.toLocaleString()}</span></span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedUser && (
          <>
            {/* Login Password */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="rounded-xl border border-border bg-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <KeyRound className="h-4 w-4" />
                Login Password
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showLoginPw ? "text" : "password"}
                    placeholder="Enter new login password..."
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPw(!showLoginPw)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showLoginPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {loginPassword && (
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(loginPassword, "Password")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateAndSetLogin} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Generate
                </Button>
                <Button
                  size="sm"
                  onClick={resetLoginPassword}
                  disabled={resettingLogin || !loginPassword.trim()}
                  className="gap-1.5"
                >
                  <Shield className="h-3.5 w-3.5" />
                  {resettingLogin ? "Resetting..." : "Reset Login Password"}
                </Button>
              </div>
            </motion.div>

            {/* Transaction Password */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-xl border border-border bg-card p-5 space-y-4"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Lock className="h-4 w-4" />
                Transaction Password
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    type={showTxPw ? "text" : "password"}
                    placeholder="Enter new transaction password..."
                    value={txPassword}
                    onChange={e => setTxPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowTxPw(!showTxPw)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showTxPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {txPassword && (
                  <Button variant="outline" size="icon" onClick={() => copyToClipboard(txPassword, "PIN")}>
                    <Copy className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={generateAndSetTx} className="gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Generate PIN
                </Button>
                <Button
                  size="sm"
                  onClick={resetTransactionPassword}
                  disabled={resettingTx || !txPassword.trim()}
                  className="gap-1.5"
                >
                  <Shield className="h-3.5 w-3.5" />
                  {resettingTx ? "Resetting..." : "Reset Transaction Password"}
                </Button>
              </div>
            </motion.div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPasswords;
