import { motion } from "framer-motion";
import { Shield, Users, Globe, Target } from "lucide-react";
import PublicLayout from "@/components/layout/PublicLayout";

const values = [
  { icon: Shield, title: "Security First", description: "Every system is built with defense-in-depth architecture and continuous monitoring." },
  { icon: Users, title: "Client Focused", description: "Your financial goals drive every decision we make, from product to portfolio." },
  { icon: Globe, title: "Global Reach", description: "Serving investors across 45+ countries with localized support and compliance." },
  { icon: Target, title: "Precision", description: "Data-driven strategies refined through rigorous backtesting and live validation." },
];

const About = () => (
  <PublicLayout>
    <section className="pt-32 pb-24">
      <div className="container mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto max-w-2xl text-center"
        >
          <h1 className="text-4xl font-semibold tracking-tight">About VaultX</h1>
          <p className="mt-6 text-lg text-muted-foreground leading-relaxed">
            VaultX is an institutional-grade wealth management platform built for the modern investor. We combine cutting-edge technology with proven financial strategies to deliver consistent, transparent returns.
          </p>
        </motion.div>

        <div className="mt-20 grid gap-6 sm:grid-cols-2">
          {values.map((v, i) => (
            <motion.div
              key={v.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="glass-card p-6"
            >
              <v.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
              <h3 className="mt-4 font-semibold">{v.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{v.description}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="vault-card mt-20 p-12 text-center"
        >
          <h2 className="text-2xl font-semibold tracking-tight">Our Mission</h2>
          <p className="mx-auto mt-4 max-w-lg text-muted-foreground leading-relaxed">
            To democratize institutional-grade investment strategies, making professional wealth management accessible to every investor regardless of portfolio size.
          </p>
        </motion.div>
      </div>
    </section>
  </PublicLayout>
);

export default About;
