import DashboardLayout from "@/components/layout/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";

const methods = ["USDT (TRC-20)", "USDT (ERC-20)", "Bitcoin", "Bank Transfer"];
const networks = ["Cash", "BTC", "TRC20", "ERC20"];
const balance = 15200;

const Withdraw = () => {
  const [method, setMethod] = useState(methods[0]);
  const [network, setNetwork] = useState("");
  const [amount, setAmount] = useState("");
  const [address, setAddress] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = Number(amount);
    if (num < 100) {
      toast.error("Minimum withdrawal amount is 100 USDC");
      return;
    }
    if (num <= 0 || num > balance) {
      toast.error("Invalid amount");
      return;
    }
    if (!network) {
      toast.error("Please select a network");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      toast.success("Submitted");
      setAmount("");
      setAddress("");
    }, 1500);
  };

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">Withdraw Funds</h1>
        <p className="mt-1 text-sm text-muted-foreground">Request a withdrawal from your available balance.</p>
      </div>

      <div className="mx-auto max-w-lg">
        <div className="vault-card mb-6 p-5">
          <span className="text-xs text-muted-foreground">Available Balance</span>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{balance.toLocaleString()}.00 USDC</div>
        </div>

        <form onSubmit={handleSubmit} className="glass-card flex flex-col gap-5 p-8">
          <div>
            <label className="text-sm font-medium mb-2 block">Withdrawal Method</label>
            <div className="grid grid-cols-2 gap-2">
              {methods.map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMethod(m)}
                  className={`rounded-lg border px-3 py-2.5 text-xs transition-colors ${method === m ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground hover:border-foreground/20"}`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium">Amount (USD)</label>
            <Input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="mt-2 bg-background tabular-nums"
              min={10}
              max={balance}
              required
            />
          </div>
          <div>
            <label className="text-sm font-medium">Network</label>
            <Select value={network} onValueChange={setNetwork}>
              <SelectTrigger className="mt-2 bg-background">
                <SelectValue placeholder="Select Network" />
              </SelectTrigger>
              <SelectContent className="rounded-xl shadow-lg border border-border/50">
                {networks.map((n) => (
                  <SelectItem key={n} value={n}>{n}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="text-sm font-medium">
              {method.includes("Bank") ? "Bank Account Details" : "Wallet Address"}
            </label>
            <Input
              placeholder={method.includes("Bank") ? "Account number" : "Wallet address"}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="mt-2 bg-background font-mono text-xs"
              required
            />
          </div>
          <Button type="submit" className="btn-press" disabled={loading}>
            {loading ? "Processing..." : "Submit Withdrawal"}
          </Button>
        </form>
      </div>
    </DashboardLayout>
  );
};

export default Withdraw;
