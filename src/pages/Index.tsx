import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Wallet, ArrowRight, BarChart3, Lock, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import PublicLayout from "@/components/layout/PublicLayout";

const features = [
  {
    icon: Shield,
    title: "Institutional Security",
    description: "Bank-grade encryption and multi-layer security protocols protect every transaction.",
  },
  {
    icon: TrendingUp,
    title: "Optimized Returns",
    description: "AI-driven portfolio strategies designed for consistent, risk-adjusted performance.",
  },
  {
    icon: Wallet,
    title: "Multi-Asset Support",
    description: "Deposit and withdraw across crypto, bank transfers, and digital payment rails.",
  },
  {
    icon: BarChart3,
    title: "Real-Time Analytics",
    description: "Track your portfolio performance with institutional-grade charting and insights.",
  },
  {
    icon: Lock,
    title: "Regulatory Compliance",
    description: "Fully compliant with international financial regulations and KYC standards.",
  },
  {
    icon: Zap,
    title: "Instant Settlement",
    description: "Near-instant deposit confirmation and rapid withdrawal processing.",
  },
];

const stats = [
  { value: "$2.4B+", label: "Assets Managed" },
  { value: "150K+", label: "Active Investors" },
  { value: "99.9%", label: "Uptime" },
  { value: "45+", label: "Countries" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  }),
};

const Index = () => {
  return (
    <PublicLayout>
      {/* Hero */}
      <section className="relative overflow-hidden pt-32 pb-20 lg:pt-40 lg:pb-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_hsl(217,91%,60%,0.08),_transparent_60%)]" />
        <div className="container relative z-10 mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto max-w-3xl text-center"
          >
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              Platform Operational
            </div>
            <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">
              Institutional-grade
              <br />
              <span className="text-primary">wealth management.</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
              Access professionally managed investment strategies with real-time portfolio tracking, secure deposits, and transparent performance metrics.
            </p>
            <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="btn-press gap-2 px-8">
                <Link to="/register">
                  Start Investing <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="btn-press px-8">
                <Link to="/plans">View Plans</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-border py-16">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <motion.div
                key={stat.label}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="text-center"
              >
                <div className="text-3xl font-semibold tabular-nums">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight">Built for serious investors</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Every feature designed with security, transparency, and performance in mind.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-6"
              >
                <feature.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 text-base font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="vault-card p-12 text-center lg:p-16">
            <h2 className="text-3xl font-semibold tracking-tight">Ready to grow your wealth?</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join thousands of investors who trust our platform for institutional-grade returns.
            </p>
            <Button asChild size="lg" className="btn-press mt-8 gap-2 px-8">
              <Link to="/register">
                Create Account <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
};

export default Index;
