import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Copy, Upload } from "lucide-react";

const methods = ["USDT (TRC-20)", "USDT (ERC-20)", "Bitcoin", "Bank Transfer"];
const quickAmounts = [500, 1000, 5000, 10000];

const Deposit = () => {
  const [step, setStep] = useState(1);
  const [method, setMethod] = useState(methods[0]);
  const [amount, setAmount] = useState("");
  const [loading, setLoading] = useState(false);

  const walletAddress = "TXrE4kD9m2UPf8vBnhAEQ7cYz1wK5pN3jF";

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddress);
    toast.success("Copied");
  };

  const handleSubmit = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Submitted");
      setStep(1);
      setAmount("");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Deposit Funds</h1>
        <p className="mt-1 text-sm text-muted-foreground">Fund your account to start investing.</p>
      </div>

      <div className="mx-auto max-w-lg">
        {/* Progress */}
        <div className="mb-8 flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-medium transition-colors ${step >= s ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                {s}
              </div>
              {s < 3 && <div className={`h-px w-8 ${step > s ? "bg-primary" : "bg-border"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="glass-card p-8">
            <h2 className="text-sm font-medium mb-4">Select Method & Amount</h2>
            <div className="grid grid-cols-2 gap-2 mb-6">
              {methods.map((m) => (
                <button
                  key={m}
                  onClick={() => setMethod(m)}
                  className={`rounded-lg border px-3 py-2.5 text-xs transition-colors ${method === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}
                >
                  {m}
                </button>
              ))}
            </div>
            <label className="text-sm font-medium">Amount (USD)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 bg-background tabular-nums"
              min={100}
            />
            <div className="mt-3 flex gap-2">
              {quickAmounts.map((a) => (
                <button
                  key={a}
                  onClick={() => setAmount(String(a))}
                  className="rounded-md border border-border px-3 py-1.5 text-xs text-muted-foreground hover:border-foreground/20 transition-colors"
                >
                  {a.toLocaleString()} USDC
                </button>
              ))}
            </div>
            <Button
              className="btn-press mt-6 w-full"
              disabled={!amount || Number(amount) < 100}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="glass-card p-8">
            <h2 className="text-sm font-medium mb-4">Send Payment</h2>
            <p className="text-xs text-muted-foreground mb-4">
              Send exactly <span className="text-foreground font-medium tabular-nums">{Number(amount).toLocaleString()} USDC</span> via {method} to the address below.
            </p>
            <div className="rounded-lg bg-background p-4 flex items-center gap-3">
              <code className="flex-1 text-xs font-mono text-muted-foreground break-all">{walletAddress}</code>
              <button onClick={handleCopy} className="shrink-0 text-primary hover:text-primary/80 transition-colors">
                <Copy className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
            <Button className="btn-press mt-6 w-full" onClick={() => setStep(3)}>
              I've Sent the Payment
            </Button>
          </div>
        )}

        {step === 3 && (
          <div className="glass-card p-8">
            <h2 className="text-sm font-medium mb-4">Upload Proof of Payment</h2>
            <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-12 text-center hover:border-primary/30 transition-colors cursor-pointer">
              <Upload className="h-8 w-8 text-muted-foreground mb-3" strokeWidth={1.5} />
              <p className="text-sm text-muted-foreground">Drop your receipt here or click to upload</p>
              <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, PDF up to 5MB</p>
            </div>
            <Button className="btn-press mt-6 w-full" onClick={handleSubmit} disabled={loading}>
              {loading ? "Submitting..." : "Submit Deposit"}
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default Deposit;
