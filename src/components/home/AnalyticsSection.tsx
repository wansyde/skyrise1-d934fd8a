import { motion } from "framer-motion";

const mediaAffinity = [
  { label: "SVOD", pct: 82 },
  { label: "Radio", pct: 72 },
  { label: "SVOD", pct: 68 },
  { label: "Gaming", pct: 58 },
  { label: "BVOD", pct: 52 },
  { label: "Messaging", pct: 45 },
  { label: "Audio", pct: 40 },
  { label: "Social", pct: 36 },
];

const brandLogos = [
  { name: "BRITISH AIRWAYS", style: "font-serif font-bold text-[12px] sm:text-[14px] tracking-[0.08em]" },
  { name: "CHANEL", style: "font-serif font-bold text-[14px] sm:text-[17px] tracking-[0.25em]" },
  { name: "PORSCHE", style: "font-sans font-bold text-[12px] sm:text-[14px] tracking-[0.18em]" },
  { name: "BENTLEY", style: "font-serif font-bold text-[12px] sm:text-[14px] tracking-[0.2em]" },
  { name: "ASTON MARTIN", style: "font-sans font-medium text-[10px] sm:text-[12px] tracking-[0.3em]" },
];

const mapDots = [
  { top: "12%", left: "38%", size: 5, type: "warm" },
  { top: "15%", left: "42%", size: 7, type: "hot" },
  { top: "18%", left: "40%", size: 4, type: "warm" },
  { top: "25%", left: "45%", size: 6, type: "hot" },
  { top: "28%", left: "50%", size: 8, type: "warm" },
  { top: "30%", left: "48%", size: 5, type: "hot" },
  { top: "32%", left: "52%", size: 10, type: "hot" },
  { top: "38%", left: "48%", size: 7, type: "warm" },
  { top: "40%", left: "52%", size: 12, type: "hot" },
  { top: "42%", left: "46%", size: 6, type: "warm" },
  { top: "44%", left: "55%", size: 8, type: "hot" },
  { top: "45%", left: "38%", size: 5, type: "warm" },
  { top: "48%", left: "36%", size: 7, type: "hot" },
  { top: "52%", left: "55%", size: 18, type: "hot" },
  { top: "54%", left: "58%", size: 14, type: "warm" },
  { top: "50%", left: "52%", size: 10, type: "hot" },
  { top: "56%", left: "50%", size: 8, type: "warm" },
  { top: "53%", left: "60%", size: 6, type: "hot" },
  { top: "58%", left: "38%", size: 6, type: "hot" },
  { top: "60%", left: "35%", size: 4, type: "warm" },
  { top: "62%", left: "32%", size: 5, type: "hot" },
  { top: "46%", left: "58%", size: 7, type: "warm" },
  { top: "48%", left: "62%", size: 9, type: "hot" },
];

const AnalyticsSection = () => (
  <section className="mt-14">
    {/* Banner */}
    <div
      className="px-5 sm:px-8 pt-16 pb-56 sm:pb-64"
      style={{
        background: "linear-gradient(180deg, hsl(var(--secondary)) 0%, hsl(var(--card)) 100%)",
      }}
    >
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="h-px flex-1 max-w-[32px] bg-primary/40" />
        <span className="text-[10px] font-semibold tracking-[0.3em] uppercase text-muted-foreground">
          Platform
        </span>
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-[1.75rem] sm:text-[2.5rem] lg:text-[3rem] font-bold leading-[1] tracking-tight text-foreground/80"
      >
        Skyrise is
        <br />
        changing
        <br />
        how
        <br />
        advertisers
        <br />
        <span className="text-foreground">use data.</span>
      </motion.h2>
    </div>

    {/* Dashboard card */}
    <div className="px-4 sm:px-6 -mt-44 sm:-mt-52 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="rounded-2xl overflow-hidden p-4 sm:p-6"
        style={{
          background: "var(--gradient-card)",
          boxShadow: "var(--shadow-card)",
        }}
      >
        {/* Map area */}
        <div
          className="relative min-h-[340px] sm:min-h-[420px] rounded-xl overflow-hidden"
          style={{
            background: "linear-gradient(180deg, hsl(var(--secondary)) 0%, hsl(var(--card)) 100%)",
          }}
        >
          {/* Map dots */}
          <div className="absolute inset-0">
            {mapDots.map((dot, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.85 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.03, duration: 0.35 }}
                className="absolute rounded-full"
                style={{
                  top: dot.top,
                  left: dot.left,
                  width: dot.size,
                  height: dot.size,
                  backgroundColor:
                    dot.type === "hot"
                      ? "hsl(var(--warning))"
                      : "hsl(var(--destructive))",
                  boxShadow: `0 0 ${dot.size * 1.5}px ${
                    dot.type === "hot"
                      ? "hsl(var(--warning) / 0.5)"
                      : "hsl(var(--destructive) / 0.4)"
                  }`,
                }}
              />
            ))}
          </div>

          {/* Audience Size */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute top-4 left-4 rounded-xl p-3 sm:p-4 w-[130px] sm:w-[150px]"
            style={{
              background: "hsl(0 0% 100% / 0.97)",
              boxShadow: "0 4px 20px hsl(0 0% 0% / 0.12)",
            }}
          >
            <span className="text-[10px] font-medium block" style={{ color: "hsl(220 10% 45%)" }}>
              Audience Size
            </span>
            <span className="text-2xl sm:text-3xl font-bold block mt-1 tabular-nums" style={{ color: "hsl(220 15% 15%)" }}>
              3.10m
            </span>
            <span className="text-[10px]" style={{ color: "hsl(220 10% 60%)" }}>
              5.5% of population
            </span>
          </motion.div>

          {/* Top Brands */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute top-4 right-4 rounded-xl p-3 sm:p-4 w-[130px] sm:w-[150px]"
            style={{
              background: "hsl(0 0% 100% / 0.97)",
              boxShadow: "0 4px 20px hsl(0 0% 0% / 0.12)",
            }}
          >
            <span className="text-[10px] font-medium block mb-2" style={{ color: "hsl(220 10% 45%)" }}>
              Top brands
            </span>
            <div className="grid grid-cols-2 gap-2">
              {["Co-op", "Ocado", "Tesco", "M&S"].map((brand) => (
                <span key={brand} className="text-[11px] sm:text-xs font-bold text-center" style={{ color: "hsl(220 15% 20%)" }}>
                  {brand}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Demographic donut */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="absolute top-[120px] sm:top-[140px] left-4 rounded-xl p-3 sm:p-4 w-[130px] sm:w-[150px]"
            style={{
              background: "hsl(0 0% 100% / 0.97)",
              boxShadow: "0 4px 20px hsl(0 0% 0% / 0.12)",
            }}
          >
            <span className="text-[10px] font-medium block mb-2" style={{ color: "hsl(220 10% 45%)" }}>
              Demographic
            </span>
            <div className="flex items-center gap-2 mb-1">
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(320 30% 88%)" strokeWidth="6" />
                  <circle
                    cx="18" cy="18" r="14" fill="none"
                    stroke="hsl(320 40% 40%)" strokeWidth="6"
                    strokeDasharray={`${54 * 0.88} ${54 * 0.12}`}
                  />
                </svg>
              </div>
              <div className="flex gap-1" style={{ color: "hsl(220 10% 55%)" }}>
                <span className="text-sm">♂</span>
                <span className="text-sm">♀</span>
              </div>
            </div>
            <span className="text-xl font-bold tabular-nums" style={{ color: "hsl(320 40% 40%)" }}>
              54%
            </span>
          </motion.div>

          {/* Media Affinity */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute top-[120px] sm:top-[140px] right-4 rounded-xl p-3 sm:p-4 w-[140px] sm:w-[160px]"
            style={{
              background: "hsl(0 0% 100% / 0.97)",
              boxShadow: "0 4px 20px hsl(0 0% 0% / 0.12)",
            }}
          >
            <span className="text-[10px] font-medium block mb-2" style={{ color: "hsl(220 10% 45%)" }}>
              Media Affinity
            </span>
            <div className="space-y-1.5">
              {mediaAffinity.map((m) => (
                <div key={m.label} className="flex items-center gap-1.5">
                  <div className="flex-1 h-[14px] rounded-full overflow-hidden" style={{ background: "hsl(220 10% 93%)" }}>
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: "hsl(var(--warning))" }}
                    />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-medium w-[52px] text-right whitespace-nowrap" style={{ color: "hsl(220 10% 40%)" }}>
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Demographic bars */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="absolute bottom-4 left-4 rounded-xl p-3 w-[130px] sm:w-[150px]"
            style={{
              background: "hsl(0 0% 100% / 0.97)",
              boxShadow: "0 4px 20px hsl(0 0% 0% / 0.12)",
            }}
          >
            <span className="text-[10px] font-medium block mb-2" style={{ color: "hsl(220 10% 45%)" }}>
              Demographic
            </span>
            <div className="flex items-end gap-1 h-8">
              {[
                { h: "50%", c: "hsl(var(--primary))" },
                { h: "50%", c: "hsl(var(--primary))" },
                { h: "50%", c: "hsl(var(--primary))" },
                { h: "85%", c: "hsl(var(--warning))" },
                { h: "40%", c: "hsl(var(--primary))" },
              ].map((bar, i) => (
                <motion.div
                  key={i}
                  initial={{ height: 0 }}
                  whileInView={{ height: bar.h }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.7 + i * 0.05, duration: 0.5 }}
                  className="flex-1 rounded-sm"
                  style={{ backgroundColor: bar.c }}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </motion.div>
    </div>

    {/* Brand Logos */}
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      transition={{ delay: 0.3, duration: 0.6 }}
      className="mt-12 px-5 sm:px-8 pb-2"
    >
      <div className="flex items-center justify-between gap-6 overflow-x-auto pb-2">
        {brandLogos.map((brand) => (
          <span
            key={brand.name}
            className={`whitespace-nowrap text-foreground/20 hover:text-foreground/40 transition-colors duration-300 cursor-default select-none ${brand.style}`}
          >
            {brand.name}
          </span>
        ))}
      </div>
    </motion.div>
  </section>
);

export default AnalyticsSection;
