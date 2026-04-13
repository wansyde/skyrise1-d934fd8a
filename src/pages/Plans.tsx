import { motion } from "framer-motion";
import { Check, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/layout/PublicLayout";

const plans = [
  {
    name: "Starter",
    rate: "8%",
    period: "Monthly",
     min: "500 AC",
     max: "9,999 AC",
    duration: "30 Days",
    features: ["Daily accrual", "Standard support", "Basic analytics", "Manual withdrawals"],
  },
  {
    name: "Alpha Growth",
    rate: "12%",
    period: "Monthly",
     min: "10,000 AC",
     max: "49,999 AC",
    duration: "60 Days",
    features: ["Hourly accrual", "Priority support", "Advanced analytics", "Express withdrawals", "Portfolio advisor"],
    featured: true,
  },
  {
    name: "Institutional",
    rate: "18%",
    period: "Monthly",
     min: "50,000 AC",
     max: "Unlimited",
    duration: "90 Days",
    features: ["Real-time accrual", "Dedicated manager", "Full analytics suite", "Instant withdrawals", "Custom strategies", "API access"],
  },
];

const Plans = () => (
  <PublicLayout>
    <section className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-4xl font-semibold tracking-tight">Investment Plans</h1>
          <p className="mt-4 text-muted-foreground">
            Choose the strategy that matches your investment goals and risk profile.
          </p>
        </motion.div>

        <div className="mt-16 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className={`glass-card flex flex-col p-8 ${plan.featured ? "ring-1 ring-primary/30" : ""}`}
            >
              {plan.featured && (
                <span className="mb-4 inline-flex self-start rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Most Popular
                </span>
              )}
              <h3 className="text-lg font-semibold">{plan.name}</h3>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tabular-nums">{plan.rate}</span>
                <span className="text-sm text-muted-foreground">/ {plan.period.toLowerCase()}</span>
              </div>
              <div className="mt-4 flex flex-col gap-1 text-sm text-muted-foreground">
                <span>Min: {plan.min} · Max: {plan.max}</span>
                <span>Lock period: {plan.duration}</span>
              </div>
              <ul className="mt-6 flex flex-1 flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm">
                    <Check className="h-3.5 w-3.5 text-success" strokeWidth={2} />
                    {f}
                  </li>
                ))}
              </ul>
              <Button asChild className="btn-press mt-8 gap-2" variant={plan.featured ? "default" : "outline"}>
                <Link to="/register">
                  Commit Funds <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default Plans;
