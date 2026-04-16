import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  MessageCircle,
  X,
  Send,
  Megaphone,
  ClipboardList,
  CheckCircle2,
  BarChart3,
  Gift,
  Smartphone,
  Globe,
  TrendingUp,
  DollarSign,
  Target,
  Users,
  ShieldCheck,
  Eye,
  Scaling,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import PublicLayout from "@/components/layout/PublicLayout";
import WhatsAppButton from "@/components/WhatsAppButton";
import { useState, useEffect, useCallback } from "react";

import heroCar1 from "@/assets/hero-car-1.jpg";
import heroCar2 from "@/assets/hero-car-2.jpg";
import heroCar3 from "@/assets/hero-car-3.jpg";

const heroSlides = [heroCar1, heroCar2, heroCar3];

const howItWorks = [
  { icon: Megaphone, title: "Brands Launch Campaigns", description: "Premium automotive brands create advertising campaigns on our platform." },
  { icon: ClipboardList, title: "Tasks Are Assigned", description: "The platform assigns simple promotional tasks to qualified promoters." },
  { icon: CheckCircle2, title: "Promoters Complete Tasks", description: "Promoters complete assignments like sharing, reviewing, and engaging." },
  { icon: BarChart3, title: "Brands Get Real Data", description: "Brands receive authentic engagement data and analytics in real time." },
  { icon: Gift, title: "Promoters Earn Rewards", description: "Promoters are rewarded for every completed assignment." },
];

const promoterBenefits = [
  { icon: Smartphone, title: "Simple Daily Tasks", description: "Complete quick promotional assignments from your phone in minutes." },
  { icon: Zap, title: "No Experience Required", description: "Anyone can start earning — no special skills or training needed." },
  { icon: Globe, title: "Work From Anywhere", description: "All tasks are fully remote. Earn from any location worldwide." },
  { icon: TrendingUp, title: "Track Earnings in Real Time", description: "Monitor your income and task progress with a live dashboard." },
];

const brandBenefits = [
  { icon: Target, title: "AI-Powered Targeting", description: "Reach the right audiences with intelligent campaign distribution." },
  { icon: Globe, title: "Global Reach", description: "Access promoters across 45+ countries for maximum brand exposure." },
  { icon: Users, title: "Real User Engagement", description: "Every interaction comes from verified, authentic users." },
  { icon: TrendingUp, title: "Improved Conversion Rates", description: "Data-driven campaigns that deliver measurable ROI." },
];

const whyChoose = [
  { icon: Zap, title: "Intelligent Promotion System", description: "AI matches the right promoters to the right campaigns for optimal results." },
  { icon: Eye, title: "Real User Data", description: "Transparent, verifiable engagement metrics from authentic interactions." },
  { icon: DollarSign, title: "Transparent Earnings", description: "Clear payout structure with no hidden fees or surprise deductions." },
  { icon: Scaling, title: "Global Scalability", description: "Built to scale from local campaigns to worldwide brand activations." },
];

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1] as const },
  }),
};

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [chatOpen, setChatOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.trim()) setSubmitted(true);
  };

  return (
    <PublicLayout>
      <WhatsAppButton />
      {/* Hero with image slider */}
      <section className="relative h-[82vh] min-h-[560px] overflow-hidden">
        {heroSlides.map((slide, i) => (
          <motion.div
            key={i}
            initial={false}
            animate={{ opacity: currentSlide === i ? 1 : 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={slide}
              alt={`Premium automotive ${i + 1}`}
              className="h-full w-full object-cover"
            />
          </motion.div>
        ))}
        {/* Overlay with stronger blur for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/90 to-background/70 backdrop-blur-[4px]" />

        {/* Slide indicators */}
        <div className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 gap-2">
          {heroSlides.map((_, i) => (
            <button
              key={i}
              onClick={() => setCurrentSlide(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                currentSlide === i ? "w-8 bg-primary" : "w-4 bg-muted-foreground/40"
              }`}
            />
          ))}
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="container mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col items-center text-center max-w-3xl mx-auto"
            >
              <h1 className="font-heading text-[28px] sm:text-4xl lg:text-[44px] xl:text-5xl font-semibold tracking-tight leading-[1.1]">
                Empowering Global Automotive Brands Through{" "}
                <span className="text-primary">Intelligent Promotion</span>
              </h1>
              <p className="mt-6 max-w-xl text-[15px] sm:text-base lg:text-[17px] text-muted-foreground leading-[1.65] font-normal">
                Earn by completing simple promotional assignments while helping premium automotive brands reach <span className="text-primary font-medium">real audiences</span> worldwide.
              </p>
              <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button asChild size="lg" className="btn-press gap-2 px-10 h-12 text-[15px]">
                  <Link to="/register">
                    Register <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="btn-press px-10 h-12 text-[15px] hover:bg-secondary hover:text-foreground">
                  <Link to="/login">Login</Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight">How It Works</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              A simple five-step process connecting brands with promoters.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
            {howItWorks.map((step, i) => (
              <motion.div
                key={step.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-6 text-center relative"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <step.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                </div>
                <span className="absolute top-3 right-3 text-xs font-semibold text-muted-foreground/40">
                  0{i + 1}
                </span>
                <h3 className="text-sm font-semibold">{step.title}</h3>
                <p className="mt-2 text-xs text-muted-foreground leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Promoter Benefits */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight">For Promoters</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Start earning today with zero experience and flexible hours.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {promoterBenefits.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-6"
              >
                <item.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Automotive Brands */}
      <section className="py-24 border-t border-border">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight">For Automotive Brands</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Reach real audiences and drive measurable results worldwide.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {brandBenefits.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="glass-card p-6"
              >
                <item.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Choose Skyrise */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="mb-16 text-center"
          >
            <h2 className="text-3xl font-semibold tracking-tight">Why Choose Skyrise</h2>
            <p className="mx-auto mt-4 max-w-lg text-muted-foreground">
              Built for transparency, performance, and global scale.
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {whyChoose.map((item, i) => (
              <motion.div
                key={item.title}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="vault-card p-6"
              >
                <item.icon className="h-5 w-5 text-primary" strokeWidth={1.5} />
                <h3 className="mt-4 text-base font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{item.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="container mx-auto px-6">
          <div className="vault-card p-12 text-center lg:p-16">
            <h2 className="text-3xl font-semibold tracking-tight">Start Earning Today</h2>
            <p className="mx-auto mt-4 max-w-md text-muted-foreground">
              Join thousands of promoters earning daily by helping premium automotive brands grow their audience.
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <Button asChild size="lg" className="btn-press gap-2 px-12 h-14 text-base">
                <Link to="/register">
                  Register <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="btn-press px-12 h-14 text-base hover:bg-secondary hover:text-foreground">
                <Link to="/login">Login</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Floating Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <AnimatePresence>
          {chatOpen && (
            <motion.div
              initial={{ opacity: 0, y: 16, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16, scale: 0.95 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="mb-3 w-80 glass-card overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-border p-4">
                <span className="text-sm font-semibold">Customer Support</span>
                <button onClick={() => setChatOpen(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4">
                {submitted ? (
                  <div className="text-center py-4">
                    <CheckCircle2 className="mx-auto h-8 w-8 text-success mb-2" />
                    <p className="text-sm font-medium">Thank you!</p>
                    <p className="text-xs text-muted-foreground mt-1">Our team will reach out to you on WhatsApp shortly.</p>
                  </div>
                ) : (
                  <>
                    <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                      We're currently unavailable. Please leave your WhatsApp number and a message — our team will get back to you as soon as possible.
                    </p>
                    <form onSubmit={handlePhoneSubmit} className="space-y-3">
                      <Input
                        type="tel"
                        placeholder="WhatsApp number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="text-sm h-9"
                      />
                      <textarea
                        placeholder="Your message (optional)"
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        className="w-full rounded-md border border-border bg-input px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring resize-none h-20"
                      />
                      <Button type="submit" size="sm" className="btn-press h-9 w-full gap-2">
                        <Send className="h-3.5 w-3.5" />
                        Send Message
                      </Button>
                    </form>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!chatOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring", stiffness: 200 }}
            onClick={() => setChatOpen(true)}
            className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg hover:brightness-110 transition-all btn-press"
          >
            <MessageCircle className="h-6 w-6" />
          </motion.button>
        )}
      </div>
    </PublicLayout>
  );
};

export default Index;
