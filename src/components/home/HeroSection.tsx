import { motion } from "framer-motion";
import heroHome from "@/assets/hero-home.jpg";

const HeroSection = () => (
  <motion.section
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1 }}
    className="relative w-full h-[480px] sm:h-[540px] lg:h-[600px] overflow-hidden"
  >
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

    {/* Multi-layer gradient for depth */}
    <div
      className="absolute inset-0"
      style={{
        background:
          "linear-gradient(180deg, transparent 0%, hsl(var(--background) / 0.2) 40%, hsl(var(--background) / 0.75) 75%, hsl(var(--background)) 100%)",
      }}
    />

    {/* Content */}
    <div className="absolute inset-0 flex flex-col justify-end px-6 sm:px-10 pb-32 sm:pb-36">
      <motion.span
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.5 }}
        className="text-[10px] sm:text-xs font-semibold tracking-[0.3em] uppercase text-muted-foreground mb-4"
      >
        Luxury Car Manufacturer Brand
      </motion.span>

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
  </motion.section>
);

export default HeroSection;
