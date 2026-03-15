import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { FileText } from "lucide-react";

const WFP = () => (
  <AppLayout>
    <div className="px-4 py-5">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Wealth Financial Plan</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your personalized wealth strategy overview.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center"
      >
        <FileText className="h-10 w-10 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
        <h3 className="text-base font-semibold mb-2">No Active Plan</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Your wealth financial plan will appear here once you activate an investment. Contact your advisor for a personalized strategy.
        </p>
      </motion.div>
    </div>
  </AppLayout>
);

export default WFP;
