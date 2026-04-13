import AppLayout from "@/components/layout/AppLayout";
import { ArrowLeft, CalendarCheck, Diamond, Info } from "lucide-react";
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

  const generateImage = useCallback(async (ref: { current: HTMLDivElement | null }) => {
    if (!ref.current) return null;

    return toPng(ref.current, {
      backgroundColor: "#ffffff",
      pixelRatio: 3,
      cacheBust: true,
      skipAutoScale: true,
    });
  }, []);

  useEffect(() => {
    let active = true;

    const renderImages = async () => {
      try {
        if (document.fonts?.ready) {
          await document.fonts.ready;
        }

        const [membershipSrc, salarySrc, rulesSrc] = await Promise.all([
          generateImage(memberTemplateRef),
          generateImage(salaryTemplateRef),
          generateImage(rulesTemplateRef),
        ]);

        if (!active) return;

        setMembershipImage(membershipSrc);
        setSalaryImage(salarySrc);
        setRulesImage(rulesSrc);
      } catch {
        if (!active) return;
        toast.error("Failed to load images");
      }
    };

    const timer = window.setTimeout(() => {
      void renderImages();
    }, 80);

    return () => {
      active = false;
      window.clearTimeout(timer);
    };
  }, [generateImage]);

  return (
    <AppLayout>
      <div className="px-4 py-4 pb-24 select-none [-webkit-user-select:none]">
        <div className="mb-5 flex items-center">
          <Link to="/app" className="text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
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

        <div className="pointer-events-none fixed left-[-99999px] top-0" aria-hidden="true">
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
