import AppLayout from "@/components/layout/AppLayout";

const TermsConditions = () => (
  <AppLayout>
    <div className="px-4 py-5 max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-semibold tracking-tight">
          Skyrise Platform Promotion Assignment Agreement Terms
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Effective Date: These terms and conditions shall take effect from the date the user registers on the Skyrise platform.
        </p>
      </div>

      <div className="flex flex-col gap-4">
        {/* I */}
        <Section title="I. Start of Promotion Assignment">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Users must have an account balance of at least 100 USDC before starting a new set of promotion assignments.</li>
            <li>100 USDC will be used to reset the counter for the new set of promotion assignments to ensure the system can properly match assignments.</li>
            <li>After completing all 3 sets of promotion assignments for the day, users must apply for a full withdrawal and ensure they have received the withdrawal amount before requesting an account reset.</li>
          </ol>
        </Section>

        {/* II */}
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
            <li>If you have received your basic salary, you must confirm with customer service that you have received it and withdraw your basic salary before starting any assignments. If you do not have sufficient backup funds, you are prohibited from using the basic salary to start assignments. Please contact customer service to withdraw your basic salary before starting work. This will help avoid issues with task completion due to insufficient funds.</li>
          </ol>
        </Section>

        {/* III */}
        <Section title="III. Fund Security">
          <ol className="list-decimal pl-5 space-y-2">
            <li>All funds will be securely stored in the user's account and will be fully refunded and available for withdrawal once the promotion assignment is completed.</li>
            <li>All fund flows are automatically processed by the system to ensure fund security, with no need for manual intervention.</li>
            <li>If funds are lost due to a system error, the platform will take full responsibility, and users need not worry about financial risk.</li>
          </ol>
        </Section>

        {/* IV */}
        <Section title="IV. Account Security">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Users must not disclose their login password and security code to anyone. The platform is not responsible for any loss resulting from password leaks.</li>
            <li>It is recommended that users avoid using personal information (e.g., birthday, ID number, phone number) as passwords to prevent account theft.</li>
            <li>If users forget their login password or security code, they can contact online customer service and provide identity verification information to reset it.</li>
          </ol>
        </Section>

        {/* V */}
        <Section title="V. Promotion Assignments and Earnings">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Users can earn normal promotion rewards and have the opportunity to earn multiples (6 times or more) of promotion rewards.</li>
            <li>Junior Promoter: Earn 0.4% Advertising salary per regular promotion assignment.</li>
            <li>Junior Promoter: When participating in Automobile Alliance assignments, users can earn 2.4% or more Advertising salary.</li>
            <li>After each promotion assignment is completed, the system will automatically return the funds and earnings to the user's account to ensure transparent fund flow.</li>
            <li>The system will randomly match assignment values and allocate promotion assignments based on the user's real-time account balance, ensuring fairness.</li>
          </ol>
        </Section>

        {/* VI */}
        <Section title="VI. Automobile Alliance Assignments (AAA)">
          <ol className="list-decimal pl-5 space-y-2">
            <li>Automobile Alliance assignments consist of 1–3 car brands. Users may not necessarily receive all 3 brands; the system will distribute them randomly.</li>
            <li>For each brand promotion within an Automobile Alliance assignment, users can earn 6 times or more the Advertising salary of a regular assignment.</li>
            <li>After an Automobile Alliance assignment begins, the account funds will be frozen. Funds will only be unlocked and returned after completing all brand promotion tasks and submitting the orders.</li>
            <li>The system will assign Automobile Alliance assignments randomly based on the user's real-time account balance, ensuring advertisement data authenticity.</li>
            <li>All promotion assignments are matched by the system. Once an Automobile Alliance assignment is allocated to a user, it cannot be canceled or skipped. The user must complete the promotion assignment and clear any negative balance before submitting the order and completing the withdrawal.</li>
            <li>In each set of promotion assignments, users can encounter up to 2 Automobile Alliance assignments. All promoter levels have equal opportunities to receive Automobile Alliance assignments.</li>
          </ol>
        </Section>

        {/* VII */}
        <Section title="VII. Deposit Rules">
          <ol className="list-decimal pl-5 space-y-2">
            <li>The deposit amount is determined by the user. The platform will not require a mandatory deposit amount. Users are advised to select an appropriate deposit based on their financial capacity.</li>
            <li>If users need to make a deposit for an Automobile Alliance assignment as a prepayment, it is recommended to deposit according to the insufficient amount shown in their account.</li>
            <li>Before depositing, users must apply to customer service for deposit details and confirm the deposit amount to ensure correct fund flow.</li>
            <li>The platform is not responsible if users deposit to an incorrect cryptocurrency address. Please ensure the deposit information is verified.</li>
          </ol>
        </Section>

        {/* VIII */}
        <Section title="VIII. Brand Cooperation">
          <ol className="list-decimal pl-5 space-y-2">
            <li>The platform's assignments involve multiple car brands. Users must complete the brand promotion assignment on time to ensure the market exposure of the brands.</li>
            <li>The platform will provide brand partners with user deposit details to ensure correct deposits and promote task completion rates.</li>
            <li>Any delay in completing promotion assignments may affect the car brand's image and impact the user's account credit score.</li>
          </ol>
        </Section>

        {/* IX */}
        <Section title="IX. User Responsibilities">
          <ol className="list-decimal pl-5 space-y-2">
            <li>
              Users must complete a set of promotion assignments within 12 hours to ensure assignment validity. If assignments are not completed on time, the account will be frozen (special cases can apply for an extension by contacting platform customer service).
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>After freezing, all funds will cease to flow. Users must pay a 30% thawing fee to restore the account.</li>
                <li>If the user applies for an assignment extension, they may need to pay a 50% delay fee, and all promotion assignments in that set must be completed before a withdrawal can be made.</li>
              </ul>
            </li>
            <li>Users must complete 3 sets of promotion assignments daily. After meeting the check-in requirements, they can receive a 900 USDC base salary every 5 days.</li>
            <li>
              Automobile Alliance assignments are randomly allocated by the system. Users must understand and accept the platform rules and select their deposit amounts based on their financial capacity.
              <ul className="list-disc pl-5 mt-1 space-y-1">
                <li>If a user receives an Automobile Alliance assignment, they can earn 6 times or more the Advertising salary, but they must clear the negative balance or complete the deposit within 12 hours, or it may affect the promotion progress for car brand partners. The user will be held responsible and the account credit score may be impacted.</li>
              </ul>
            </li>
          </ol>
        </Section>

        {/* X */}
        <Section title="X. Invitation Mechanism">
          <div className="space-y-2">
            <p>Expert promoters and above can invite others to join the platform using an invitation code to expand their promotion team.</p>
            <p>Users must complete all their own promotion assignments before inviting others to ensure smooth execution across the platform.</p>
            <p>The referrer will receive 20% of the recommended user's daily earnings (excluding the Advertising salary part). The platform will additionally reward this earnings to encourage excellent promoters.</p>
          </div>
        </Section>

        {/* XI */}
        <Section title="XI. KYC Verification Policy (Identity Verification Rules)">
          <p className="mb-3">To ensure user account security and comply with Anti-Money Laundering (AML) regulations and financial supervision laws, our platform implements the following Know Your Customer (KYC) verification policy:</p>

          <div className="space-y-4">
            <div>
              <h4 className="text-xs font-semibold mb-1">1. Verification Requirements</h4>
              <p>All users must complete identity verification (KYC) before submitting their first withdrawal request. The platform reserves the right to request additional identity information at any time for the purpose of risk assessment or legal compliance, in order to verify the authenticity and security of user accounts.</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-1">2. Required Documents</h4>
              <p className="mb-1">To successfully complete the KYC process, users are required to provide the following documents (including but not limited to):</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>A valid government-issued ID (front and back), such as an identity card, passport, or residence permit</li>
                <li>A clear selfie photo of the user holding the same ID document (the face and ID details must be clearly visible)</li>
              </ul>
              <p className="mt-1">Our customer service team will provide detailed guidance to help users complete the verification process smoothly.</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-1">3. Data Security and Privacy Protection</h4>
              <p>The platform ensures that all KYC documents are securely encrypted and strictly confidential. Identity information will only be used for compliance verification, risk control, and account protection purposes, and will never be used for any unauthorized activities.</p>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-1">4. Limitations on Unverified Accounts</h4>
              <p className="mb-1">If users do not complete the KYC verification, the following actions will be temporarily restricted:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Withdrawing funds to a personal wallet or account</li>
                <li>Participating in or starting any assignments and platform activities</li>
                <li>Performing any operations related to account fund transfers</li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-semibold mb-1">5. Legal Compliance Statement</h4>
              <p>Our platform strictly complies with U.S. anti-money laundering regulations including the Bank Secrecy Act, the USA PATRIOT Act, and FinCEN requirements to ensure that all transactions meet federal standards and to safeguard user rights to the fullest extent.</p>
            </div>
          </div>
        </Section>

        {/* Declaration */}
        <Section title="Important Declaration">
          <p className="mb-2">This agreement is designed to ensure the smooth execution of platform promotion assignments, protecting both brand partners' interests and user earnings. All users should carefully read and agree to these terms before participating in promotion assignments. If you have any questions, please contact customer service for assistance.</p>
          <p className="text-muted-foreground font-medium">Effective Date: These terms and conditions shall take effect from the date the user registers on the Skyrise platform.</p>
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

export default TermsConditions;
