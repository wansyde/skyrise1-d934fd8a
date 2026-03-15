import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const transactions = [
  { id: "TXN-0041", type: "Deposit", amount: "+$5,000.00", status: "Approved", date: "Mar 12", method: "USDT", positive: true },
  { id: "TXN-0040", type: "ROI", amount: "+$120.00", status: "Approved", date: "Mar 11", method: "System", positive: true },
  { id: "TXN-0039", type: "Withdrawal", amount: "-$1,000.00", status: "Pending", date: "Mar 10", method: "Bitcoin", positive: false },
  { id: "TXN-0038", type: "Deposit", amount: "+$3,500.00", status: "Approved", date: "Mar 8", method: "Bank", positive: true },
  { id: "TXN-0037", type: "ROI", amount: "+$95.00", status: "Approved", date: "Mar 7", method: "System", positive: true },
  { id: "TXN-0036", type: "Deposit", amount: "+$10,000.00", status: "Approved", date: "Mar 1", method: "USDT", positive: true },
];

const WalletPage = () => (
  <AppLayout>
    <div className="px-4 py-5">
      <div className="mb-5">
        <h1 className="text-xl font-semibold tracking-tight">Wallet</h1>
        <p className="mt-1 text-sm text-muted-foreground">Manage your funds and transactions.</p>
      </div>

      {/* Balance */}
      <div className="balance-card p-5 mb-5">
        <span className="text-sm text-white/70">Available Balance</span>
        <div className="text-3xl font-semibold tabular-nums mt-1">$15,200.00</div>
      </div>

      {/* Actions */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <Button asChild className="btn-press gap-2 h-12">
          <Link to="/app/wallet/deposit">
            <ArrowDownToLine className="h-4 w-4" strokeWidth={1.5} />
            Deposit
          </Link>
        </Button>
        <Button asChild variant="outline" className="btn-press gap-2 h-12">
          <Link to="/app/wallet/withdraw">
            <ArrowUpFromLine className="h-4 w-4" strokeWidth={1.5} />
            Withdraw
          </Link>
        </Button>
      </div>

      {/* Transaction history */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">Transaction History</h3>
        <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
      </div>

      <div className="flex flex-col gap-2">
        {transactions.map((tx, i) => (
          <motion.div
            key={tx.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.3 }}
            className="glass-card flex items-center justify-between p-3.5"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${tx.positive ? "bg-success/10" : "bg-muted"}`}>
                {tx.positive ? (
                  <ArrowDownToLine className="h-3.5 w-3.5 text-success" strokeWidth={1.5} />
                ) : (
                  <ArrowUpFromLine className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                )}
              </div>
              <div>
                <span className="text-sm font-medium">{tx.type}</span>
                <span className="text-xs text-muted-foreground block mt-0.5">{tx.date} · {tx.method}</span>
              </div>
            </div>
            <div className="text-right">
              <span className={`text-sm font-medium tabular-nums ${tx.positive ? "text-success" : "text-foreground"}`}>
                {tx.amount}
              </span>
              <span className={`text-[10px] block mt-0.5 ${tx.status === "Pending" ? "text-warning" : "text-success"}`}>
                {tx.status}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default WalletPage;
