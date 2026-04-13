import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import editorialAnalysis from "@/assets/editorial-analysis.jpg";
import editorialOwners from "@/assets/editorial-owners.jpg";

const editorialBlocks = [
  {
    image: editorialAnalysis,
    alt: "Luxury car interior carbon fiber steering wheel detail",
    label: "INTELLIGENCE",
    title: "In-depth analysis",
    subtitle: "Put effective audience design at your fingertips",
    body: "An evidence-based shortcut for marketers to understand audiences, win customers, and make smarter media investments with where+when®.",
    stats: [],
  },
  {
    image: editorialOwners,
    alt: "Luxury supercars at golden hour on private track",
    label: "CONNECTIVITY",
    title: "Connecting real car owners",
    subtitle: "Real-world data meets predictive AI",
    body: "This powerful platform combines high-quality real-world time and location data with expert market analysis and predictive AI.",
    stats: [
      { value: "3.1M", label: "Verified owners" },
      { value: "12K+", label: "Dealerships" },
      { value: "24/7", label: "Live tracking" },
    ],
  },
];

const EditorialSection = () => (
  <section className="px-4 sm:px-6 mt-16 mb-12 space-y-20">
    {editorialBlocks.map((block, idx) => (
      <motion.article
        key={block.title}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="group"
      >
        {/* Image container with overlay */}
        <div className="relative overflow-hidden rounded-2xl">
          <motion.div
            whileInView={{ scale: 1.04 }}
            viewport={{ once: true }}
            transition={{ duration: 1.6, ease: "easeOut" }}
            className="h-[260px] sm:h-[360px] overflow-hidden"
          >
            <img
              src={block.image}
              alt={block.alt}
              className="w-full h-full object-cover"
              loading="lazy"
              width={1920}
              height={1080}
            />
          </motion.div>


          {/* Label badge */}
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="absolute top-4 left-4 px-3 py-1 rounded-full text-[10px] font-semibold tracking-[0.2em] uppercase"
            style={{
              background: "hsl(var(--foreground) / 0.12)",
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              color: "hsl(var(--foreground) / 0.9)",
              border: "1px solid hsl(var(--foreground) / 0.08)",
            }}
          >
            {block.label}
          </motion.span>

          {/* Stats row at bottom of image */}
          {block.stats.length > 0 && (
            <div className="absolute bottom-0 left-0 right-0 px-5 pb-5">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="flex items-center gap-6"
              >
                {block.stats.map((stat) => (
                  <div key={stat.label} className="flex flex-col">
                    <span className="text-lg sm:text-xl font-bold text-foreground tabular-nums">
                      {stat.value}
                    </span>
                    <span className="text-[10px] font-medium text-muted-foreground tracking-wide uppercase">
                      {stat.label}
                    </span>
                  </div>
                ))}
              </motion.div>
            </div>
          )}
        </div>

        {/* Text content */}
        <div className="mt-6 px-1">
          <motion.h2
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.15, duration: 0.6 }}
            className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground"
          >
            {block.title}
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.22, duration: 0.5 }}
            className="text-sm font-medium text-foreground/70 mt-2"
          >
            {block.subtitle}
          </motion.p>

          <motion.p
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="text-sm text-muted-foreground leading-relaxed mt-3 max-w-lg"
          >
            {block.body}
          </motion.p>

          <motion.button
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="mt-5 flex items-center gap-2 text-xs font-semibold tracking-wide uppercase text-foreground/60 hover:text-foreground transition-colors duration-300 group/btn"
          >
            Learn more
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </motion.button>
        </div>
      </motion.article>
    ))}
  </section>
);

export default EditorialSection;
