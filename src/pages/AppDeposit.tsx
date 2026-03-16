import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Upload, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const methods = ["USDT (TRC-20)", "USDT (ERC-20)", "Bitcoin", "Bank Transfer"];
const quickAmounts = [500, 1000, 5000, 10000];

const AppDeposit = () => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(methods[0]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);
  const [proofFile, setProofFile] = useState<File | null>(null);
  const { user } = useAuth();

  const walletAddress = "TXrE4kD9m2UPf8vBnhAEQ7cYz1wK5pN3jF";

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Address copied.");
  };

  const handleSubmit = async () => {
    if (!user) return;
    setLoading(true);

    let proofUrl: string | null = null;
    if (proofFile) {
      const filePath = `${user.id}/${Date.now()}-${proofFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("deposit-proofs")
        .upload(filePath, proofFile);
      if (!uploadError) {
        proofUrl = filePath;
      }
    }

    const { error } = await supabase.from("deposits").insert({
      user_id: user.id,
      amount: Number(amount),
      method,
      wallet_address: walletAddress,
      proof_url: proofUrl,
    });

    if (error) {
      toast.error("Failed to submit deposit: " + error.message);
    } else {
      // Also create a pending transaction
      await supabase.from("transactions").insert({
        user_id: user.id,
        type: "deposit",
        amount: Number(amount),
        status: "pending",
        method,
        description: `Deposit via ${method}`,
      });
      toast.success("Deposit request submitted! Awaiting admin approval.");
      setStep(1);
      setAmount("");
      setProofFile(null);
    }
    setLoading(false);
  };

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/app/wallet" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Deposit</h1>
            <p className="text-sm text-muted-foreground">Fund your account</p>
          </div>
        </div>

        <div className="flex items-center gap-2 mb-6">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-medium transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-px w-6 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="flex flex-col gap-4">
            <div className="glass-card p-4">
              <label className="text-xs font-medium mb-2 block text-muted-foreground">Payment Method</label>
              <div className="grid grid-cols-2 gap-2">
                {methods.map((m) => (
                  <button
                    key={m}
                    onClick={() => setMethod(m)}
                    className={`rounded-lg border px-3 py-2.5 text-xs transition-colors btn-press ${method === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>
            <div className="glass-card p-4">
              <label className="text-xs font-medium mb-2 block text-muted-foreground">Amount (USD)</label>
              <Input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="bg-background tabular-nums text-lg h-12"
                min={100}
              />
              <div className="flex gap-2 mt-2">
                {quickAmounts.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAmount(String(a))}
                    className="flex-1 rounded-md bg-muted/50 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    ${a.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>
            <Button
              className="btn-press h-12"
              disabled={!amount || Number(amount) < 100}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card p-5 flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Send <span className="text-foreground font-medium tabular-nums">${Number(amount).toLocaleString()}</span> via {method}
            </p>
            <div className="rounded-lg bg-muted/50 p-3 flex items-center gap-2">
              <code className="flex-1 text-xs font-mono text-muted-foreground break-all">{walletAddress}</code>
              <button onClick={handleCopy} className="shrink-0 text-primary">
                <Copy className="h-4 w-4" />
              </button>
            </div>
            <Button className="btn-press h-12" onClick={() => setStep(3)}>
              I've Sent the Payment
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="glass-card p-5 flex flex-col gap-4">
            <h3 className="text-sm font-medium">Upload Proof</h3>
            <label className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-10 text-center cursor-pointer hover:border-primary/50 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground mb-2" strokeWidth={1.5} />
              <p className="text-xs text-muted-foreground">
                {proofFile ? proofFile.name : "Drop receipt or tap to upload"}
              </p>
              <input
                type="file"
                className="hidden"
                accept="image/*,.pdf"
                onChange={(e) => setProofFile(e.target.files?.[0] || null)}
              />
            </label>
            <Button className="btn-press h-12" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Deposit"}
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default AppDeposit;
