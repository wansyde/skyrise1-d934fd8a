import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowUpFromLine, Clock, Eye, EyeOff, Wallet, CheckCircle, ShieldAlert } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import WithdrawalReceipt from "@/components/withdraw/WithdrawalReceipt";

const AppWithdraw = () => {
  const [tab, setTab] = useState<"withdraw" | "history">("withdraw");
  const [step, setStep] = useState<1 | 2>(1);
  const [amount, setAmount] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [receiptData, setReceiptData] = useState<any>(null);
  const [showKycPrompt, setShowKycPrompt] = useState(false);
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const balance = profile?.balance ?? 0;

  const kycStatus = (profile as any)?.kyc_status || "pending";
  const isKycVerified = kycStatus === "verified";

  const hasSavedWallet = !!profile?.saved_wallet_address;

  const checkPaymentMethod = () => {
    if (!hasSavedWallet) {
      toast.error("Set up payment method first", {
        action: {
          label: "Set Up",
          onClick: () => window.location.href = "/app/wallet/payment-methods",
        },
      });
      return false;
    }
    return true;
  };

  const { data: history } = useQuery({
    queryKey: ["withdrawal-history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("withdrawals")
        .select("*")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false })
        .limit(20);
      return data || [];
    },
  });

  const handleFillAll = () => {
    setAmount(balance.toFixed(2));
  };

  const tierMaxWithdrawal: Record<string, number> = {
    Junior: 5000,
    Professional: 10000,
    Expert: 60000,
    Elite: 100000,
  };

  const userTierMax = tierMaxWithdrawal[profile?.vip_level || "Junior"] || 5000;

  const handleProceedToStep2 = () => {
    if (!user) return;
    const num = Number(amount);
    if (num < 100) {
      toast.error("Minimum withdrawal amount is 100 AC");
      return;
    }
    if (num <= 0 || num > balance) {
      toast.error("Invalid amount");
      return;
    }
    if (num > userTierMax) {
      toast.error(`Maximum withdrawal for your level is ${userTierMax.toLocaleString()} AC`);
      return;
    }
    if (!password) {
      toast.error("Enter password");
      return;
    }
    // Verify withdraw password server-side
    const { data: isValid, error: verifyError } = await supabase.rpc("verify_withdraw_password", { _password: password });
    if (verifyError || !isValid) {
      toast.error("Incorrect password");
      return;
    }

    if (!checkPaymentMethod()) return;

    // Check KYC after validating amount & password
    if (!isKycVerified) {
      setShowKycPrompt(true);
      return;
    }

    setStep(2);
  };

  const handleSubmit = async () => {
    if (!user) return;

    const finalAddress = profile?.saved_wallet_address || "";
    const finalName = profile?.saved_wallet_name || "";

    setLoading(true);
    try {
      const { data, error } = await supabase.rpc("submit_withdrawal", {
        _amount: Number(amount),
        _wallet_address: finalAddress,
        _wallet_name: finalName || null,
      } as any);
      if (error) throw error;
      const result = data as any;
      if (result?.error) {
        toast.error(result.error);
        return;
      }

      if (result?.status === "pending_review") {
        toast.info("Withdrawal submitted. Awaiting manual review.", { duration: 6000 });
      } else {
        toast.success("Withdrawal submitted successfully");
      }

      // Show receipt
      setReceiptData({
        username: profile?.username || profile?.email || "User",
        amount: Number(amount),
        vipLevel: profile?.vip_level || "Junior",
        walletName: finalName || "—",
        walletAddress: finalAddress,
        transactionId: crypto.randomUUID(),
      });

      setAmount("");
      setPassword("");
      setPassword("");
      setStep(1);
      queryClient.invalidateQueries({ queryKey: ["withdrawal-history"] });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    } catch (e: any) {
      toast.error("Submission failed");
    } finally {
      setLoading(false);
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
          <h1 className="flex-1 text-center text-base font-semibold tracking-tight pr-8">Withdraw</h1>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border">
          {(["withdraw", "history"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-colors relative ${tab === t ? "text-primary" : "text-muted-foreground"}`}
            >
              {t}
              {tab === t && (
                <motion.div
                  layoutId="withdraw-tab-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-12 rounded-full bg-primary"
                />
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 px-4 py-5">
          <AnimatePresence mode="wait">
            {tab === "withdraw" ? (
              <motion.div
                key="withdraw"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-5"
              >
                {/* KYC Prompt Modal */}
                <AnimatePresence>
                  {showKycPrompt && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-6"
                      onClick={() => setShowKycPrompt(false)}
                    >
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 10 }}
                        className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-xl"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <div className="flex flex-col items-center text-center gap-4">
                          <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center">
                            <ShieldAlert className="h-7 w-7 text-amber-400" strokeWidth={1.5} />
                          </div>
                          <div className="space-y-1.5">
                            <h3 className="text-base font-semibold">KYC Verification Required</h3>
                            <p className="text-sm text-muted-foreground">
                              {kycStatus === "submitted"
                                ? "Your KYC documents are being reviewed. Verification usually takes 24 hours."
                                : "To comply with anti-money laundering regulations, you must complete identity verification before withdrawing funds."}
                            </p>
                          </div>
                          <div className="flex gap-3 w-full mt-2">
                            <Button variant="outline" className="flex-1" onClick={() => setShowKycPrompt(false)}>
                              Cancel
                            </Button>
                            {kycStatus !== "submitted" && (
                              <Button className="flex-1" onClick={() => navigate("/app/kyc")}>
                                Complete KYC
                              </Button>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <AnimatePresence mode="wait">
                  {step === 1 ? (
                    <motion.div key="step1" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">
                      {/* Balance card */}
                      <div className="balance-card p-5 rounded-2xl">
                        <span className="text-sm text-white/60">Account Amount</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-3xl font-semibold tabular-nums">
                            {balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                          </span>
                          <span className="text-sm text-white/50 font-medium">AC</span>
                        </div>
                        <p className="text-xs text-white/40 mt-2">You will receive your withdrawal within an hour</p>
                      </div>

                      {/* Withdraw Amount */}
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">Withdraw Amount</label>
                        <div className="relative">
                          <Input
                            type="number"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className="bg-transparent border-0 border-b border-border rounded-none h-12 text-sm tabular-nums pr-16 focus-visible:border-muted-foreground/40"
                            min={0}
                            max={balance}
                          />
                          <button
                            type="button"
                            onClick={handleFillAll}
                            className="absolute right-0 top-1/2 -translate-y-1/2 bg-primary text-primary-foreground text-xs font-medium px-4 py-1.5 rounded-md hover:bg-primary/90 transition-colors"
                          >
                            ALL
                          </button>
                        </div>
                      </div>

                      {/* Transaction Password */}
                      <div>
                        <label className="text-sm text-muted-foreground block mb-2">Transaction Password</label>
                        <div className="relative">
                          <Input
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="bg-transparent border-0 border-b border-border rounded-none h-12 text-sm pr-12 focus-visible:border-muted-foreground/40"
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

                      <Button
                        className="btn-press h-12 w-full text-sm mt-2"
                        disabled={!amount || !password}
                        onClick={handleProceedToStep2}
                      >
                        Continue
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.div key="step2" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} transition={{ duration: 0.2 }} className="flex flex-col gap-5">
                      {/* Summary */}
                      <div className="balance-card p-5 rounded-2xl">
                        <span className="text-sm text-white/60">Withdrawal Amount</span>
                        <div className="text-3xl font-semibold tabular-nums mt-1">
                          ${Number(amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Saved wallet display */}
                      {hasSavedWallet && (
                        <div className="glass-card p-4 rounded-xl">
                          <div className="flex items-center gap-2 mb-3">
                            <CheckCircle className="h-4 w-4 text-primary" strokeWidth={1.5} />
                            <span className="text-sm font-medium">Saved Wallet</span>
                          </div>
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-xs text-muted-foreground">Name</span>
                              <span className="text-xs font-medium">{profile?.saved_wallet_name || "—"}</span>
                            </div>
                            <div className="flex justify-between items-start gap-3">
                              <span className="text-xs text-muted-foreground whitespace-nowrap">Address</span>
                              <span className="text-xs font-mono text-right break-all">{profile?.saved_wallet_address}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-3 mt-2">
                        <Button variant="outline" className="btn-press h-12 flex-1 text-sm" onClick={() => setStep(1)}>
                          Back
                        </Button>
                        <Button
                          className="btn-press h-12 flex-[2] text-sm"
                          disabled={loading}
                          onClick={handleSubmit}
                        >
                          {loading ? "Processing..." : "Confirm Withdrawal"}
                        </Button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ) : (
              <motion.div
                key="history"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-2"
              >
                {(history || []).map((w, i) => (
                  <motion.div
                    key={w.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04, duration: 0.25 }}
                    className="glass-card p-3.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                          <ArrowUpFromLine className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                        </div>
                        <div>
                          <span className="text-sm font-medium">Withdrawal</span>
                          <span className="text-xs text-muted-foreground block mt-0.5">
                            {new Date(w.created_at).toLocaleDateString()} · {w.method}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium tabular-nums">
                          -${Number(w.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                        <span className={`text-[10px] block mt-0.5 capitalize ${w.status === "pending" ? "text-warning" : w.status === "pending_review" ? "text-amber-400" : w.status === "completed" ? "text-primary" : w.status === "approved" ? "text-primary" : "text-destructive"}`}>
                          {w.status === "approved" ? "completed" : w.status === "pending_review" ? "Pending Review" : w.status}
                        </span>
                      </div>
                    </div>
                    {w.wallet_address && (
                      <div className="flex items-center gap-1.5 mt-2 pl-12">
                        <Wallet className="h-3 w-3 text-muted-foreground" strokeWidth={1.5} />
                        <span className="text-[10px] text-muted-foreground font-mono truncate">{w.wallet_address}</span>
                      </div>
                    )}
                  </motion.div>
                ))}
                {(!history || history.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                    <Clock className="h-8 w-8 mb-3 opacity-40" strokeWidth={1.5} />
                    <p className="text-sm">No withdrawal history yet.</p>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Receipt Modal */}
      <AnimatePresence>
        {receiptData && (
          <WithdrawalReceipt {...receiptData} onClose={() => setReceiptData(null)} />
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default AppWithdraw;
