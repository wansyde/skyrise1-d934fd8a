import { forwardRef } from "react";
import {
  Award,
  CalendarCheck,
  CheckCircle,
  ChevronRight,
  Crown,
  Diamond,
  Gem,
  Star,
} from "lucide-react";

const tiers = [
  {
    name: "Junior",
    icon: Star,
    salary: "0.4%",
    tasks: "40 / 3 sets daily",
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
    tasks: "40 / 3 sets daily",
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
    tasks: "40 / 3 sets daily",
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
    tasks: "40 / 3 sets daily",
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

export const MembershipLevelsTemplate = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="w-[380px] rounded-[30px] border border-border/50 bg-background p-5 text-foreground shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.18)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Diamond className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Skyrise
            </p>
            <h3 className="font-[Montserrat] text-lg font-bold tracking-tight text-foreground">
              Membership Levels
            </h3>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          VIP
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {tiers.map((tier) => {
          const Icon = tier.icon;
          return (
            <div
              key={tier.name}
              className={`rounded-2xl bg-gradient-to-r ${tier.color} p-4 ring-1 ring-white/[0.04]`}
            >
              <div className="mb-2.5 flex items-center gap-2.5">
                <Icon className="h-5 w-5 shrink-0" style={{ color: tier.accent }} strokeWidth={1.5} />
                <span className={`text-base font-bold ${tier.textColor}`}>{tier.name}</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Salary
                  </span>
                  <span className={`text-sm font-extrabold tabular-nums ${tier.textColor}`}>
                    {tier.salary}
                  </span>
                </div>
                <div>
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Tasks
                  </span>
                  <span className={`text-[11px] font-bold leading-tight ${tier.textColor}`}>
                    {tier.tasks}
                  </span>
                </div>
                <div className="text-right">
                  <span className="block text-[9px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    Deposit
                  </span>
                  <span className={`text-[11px] font-bold leading-tight ${tier.textColor}`}>
                    {tier.deposit}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="mt-4 text-center text-[10px] text-muted-foreground/70">Share this with friends</p>
    </div>
  );
});

MembershipLevelsTemplate.displayName = "MembershipLevelsTemplate";

export const BaseSalaryTemplate = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="w-[380px] rounded-[30px] border border-border/50 bg-background p-5 text-foreground shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.18)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <CalendarCheck className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Skyrise
            </p>
            <h3 className="font-[Montserrat] text-lg font-bold tracking-tight text-foreground">
              Base Salary
            </h3>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Rewards
        </span>
      </div>

      <div className="flex flex-col gap-2.5">
        {salaryTiers.map((tier) => (
          <div
            key={tier.days}
            className="flex items-center gap-3 rounded-2xl bg-secondary/60 p-4 ring-1 ring-white/[0.04]"
          >
            <div className="min-w-0 flex-1">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Consecutive Check-ins
              </span>
              <p className="font-[Montserrat] text-xl font-extrabold tabular-nums text-foreground">
                {tier.days} Days
              </p>
            </div>

            <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground/40" strokeWidth={1.5} />

            <div className="min-w-0 flex-1 text-right">
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Receive
              </span>
              <p className="font-[Montserrat] text-xl font-extrabold tabular-nums text-foreground">
                {tier.reward.toLocaleString()} <span className="text-sm font-semibold text-muted-foreground">USDC</span>
              </p>
            </div>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] text-muted-foreground/70">
        The final interpretation right belongs to Skyrise.
      </p>
    </div>
  );
});

BaseSalaryTemplate.displayName = "BaseSalaryTemplate";

export const SalaryRulesTemplate = forwardRef<HTMLDivElement>((_, ref) => {
  return (
    <div
      ref={ref}
      className="w-[380px] rounded-[30px] border border-border/50 bg-background p-5 text-foreground shadow-[0_24px_60px_-30px_hsl(var(--foreground)/0.18)]"
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10">
            <Diamond className="h-5 w-5 text-primary" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Skyrise
            </p>
            <h3 className="font-[Montserrat] text-lg font-bold tracking-tight text-foreground">
              Base Salary
            </h3>
          </div>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Guide
        </span>
      </div>

      <div className="mb-3 text-center">
        <p className="font-[Montserrat] text-base font-bold text-foreground">Base Salary</p>
      </div>

      <div className="flex flex-col gap-2.5">
        {salaryRules.map((rule, index) => (
          <div
            key={index}
            className="flex items-start gap-3 rounded-2xl bg-secondary/60 p-4 ring-1 ring-white/[0.04]"
          >
            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" strokeWidth={1.5} />
            <p className="text-sm font-medium leading-relaxed text-foreground">{rule}</p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-center text-[10px] text-muted-foreground/70">
        The final interpretation right belongs to Skyrise.
      </p>
    </div>
  );
});

SalaryRulesTemplate.displayName = "SalaryRulesTemplate";
