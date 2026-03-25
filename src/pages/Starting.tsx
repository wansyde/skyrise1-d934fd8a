import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, DollarSign, Play, ChevronRight, Clock, Headphones, ChevronLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback } from "react";

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

// Featured images (different angles)
import bmwFeatured from "@/assets/cars/featured/bmw.jpg";
import mercedesFeatured from "@/assets/cars/featured/mercedes.jpg";
import rollsRoyceFeatured from "@/assets/cars/featured/rolls-royce.jpg";
import porscheFeatured from "@/assets/cars/featured/porsche.jpg";
import audiFeatured from "@/assets/cars/featured/audi.jpg";
import ferrariFeatured from "@/assets/cars/featured/ferrari.jpg";
import lamborghiniFeatured from "@/assets/cars/featured/lamborghini.jpg";
import bentleyFeatured from "@/assets/cars/featured/bentley.jpg";
import maseratiFeatured from "@/assets/cars/featured/maserati.jpg";
import rangeRoverFeatured from "@/assets/cars/featured/range-rover.jpg";
import teslaFeatured from "@/assets/cars/featured/tesla.jpg";
import jaguarFeatured from "@/assets/cars/featured/jaguar.jpg";
import lexusFeatured from "@/assets/cars/featured/lexus.jpg";
import volvoFeatured from "@/assets/cars/featured/volvo.jpg";
import mclarenFeatured from "@/assets/cars/featured/mclaren.jpg";
import genesisFeatured from "@/assets/cars/featured/genesis.jpg";
import astonMartinFeatured from "@/assets/cars/featured/aston-martin.jpg";
import bugattiFeatured from "@/assets/cars/featured/bugatti.jpg";
import landRoverFeatured from "@/assets/cars/featured/land-rover.jpg";
import alfaRomeoFeatured from "@/assets/cars/featured/alfa-romeo.jpg";

const carCampaigns = [
  { brand: "BMW", image: bmwImg, featured: bmwFeatured },
  { brand: "Mercedes", image: mercedesImg, featured: mercedesFeatured },
  { brand: "Rolls Royce", image: rollsRoyceImg, featured: rollsRoyceFeatured },
  { brand: "Porsche", image: porscheImg, featured: porscheFeatured },
  { brand: "Audi", image: audiImg, featured: audiFeatured },
  { brand: "Ferrari", image: ferrariImg, featured: ferrariFeatured },
  { brand: "Lamborghini", image: lamborghiniImg, featured: lamborghiniFeatured },
  { brand: "Bentley", image: bentleyImg, featured: bentleyFeatured },
  { brand: "Maserati", image: maseratiImg, featured: maseratiFeatured },
  { brand: "Range Rover", image: rangeRoverImg, featured: rangeRoverFeatured },
  { brand: "Tesla", image: teslaImg, featured: teslaFeatured },
  { brand: "Jaguar", image: jaguarImg, featured: jaguarFeatured },
  { brand: "Lexus", image: lexusImg, featured: lexusFeatured },
  { brand: "Volvo", image: volvoImg, featured: volvoFeatured },
  { brand: "McLaren", image: mclarenImg, featured: mclarenFeatured },
  { brand: "Genesis", image: genesisImg, featured: genesisFeatured },
  { brand: "Aston Martin", image: astonMartinImg, featured: astonMartinFeatured },
  { brand: "Bugatti", image: bugattiImg, featured: bugattiFeatured },
  { brand: "Land Rover", image: landRoverImg, featured: landRoverFeatured },
  { brand: "Alfa Romeo", image: alfaRomeoImg, featured: alfaRomeoFeatured },
];

const VISIBLE_COUNT = 5;

const Starting = () => {
  const { profile } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [featuredPaused, setFeaturedPaused] = useState(false);
  const todaySalary = 0;
  const userName = profile?.full_name || "User";
  const total = carCampaigns.length;

  // Auto-slide for top carousel
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 4000);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  // Auto-slide for featured carousel
  useEffect(() => {
    if (featuredPaused) return;
    const interval = setInterval(() => {
      setFeaturedIndex((prev) => (prev + 1) % total);
    }, 4500);
    return () => clearInterval(interval);
  }, [featuredPaused, total]);

  // Pause on interaction
  const handleInteraction = useCallback(() => {
    setIsPaused(true);
    const timeout = setTimeout(() => setIsPaused(false), 8000);
    return () => clearTimeout(timeout);
  }, []);

  const handleFeaturedInteraction = useCallback(() => {
    setFeaturedPaused(true);
    const timeout = setTimeout(() => setFeaturedPaused(false), 8000);
    return () => clearTimeout(timeout);
  }, []);

  const goTo = useCallback((i: number) => {
    setActiveIndex(i);
    handleInteraction();
  }, [handleInteraction]);

  // Get offset from center for 3D transform
  const getCardStyle = (offset: number) => {
    const absOffset = Math.abs(offset);
    const scale = offset === 0 ? 1.08 : Math.max(0.68, 1 - absOffset * 0.14);
    const rotateY = offset * -22;
    const translateX = offset * 95;
    const translateZ = offset === 0 ? 60 : -absOffset * 70;
    const opacity = offset === 0 ? 1 : Math.max(0.45, 1 - absOffset * 0.25);
    const zIndex = 10 - absOffset;
    const brightness = offset === 0 ? 1.12 : Math.max(0.7, 1 - absOffset * 0.15);
    const contrast = offset === 0 ? 1.1 : 1;
    const saturate = offset === 0 ? 1.15 : Math.max(0.85, 1 - absOffset * 0.1);

    return {
      transform: `perspective(1200px) translateX(${translateX}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
      opacity,
      zIndex,
      filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`,
    };
  };

  // Visible cards around active
  const visibleCards = [];
  const half = Math.floor(VISIBLE_COUNT / 2);
  for (let offset = -half; offset <= half; offset++) {
    const idx = ((activeIndex + offset) % total + total) % total;
    visibleCards.push({ idx, offset, car: carCampaigns[idx] });
  }

  const featuredCar = carCampaigns[featuredIndex];

  // Swipe handling for top carousel
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const handleTouchStart = (e: React.TouchEvent) => setTouchStart(e.touches[0].clientX);
  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;
    const diff = touchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? (activeIndex + 1) % total : (activeIndex - 1 + total) % total);
    }
    setTouchStart(null);
  };

  // Swipe handling for featured carousel
  const [featuredTouchStart, setFeaturedTouchStart] = useState<number | null>(null);
  const handleFeaturedTouchStart = (e: React.TouchEvent) => setFeaturedTouchStart(e.touches[0].clientX);
  const handleFeaturedTouchEnd = (e: React.TouchEvent) => {
    if (featuredTouchStart === null) return;
    const diff = featuredTouchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      const next = diff > 0 ? (featuredIndex + 1) % total : (featuredIndex - 1 + total) % total;
      setFeaturedIndex(next);
      handleFeaturedInteraction();
    }
    setFeaturedTouchStart(null);
  };

  const goFeaturedPrev = useCallback(() => {
    setFeaturedIndex((prev) => (prev - 1 + total) % total);
    handleFeaturedInteraction();
  }, [total, handleFeaturedInteraction]);

  const goFeaturedNext = useCallback(() => {
    setFeaturedIndex((prev) => (prev + 1) % total);
    handleFeaturedInteraction();
  }, [total, handleFeaturedInteraction]);

  return (
    <AppLayout>
      <div
        className="px-4 py-5 pb-8 min-h-screen relative"
        style={{
          background: "radial-gradient(ellipse at 50% 20%, hsl(var(--primary) / 0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, hsl(var(--primary) / 0.03) 0%, transparent 40%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background) / 0.97) 100%)",
        }}
      >
        {/* Subtle tire track / road line accent */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-foreground to-transparent" />
          <div className="absolute top-0 left-[calc(50%-3px)] w-px h-full bg-gradient-to-b from-transparent via-foreground/50 to-transparent" />
          <div className="absolute top-0 left-[calc(50%+3px)] w-px h-full bg-gradient-to-b from-transparent via-foreground/50 to-transparent" />
        </div>
        <div className="relative z-10">
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

        {/* 3D Car Carousel */}
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
            <span className="text-[10px] text-muted-foreground">{total} available</span>
          </div>

          {/* 3D Carousel Container */}
          <div
            className="relative h-[340px] sm:h-[400px] flex items-center justify-center overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            style={{
              background: "radial-gradient(ellipse at center bottom, hsl(var(--primary) / 0.06) 0%, transparent 70%)",
            }}
          >
          {visibleCards.map(({ idx, offset, car }) => {
              const style = getCardStyle(offset);
              const isCenter = offset === 0;
              return (
                <motion.div
                  key={`${idx}-${car.brand}`}
                  className="absolute cursor-pointer"
                  onClick={() => goTo(idx)}
                  animate={{
                    transform: style.transform,
                    opacity: style.opacity,
                    zIndex: style.zIndex,
                    filter: style.filter,
                  }}
                  transition={{ type: "spring", stiffness: 260, damping: 26 }}
                  style={{ zIndex: style.zIndex }}
                >
                  {/* Card with showroom floor reflection */}
                  <div className="flex flex-col items-center">
                    <div
                      className="w-40 h-56 sm:w-48 sm:h-64 rounded-2xl overflow-hidden relative"
                      style={{
                        boxShadow: isCenter
                          ? "0 20px 60px rgba(0,0,0,0.5), 0 0 30px hsl(var(--primary) / 0.12), 0 0 80px hsl(var(--primary) / 0.06)"
                          : "0 8px 24px rgba(0,0,0,0.35)",
                      }}
                    >
                      <img
                        src={car.image}
                        alt={car.brand}
                        loading="lazy"
                        className="w-full h-full object-cover"
                      />
                      {/* Very subtle top highlight for 3D edge lighting */}
                      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      {/* Subtle side edge highlights */}
                      <div className="absolute inset-y-0 left-0 w-px bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                      <div className="absolute inset-y-0 right-0 w-px bg-gradient-to-b from-white/10 via-transparent to-transparent" />
                    </div>
                    {/* Showroom floor reflection */}
                    <div
                      className="w-36 sm:w-44 h-12 mt-0.5 rounded-b-2xl overflow-hidden opacity-30"
                      style={{
                        transform: "scaleY(-1) scaleX(0.92)",
                        maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)",
                        WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)",
                      }}
                    >
                      <img
                        src={car.image}
                        alt=""
                        className="w-full h-44 object-cover object-bottom"
                        style={{ filter: "blur(2px)" }}
                      />
                    </div>
                    {/* Soft glow under center car */}
                    {isCenter && (
                      <div
                        className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full"
                        style={{
                          background: "radial-gradient(ellipse, hsl(var(--primary) / 0.15) 0%, transparent 70%)",
                        }}
                      />
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1 mt-3">
            {carCampaigns.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`rounded-full transition-all duration-300 ${
                  i === activeIndex
                    ? "w-5 h-1.5 bg-primary"
                    : "w-1.5 h-1.5 bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Featured Car Carousel - Premium Showcase */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mb-6 relative"
        >
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">
              Showcase
            </h2>
            <span className="text-[10px] text-muted-foreground">{featuredCar.brand}</span>
          </div>

          {/* Carousel Container */}
          <div
            className="relative rounded-2xl overflow-hidden"
            onTouchStart={handleFeaturedTouchStart}
            onTouchEnd={handleFeaturedTouchEnd}
            style={{
              background: "radial-gradient(ellipse at 50% 40%, hsl(var(--primary) / 0.06) 0%, hsl(var(--card) / 0.4) 50%, hsl(var(--background)) 100%)",
            }}
          >
            {/* Main image with cinematic transitions */}
            <div className="relative" style={{ perspective: "1200px" }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={featuredCar.brand}
                  className="relative"
                  initial={{ opacity: 0, scale: 1.06, x: 40 }}
                  animate={{ opacity: 1, scale: 1, x: 0 }}
                  exit={{ opacity: 0, scale: 0.96, x: -40 }}
                  transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
                >
                  <img
                    src={featuredCar.featured}
                    alt={featuredCar.brand}
                    className="w-full aspect-[16/10] object-cover rounded-2xl"
                    style={{
                      filter: "brightness(1.08) contrast(1.06) saturate(1.12)",
                    }}
                  />
                  {/* Floating shadow underneath */}
                  <div
                    className="absolute -bottom-3 left-[10%] right-[10%] h-8 rounded-full"
                    style={{
                      background: "radial-gradient(ellipse, rgba(0,0,0,0.35) 0%, transparent 70%)",
                      filter: "blur(8px)",
                    }}
                  />
                </motion.div>
              </AnimatePresence>

              {/* Showroom floor reflection */}
              <div
                className="absolute bottom-0 left-0 right-0 h-24 rounded-b-2xl overflow-hidden opacity-20 pointer-events-none"
                style={{
                  background: "linear-gradient(to top, hsl(var(--primary) / 0.08), transparent)",
                }}
              />

              {/* Subtle top highlight edge */}
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent rounded-t-2xl" />
            </div>

            {/* Arrow Controls */}
            <button
              onClick={goFeaturedPrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-200 hover:bg-background/80 hover:scale-105"
            >
              <ChevronLeft className="h-4 w-4 text-foreground/70" />
            </button>
            <button
              onClick={goFeaturedNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-background/60 backdrop-blur-sm border border-border/50 flex items-center justify-center transition-all duration-200 hover:bg-background/80 hover:scale-105"
            >
              <ChevronRight className="h-4 w-4 text-foreground/70" />
            </button>
          </div>

          {/* Brand label */}
          <AnimatePresence mode="wait">
            <motion.p
              key={featuredCar.brand}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.4 }}
              className="text-center text-xs font-medium text-muted-foreground mt-3 tracking-widest uppercase"
            >
              {featuredCar.brand}
            </motion.p>
          </AnimatePresence>

          {/* Dot indicators */}
          <div className="flex justify-center gap-1 mt-2">
            {carCampaigns.map((_, i) => (
              <button
                key={i}
                onClick={() => { setFeaturedIndex(i); handleFeaturedInteraction(); }}
                className={`rounded-full transition-all duration-300 ${
                  i === featuredIndex
                    ? "w-4 h-1 bg-primary/70"
                    : "w-1 h-1 bg-muted-foreground/20"
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Start Task Button */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mb-6"
        >
          <button
            className="w-full py-4 rounded-full font-semibold text-sm tracking-wide flex items-center justify-center gap-2 btn-press transition-all duration-300 bg-card text-foreground border border-border hover:border-primary/30"
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
          transition={{ delay: 0.4, duration: 0.5 }}
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
          transition={{ delay: 0.45, duration: 0.5 }}
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
      </div>
    </AppLayout>
  );
};

export default Starting;
