import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { ArrowLeft, CalendarCheck, Copy, Diamond, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useCallback, useEffect, useRef, useState } from "react";
import { toPng } from "html-to-image";
import NativeLongPressImageCard from "@/components/event/NativeLongPressImageCard";
import {
  BaseSalaryTemplate,
  MembershipLevelsTemplate,
  SalaryRulesTemplate,
} from "@/components/event/EventImageTemplates";

const Event = () => {
  const memberTemplateRef = useRef<HTMLDivElement>(null);
  const salaryTemplateRef = useRef<HTMLDivElement>(null);
  const rulesTemplateRef = useRef<HTMLDivElement>(null);

  const [membershipImage, setMembershipImage] = useState<string | null>(null);
  const [salaryImage, setSalaryImage] = useState<string | null>(null);
  const [rulesImage, setRulesImage] = useState<string | null>(null);

  const generateImage = useCallback(async (ref: React.RefObject<HTMLDivElement>) => {
    if (!ref.current) return null;

    return toPng(ref.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 3,
      cacheBust: true,
      skipAutoScale: true,
    });
  }, []);

  useEffect(() => {
    let mounted = true;

    const renderImages = async () => {
      try {
        const [membershipSrc, salarySrc, rulesSrc] = await Promise.all([
          generateImage(memberTemplateRef),
          generateImage(salaryTemplateRef),
          generateImage(rulesTemplateRef),
        ]);

        if (!mounted) return;

        setMembershipImage(membershipSrc);
        setSalaryImage(salarySrc);
        setRulesImage(rulesSrc);
      } catch {
        if (!mounted) return;
        toast.error("Failed to load images");
      }
    };

    const timer = window.setTimeout(renderImages, 80);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
    };
  }, [generateImage]);

  const copyAllText = useCallback(() => {
    const lines = [
      "=== SKYRISE MEMBERSHIP LEVELS ===",
      "Junior: Salary 0.4% | Tasks 40 / 3 sets daily | Deposit USD 100–499",
      "Professional: Salary 0.6% | Tasks 45 / 3 sets daily | Deposit USD 500–1,499",
      "Expert: Salary 0.8% | Tasks 50 / 3 sets daily | Deposit USD 1,500–4,999",
      "Elite: Salary 1.0% | Tasks 55 / 3 sets daily | Deposit USD 5,000+",
      "",
      "=== BASE SALARY REWARDS ===",
      "5 Days → 900 USDC",
      "10 Days → 1,800 USDC",
      "15 Days → 2,700 USDC",
      "20 Days → 3,600 USDC",
      "25 Days → 4,500 USDC",
      "30 Days → 5,400 USDC",
    ];

    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Copied");
  }, []);

  return (
    <AppLayout>
      <div className="px-4 py-4 pb-24 select-none [-webkit-user-select:none]">
        <div className="mb-5 flex items-center justify-between">
          <Link to="/app" className="text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <button
            onClick={copyAllText}
            className="flex items-center gap-1.5 rounded-lg bg-secondary px-3 py-1.5 text-xs font-medium text-secondary-foreground transition-colors hover:bg-secondary/80"
          >
            <Copy className="h-3.5 w-3.5" /> Copy All
          </button>
        </div>

        <NativeLongPressImageCard
          title="Membership Levels"
          description="Unlock tiers by increasing your deposit"
          icon={Diamond}
          imageSrc={membershipImage}
          alt="Skyrise Membership Levels"
        />

        <NativeLongPressImageCard
          title="Base Salary"
          description="Earn rewards for consecutive daily check-ins"
          icon={CalendarCheck}
          imageSrc={salaryImage}
          alt="Skyrise Base Salary"
          delay={0.08}
        />

        <NativeLongPressImageCard
          title="Salary Rules"
          description="How the base salary system works"
          icon={Info}
          imageSrc={rulesImage}
          alt="Skyrise Salary Rules"
          delay={0.16}
        />

        <div className="pointer-events-none fixed -left-[9999px] top-0 opacity-0" aria-hidden="true">
          <MembershipLevelsTemplate ref={memberTemplateRef} />
          <div className="h-6" />
          <BaseSalaryTemplate ref={salaryTemplateRef} />
          <div className="h-6" />
          <SalaryRulesTemplate ref={rulesTemplateRef} />
        </div>
      </div>
    </AppLayout>
  );
};

export default Event;
