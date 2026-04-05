import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const sections = [
  {
    title: "1. Agreement Overview",
    content: `This User Confidentiality Agreement ("Agreement") applies to all users of the Skyrise platform. It is designed to ensure the smooth operation of the platform, protect the commercial interests of automotive brands, and safeguard user privacy and financial security.\n\nBy registering and using the platform, all users agree to comply with this Agreement.`,
  },
  {
    title: "2. Importance of Confidentiality",
    content: "Confidentiality is essential to maintaining platform integrity, protecting brand partnerships, and securing user data.",
    subsections: [
      {
        title: "2.1 Protection of Automotive Brand Information",
        content: "Users must not disclose any brand-related information, including:",
        bullets: [
          "Advertising strategies",
          "Promotion plans",
          "Campaign performance data",
        ],
        note: "Unauthorized disclosure may damage brand competitiveness, reduce campaign effectiveness, and distort marketing data.",
      },
      {
        title: "2.2 Protection of User Privacy and Financial Security",
        content: "User accounts contain sensitive data such as:",
        bullets: [
          "Advertising Salary earnings",
          "Personal details",
          "Task records",
        ],
        note: "Exposure may lead to account compromise, identity theft, or unwanted personal scrutiny. Users must keep their account information strictly confidential.",
      },
      {
        title: "2.3 Prevention of External Interference",
        content: "Users must not share platform-related information publicly, including on social media, forums, and messaging apps. This prevents malicious reporting, regulatory issues, and operational disruption.",
      },
      {
        title: "2.4 Data Integrity and Platform Fairness",
        content: "Confidentiality ensures accurate advertising data, fair task distribution, and sustained platform trust. Any exposure of task details may compromise system integrity.",
      },
    ],
  },
  {
    title: "3. User Confidentiality Obligations",
    subsections: [
      {
        title: "3.1 Scope of Confidential Information",
        content: "Users must not disclose:",
        bullets: [
          "Business Information: Task logic, earnings structure",
          "Brand Information: Campaigns, strategies, performance",
          "Account Information: Balances, withdrawals, wallet details",
          "Platform Operations: Matching systems, internal processes",
        ],
      },
      {
        title: "3.2 Prohibited Sharing Channels",
        content: "Sharing is strictly prohibited across:",
        bullets: [
          "Messaging apps (WhatsApp, Telegram, etc.)",
          "Social media (Instagram, TikTok, X, etc.)",
          "Forums (Reddit, Discord, etc.)",
          "Offline discussions",
          "Financial institutions",
        ],
      },
      {
        title: "3.3 Violation Consequences",
        content: "Violations may result in:",
        bullets: [
          "Account suspension (permanent)",
          "Forfeiture of earnings",
          "Legal action",
          "Permanent ban from the platform",
        ],
      },
      {
        title: "3.4 Exceptions",
        content: "Exceptions apply only when required by law (with platform consent) or when security incidents occur (must be reported immediately).",
      },
      {
        title: "3.5 Liability",
        content: "Users are responsible for safeguarding their own information. The platform is not liable for losses caused by weak passwords, account sharing, or personal negligence.",
      },
    ],
  },
  {
    title: "4. Agreement Confirmation",
    content: "By registering, users confirm they have read and understood this Agreement, agree to comply fully, and acknowledge that violations may result in suspension or legal action.\n\nThis Agreement remains active throughout platform usage.",
  },
  {
    title: "5. Applicable Law",
    content: "This Agreement is governed by applicable data protection and cybersecurity regulations. Violations may result in legal liability, financial penalties, and regulatory action. All disputes will be resolved under the jurisdiction governing the platform.",
  },
];

const NDA = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center h-14 px-4 border-b border-border bg-background/95 backdrop-blur-sm">
        <Link to="/login?tab=register" className="mr-3 text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
        </Link>
        <h1 className="flex-1 text-center text-base font-semibold tracking-tight pr-8">Non-Disclosure Agreement</h1>
      </div>

      <div className="max-w-2xl mx-auto px-5 py-8">
        <p className="text-xs text-muted-foreground mb-6">Effective Date: From the date of user registration on the Skyrise platform</p>

        <div className="flex flex-col gap-8">
          {sections.map((section) => (
            <div key={section.title}>
              <h2 className="text-base font-semibold tracking-tight mb-3">{section.title}</h2>
              {section.content && (
                <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{section.content}</p>
              )}
              {section.subsections?.map((sub) => (
                <div key={sub.title} className="mt-4 ml-1">
                  <h3 className="text-sm font-medium mb-2">{sub.title}</h3>
                  {sub.content && (
                    <p className="text-sm text-muted-foreground leading-relaxed">{sub.content}</p>
                  )}
                  {sub.bullets && (
                    <ul className="mt-2 space-y-1 pl-4">
                      {sub.bullets.map((b) => (
                        <li key={b} className="text-sm text-muted-foreground list-disc">{b}</li>
                      ))}
                    </ul>
                  )}
                  {sub.note && (
                    <p className="text-sm text-muted-foreground leading-relaxed mt-2">{sub.note}</p>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>

        <div className="mt-10 pt-6 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">Skyrise Platform — Effective upon registration</p>
        </div>
      </div>
    </div>
  );
};

export default NDA;
