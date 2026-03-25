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
  { name: "BRITISH AIRWAYS", style: "font-serif font-bold text-[13px] sm:text-[15px] tracking-[0.08em]" },
  { name: "CHANEL", style: "font-serif font-bold text-[15px] sm:text-[18px] tracking-[0.25em]" },
  { name: "PORSCHE", style: "font-sans font-bold text-[13px] sm:text-[15px] tracking-[0.18em]" },
  { name: "BENTLEY", style: "font-serif font-bold text-[13px] sm:text-[15px] tracking-[0.2em]" },
  { name: "ASTON MARTIN", style: "font-sans font-medium text-[11px] sm:text-[13px] tracking-[0.3em]" },
];

const mapDots = [
  // Scotland
  { top: "12%", left: "38%", size: 5, type: "red" },
  { top: "15%", left: "42%", size: 7, type: "orange" },
  { top: "18%", left: "40%", size: 4, type: "red" },
  // Northern England
  { top: "25%", left: "45%", size: 6, type: "orange" },
  { top: "28%", left: "50%", size: 8, type: "red" },
  { top: "30%", left: "48%", size: 5, type: "orange" },
  { top: "32%", left: "52%", size: 10, type: "orange" },
  // Midlands
  { top: "38%", left: "48%", size: 7, type: "red" },
  { top: "40%", left: "52%", size: 12, type: "orange" },
  { top: "42%", left: "46%", size: 6, type: "red" },
  { top: "44%", left: "55%", size: 8, type: "orange" },
  // Wales
  { top: "45%", left: "38%", size: 5, type: "red" },
  { top: "48%", left: "36%", size: 7, type: "orange" },
  // London & Southeast
  { top: "52%", left: "55%", size: 18, type: "orange" },
  { top: "54%", left: "58%", size: 14, type: "red" },
  { top: "50%", left: "52%", size: 10, type: "orange" },
  { top: "56%", left: "50%", size: 8, type: "red" },
  { top: "53%", left: "60%", size: 6, type: "orange" },
  // Southwest
  { top: "58%", left: "38%", size: 6, type: "orange" },
  { top: "60%", left: "35%", size: 4, type: "red" },
  { top: "62%", left: "32%", size: 5, type: "orange" },
  // East
  { top: "46%", left: "58%", size: 7, type: "red" },
  { top: "48%", left: "62%", size: 9, type: "orange" },
];

const AnalyticsSection = () => (
  <section className="mt-10">
    {/* Purple banner with headline */}
    <div
      className="px-5 sm:px-8 pt-14 pb-56 sm:pb-64"
      style={{ background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--secondary)) 100%)" }}
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as const }}
        className="text-[2rem] sm:text-[2.8rem] lg:text-[3.5rem] font-black leading-[0.95] tracking-tight uppercase"
        style={{ color: "hsl(240 40% 20%)" }}
      >
        Skyrise is
        <br />
        changing
        <br />
        how
        <br />
        advertisers
        <br />
        use data.
      </motion.h2>
    </div>

    {/* Dashboard card overlapping into the purple section */}
    <div className="px-4 sm:px-6 -mt-44 sm:-mt-52 relative z-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, delay: 0.15 }}
        className="rounded-3xl overflow-hidden p-4 sm:p-6"
        style={{ background: "linear-gradient(135deg, hsl(225 30% 12%) 0%, hsl(230 35% 16%) 100%)" }}
      >
        {/* Map + overlaid data cards */}
        <div className="relative min-h-[340px] sm:min-h-[420px] rounded-2xl overflow-hidden"
          style={{ background: "linear-gradient(180deg, hsl(225 40% 28%) 0%, hsl(230 35% 22%) 100%)" }}
        >
          {/* Map dots */}
          <div className="absolute inset-0">
            {mapDots.map((dot, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 0.9 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + i * 0.03, duration: 0.35 }}
                className="absolute rounded-full"
                style={{
                  top: dot.top,
                  left: dot.left,
                  width: dot.size,
                  height: dot.size,
                  backgroundColor: dot.type === "orange" ? "hsl(30 90% 55%)" : "hsl(0 75% 55%)",
                  boxShadow: `0 0 ${dot.size * 1.5}px ${dot.type === "orange" ? "hsla(30,90%,55%,0.5)" : "hsla(0,75%,55%,0.4)"}`,
                }}
              />
            ))}
          </div>

          {/* Audience Size card - top left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="absolute top-4 left-4 bg-white rounded-xl p-3 sm:p-4 shadow-lg w-[130px] sm:w-[150px]"
          >
            <span className="text-[10px] font-medium text-gray-500 block">Audience Size</span>
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 block mt-1 tabular-nums">3.10m</span>
            <span className="text-[10px] text-gray-400">5.5% of population</span>
          </motion.div>

          {/* Top Brands card - top right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.5, duration: 0.5 }}
            className="absolute top-4 right-4 bg-white rounded-xl p-3 sm:p-4 shadow-lg w-[130px] sm:w-[150px]"
          >
            <span className="text-[10px] font-medium text-gray-500 block mb-2">Top brands</span>
            <div className="grid grid-cols-2 gap-2">
              {["Co-op", "Ocado", "Tesco", "M&S"].map((brand) => (
                <span key={brand} className="text-[11px] sm:text-xs font-bold text-gray-800 text-center">
                  {brand}
                </span>
              ))}
            </div>
          </motion.div>

          {/* Demographic card - mid left */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.55, duration: 0.5 }}
            className="absolute top-[120px] sm:top-[140px] left-4 bg-white rounded-xl p-3 sm:p-4 shadow-lg w-[130px] sm:w-[150px]"
          >
            <span className="text-[10px] font-medium text-gray-500 block mb-2">Demographic</span>
            {/* Gender donut */}
            <div className="flex items-center gap-2 mb-1">
              <div className="relative w-10 h-10">
                <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                  <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(320 30% 88%)" strokeWidth="6" />
                  <circle cx="18" cy="18" r="14" fill="none" stroke="hsl(320 40% 40%)" strokeWidth="6"
                    strokeDasharray={`${54 * 0.8796} ${54 * 0.1204}`} />
                </svg>
              </div>
              <div className="flex gap-1 text-gray-500">
                <span className="text-sm">♂</span>
                <span className="text-sm">♀</span>
              </div>
            </div>
            <span className="text-xl font-bold text-[hsl(320,40%,40%)] tabular-nums">54%</span>
          </motion.div>

          {/* Media Affinity card - mid/bottom right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="absolute top-[120px] sm:top-[140px] right-4 bg-white rounded-xl p-3 sm:p-4 shadow-lg w-[140px] sm:w-[160px]"
          >
            <span className="text-[10px] font-medium text-gray-500 block mb-2">Media Affinity</span>
            <div className="space-y-1.5">
              {mediaAffinity.map((m) => (
                <div key={m.label} className="flex items-center gap-1.5">
                  <div className="flex-1 h-[14px] rounded-full overflow-hidden bg-gray-100">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${m.pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className="h-full rounded-full"
                      style={{ background: "hsl(10 70% 60%)" }}
                    />
                  </div>
                  <span className="text-[8px] sm:text-[9px] font-medium text-gray-600 w-[52px] text-right whitespace-nowrap">
                    {m.label}
                  </span>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-[8px] text-gray-400">
              {["0%", "1%", "2%", "3%", "4%"].map((v) => (
                <span key={v}>{v}</span>
              ))}
            </div>
          </motion.div>

          {/* Bottom demographic bar card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.65, duration: 0.5 }}
            className="absolute bottom-4 left-4 bg-white rounded-xl p-3 shadow-lg w-[130px] sm:w-[150px]"
          >
            <span className="text-[10px] font-medium text-gray-500 block mb-2">Demographic</span>
            <div className="flex items-end gap-1 h-8">
              {[
                { h: "50%", c: "hsl(250 40% 55%)" },
                { h: "50%", c: "hsl(250 40% 55%)" },
                { h: "50%", c: "hsl(250 40% 55%)" },
                { h: "85%", c: "hsl(38 80% 50%)" },
                { h: "40%", c: "hsl(250 40% 55%)" },
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
      className="mt-10 px-5 sm:px-8 pb-2"
    >
      <div className="flex items-center justify-between gap-6 overflow-x-auto pb-2">
        {brandLogos.map((brand) => (
          <span
            key={brand.name}
            className={`whitespace-nowrap text-foreground/30 hover:text-foreground/50 transition-colors duration-300 cursor-default select-none ${brand.style}`}
          >
            {brand.name}
          </span>
        ))}
      </div>
    </motion.div>
  </section>
);

export default AnalyticsSection;
