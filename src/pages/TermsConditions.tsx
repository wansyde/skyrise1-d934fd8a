import AppLayout from "@/components/layout/AppLayout";

const sections = [
  {
    title: "1. Agreement to Terms",
    content: "By accessing and using the Skyrise platform, you acknowledge that you have read, understood, and agree to be bound by these Terms and Conditions."
  },
  {
    title: "2. Investment Risks",
    content: "All investments carry risk. Past performance is not indicative of future results. You should not invest money that you cannot afford to lose."
  },
  {
    title: "3. Account Responsibilities",
    content: "You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account."
  },
  {
    title: "4. Deposits & Withdrawals",
    content: "All deposits are subject to verification. Withdrawal requests are processed within 24-72 hours depending on the payment method and verification status."
  },
  {
    title: "5. Privacy & Data Protection",
    content: "We are committed to protecting your personal information in accordance with applicable data protection laws and our Privacy Policy."
  },
];

const TermsConditions = () => (
  <AppLayout>
    <div className="px-4 py-5">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Terms & Conditions</h1>
        <p className="mt-1 text-sm text-muted-foreground">Last updated: March 2026</p>
      </div>

      <div className="flex flex-col gap-4">
        {sections.map((s) => (
          <div key={s.title} className="glass-card p-4">
            <h3 className="text-sm font-semibold mb-2">{s.title}</h3>
            <p className="text-xs text-muted-foreground leading-relaxed">{s.content}</p>
          </div>
        ))}
      </div>
    </div>
  </AppLayout>
);

export default TermsConditions;
