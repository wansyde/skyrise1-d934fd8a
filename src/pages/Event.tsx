import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Diamond, ChevronRight, Crown, Award, Star, Gem, CalendarCheck, Copy, Download, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { useRef, useCallback } from "react";
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

const Event = () => {
  const memberRef = useRef<HTMLDivElement>(null);
  const salaryRef = useRef<HTMLDivElement>(null);

  const copyAllText = useCallback(() => {
    const lines: string[] = ["=== SKYRISE MEMBERSHIP LEVELS ===\n"];
    tiers.forEach((t) => {
      lines.push(`${t.name}: Salary ${t.salary} | Tasks ${t.tasks} | Deposit ${t.deposit}`);
    });
    lines.push("\n=== BASE SALARY REWARDS ===\n");
    salaryTiers.forEach((s) => {
      lines.push(`${s.days} Days → $${s.reward.toLocaleString()} USD`);
    });
    navigator.clipboard.writeText(lines.join("\n"));
    toast.success("Copied to clipboard");
  }, []);

  const downloadImage = useCallback(async (ref: React.RefObject<HTMLDivElement>, name: string) => {
    if (!ref.current) return;
    try {
      const dataUrl = await toPng(ref.current, { backgroundColor: "#ffffff", pixelRatio: 3 });
      const link = document.createElement("a");
      link.download = `skyrise-${name}.png`;
      link.href = dataUrl;
      link.click();
      toast.success("Image saved");
    } catch {
      toast.error("Failed to generate image");
    }
  }, []);

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
                <h1 className="text-lg font-bold tracking-tight">Membership Levels</h1>
                <p className="text-sm text-muted-foreground">Unlock tiers by increasing your deposit</p>
              </div>
            </div>
            <button onClick={() => downloadImage(memberRef, "membership")} className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div ref={memberRef} className="flex flex-col gap-3 p-1">
            {/* Header row */}
            <div className="grid grid-cols-4 gap-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              <span>VIP Level</span>
              <span className="text-center">Ads Salary</span>
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
                  className={`grid grid-cols-4 items-center gap-2 rounded-xl bg-gradient-to-r ${tier.color} p-4 ring-1 ring-white/[0.04]`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="h-5 w-5 shrink-0" style={{ color: tier.accent }} strokeWidth={1.5} />
                    <span className={`text-sm font-bold ${tier.textColor}`}>{tier.name}</span>
                  </div>
                  <span className={`text-center text-base font-extrabold tabular-nums ${tier.textColor}`}>{tier.salary}</span>
                  <span className={`text-center text-sm font-medium ${tier.subColor}`}>{tier.tasks}</span>
                  <div className="text-right">
                    <span className={`text-[11px] ${tier.subColor} block leading-tight font-medium`}>Reset Deposit</span>
                    <span className={`text-sm font-bold ${tier.textColor}`}>{tier.deposit}</span>
                  </div>
                </motion.div>
              );
            })}
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
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-success/10">
                <CalendarCheck className="h-4.5 w-4.5 text-success" strokeWidth={1.5} />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight">Base Salary</h2>
                <p className="text-sm text-muted-foreground">Earn rewards for consecutive daily check-ins</p>
              </div>
            </div>
            <button onClick={() => downloadImage(salaryRef, "salary")} className="h-8 w-8 rounded-lg bg-secondary flex items-center justify-center hover:bg-secondary/80 transition-colors">
              <Download className="h-4 w-4 text-muted-foreground" />
            </button>
          </div>

          <div ref={salaryRef} className="flex flex-col gap-2.5 p-1">
            {salaryTiers.map((tier, i) => (
              <motion.div
                key={tier.days}
                initial={{ opacity: 0, x: 12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.35 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className="flex items-center gap-3 rounded-xl bg-secondary/60 p-4 ring-1 ring-white/[0.04]"
              >
                <div className="flex-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Consecutive Check-ins
                  </span>
                  <p className="text-xl font-extrabold tabular-nums text-foreground">{tier.days} Days</p>
                </div>

                <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />

                <div className="flex-1 text-right">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Receive
                  </span>
                  <p className="text-xl font-extrabold tabular-nums text-foreground">
                    {tier.reward.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">USD</span>
                  </p>
                </div>
              </motion.div>
            ))}
          </div>

          <p className="mt-5 text-center text-[11px] text-muted-foreground/60">
            The final interpretation right belongs to Skyrise
          </p>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Event;
