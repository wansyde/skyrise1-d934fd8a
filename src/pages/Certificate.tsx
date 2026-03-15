import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Award } from "lucide-react";

const Certificate = () => (
  <AppLayout>
    <div className="px-4 py-5">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Certificates</h1>
        <p className="mt-1 text-sm text-muted-foreground">Your investment certificates and verifications.</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card p-8 text-center"
      >
        <Award className="h-10 w-10 mx-auto text-muted-foreground mb-4" strokeWidth={1.5} />
        <h3 className="text-base font-semibold mb-2">No Certificates Yet</h3>
        <p className="text-sm text-muted-foreground max-w-xs mx-auto">
          Certificates are generated upon completion of investment cycles. Complete your first investment to receive your certificate.
        </p>
      </motion.div>
    </div>
  </AppLayout>
);

export default Certificate;
