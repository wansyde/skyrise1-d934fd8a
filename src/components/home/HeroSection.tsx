import { motion } from "framer-motion";
import heroHome from "@/assets/hero-home.jpg";

const HeroSection = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
  >
    {/* Image section */}
    <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[520px] overflow-hidden">
      <motion.img
        initial={{ scale: 1.06 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
        src={heroHome}
        alt="Luxury automotive campaign"
        className="absolute inset-0 w-full h-full object-cover"
        width={1920}
        height={1080}
      />

      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.15) 50%, hsl(var(--background)) 100%)",
        }}
      />

      {/* Label on image */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-10 pb-6">
        <motion.span
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground"
        >
          Luxury Car Manufacturer Brand
        </motion.span>
      </div>
    </div>

    {/* Text below image */}
    <div className="px-6 sm:px-10 pt-6 pb-2">
      <motion.h1
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.55, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[0.92]"
      >
        3X CONVERSION
        <br />
        <span className="text-primary">UPLIFT</span>
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.6 }}
        className="text-sm text-muted-foreground mt-4 max-w-md leading-relaxed"
      >
        Data-driven audience intelligence for premium automotive brands.
      </motion.p>
    </div>
  </motion.div>
);

export default HeroSection;
