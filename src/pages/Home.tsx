import AppLayout from "@/components/layout/AppLayout";
import { motion } from "framer-motion";
import {
  Globe2, Users, BarChart3
} from "lucide-react";
import heroDashboard from "@/assets/hero-dashboard.jpg";
import analysisCar from "@/assets/analysis-car.jpg";
import carOwners from "@/assets/car-owners.jpg";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const brandLogos = ["British Airways", "Chanel", "Porsche", "Bentley", "Aston Martin"];

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

const Home = () => {
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

        {/* SECTION 4 — IN-DEPTH ANALYSIS & CONNECTING CAR OWNERS */}
        <div className="px-4 mt-10 mb-8 space-y-12">
          {/* In-depth Analysis */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <motion.div
                whileInView={{ scale: 1.03 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-[220px] sm:h-[280px] overflow-hidden"
              >
                <img
                  src={analysisCar}
                  alt="Luxury car interior analysis"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
            <div className="mt-6">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-2xl sm:text-3xl font-bold tracking-tight"
              >
                In-depth analysis
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-3 max-w-xl"
              >
                Our platform leverages advanced data analytics to provide
                deep insights into consumer behavior across the luxury
                automotive sector. Every campaign is meticulously tracked
                and optimized in real time, ensuring maximum return on
                investment for our brand partners.
              </motion.p>
            </div>
          </motion.div>

          {/* Connecting Real Car Owners */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="overflow-hidden rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
              <motion.div
                whileInView={{ scale: 1.03 }}
                viewport={{ once: true }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-[220px] sm:h-[280px] overflow-hidden"
              >
                <img
                  src={carOwners}
                  alt="Connecting real car owners"
                  className="w-full h-full object-cover"
                />
              </motion.div>
            </div>
            <div className="mt-6">
              <motion.h2
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.15, duration: 0.5 }}
                className="text-2xl sm:text-3xl font-bold tracking-tight"
              >
                Connecting real car owners
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.25, duration: 0.5 }}
                className="text-sm sm:text-base text-muted-foreground leading-relaxed mt-3 max-w-xl"
              >
                Skyrise bridges the gap between premium automotive brands
                and genuine car enthusiasts. Through our verified promoter
                network, campaigns reach audiences who are truly passionate
                about luxury vehicles — driving authentic engagement and
                meaningful brand connections.
              </motion.p>
            </div>
          </motion.div>
        </div>
      </div>
    </AppLayout>
  );
};

export default Home;
