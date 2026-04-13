import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Diamond, ChevronRight, Crown, Award, Star, Gem, CalendarCheck, Copy, ArrowLeft, Share2, CheckCircle, Info, X } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useRef, useCallback, useState } from "react";
import { toPng } from "html-to-image";

const tiers = [
  {
    name: "Junior",
    icon: Star,
    salary: "0.4%",
    tasks: "40 / 3 sets",
    deposit: "USD 100–499",
    color: "from-[hsl(240,8%,95%)] to-[hsl(240,8%,90%)]",
    accent: "hsl(240, 10%, 45%)",
    textColor: "text-foreground",
    subColor: "text-muted-foreground",
  },
  {
    name: "Professional",
    icon: Gem,
    salary: "0.6%",
    tasks: "45 / 3 sets",
    deposit: "USD 500–1,499",
    color: "from-[hsl(255,50%,95%)] to-[hsl(255,45%,88%)]",
    accent: "hsl(255, 60%, 58%)",
    textColor: "text-foreground",
    subColor: "text-muted-foreground",
  },
  {
    name: "Expert",
    icon: Award,
    salary: "0.8%",
    tasks: "50 / 3 sets",
    deposit: "USD 1,500–4,999",
    color: "from-[hsl(38,70%,94%)] to-[hsl(38,60%,85%)]",
    accent: "hsl(38, 80%, 42%)",
    textColor: "text-foreground",
    subColor: "text-muted-foreground",
  },
  {
    name: "Elite",
    icon: Crown,
    salary: "1.0%",
    tasks: "55 / 3 sets",
    deposit: "USD 5,000+",
    color: "from-[hsl(270,40%,94%)] to-[hsl(270,35%,87%)]",
    accent: "hsl(270, 55%, 50%)",
    textColor: "text-foreground",
    subColor: "text-muted-foreground",
  },
];

const salaryTiers = [
  { days: 5, reward: 900 },
  { days: 10, reward: 1800 },
  { days: 15, reward: 2700 },
  { days: 20, reward: 3600 },
  { days: 25, reward: 4500 },
  { days: 30, reward: 5400 },
];

const salaryRules = [
  "To check in for one working day, you must reset 3 sets of assignments within the same day.",
  "Upon completing your 5th check-in, you will receive a base salary of 900 USDC.",
  "After the 5th check-in, your day count will reset to 0, and the cycle will restart.",
  "Every additional 5 check-ins will grant another 900 USDC base salary.",
];

const Event = () => {
  const memberRef = useRef<HTMLDivElement>(null);
  const salaryRef = useRef<HTMLDivElement>(null);
  const rulesRef = useRef<HTMLDivElement>(null);

  // Image preview state: which section is being previewed
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState("");

  const copyAllText = useCallback(() => {
    const lines: string[] = ["=== SKYRISE MEMBERSHIP LEVELS ===\n"];
    tiers.forEach((t) => {
      lines.push(`${t.name}: Salary ${t.salary} | Tasks ${t.tasks} | Deposit ${t.deposit}`);
    });
    lines.push("\n=== BASE SALARY REWARDS ===\n");
    salaryTiers.forEach((s) => {
      lines.push(`${s.days} Days → ${s.reward.toLocaleString()} USDC`);
    });
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Copied");
  }, []);

  const generatePreview = useCallback(async (ref: React.RefObject<HTMLDivElement>, name: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { backgroundColor: "#ffffff", pixelRatio: 3 });
      setPreviewSrc(dataUrl);
      setPreviewName(name);
    } catch {
      toast.error("Failed to generate image");
    }
  }, []);

  const saveCurrentImage = useCallback(async () => {
    if (!previewSrc) return;
    try {
      const res = await fetch(previewSrc);
      const blob = await res.blob();
      const file = new File([blob], `skyrise-${previewName}.png`, { type: "image/png" });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: `Skyrise ${previewName}` });
        toast.success("Shared");
        return;
      }

      const link = document.createElement("a");
      link.download = `skyrise-${previewName}.png`;
      link.href = previewSrc;
      link.click();
      toast.success("Image saved");
    } catch (err: any) {
      if (err?.name === "AbortError") return;
      toast.error("Failed to save");
    }
  }, [previewSrc, previewName]);

  return (
    <AppLayout>
      <div className="px-4 py-4 pb-24">
        {/* Back + Actions header */}
        <div className="flex items-center justify-between mb-5">
          <Link to="/app" className="text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-5 w-5" strokeWidth={1.5} />
          </Link>
          <div className="flex items-center gap-2">
            <button onClick={copyAllText} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 transition-colors">
              <Copy className="h-3.5 w-3.5" /> Copy All
            </button>
          </div>
        </div>

        {/* Membership Levels */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Diamond className="h-4.5 w-4.5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-lg font-bold tracking-tight font-[Montserrat]">Membership Levels</h1>
                <p className="text-sm text-muted-foreground">Unlock tiers by increasing your deposit</p>
              </div>
            </div>
            <button onClick={() => generatePreview(memberRef, "membership")} title="Save / Share" className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div ref={memberRef} className="flex flex-col gap-3 p-4 rounded-2xl border border-border/40">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Diamond className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-bold tracking-tight text-foreground font-[Montserrat]">Skyrise</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Membership Levels</span>
            </div>
            <div className="grid grid-cols-4 gap-1.5 sm:gap-2 px-2 text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>VIP Level</span>
              <span className="text-center">Salary</span>
              <span className="text-center">Tasks</span>
              <span className="text-right">Condition</span>
            </div>

            {tiers.map((tier, i) => {
              const Icon = tier.icon;
              return (
                <motion.div
                  key={tier.name}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                  className={`grid grid-cols-4 items-center gap-1.5 sm:gap-2 rounded-xl bg-gradient-to-r ${tier.color} p-3 sm:p-4 ring-1 ring-white/[0.04]`}
                >
                  <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0">
                    <Icon className="h-4 w-4 sm:h-5 sm:w-5 shrink-0" style={{ color: tier.accent }} strokeWidth={1.5} />
                    <span className={`text-xs sm:text-sm font-bold ${tier.textColor} truncate`}>{tier.name}</span>
                  </div>
                  <span className={`text-center text-sm sm:text-base font-extrabold tabular-nums ${tier.textColor}`}>{tier.salary}</span>
                  <span className={`text-center text-[11px] sm:text-sm font-medium ${tier.subColor} leading-tight`}>{tier.tasks}</span>
                  <div className="text-right min-w-0">
                    <span className={`text-[9px] sm:text-[11px] ${tier.subColor} block leading-tight font-medium`}>Reset Deposit</span>
                    <span className={`text-[11px] sm:text-sm font-bold ${tier.textColor} leading-tight`}>{tier.deposit}</span>
                  </div>
                </motion.div>
              );
            })}
            <p className="text-[9px] text-muted-foreground/50 text-center mt-2">Long press the image preview to copy or share</p>
          </div>
        </motion.div>

        {/* Base Salary Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <CalendarCheck className="h-4.5 w-4.5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight font-[Montserrat]">Base Salary</h2>
                <p className="text-sm text-muted-foreground">Earn rewards for consecutive daily check-ins</p>
              </div>
            </div>
            <button onClick={() => generatePreview(salaryRef, "salary")} title="Save / Share" className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div ref={salaryRef} className="flex flex-col gap-2.5 p-4 rounded-2xl border border-border/40">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-bold tracking-tight text-foreground font-[Montserrat]">Skyrise</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Base Salary Rewards</span>
            </div>
            {salaryTiers.map((tier, i) => (
              <motion.div
                key={tier.days}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-2.5 sm:gap-3 rounded-xl bg-secondary/60 p-3 sm:p-4 ring-1 ring-white/[0.04]"
              >
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Consecutive Check-ins
                  </span>
                  <p className="text-lg sm:text-xl font-extrabold tabular-nums text-foreground">{tier.days} Days</p>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />

                <div className="flex-1 text-right min-w-0">
                  <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Receive
                  </span>
                  <p className="text-lg sm:text-xl font-extrabold tabular-nums text-foreground">
                    {tier.reward.toLocaleString()} <span className="text-xs sm:text-sm font-semibold text-muted-foreground">USDC</span>
                  </p>
                </div>
              </motion.div>
            ))}
            <p className="text-[9px] text-muted-foreground/50 text-center mt-2">Long press the image preview to copy or share</p>
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground/60">
            The final interpretation right belongs to Skyrise
          </p>
        </motion.div>

        {/* Base Salary Rules Section */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8"
        >
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Info className="h-4.5 w-4.5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight font-[Montserrat]">Salary Rules</h2>
                <p className="text-sm text-muted-foreground">How the base salary system works</p>
              </div>
            </div>
            <button onClick={() => generatePreview(rulesRef, "salary-rules")} title="Save / Share" className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div ref={rulesRef} className="flex flex-col gap-3 p-5 rounded-2xl border border-border/40">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Diamond className="h-4 w-4 text-primary" strokeWidth={1.5} />
                <span className="text-sm font-bold tracking-tight text-foreground font-[Montserrat]">Skyrise</span>
              </div>
              <span className="text-[10px] text-muted-foreground">Base Salary</span>
            </div>

            <h3 className="text-base font-bold text-center text-foreground font-[Montserrat] mb-1">Base Salary</h3>

            {salaryRules.map((rule, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.55 + i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-start gap-3 rounded-xl bg-secondary/60 p-3.5 sm:p-4 ring-1 ring-white/[0.04]"
              >
                <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" strokeWidth={1.5} />
                <p className="text-sm text-foreground font-medium leading-relaxed">{rule}</p>
              </motion.div>
            ))}

            <p className="text-[10px] text-muted-foreground/60 text-center mt-2">
              The final interpretation right belongs to Skyrise.
            </p>
            <p className="text-[9px] text-muted-foreground/50 text-center">Long press the image preview to copy or share</p>
          </div>
        </motion.div>
      </div>

      {/* Image Preview Modal — renders real <img> for native long-press */}
      <AnimatePresence>
        {previewSrc && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
              onClick={() => setPreviewSrc(null)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.92, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed inset-0 z-[51] flex flex-col items-center justify-center p-4"
              onClick={() => setPreviewSrc(null)}
            >
              <div
                className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                {/* The real <img> — supports native long-press on iOS/Android */}
                <img
                  src={previewSrc}
                  alt={`Skyrise ${previewName}`}
                  className="w-full h-auto select-auto"
                  draggable
                  style={{ WebkitTouchCallout: "default" } as React.CSSProperties}
                />
              </div>

              <div className="mt-3 flex gap-2 w-full max-w-md" onClick={(e) => e.stopPropagation()}>
                <button
                  onClick={saveCurrentImage}
                  className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
                >
                  <Share2 className="h-4 w-4" />
                  Save Image
                </button>
                <button
                  onClick={() => setPreviewSrc(null)}
                  className="h-11 w-11 rounded-xl bg-white/90 flex items-center justify-center hover:bg-white transition-colors"
                >
                  <X className="h-5 w-5 text-foreground" strokeWidth={1.5} />
                </button>
              </div>

              <p className="mt-3 text-xs text-white/70 text-center">
                Long press the image to copy or share
              </p>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Event;
