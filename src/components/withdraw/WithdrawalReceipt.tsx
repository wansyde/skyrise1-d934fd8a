import { motion } from "framer-motion";
import { CheckCircle, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRef, useCallback, useState } from "react";
import { toPng } from "html-to-image";
import { toast } from "sonner";

interface WithdrawalReceiptProps {
  username: string;
  amount: number;
  vipLevel: string;
  walletName: string;
  walletAddress: string;
  transactionId: string;
  onClose: () => void;
}

const WithdrawalReceipt = ({
  username,
  amount,
  vipLevel,
  walletName,
  walletAddress,
  transactionId,
  onClose,
}: WithdrawalReceiptProps) => {
  const receiptRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  const now = new Date();
  const date = now.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  const rows = [
    { label: "Username", value: `@${username}` },
    { label: "Amount", value: `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}` },
    { label: "VIP Level", value: vipLevel },
    { label: "Network", value: "USDT (TRC-20)" },
    { label: "Wallet Name", value: walletName },
    { label: "Wallet Address", value: walletAddress },
    { label: "Date", value: date },
    { label: "Time", value: time },
    { label: "Transaction ID", value: transactionId.slice(0, 12).toUpperCase() },
    { label: "Status", value: "Pending" },
  ];

  const handleSaveReceipt = useCallback(async () => {
    if (!receiptRef.current) return;
    setSaving(true);
    try {
      const dataUrl = await toPng(receiptRef.current, {
        cacheBust: true,
        pixelRatio: 3,
        backgroundColor: "#09090b",
      });
      const link = document.createElement("a");
      link.download = `skyrise-receipt-${transactionId.slice(0, 8).toUpperCase()}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Saved");
    } catch (err) {
      console.error("Failed to save receipt:", err);
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  }, [transactionId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="w-full max-w-sm overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Capturable receipt area */}
        <div ref={receiptRef} className="bg-card rounded-2xl overflow-hidden shadow-2xl border border-border">
          {/* Header */}
          <div className="relative bg-gradient-to-br from-primary/20 to-primary/5 px-6 pt-6 pb-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", damping: 15 }}
              className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/15"
            >
              <CheckCircle className="h-8 w-8 text-primary" strokeWidth={1.5} />
            </motion.div>
            <h2 className="text-lg font-semibold">Withdrawal Submitted</h2>
            <p className="text-xs text-muted-foreground mt-1">Your request is being processed</p>
          </div>

          {/* Receipt Body */}
          <div className="px-6 py-5">
            <div className="border-t border-dashed border-border mb-4" />

            <div className="space-y-3">
              {rows.map((row, i) => (
                <motion.div
                  key={row.label}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + i * 0.03 }}
                  className="flex justify-between items-start gap-3"
                >
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{row.label}</span>
                  <span
                    className={`text-xs font-medium text-right ${
                      row.label === "Wallet Address" ? "font-mono break-all max-w-[180px]" :
                      row.label === "Status" ? "text-warning" :
                      row.label === "Amount" ? "text-primary font-semibold" : ""
                    }`}
                  >
                    {row.value}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="border-t border-dashed border-border mt-4 mb-4" />

            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              This is an electronic receipt for your withdrawal request.
              Funds will be transferred to your wallet within 1-24 hours
              after admin approval. Reference this receipt for support inquiries.
            </p>
          </div>
        </div>

        {/* Buttons outside capture area */}
        <div className="mt-3 flex gap-2">
          <Button
            onClick={handleSaveReceipt}
            disabled={saving}
            variant="outline"
            className="flex-1 h-11 text-sm gap-2"
          >
            <Download className="h-4 w-4" />
            {saving ? "Saving..." : "Save Receipt"}
          </Button>
          <Button onClick={onClose} className="btn-press flex-1 h-11 text-sm">
            Done
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default WithdrawalReceipt;
