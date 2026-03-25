import { motion } from "framer-motion";
import { ReactNode, useState } from "react";
import { ChevronDown } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

interface FaqEntry {
  q: string;
  a: ReactNode;
  category?: string;
}

const faqs: FaqEntry[] = [
  {
    category: "General",
    q: "Do users need to follow specific rules when using the platform?",
    a: "Yes, by using the Skyrise platform, you acknowledge that you have read, understood, and agreed to the terms and conditions. If you do not agree, please do not use our services.",
  },
  {
    category: "Assignment-Related",
    q: "What are the users' responsibilities?",
    a: (
      <>
        <p className="mb-2">Users are responsible for promoting designated car brands by completing promotional assignments to increase brand exposure and awareness. Assignments are automatically matched by the system, and users must follow instructions to ensure the brand's advertisement reaches the target audience.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Keep your account AC balance sufficient to qualify for assignment matching</li>
          <li>Complete assignments promptly and submit orders to ensure smooth Advertising Salary and base salary settlement</li>
          <li>Follow the platform's assignment mechanism to ensure successful completion and brand compliance</li>
        </ul>
      </>
    ),
  },
  {
    q: "Why is a deposit required to start a new assignment?",
    a: (
      <>
        <p className="mb-2">A deposit is required because the platform's assignment matching system is based on the user's real-time AC balance. The deposit ensures sufficient balance to match assignments of the corresponding level.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>High-value assignments typically require a higher AC balance. Once completed, all principal and Advertising Salary will be fully returned to the account</li>
          <li>Brand partners require data from real users, and the deposit proves users are real participants, ensuring assignment authenticity and compliance</li>
          <li>The deposit ensures the smooth execution of assignments and allows users to earn the corresponding Advertising Salary rewards</li>
        </ul>
      </>
    ),
  },
  {
    q: "What is the minimum account balance required to start a new set of promotional assignments?",
    a: (
      <>
        <p className="mb-2">Minimum balance requirements vary by promoter level:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Junior Promoter: Minimum deposit 100 USDC – 499 USDC, suitable for basic assignments with relatively lower Advertising Salary</li>
          <li>Professional Promoter: Minimum deposit 501 USDC – 2,999 USDC, eligible for higher-level assignments with better Advertising Salary returns</li>
          <li>Expert Promoter: Minimum deposit 3,000 USDC – 4,999 USDC, matches with high-value assignments and higher Advertising Salary rewards</li>
          <li>Elite Promoter: Minimum deposit 5,000 USDC and above, eligible for the highest-value assignments with the highest Advertising Salary returns</li>
        </ul>
        <p className="mt-2">The deposit amount determines the level of assignments that can be matched. The higher the deposit, the greater the value of assignments and the higher the Advertising Salary. All principal and Advertising Salary will be fully refunded upon completion to ensure fund security.</p>
      </>
    ),
  },
  {
    q: "How many sets of promotional assignments can a user complete per day?",
    a: (
      <>
        <p className="mb-2">Users can complete up to 3 sets of assignments per day, regardless of promoter level.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Assignments are matched based on the user's real-time AC balance, assignment completion status, and brand demand</li>
          <li>After completing each set, ensure that the AC balance is sufficient for the next set</li>
          <li>The daily limit is 3 sets to maintain assignment quality and meet brand demand</li>
        </ul>
      </>
    ),
  },
  {
    q: "How can users qualify for the base salary?",
    a: (
      <>
        <p className="mb-2">Users must meet the following conditions to receive the base salary:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Complete daily assignments: Complete 3 sets of assignments daily, submit them on time, and meet the system's requirements</li>
          <li>Maintain account activity: Stay active and avoid long periods of inactivity to ensure stable promotion</li>
          <li>Follow platform rules: No violations like fraud, assignment interruption, or misconduct</li>
        </ul>
        <p className="mt-2">After meeting these conditions, a base salary of $900 will be settled every 5 days based on assignment completion.</p>
      </>
    ),
  },
  {
    category: "Withdrawal-Related",
    q: "Can users request a withdrawal after completing a set of assignments?",
    a: "Yes, users can choose to withdraw after completing one set of assignments, or wait until all 3 sets are completed.",
  },
  {
    q: "Can users withdraw or request a refund if they quit during an assignment?",
    a: (
      <>
        <p className="mb-2">No. If a user quits or abandons an assignment during the process, they cannot withdraw or request a refund.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>The platform requires users to complete assignments according to the established process to ensure task integrity and protect brand interests</li>
          <li>Abandoning an assignment results in no Advertising Salary and may affect future assignment matching</li>
        </ul>
      </>
    ),
  },
  {
    q: "Is it mandatory to withdraw the full amount after completing all 3 sets of assignments in a day?",
    a: (
      <>
        <p className="mb-2">Yes. After completing all 3 sets of assignments in a day, users must withdraw the full amount.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>All principal and Advertising Salary will be returned after task completion, and users must withdraw the same day</li>
          <li>This ensures fund liquidity, maintains system stability, and prevents funds from remaining idle</li>
        </ul>
      </>
    ),
  },
  {
    category: "Account Security",
    q: "How can users ensure account security?",
    a: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Keep login and withdrawal passwords secure and do not share them</li>
        <li>Avoid using sensitive information (e.g., birthdate, ID number) as passwords</li>
        <li>Do not click unfamiliar links or share account info with unknown third parties</li>
        <li>Regularly update passwords and use complex combinations to enhance security</li>
      </ul>
    ),
  },
  {
    q: "What should users do if they forget their login or withdrawal password?",
    a: (
      <ul className="list-disc pl-5 space-y-1">
        <li>Contact platform customer service for recovery</li>
        <li>Provide identity verification (e.g., transfer records, transaction details) to confirm account ownership</li>
        <li>Once verified, customer service will assist in resetting passwords to secure the account</li>
      </ul>
    ),
  },
  {
    category: "Assignment Mechanism",
    q: "Can assigned Auto Alliance assignments be canceled or skipped?",
    a: (
      <>
        <p className="mb-2">No. Auto Alliance assignments cannot be canceled or skipped. Users must complete the tasks as matched by the system.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Assignments are matched based on account balance, promotion progress, and brand demand</li>
          <li>Unfinished assignments will result in no Advertising Salary and may impact future task matching</li>
        </ul>
      </>
    ),
  },
  {
    q: "What is an Auto Alliance assignment?",
    a: (
      <>
        <p className="mb-2">Auto Alliance assignments are high-value promotional tasks consisting of 1–3 car brands. Users must complete each brand's promotion as per the system's requirements.</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>These assignments have a higher AC value and offer greater Advertising Salary upon completion</li>
          <li>Matching is based on the user's AC balance. The higher the balance, the higher-value assignments they can match</li>
        </ul>
      </>
    ),
  },
  {
    category: "Other Questions",
    q: "Can users invite others to join the platform?",
    a: (
      <>
        <p className="mb-2">Yes, but the following conditions must be met:</p>
        <ul className="list-disc pl-5 space-y-1">
          <li>Users must be familiar with the workflow and have reached Expert Promoter level to invite others</li>
          <li>Once successfully invited, the referrer will receive 20% of the invitee's daily earnings as a referral bonus</li>
        </ul>
      </>
    ),
  },
];

const FaqItem = ({ q, a }: { q: string; a: ReactNode }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="glass-card">
      <button
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between p-5 text-left"
      >
        <span className="text-sm font-medium">{q}</span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 ml-3 text-muted-foreground transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          strokeWidth={1.5}
        />
      </button>
      <motion.div
        initial={false}
        animate={{ height: open ? "auto" : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="overflow-hidden"
      >
        <div className="px-5 pb-5 text-sm text-muted-foreground leading-relaxed">{a}</div>
      </motion.div>
    </div>
  );
};

const FAQ = () => {
  let lastCategory = "";

  return (
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
            <p className="mt-4 text-muted-foreground">
              Find answers to common questions about the Skyrise platform.
            </p>
          </motion.div>

          <div className="mx-auto mt-16 flex max-w-2xl flex-col gap-3">
            {faqs.map((faq, i) => {
              const showCategory = faq.category && faq.category !== lastCategory;
              if (faq.category) lastCategory = faq.category;

              return (
                <div key={i}>
                  {showCategory && (
                    <h2 className={`text-xs font-semibold uppercase tracking-widest text-primary ${i > 0 ? "mt-6" : ""} mb-3`}>
                      {faq.category}
                    </h2>
                  )}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.03, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <FaqItem q={faq.q} a={faq.a} />
                  </motion.div>
                </div>
              );
            })}
          </div>

          <div className="mx-auto mt-12 max-w-2xl text-center">
            <p className="text-sm text-muted-foreground">
              Skyrise is committed to providing a transparent, secure, and high-reward promotional environment. If you have any questions, please contact customer service.
            </p>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default FAQ;
