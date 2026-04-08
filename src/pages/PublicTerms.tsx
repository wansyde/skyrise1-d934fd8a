import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import SkyriseLogo from "@/components/SkyriseLogo";

const PublicTerms = () => (
  <div className="min-h-screen bg-background">
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-card/80 backdrop-blur-md px-6">
      <Link to="/" className="flex items-center">
        <SkyriseLogo className="h-10 w-auto" />
      </Link>
      <Link to="/" className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
    </header>

    <div className="px-4 py-8 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Skyrise Platform Promotion Assignment Agreement Terms
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Effective Date: These terms and conditions shall take effect from the date the user registers on the Skyrise platform.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        <Section title="I. Start of Promotion Assignment">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Users must have an account balance of at least 100 AC before starting a new set of promotion assignments.</li>
            <li>100 AC will be used to reset the counter for the new set of promotion assignments to ensure the system can properly match assignments.</li>
            <li>After completing all 3 sets of promotion assignments for the day, users must apply for a full withdrawal and ensure they have received the withdrawal amount before requesting an account reset.</li>
          </ol>
        </Section>

        <Section title="II. Withdrawal Rules">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              For withdrawal amounts of 10,000 USDC or above, users must contact customer service for manual review.
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>Junior Promoter: Maximum withdrawal per transaction: 5,000 USDC</li>
                <li>Professional Promoter: Maximum withdrawal per transaction: 10,000 USDC</li>
                <li>Expert Promoter: Maximum withdrawal per transaction: 60,000 USDC</li>
                <li>Elite Promoter: Maximum withdrawal per transaction: 100,000 USDC</li>
              </ul>
            </li>
            <li>After account reset, users must complete a full set of promotion assignments before they can apply for a withdrawal.</li>
            <li>If a user chooses to abandon or quit during the promotion process, they will not be able to request a withdrawal or refund.</li>
            <li>If no withdrawal request is submitted, the platform will not process account exits, ensuring the safe flow of funds.</li>
            <li>Users with an account credit score below 100% cannot request a withdrawal and must restore their credit score before withdrawal is possible.</li>
            <li>If you have received your basic salary, you must confirm with customer service that you have received it and withdraw your basic salary before starting any assignments.</li>
          </ol>
        </Section>

        <Section title="III. Fund Security">
          <ol className="list-decimal pl-5 space-y-2">
            <li>All funds will be securely stored in the user's account and will be fully refunded and available for withdrawal once the promotion assignment is completed.</li>
            <li>All fund flows are automatically processed by the system to ensure fund security, with no need for manual intervention.</li>
            <li>If funds are lost due to a system error, the platform will take full responsibility.</li>
          </ol>
        </Section>

        <Section title="IV. Account Security">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Users must not disclose their login password and security code to anyone.</li>
            <li>It is recommended that users avoid using personal information as passwords.</li>
            <li>If users forget their login password or security code, they can contact online customer service to reset it.</li>
          </ol>
        </Section>

        <Section title="V. Promotion Assignments and Earnings">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Users can earn normal promotion rewards and have the opportunity to earn multiples (6 times or more) of promotion rewards.</li>
            <li>Junior Promoter: Earn 0.4% Advertising salary per regular promotion assignment.</li>
            <li>After each promotion assignment is completed, the system will automatically return the funds and earnings to the user's account.</li>
            <li>The system will randomly match assignment values based on the user's real-time account balance.</li>
          </ol>
        </Section>

        <Section title="VI. Automobile Alliance Assignments (AAA)">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Automobile Alliance assignments consist of 1–3 car brands distributed randomly.</li>
            <li>For each brand promotion, users can earn 6 times or more the Advertising salary.</li>
            <li>After an Automobile Alliance assignment begins, account funds will be frozen until all tasks are completed.</li>
            <li>Once allocated, assignments cannot be canceled or skipped.</li>
          </ol>
        </Section>

        <Section title="VII. Deposit Rules">
          <ol className="list-decimal pl-5 space-y-2">
            <li>The deposit amount is determined by the user. The platform will not require a mandatory deposit amount.</li>
            <li>Before depositing, users must apply to customer service for deposit details.</li>
            <li>The platform is not responsible if users deposit to an incorrect cryptocurrency address.</li>
          </ol>
        </Section>

        <Section title="VIII. Brand Cooperation">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Users must complete the brand promotion assignment on time.</li>
            <li>Any delay may affect the car brand's image and impact the user's account credit score.</li>
          </ol>
        </Section>

        <Section title="IX. User Responsibilities">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Users must complete a set of promotion assignments within 12 hours.</li>
            <li>Users must complete 3 sets of promotion assignments daily.</li>
            <li>Automobile Alliance assignments are randomly allocated by the system.</li>
          </ol>
        </Section>

        <Section title="X. Invitation Mechanism">
          <div className="space-y-2">
            <p>Expert promoters and above can invite others to join using an invitation code.</p>
            <p>The referrer will receive 20% of the recommended user's daily earnings.</p>
          </div>
        </Section>

        <Section title="XI. KYC Verification Policy">
          <div className="space-y-3">
            <p>All users must complete identity verification (KYC) before submitting their first withdrawal request.</p>
            <p>Required: A valid government-issued ID (front and back) and a clear selfie photo holding the same ID document.</p>
            <p>All KYC documents are securely encrypted and strictly confidential.</p>
          </div>
        </Section>

        <Section title="Important Declaration">
          <p>This agreement is designed to ensure the smooth execution of platform promotion assignments, protecting both brand partners' interests and user earnings. If you have any questions, please contact customer service for assistance.</p>
        </Section>
      </div>
    </div>
  </div>
);

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="rounded-xl border border-border bg-card p-4">
    <h3 className="text-sm font-semibold mb-3">{title}</h3>
    <div className="text-xs text-muted-foreground leading-relaxed">{children}</div>
  </div>
);

export default PublicTerms;
