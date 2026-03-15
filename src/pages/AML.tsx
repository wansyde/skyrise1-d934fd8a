import AppLayout from "@/components/layout/AppLayout";

const sections = [
  {
    title: "Anti-Money Laundering Policy",
    content: "Skyrise is committed to preventing money laundering and terrorist financing. We comply with all applicable AML regulations and implement robust measures to detect and report suspicious activities."
  },
  {
    title: "Know Your Customer (KYC)",
    content: "All users are required to complete identity verification before accessing investment features. This includes providing government-issued identification and proof of address."
  },
  {
    title: "Transaction Monitoring",
    content: "We continuously monitor transactions for unusual or suspicious patterns. Large transactions may be subject to additional review and verification."
  },
  {
    title: "Reporting Obligations",
    content: "Suspicious activities are reported to the relevant financial authorities in accordance with applicable laws and regulations."
  },
];

const AML = () => (
  <AppLayout>
    <div className="px-4 py-5">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">AML Policy</h1>
        <p className="mt-1 text-sm text-muted-foreground">Anti-Money Laundering compliance.</p>
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

export default AML;
