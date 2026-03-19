import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import {
  Wallet, TrendingUp, CheckCircle2, ListChecks, Clock,
  BarChart3, Globe2, Users
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import heroDashboard from "@/assets/hero-dashboard.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const brandLogos = ["British Airways", "Chanel", "Porsche", "Bentley", "Aston Martin"];

const Home = () => {
  const { profile } = useAuth();

  const { data: investments } = useQuery({
    queryKey: ["user-investments"],
    queryFn: async () => {
      const { data } = await supabase
        .from("user_investments")
        .select("*, investment_plans(*)")
        .eq("status", "active");
      return data || [];
    },
  });

  const { data: recentTxns } = useQuery({
    queryKey: ["recent-transactions"],
    queryFn: async () => {
      const { data } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(5);
      return data || [];
    },
  });

  const balance = profile?.balance ?? 0;
  const totalInvested = investments?.reduce((sum, inv) => sum + Number(inv.amount), 0) ?? 0;
  const accruedReturns = investments?.reduce((s, i) => s + Number(i.accrued_return), 0) ?? 0;

  const summaryStats = [
    { label: "Total Balance", value: `$${balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: Wallet, accent: "text-primary" },
    { label: "Accrued Returns", value: `$${accruedReturns.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: TrendingUp, accent: "text-success" },
    { label: "Invested", value: `$${totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2 })}`, icon: CheckCircle2, accent: "text-primary" },
    { label: "Transactions", value: `${recentTxns?.length ?? 0}`, icon: ListChecks, accent: "text-muted-foreground" },
  ];

  const caseStudyCards = [
    {
      title: "Campaign Overview",
      content: "A luxury automotive manufacturer partnered with Skyrise to amplify their new model launch across global markets.",
      highlight: "2.5M",
      highlightLabel: "Users Reached",
    },
    {
      title: "Target Audience",
      content: "High-net-worth individuals aged 30–55 with affinity for luxury lifestyle, premium travel, and automotive culture.",
      highlight: "3.3M",
      highlightLabel: "Impressions",
    },
    {
      title: "Results",
      content: "The campaign achieved unprecedented engagement rates, surpassing industry benchmarks by a significant margin.",
      highlight: "40.7%",
      highlightLabel: "Engagement Rate",
    },
    {
      title: "Performance Metrics",
      content: "Conversion rates tripled compared to traditional advertising methods, validating the promoter-driven model.",
      highlight: "3X",
      highlightLabel: "Conversion Uplift",
    },
  ];

  const demographics = [
    { label: "25–34", pct: 38 },
    { label: "35–44", pct: 29 },
    { label: "45–54", pct: 18 },
    { label: "55+", pct: 15 },
  ];

  const mediaAffinity = [
    { label: "Social Media", pct: 72 },
    { label: "Video Platforms", pct: 61 },
    { label: "Lifestyle Blogs", pct: 48 },
    { label: "News & Finance", pct: 35 },
  ];

  return (
    <AppLayout>
      <div className="px-0">
        {/* SECTION 1 — HERO BANNER */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="relative w-full h-[280px] sm:h-[340px] overflow-hidden"
        >
          <img
            src={heroDashboard}
            alt="Luxury automotive campaign"
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/70 to-background/30" />
          <div className="absolute inset-0 flex flex-col justify-end p-5 sm:p-8">
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="text-xs font-medium tracking-[0.2em] uppercase text-primary mb-2"
            >
              Luxury Car Manufacturer Brand
            </motion.span>
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.6 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1]"
            >
              3X CONVERSION
              <br />
              <span className="text-primary">UPLIFT</span>
            </motion.h1>
          </div>
        </motion.section>

        {/* SUMMARY BAR */}
        <div className="px-4 -mt-4 relative z-10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {summaryStats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                animate="visible"
                variants={fadeUp}
                className="glass-card p-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] text-muted-foreground">{stat.label}</span>
                  <stat.icon className={`h-4 w-4 ${stat.accent}`} strokeWidth={1.5} />
                </div>
                <span className="text-xl font-semibold tabular-nums">{stat.value}</span>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 2 — CASE STUDY */}
        <div className="px-4 mt-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg font-semibold mb-4"
          >
            Campaign Case Study
          </motion.h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {caseStudyCards.map((card, i) => (
              <motion.div
                key={card.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-5"
              >
                <span className="text-xs text-muted-foreground uppercase tracking-wider">{card.title}</span>
                <div className="mt-3 mb-2">
                  <span className="text-3xl font-bold text-primary tabular-nums">{card.highlight}</span>
                  <span className="text-xs text-muted-foreground ml-2">{card.highlightLabel}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{card.content}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 3 — ANALYTICS */}
        <div className="px-4 mt-8">
          <motion.h2
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-lg font-semibold mb-4"
          >
            Analytics & Data
          </motion.h2>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="glass-card p-5 sm:p-6"
          >
            {/* Audience Size */}
            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
              </div>
              <div>
                <span className="text-xs text-muted-foreground">Global Audience Size</span>
                <div className="text-2xl font-bold tabular-nums">2,540,000</div>
              </div>
            </div>

            {/* Map placeholder */}
            <div className="relative h-40 sm:h-52 rounded-xl overflow-hidden mb-6 bg-secondary/50">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative">
                  {[
                    { top: "20%", left: "25%", size: "h-3 w-3" },
                    { top: "35%", left: "48%", size: "h-4 w-4" },
                    { top: "30%", left: "52%", size: "h-2.5 w-2.5" },
                    { top: "45%", left: "75%", size: "h-3.5 w-3.5" },
                    { top: "55%", left: "30%", size: "h-2 w-2" },
                    { top: "40%", left: "15%", size: "h-3 w-3" },
                  ].map((dot, i) => (
                    <motion.div
                      key={i}
                      initial={{ scale: 0, opacity: 0 }}
                      whileInView={{ scale: 1, opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.3 + i * 0.1, duration: 0.4 }}
                      className={`absolute ${dot.size} rounded-full bg-primary shadow-[0_0_12px_hsl(var(--primary)/0.5)]`}
                      style={{ top: dot.top, left: dot.left }}
                    />
                  ))}
                  <div className="text-xs text-muted-foreground text-center mt-28">Global Reach Map</div>
                </div>
              </div>
            </div>

            {/* Demographics */}
            <div className="grid sm:grid-cols-2 gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Users className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Demographics</span>
                </div>
                <div className="space-y-3">
                  {demographics.map((d) => (
                    <div key={d.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{d.label}</span>
                        <span className="tabular-nums">{d.pct}%</span>
                      </div>
                      <div className="progress-track">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${d.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="progress-fill"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BarChart3 className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
                  <span className="text-sm font-medium">Media Affinity</span>
                </div>
                <div className="space-y-3">
                  {mediaAffinity.map((m) => (
                    <div key={m.label}>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-muted-foreground">{m.label}</span>
                        <span className="tabular-nums">{m.pct}%</span>
                      </div>
                      <div className="progress-track">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${m.pct}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.8, ease: "easeOut" }}
                          className="progress-fill"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Brand Logos */}
            <div className="mt-6 pt-5 border-t border-border">
              <span className="text-xs text-muted-foreground mb-3 block">Featured Brands</span>
              <div className="flex items-center gap-6 overflow-x-auto pb-1">
                {brandLogos.map((name) => (
                  <span
                    key={name}
                    className="text-xs font-medium text-muted-foreground/60 whitespace-nowrap uppercase tracking-widest hover:text-muted-foreground transition-all duration-300 cursor-default"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        </div>


        {/* RECENT ACTIVITY */}
        <div className="px-4 mt-8 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Recent Activity</h2>
            <Clock className="h-4 w-4 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div className="flex flex-col gap-2">
            {(recentTxns || []).map((tx, i) => (
              <motion.div
                key={tx.id}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card flex items-center justify-between p-4"
              >
                <div>
                  <span className="text-sm font-medium capitalize">{tx.type}</span>
                  <span className="text-xs text-muted-foreground block mt-0.5">
                    {new Date(tx.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-medium tabular-nums ${Number(tx.amount) >= 0 ? "text-success" : "text-foreground"}`}>
                    {Number(tx.amount) >= 0 ? "+" : ""}${Math.abs(Number(tx.amount)).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                  <span className={`text-[10px] block mt-0.5 capitalize ${tx.status === "pending" ? "text-warning" : tx.status === "approved" ? "text-success" : "text-muted-foreground"}`}>
                    {tx.status}
                  </span>
                </div>
              </motion.div>
            ))}
            {(!recentTxns || recentTxns.length === 0) && (
              <div className="glass-card p-8 text-center text-sm text-muted-foreground">
                No activity yet. Complete your first task to start earning.
              </div>
            )}
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
