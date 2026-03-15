import AppLayout from "@/components/layout/AppLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const methods = ["USDT (TRC-20)", "USDT (ERC-20)", "Bitcoin", "Bank Transfer"];
const balance = 15200;

const AppWithdraw = () => {
  const [method, setMethod] = useState(methods[0]);
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (num <= 0 || num > balance) {
      toast.error("Invalid amount.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Withdrawal request submitted.");
      setAmount("");
      setAddress("");
    }, 1500);
  };

  return (
    <AppLayout>
      <div className="px-4 py-5">
        <div className="flex items-center gap-3 mb-5">
          <Link to="/app/wallet" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <div>
            <h1 className="text-xl font-semibold tracking-tight">Withdraw</h1>
            <p className="text-sm text-muted-foreground">Request a withdrawal</p>
          </div>
        </div>

        <div className="glass-card p-4 mb-5">
          <span className="text-xs text-muted-foreground">Available Balance</span>
          <div className="text-2xl font-semibold tabular-nums mt-1">${balance.toLocaleString()}.00</div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="glass-card p-4">
            <label className="text-xs font-medium mb-2 block text-muted-foreground">Withdrawal Method</label>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m}
                  type="button"
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
              min={10}
              max={balance}
              required
            />
          </div>

          <div className="glass-card p-4">
            <label className="text-xs font-medium mb-2 block text-muted-foreground">
              {method.includes("Bank") ? "Bank Details" : "Wallet Address"}
            </label>
            <Input
              placeholder={method.includes("Bank") ? "Account number" : "Wallet address"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="bg-background font-mono text-xs"
              required
            />
          </div>

          <Button type="submit" className="btn-press h-12" disabled={loading}>
            {loading ? "Processing..." : "Submit Withdrawal"}
          </Button>
        </form>
      </div>
    </AppLayout>
  );
};

export default AppWithdraw;
