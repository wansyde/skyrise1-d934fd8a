import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import { Diamond, ChevronRight, Crown, Award, Star, Gem, CalendarCheck } from "lucide-react";

const tiers = [
  {
    name: "Junior",
    icon: Star,
    salary: "0.4%",
    tasks: "40 / 3 sets",
    deposit: "USD 100–499",
    color: "from-[hsl(240,8%,95%)] to-[hsl(240,8%,90%)]",
    accent: "hsl(240, 10%, 45%)",
    textColor: "text-gray-800",
    subColor: "text-gray-500",
  },
  {
    name: "Professional",
    icon: Gem,
    salary: "0.6%",
    tasks: "45 / 3 sets",
    deposit: "USD 500–1,499",
    color: "from-[hsl(255,50%,95%)] to-[hsl(255,45%,88%)]",
    accent: "hsl(255, 60%, 58%)",
    textColor: "text-gray-800",
    subColor: "text-gray-500",
  },
  {
    name: "Expert",
    icon: Award,
    salary: "0.8%",
    tasks: "50 / 3 sets",
    deposit: "USD 1,500–4,999",
    color: "from-[hsl(38,70%,94%)] to-[hsl(38,60%,85%)]",
    accent: "hsl(38, 80%, 42%)",
    textColor: "text-gray-800",
    subColor: "text-gray-500",
  },
  {
    name: "Elite",
    icon: Crown,
    salary: "1.0%",
    tasks: "55 / 3 sets",
    deposit: "USD 5,000+",
    color: "from-[hsl(270,40%,94%)] to-[hsl(270,35%,87%)]",
    accent: "hsl(270, 55%, 50%)",
    textColor: "text-gray-800",
    subColor: "text-gray-500",
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

const Event = () => (
  <AppLayout>
    <div className="px-4 py-5 pb-24">
      {/* Membership Levels */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Diamond className="h-4 w-4 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight">Membership Levels</h1>
            <p className="text-xs text-muted-foreground">Unlock tiers by increasing your deposit</p>
          </div>
        </div>

        {/* Header row */}
        <div className="mb-2 grid grid-cols-4 gap-2 px-1 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          <span>VIP Level</span>
          <span className="text-center">Ads Salary</span>
          <span className="text-center">Tasks</span>
          <span className="text-right">Condition</span>
        </div>

        <div className="flex flex-col gap-2.5">
          {tiers.map((tier, i) => {
            const Icon = tier.icon;
            return (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
                className={`grid grid-cols-4 items-center gap-2 rounded-xl bg-gradient-to-r ${tier.color} p-3.5 ring-1 ring-white/[0.04]`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4 shrink-0" style={{ color: tier.accent }} strokeWidth={1.5} />
                  <span className={`text-xs font-semibold ${tier.textColor}`}>{tier.name}</span>
                </div>
                <span className={`text-center text-sm font-bold tabular-nums ${tier.textColor}`}>{tier.salary}</span>
                <span className={`text-center text-xs ${tier.subColor}`}>{tier.tasks}</span>
                <div className="text-right">
                  <span className={`text-[10px] ${tier.subColor} block leading-tight`}>Reset Deposit</span>
                  <span className={`text-xs font-semibold ${tier.textColor}`}>{tier.deposit}</span>
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
        <div className="mb-5 flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10">
            <CalendarCheck className="h-4 w-4 text-success" strokeWidth={1.5} />
          </div>
          <div>
            <h2 className="text-base font-semibold tracking-tight">Base Salary</h2>
            <p className="text-xs text-muted-foreground">Earn rewards for consecutive daily check-ins</p>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          {salaryTiers.map((tier, i) => (
            <motion.div
              key={tier.days}
              initial={{ opacity: 0, x: 12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.35 + i * 0.06, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
              className="flex items-center gap-3 rounded-xl bg-secondary/60 p-3.5 ring-1 ring-white/[0.04]"
            >
              <div className="flex-1">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Consecutive Check-ins
                </span>
                <p className="text-lg font-bold tabular-nums text-foreground">{tier.days} Days</p>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground/40 shrink-0" strokeWidth={1.5} />

              <div className="flex-1 text-right">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Receive
                </span>
                <p className="text-lg font-bold tabular-nums text-foreground">
                  {tier.reward.toLocaleString()} <span className="text-xs font-medium text-muted-foreground">USD</span>
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        <p className="mt-4 text-center text-[10px] text-muted-foreground/60">
          The final interpretation right belongs to Skyrise
        </p>
      </motion.div>
    </div>
  </AppLayout>
);

export default Event;
