import AppLayout from "@/components/layout/AppLayout";

const AML = () => (
  <AppLayout>
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">Anti-Money Laundering Policy</h1>
      </div>

      <div className="flex flex-col gap-4">
        {/* Intro */}
        <div className="glass-card p-4">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Skyrise maintains a zero-tolerance policy toward money laundering and fully supports global efforts to prevent money laundering and terrorist financing. Our platform strictly follows U.S. anti-money laundering regulations, including the Bank Secrecy Act (BSA), the USA PATRIOT Act, and the regulatory requirements established by the Financial Crimes Enforcement Network (FinCEN). We also follow international AML guidelines promoted by the Financial Action Task Force (FATF).
          </p>
          <p className="text-xs text-muted-foreground leading-relaxed mt-2">
            To prevent the financial system from being used for illegal purposes, Skyrise has established and implemented the following AML policies:
          </p>
        </div>

        {/* AML Measures */}
        <Section title="Our AML Measures">
          <div className="space-y-3">
            <SubSection title="Know Your Customer (KYC)">
              All customers must provide valid identification and supporting documents so we can verify their identity in compliance with U.S. AML requirements.
            </SubSection>
            <SubSection title="Recordkeeping Requirements">
              We maintain complete records of customer identification and verification documents and securely store them for the period required under U.S. federal law.
            </SubSection>
            <SubSection title="Sanctions List Screening">
              We screen customer information against U.S. and international sanctions lists, including OFAC, FinCEN, and other government-issued lists, to ensure that sanctioned or high-risk individuals cannot access our platform.
            </SubSection>
            <SubSection title="Use of Customer Information">
              Any information provided by customers may be used for identity verification, AML compliance, and fraud-prevention purposes.
            </SubSection>
            <SubSection title="Transaction Monitoring">
              We continuously monitor customer account activity for suspicious behavior or potential money-laundering risks.
            </SubSection>
          </div>
        </Section>

        {/* Prohibited */}
        <Section title="Prohibited Payment Methods">
          <p className="mb-2">To minimize risk, we do not accept the following funding or deposit methods:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Money orders</li>
            <li>Third-party payments or deposits</li>
            <li>Western Union or similar remittance services</li>
          </ul>
        </Section>

        {/* What is ML */}
        <Section title="What Is Money Laundering?">
          <p className="mb-2">Money laundering refers to concealing the origins of illegally obtained funds through a series of financial transactions so that the money appears legitimate. It typically involves three stages:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><span className="font-semibold">Placement:</span> Introducing illegal funds into the financial system.</li>
            <li><span className="font-semibold">Layering:</span> Using multiple or complex transactions to obscure the money trail.</li>
            <li><span className="font-semibold">Integration:</span> Reintroducing the "cleaned" funds into the legitimate economy through investments or bank accounts.</li>
          </ul>
        </Section>

        {/* Prevention */}
        <Section title="Our Prevention Mechanisms">
          <p className="mb-3">To ensure accounts are not used to conceal or disguise the source of funds, Skyrise implements rigorous monitoring and verification procedures.</p>
          <div className="space-y-3">
            <SubSection title="Enhanced Review for Irregular Activity">
              If unusual account activity is detected, the platform may request verification of the source of funds. To expedite the review and protect account security, users may be required to:
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Submit documents proving the source of funds (e.g., transfer receipts, bank statements)</li>
                <li>Provide a temporary security deposit to confirm legitimate account activity (refunded according to the review outcome)</li>
              </ul>
            </SubSection>
            <SubSection title="Account Activity Monitoring">
              Our systems continuously monitor transactions and flag any suspicious or abnormal behavior for further risk assessment.
            </SubSection>
            <SubSection title="Compliance Reporting and Response">
              We maintain a comprehensive compliance program designed to comply with U.S. AML laws and ensure timely identification, prevention, and reporting of suspicious activity to the appropriate authorities when required.
            </SubSection>
          </div>
        </Section>

        {/* Contact */}
        <Section title="Contact Us">
          <p>These policies are in place to protect the rights and security of all users on our platform. If you have any questions or suggestions regarding this AML policy, please feel free to contact our customer support team.</p>
        </Section>
      </div>
    </div>
  </AppLayout>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="glass-card p-4">
    <h3 className="text-sm font-semibold mb-3">{title}</h3>
    <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

const SubSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div>
    <h4 className="text-xs font-semibold mb-1">{title}</h4>
    <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

export default AML;
