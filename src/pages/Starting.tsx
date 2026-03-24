import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, DollarSign, Play, ChevronRight, Clock, Headphones } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRef, useState, useEffect, useCallback, useMemo } from "react";

import bmwImg from "@/assets/cars/bmw.jpg";
import mercedesImg from "@/assets/cars/mercedes.jpg";
import rollsRoyceImg from "@/assets/cars/rolls-royce.jpg";
import porscheImg from "@/assets/cars/porsche.jpg";
import audiImg from "@/assets/cars/audi.jpg";
import ferrariImg from "@/assets/cars/ferrari.jpg";
import lamborghiniImg from "@/assets/cars/lamborghini.jpg";
import bentleyImg from "@/assets/cars/bentley.jpg";
import maseratiImg from "@/assets/cars/maserati.jpg";
import rangeRoverImg from "@/assets/cars/range-rover.jpg";
import teslaImg from "@/assets/cars/tesla.jpg";
import jaguarImg from "@/assets/cars/jaguar.jpg";
import lexusImg from "@/assets/cars/lexus.jpg";
import volvoImg from "@/assets/cars/volvo.jpg";
import mclarenImg from "@/assets/cars/mclaren.jpg";
import genesisImg from "@/assets/cars/genesis.jpg";
import astonMartinImg from "@/assets/cars/aston-martin.jpg";
import bugattiImg from "@/assets/cars/bugatti.jpg";
import landRoverImg from "@/assets/cars/land-rover.jpg";
import alfaRomeoImg from "@/assets/cars/alfa-romeo.jpg";

const carCampaigns = [
  { brand: "BMW", image: bmwImg },
  { brand: "Mercedes", image: mercedesImg },
  { brand: "Rolls Royce", image: rollsRoyceImg },
  { brand: "Porsche", image: porscheImg },
  { brand: "Audi", image: audiImg },
  { brand: "Ferrari", image: ferrariImg },
  { brand: "Lamborghini", image: lamborghiniImg },
  { brand: "Bentley", image: bentleyImg },
  { brand: "Maserati", image: maseratiImg },
  { brand: "Range Rover", image: rangeRoverImg },
  { brand: "Tesla", image: teslaImg },
  { brand: "Jaguar", image: jaguarImg },
  { brand: "Lexus", image: lexusImg },
  { brand: "Volvo", image: volvoImg },
  { brand: "McLaren", image: mclarenImg },
  { brand: "Genesis", image: genesisImg },
  { brand: "Aston Martin", image: astonMartinImg },
  { brand: "Bugatti", image: bugattiImg },
  { brand: "Land Rover", image: landRoverImg },
  { brand: "Alfa Romeo", image: alfaRomeoImg },
];

const Starting = () => {
  const { profile } = useAuth();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isPaused, setIsPaused] = useState(false);
  const todaySalary = 0;

  const userName = profile?.full_name || "User";

  // Auto-scroll carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % carCampaigns.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Scroll to active card
  useEffect(() => {
    if (scrollRef.current) {
      const card = scrollRef.current.children[activeIndex] as HTMLElement;
      if (card) {
        const scrollLeft = card.offsetLeft - scrollRef.current.offsetWidth / 2 + card.offsetWidth / 2;
        scrollRef.current.scrollTo({ left: scrollLeft, behavior: "smooth" });
      }
    }
  }, [activeIndex]);

  const handleScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const container = scrollRef.current;
    const center = container.scrollLeft + container.offsetWidth / 2;
    let closest = 0;
    let minDist = Infinity;
    Array.from(container.children).forEach((child, i) => {
      const el = child as HTMLElement;
      const elCenter = el.offsetLeft + el.offsetWidth / 2;
      const dist = Math.abs(center - elCenter);
      if (dist < minDist) { minDist = dist; closest = i; }
    });
    setActiveIndex(closest);
  }, []);

  const featuredCar = carCampaigns[activeIndex];

  return (
    <AppLayout>
      <div className="px-4 py-5 pb-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass-card p-4 mb-5"
        >
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold tracking-tight">
                Hi, {userName} 👋
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">Junior Promoter</p>
            </div>
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-sm font-semibold text-primary">
                {userName.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Balance Cards */}
        <div className="grid grid-cols-2 gap-3 mb-6">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="glass-card p-4"
          >
            <Wallet className="h-4 w-4 text-primary mb-2" strokeWidth={1.5} />
            <div className="text-xl font-bold tabular-nums tracking-tight">0 AC</div>
            <span className="text-[10px] text-muted-foreground">Wallet Balance</span>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="glass-card p-4"
          >
            <DollarSign className="h-4 w-4 text-success mb-2" strokeWidth={1.5} />
            <div className="text-xl font-bold tabular-nums tracking-tight">0 AC</div>
            <span className="text-[10px] text-muted-foreground">Advertising Salary</span>
          </motion.div>
        </div>

        {/* Car Slideshow */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="mb-6"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Campaigns
            </h2>
            <span className="text-[10px] text-muted-foreground">{carCampaigns.length} available</span>
          </div>
          <div
            ref={scrollRef}
            onScroll={handleScroll}
            className="flex gap-3 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {carCampaigns.map((car, i) => (
              <motion.div
                key={car.brand}
                className={`flex-shrink-0 snap-center rounded-2xl overflow-hidden relative transition-all duration-500 ${
                  i === activeIndex ? "w-36 h-48" : "w-28 h-44 opacity-60"
                }`}
                style={{
                  boxShadow: i === activeIndex
                    ? "0 8px 32px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.08)"
                    : "0 2px 8px rgba(0,0,0,0.3)",
                }}
              >
                <img
                  src={car.image}
                  alt={car.brand}
                  loading="lazy"
                  width={640}
                  height={800}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-2.5">
                  <p className="text-[11px] font-semibold truncate">{car.brand} Campaign</p>
                  <p className="text-[10px] text-success font-medium tabular-nums">+${car.reward.toFixed(2)}</p>
                </div>
              </motion.div>
            ))}
          </div>
          {/* Dot indicators */}
          <div className="flex justify-center gap-1 mt-3">
            {carCampaigns.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveIndex(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-5 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Featured Car Display */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6 rounded-2xl overflow-hidden relative"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.05)" }}
        >
          <AnimatePresence mode="wait">
            <motion.img
              key={featuredCar.brand}
              src={featuredCar.image}
              alt={featuredCar.brand}
              width={640}
              height={800}
              className="w-full h-56 object-cover"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.4 }}
            />
          </AnimatePresence>
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">Featured</p>
                <h3 className="text-lg font-bold">{featuredCar.brand}</h3>
                <p className="text-xs text-muted-foreground">{featuredCar.model}</p>
              </div>
              <span className="text-base font-bold text-success tabular-nums">+${featuredCar.reward.toFixed(2)}</span>
            </div>
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="glass-card p-4 mb-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-muted-foreground">Task Progress</span>
            <span className="text-xs tabular-nums font-semibold">{completedTasks} / {totalTasks}</span>
          </div>
          <div className="progress-track h-2.5">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(completedTasks / totalTasks) * 100}%` }}
              transition={{ duration: 1.2, ease: "easeOut" }}
              className="progress-fill h-2.5"
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1.5">
            {Math.round((completedTasks / totalTasks) * 100)}% completed today
          </p>
        </motion.div>

        {/* Start Task Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-6"
        >
          <button className="w-full py-4 rounded-full font-semibold text-sm tracking-wide flex items-center justify-center gap-2 btn-press transition-all duration-300 bg-card text-foreground border border-border hover:border-primary/30"
            style={{ boxShadow: "0 4px 20px rgba(0,0,0,0.2)" }}
          >
            <Play className="h-4 w-4 text-primary" fill="hsl(var(--primary))" />
            Match Ad
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </motion.div>

        {/* Daily Earnings */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.5 }}
          className="glass-card p-4 mb-5"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
              <span className="text-xs text-muted-foreground">Today Advertising Salary</span>
            </div>
            <span className="text-base font-bold tabular-nums">{todaySalary}</span>
          </div>
        </motion.div>

        {/* Important Notes */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="glass-card p-5 border border-border/50"
        >
          <h3 className="text-sm font-semibold mb-3">Important Notes</h3>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-medium">Support Hours</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Mon – Fri, 9:00 AM – 6:00 PM (UTC)
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Headphones className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
              <div>
                <p className="text-xs font-medium">Contact Support</p>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  support@skyrise.com
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AppLayout>
  );
};

export default Starting;
