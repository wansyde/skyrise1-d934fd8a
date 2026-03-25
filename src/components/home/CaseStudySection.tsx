import { motion } from "framer-motion";
import { TrendingUp, Eye, Users, Zap } from "lucide-react";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const stats = [
  { value: "40.7%", label: "Video VTR vs 30% benchmark", icon: Eye },
  { value: "+19%", label: "Attention score above benchmark", icon: Zap },
  { value: "2.5M", label: "Audience reach", icon: Users },
  { value: "3X", label: "Conversion uplift", icon: TrendingUp },
];

const CaseStudySection = () => (
  <section className="px-4 sm:px-6 mt-12">
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="flex items-center gap-3 mb-6"
    >
      <div className="h-px flex-1 max-w-[32px] bg-primary/40" />
      <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
        Case Study
      </span>
    </motion.div>

    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: "var(--gradient-card)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="p-6 sm:p-8 space-y-4">
        <motion.p custom={0} variants={fadeUp} className="text-sm text-muted-foreground leading-relaxed">
          A luxury car manufacturer wanted to drive leads for its new model with a 10-week Display campaign.
        </motion.p>
        <motion.p custom={1} variants={fadeUp} className="text-sm text-muted-foreground leading-relaxed">
          Skyrise built a bespoke audience profile consisting of high-net-worth individuals overlapping car enthusiasts and those in-market for a new car — resulting in an audience of over{" "}
          <span className="text-foreground font-semibold tabular-nums">2.5m</span>.
        </motion.p>
        <motion.p custom={2} variants={fadeUp} className="text-sm text-muted-foreground leading-relaxed">
          Locations and preferred publishers for this HNW audience targeted, supported by strong creative across{" "}
          <span className="text-foreground font-semibold tabular-nums">3.3m</span> impressions resulted in{" "}
          <span className="text-foreground font-semibold">25 leads</span> —{" "}
          <span className="text-primary font-bold">3x improvement</span> in conversions.
        </motion.p>
      </div>

      {/* Stats grid */}
      <motion.div
        custom={3}
        variants={fadeUp}
        className="grid grid-cols-2 border-t border-border"
      >
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className={`flex flex-col items-center py-6 px-4 ${
                i % 2 === 0 ? "border-r border-border" : ""
              } ${i < 2 ? "border-b border-border" : ""}`}
            >
              <Icon className="w-4 h-4 text-primary/60 mb-2" />
              <span className="text-xl sm:text-2xl font-bold text-foreground tabular-nums">
                {stat.value}
              </span>
              <span className="text-[10px] text-muted-foreground mt-1 text-center leading-tight max-w-[120px]">
                {stat.label}
              </span>
            </div>
          );
        })}
      </motion.div>
    </motion.div>
  </section>
);

export default CaseStudySection;
