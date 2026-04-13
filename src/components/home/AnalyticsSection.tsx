import { motion } from "framer-motion";
import britishAirwaysLogo from "@/assets/brands/british-airways.webp";
import chanelLogo from "@/assets/brands/chanel.png";
import porscheLogo from "@/assets/brands/porsche.png";
import bentleyLogo from "@/assets/brands/bentley.png";
import astonMartinLogo from "@/assets/brands/aston-martin.webp";

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
  { name: "British Airways", src: britishAirwaysLogo, height: "h-10 sm:h-14" },
  { name: "Chanel", src: chanelLogo, height: "h-8 sm:h-12" },
  { name: "Porsche", src: porscheLogo, height: "h-10 sm:h-14" },
  { name: "Bentley", src: bentleyLogo, height: "h-8 sm:h-12" },
  { name: "Aston Martin", src: astonMartinLogo, height: "h-10 sm:h-14" },
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
            background: "linear-gradient(180deg, hsl(250 20% 97%) 0%, hsl(250 15% 94%) 100%)",
          }}
        >
          {/* World Map SVG */}
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.12]">
            <svg viewBox="0 0 1000 500" className="w-[95%] h-auto" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Simplified world map paths */}
              <g fill="hsl(255 40% 45%)" fillRule="evenodd">
                {/* North America */}
                <path d="M150 120 Q170 100 210 95 Q240 90 260 100 Q275 105 280 120 Q285 135 275 150 Q265 160 255 165 Q250 175 240 185 Q230 190 220 195 Q210 200 195 195 Q180 190 170 180 Q160 170 150 155 Q145 140 150 120Z" />
                <path d="M195 195 Q200 205 210 215 Q215 225 210 235 Q200 240 190 235 Q185 225 185 215 Q185 205 195 195Z" />
                {/* South America */}
                <path d="M240 260 Q250 250 265 255 Q275 260 280 275 Q285 295 280 315 Q275 335 265 350 Q255 365 245 370 Q235 375 230 365 Q225 350 220 335 Q215 315 220 295 Q225 275 240 260Z" />
                {/* Europe */}
                <path d="M440 100 Q455 90 475 95 Q490 100 500 110 Q505 120 500 130 Q495 140 485 145 Q475 150 465 148 Q455 145 448 138 Q440 130 438 120 Q436 110 440 100Z" />
                {/* Africa */}
                <path d="M460 180 Q475 170 490 175 Q505 180 515 195 Q520 210 520 230 Q518 250 510 270 Q500 290 490 305 Q480 315 470 310 Q460 305 455 290 Q448 270 445 250 Q442 230 445 210 Q448 190 460 180Z" />
                {/* Asia */}
                <path d="M520 80 Q550 70 580 75 Q610 80 640 90 Q670 100 700 95 Q730 90 750 100 Q770 110 780 125 Q785 140 775 155 Q760 165 740 160 Q720 155 700 160 Q680 165 660 158 Q640 150 620 155 Q600 160 580 155 Q560 148 545 140 Q530 130 520 120 Q515 105 520 80Z" />
                {/* Middle East */}
                <path d="M540 155 Q555 148 570 155 Q580 165 575 180 Q565 190 550 185 Q540 175 540 165 Q540 158 540 155Z" />
                {/* India */}
                <path d="M620 165 Q635 158 645 170 Q650 185 648 200 Q642 215 635 225 Q625 230 618 220 Q612 208 612 195 Q614 180 620 165Z" />
                {/* Southeast Asia */}
                <path d="M700 170 Q715 165 730 175 Q740 185 735 200 Q725 208 715 205 Q705 200 700 190 Q698 180 700 170Z" />
                {/* Australia */}
                <path d="M740 300 Q760 290 785 295 Q805 300 815 315 Q820 330 810 345 Q795 355 775 350 Q755 345 745 332 Q738 318 740 300Z" />
                {/* Japan */}
                <path d="M785 115 Q790 108 795 115 Q798 125 795 135 Q790 140 785 135 Q782 125 785 115Z" />
                {/* UK/Ireland */}
                <path d="M435 100 Q440 95 445 100 Q448 108 445 115 Q440 118 435 112 Q432 106 435 100Z" />
                {/* Greenland */}
                <path d="M310 55 Q330 48 345 55 Q355 65 350 78 Q340 85 325 82 Q310 78 308 68 Q306 60 310 55Z" />
              </g>
            </svg>
          </div>

          {/* Animated hotspot dots on the map */}
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
                  backgroundColor:
                    dot.type === "hot"
                      ? "hsl(var(--primary))"
                      : "hsl(var(--primary-glow))",
                  boxShadow: `0 0 ${dot.size * 2}px ${
                    dot.type === "hot"
                      ? "hsl(var(--primary) / 0.4)"
                      : "hsl(var(--primary-glow) / 0.3)"
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

    {/* Brand Logos Ticker */}
    <div className="mt-12 overflow-hidden pb-2">
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <div className="relative">
          <div className="flex ticker-scroll w-max">
            {[...brandLogos, ...brandLogos, ...brandLogos].map((brand, i) => (
              <span
                key={`${brand.name}-${i}`}
                className={`whitespace-nowrap text-foreground/20 cursor-default select-none mx-8 sm:mx-12 ${brand.style}`}
              >
                {brand.name}
              </span>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

export default AnalyticsSection;
