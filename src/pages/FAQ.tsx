import { motion } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

const faqs = [
  { q: "How does Skyrise work?", a: "Skyrise pools investor capital into professionally managed strategies. Your funds are allocated across diversified portfolios, and returns are accrued based on your selected plan's rate and schedule." },
  { q: "What are the minimum investment amounts?", a: "Our Starter plan begins at $500. Alpha Growth requires $10,000, and the Institutional tier starts at $50,000. Each tier offers progressively better returns and features." },
  { q: "How do deposits work?", a: "We support USDT (TRC-20/ERC-20), Bitcoin, and bank transfers. After submitting a deposit, our team verifies the payment and credits your account, typically within 1-4 hours." },
  { q: "How do I withdraw my funds?", a: "Navigate to the Withdraw section in your dashboard, select your preferred method, enter the amount, and submit. Processing times vary by tier: Standard (24h), Express (4h), and Instant for Institutional clients." },
  { q: "Is my investment secure?", a: "Absolutely. We employ bank-grade encryption, cold storage for digital assets, multi-signature wallets, and continuous security monitoring. Your funds are segregated from operational capital." },
  { q: "What fees does Skyrise charge?", a: "Skyrise operates on a performance-based model. There are no hidden fees. A small management fee is deducted from returns, not from your principal investment." },
  { q: "Can I cancel my investment early?", a: "Investments are locked for the duration of the selected plan. Early withdrawal may incur a penalty depending on the plan terms. Contact support for specific cases." },
  { q: "How are returns calculated?", a: "Returns are calculated based on your plan's APR and accrual frequency. Starter plans accrue daily, Alpha Growth hourly, and Institutional in real-time. All calculations use compound interest." },
];

const FaqItem = ({ q, a }: { q: string; a: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown
          className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <p className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</p>
      </motion.div>
    </div>
  );
};

const FAQ = () => (
  <PublicLayout>
    <section className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-4xl font-semibold tracking-tight">Frequently Asked Questions</h1>
          <p className="mt-4 text-muted-foreground">Find answers to common questions about our platform.</p>
        </motion.div>
        <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-3">
          {faqs.map((faq, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            >
              <FaqItem {...faq} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default FAQ;
