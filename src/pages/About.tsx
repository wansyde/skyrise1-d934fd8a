import { motion } from "framer-motion";
import { Brain, Fingerprint, Globe, DollarSign, ArrowRight } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

const advantages = [
  {
    icon: Brain,
    title: "Intelligent Promotion System",
    description: "Using AI to allocate advertising assignments with precision, ensuring ads reach the right audience. This boosts conversion rates and maximizes the return on investment for advertisers.",
  },
  {
    icon: Fingerprint,
    title: "Authentic User Data",
    description: "Unlike traditional ads that are often ignored, promotions on the Skyrise platform are executed by promoters using independent devices, IP addresses, and network environments. This guarantees real user engagement and helps brands optimize their ad strategies.",
  },
  {
    icon: Globe,
    title: "Global Reach",
    description: "Advertising is no longer limited by geography. With promoters from all over the world, brands can accurately target customers in various regions and achieve a truly global marketing strategy.",
  },
  {
    icon: DollarSign,
    title: "Transparent and Stable Earnings for Promoters",
    description: "Promoters only need 1–2 hours daily to complete assignments and earn a stable income. Advertising Salary is settled instantly and can be withdrawn at any time. No experience is required—beginners can easily get started.",
  },
];

const steps = [
  "Brand places an ad",
  "Platform matches assignments",
  "Promoter completes the assignment",
  "Brand receives authentic data",
  "Promoter earns Advertising Salary",
];

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true },
  transition: { delay, duration: 0.5, ease: [0.16, 1, 0.3, 1] as number[] },
});

const About = () => (
  <PublicLayout>
    <section className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        {/* Hero */}
        <motion.div {...fade()} className="mx-auto max-w-2xl text-center">
          <h1 className="text-4xl font-semibold tracking-tight">
            Empowering Global Automotive Brands with Intelligent Digital Marketing
          </h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            Skyrise is a digital marketing platform dedicated to promoting global automotive brands. Our mission is to help car manufacturers enhance their advertising performance, boost brand awareness, and ultimately drive sales growth. By connecting automotive brands with promoters, our platform leverages AI-driven systems to accurately match promotional assignments, ensuring ads effectively reach their target audiences. This creates a win-win-win ecosystem for brands, promoters, and the platform.
          </p>
        </motion.div>

        {/* Mission */}
        <motion.div
          {...fade()}
          className="vault-card mt-20 p-12 text-center"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Our Mission</h2>
          <p className="mx-auto mt-4 max-w-xl text-muted-foreground leading-relaxed">
            Our goal is to provide precise, efficient, and genuinely engaging advertising solutions for automotive brands—ensuring ads are seen by real potential customers and deliver actual value. At the same time, we offer promoters around the world a flexible, high-earning opportunity to make substantial income by completing simple online assignments.
          </p>
        </motion.div>

        {/* Advantages */}
        <div className="mt-20">
          <motion.h2
            {...fade()}
            className="text-center text-2xl font-semibold tracking-tight mb-10"
          >
            Our Advantages
          </motion.h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {advantages.map((v, i) => (
              <motion.div
                key={v.title}
                {...fade(i * 0.1)}
                className="glass-card p-6"
              >
                <v.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 font-semibold">{v.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* How It Works */}
        <div className="mt-20">
          <motion.h2
            {...fade()}
            className="text-center text-2xl font-semibold tracking-tight mb-10"
          >
            How It Works
          </motion.h2>
          <motion.div
            {...fade(0.1)}
            className="glass-card p-8 flex flex-wrap items-center justify-center gap-3"
          >
            {steps.map((step, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm font-medium">{step}</span>
                {i < steps.length - 1 && (
                  <ArrowRight className="h-4 w-4 text-primary shrink-0" strokeWidth={1.5} />
                )}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  </PublicLayout>
);

export default About;
