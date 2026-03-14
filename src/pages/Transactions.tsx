import DashboardLayout from "@/components/layout/DashboardLayout";

const transactions = [
  { id: "TXN-0041", type: "Deposit", amount: "+$5,000.00", status: "Approved", date: "Mar 12, 2026", method: "USDT (TRC-20)" },
  { id: "TXN-0040", type: "ROI", amount: "+$120.00", status: "Approved", date: "Mar 11, 2026", method: "System" },
  { id: "TXN-0039", type: "Withdrawal", amount: "-$1,000.00", status: "Pending", date: "Mar 10, 2026", method: "Bitcoin" },
  { id: "TXN-0038", type: "Deposit", amount: "+$3,500.00", status: "Approved", date: "Mar 8, 2026", method: "Bank Transfer" },
  { id: "TXN-0037", type: "ROI", amount: "+$95.00", status: "Approved", date: "Mar 7, 2026", method: "System" },
  { id: "TXN-0036", type: "Deposit", amount: "+$10,000.00", status: "Approved", date: "Mar 1, 2026", method: "USDT (ERC-20)" },
  { id: "TXN-0035", type: "Withdrawal", amount: "-$2,300.00", status: "Approved", date: "Feb 25, 2026", method: "Bank Transfer" },
];

const Transactions = () => (
  <DashboardLayout>
    <div className="mb-8">
      <h1 className="text-2xl font-semibold tracking-tight">Transaction History</h1>
      <p className="mt-1 text-sm text-muted-foreground">Complete record of all account activity.</p>
    </div>

    <div className="glass-card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="text-left text-xs text-muted-foreground border-b border-border">
              <th className="px-5 py-3 font-medium">ID</th>
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Method</th>
              <th className="px-5 py-3 font-medium">Amount</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((tx) => (
              <tr key={tx.id} className="border-t border-border transition-colors hover:bg-[rgba(255,255,255,0.02)]">
                <td className="px-5 py-3 text-xs font-mono text-muted-foreground">{tx.id}</td>
                <td className="px-5 py-3 text-sm">{tx.type}</td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{tx.method}</td>
                <td className={`px-5 py-3 text-sm tabular-nums ${tx.amount.startsWith("+") ? "text-success" : "text-foreground"}`}>
                  {tx.amount}
                </td>
                <td className="px-5 py-3">
                  <span className={`inline-flex items-center gap-1.5 text-xs ${tx.status === "Pending" ? "status-pending" : tx.status === "Approved" ? "status-approved" : "status-rejected"}`}>
                    {tx.status === "Pending" && <span className="h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />}
                    {tx.status === "Approved" && <span className="h-1.5 w-1.5 rounded-full bg-success" />}
                    {tx.status}
                  </span>
                </td>
                <td className="px-5 py-3 text-xs text-muted-foreground">{tx.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  </DashboardLayout>
);

export default Transactions;
