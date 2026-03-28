import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, DollarSign, Play, ChevronRight, Clock, Headphones, ChevronLeft, X, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getVipTier, getSetProgress } from "@/lib/vip-config";

import audiA1Img from "@/assets/cars/audi-a1.jpg";
import audiA2Img from "@/assets/cars/audi-a2.jpg";
import astonMartinGreenImg from "@/assets/cars/aston-martin-green.jpg";
import astonMartinYellowImg from "@/assets/cars/aston-martin-yellow.jpg";
import maybachImg from "@/assets/cars/maybach.jpg";
import mercedesRedImg from "@/assets/cars/mercedes-red.jpg";
import bmwBlueImg from "@/assets/cars/bmw-blue.jpg";
import bmwPurpleImg from "@/assets/cars/bmw-purple.jpg";
import ferrariYellowImg from "@/assets/cars/ferrari-yellow.jpg";
import bentleyWhiteImg from "@/assets/cars/bentley-white.jpg";
import bentleyBlueImg from "@/assets/cars/bentley-blue.jpg";
import fordMustangImg from "@/assets/cars/ford-mustang.jpg";
import ferrariRomaImg from "@/assets/cars/ferrari-roma.jpg";
import cadillacCt5Img from "@/assets/cars/cadillac-ct5.jpg";
import rangeRoverImg from "@/assets/cars/range-rover.jpg";
import lexusLcImg from "@/assets/cars/lexus-lc.jpg";
import mclarenArturaImg from "@/assets/cars/mclaren-artura.jpg";
import mclarenGtImg from "@/assets/cars/mclaren-gt.jpg";
import lexusEsImg from "@/assets/cars/lexus-es.jpg";
import teslaModelSImg from "@/assets/cars/tesla-model-s.jpg";

import audiA1Featured from "@/assets/cars/featured/audi-a1.png";
import audiA2Featured from "@/assets/cars/featured/audi-a2.png";
import astonMartinGreenFeatured from "@/assets/cars/featured/aston-martin-green.png";
import astonMartinYellowFeatured from "@/assets/cars/featured/aston-martin-yellow.png";
import maybachFeatured from "@/assets/cars/featured/maybach.png";
import mercedesRedFeatured from "@/assets/cars/featured/mercedes-red.png";
import bmwBlueFeatured from "@/assets/cars/featured/bmw-blue.png";
import bmwPurpleFeatured from "@/assets/cars/featured/bmw-purple.png";
import ferrariYellowFeatured from "@/assets/cars/featured/ferrari-yellow.png";
import bentleyWhiteFeatured from "@/assets/cars/featured/bentley-white.png";
import bentleyBlueFeatured from "@/assets/cars/featured/bentley-blue.png";
import fordMustangFeatured from "@/assets/cars/featured/ford-mustang.png";
import ferrariRomaFeatured from "@/assets/cars/featured/ferrari-roma.png";
import cadillacCt5Featured from "@/assets/cars/featured/cadillac-ct5.png";
import rangeRoverFeatured from "@/assets/cars/featured/range-rover.png";
import lexusLcFeatured from "@/assets/cars/featured/lexus-lc.png";
import mclarenArturaFeatured from "@/assets/cars/featured/mclaren-artura.png";
import mclarenGtFeatured from "@/assets/cars/featured/mclaren-gt.png";
import lexusEsFeatured from "@/assets/cars/featured/lexus-es.png";
import teslaModelSFeatured from "@/assets/cars/featured/tesla-model-s.png";

const carCampaigns = [
  { brand: "Audi", name: "Audi A1 2025 Sportback Premium Edition", image: audiA1Img, featured: audiA1Featured, totalAmount: 41, adSalary: 0.16 },
  { brand: "Audi RS", name: "Audi RS e-tron GT 2025 Performance", image: audiA2Img, featured: audiA2Featured, totalAmount: 45, adSalary: 0.18 },
  { brand: "Aston Martin", name: "Aston Martin DB12 Volante 2025", image: astonMartinGreenImg, featured: astonMartinGreenFeatured, totalAmount: 52, adSalary: 0.21 },
  { brand: "Aston Martin", name: "Aston Martin Vantage 2025 AMR", image: astonMartinYellowImg, featured: astonMartinYellowFeatured, totalAmount: 48, adSalary: 0.19 },
  { brand: "Maybach", name: "Mercedes-Maybach S680 2025 Edition", image: maybachImg, featured: maybachFeatured, totalAmount: 55, adSalary: 0.22 },
  { brand: "Mercedes", name: "Mercedes-AMG GT 63 S E Performance", image: mercedesRedImg, featured: mercedesRedFeatured, totalAmount: 43, adSalary: 0.17 },
  { brand: "BMW", name: "BMW M4 Competition 2025 xDrive", image: bmwBlueImg, featured: bmwBlueFeatured, totalAmount: 44, adSalary: 0.18 },
  { brand: "BMW", name: "BMW iX M60 2025 Electric SUV", image: bmwPurpleImg, featured: bmwPurpleFeatured, totalAmount: 46, adSalary: 0.18 },
  { brand: "Ferrari", name: "Ferrari 296 GTB 2025 Assetto Fiorano", image: ferrariYellowImg, featured: ferrariYellowFeatured, totalAmount: 58, adSalary: 0.23 },
  { brand: "Bentley", name: "Bentley Continental GT 2025 Speed", image: bentleyWhiteImg, featured: bentleyWhiteFeatured, totalAmount: 50, adSalary: 0.20 },
  { brand: "Bentley", name: "Bentley Continental GT 2025 Azure", image: bentleyBlueImg, featured: bentleyBlueFeatured, totalAmount: 51, adSalary: 0.20 },
  { brand: "Ford", name: "Ford Mustang GT 2025 Premium", image: fordMustangImg, featured: fordMustangFeatured, totalAmount: 39, adSalary: 0.15 },
  { brand: "Ferrari", name: "Ferrari Roma 2025 Spider", image: ferrariRomaImg, featured: ferrariRomaFeatured, totalAmount: 56, adSalary: 0.22 },
  { brand: "Cadillac", name: "Cadillac CT5-V 2025 Blackwing", image: cadillacCt5Img, featured: cadillacCt5Featured, totalAmount: 47, adSalary: 0.19 },
  { brand: "Range Rover", name: "Range Rover Autobiography 2025 LWB", image: rangeRoverImg, featured: rangeRoverFeatured, totalAmount: 53, adSalary: 0.21 },
  { brand: "Lexus", name: "Lexus LC 500 2025 Inspiration Series", image: lexusLcImg, featured: lexusLcFeatured, totalAmount: 49, adSalary: 0.19 },
  { brand: "McLaren", name: "McLaren Artura 2025 Spider", image: mclarenArturaImg, featured: mclarenArturaFeatured, totalAmount: 57, adSalary: 0.23 },
  { brand: "McLaren", name: "McLaren GT 2025 Luxe", image: mclarenGtImg, featured: mclarenGtFeatured, totalAmount: 54, adSalary: 0.21 },
  { brand: "Lexus", name: "Lexus ES 350 2025 F Sport", image: lexusEsImg, featured: lexusEsFeatured, totalAmount: 42, adSalary: 0.17 },
  { brand: "Tesla", name: "Tesla Model S 2025 Plaid", image: teslaModelSImg, featured: teslaModelSFeatured, totalAmount: 44, adSalary: 0.18 },
];

const VISIBLE_COUNT = 5;

const generateAssignmentCode = () => {
  const now = new Date();
  return now.getFullYear().toString() +
    String(now.getMonth() + 1).padStart(2, '0') +
    String(now.getDate()).padStart(2, '0') +
    String(now.getHours()).padStart(2, '0') +
    String(now.getMinutes()).padStart(2, '0') +
    String(now.getSeconds()).padStart(2, '0') +
    String(now.getMilliseconds()).padStart(3, '0') +
    Math.floor(Math.random() * 1000).toString().padStart(3, '0');
};

type MatchState = "idle" | "matching" | "matched";

const Starting = () => {
  const { profile, user, refreshProfile } = useAuth();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [matchState, setMatchState] = useState<MatchState>("idle");
  const [matchedCar, setMatchedCar] = useState<typeof carCampaigns[0] | null>(null);
  const [matchProgress, setMatchProgress] = useState(0);
  const [assignmentCode, setAssignmentCode] = useState("");
  const [matchedAt, setMatchedAt] = useState<Date | null>(null);
  const [completedCount, setCompletedCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const vipTier = useMemo(() => getVipTier(profile?.vip_level || "Junior"), [profile?.vip_level]);
  const DAILY_LIMIT = vipTier.totalTasks;
  const setProgress = useMemo(() => getSetProgress(completedCount, vipTier), [completedCount, vipTier]);

  const todaySalary = Number(profile?.advertising_salary ?? 0).toFixed(2);
  const userName = profile?.full_name || "User";
  const total = carCampaigns.length;

  // Use profile tasks_completed_today directly
  useEffect(() => {
    if (profile) {
      setCompletedCount(profile.tasks_completed_today || 0);
    }
  }, [profile]);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % total);
    }, 3000);
    return () => clearInterval(interval);
  }, [isPaused, total]);

  const handleInteraction = useCallback(() => {
    setIsPaused(true);
    const timeout = setTimeout(() => setIsPaused(false), 8000);
    return () => clearTimeout(timeout);
  }, []);

  const goTo = useCallback((i: number) => {
    setActiveIndex(i);
    handleInteraction();
  }, [handleInteraction]);

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
      opacity, zIndex,
      filter: `brightness(${brightness}) contrast(${contrast}) saturate(${saturate})`,
    };
  };

  const visibleCards = [];
  const half = Math.floor(VISIBLE_COUNT / 2);
  for (let offset = -half; offset <= half; offset++) {
    const idx = ((activeIndex + offset) % total + total) % total;
    visibleCards.push({ idx, offset, car: carCampaigns[idx] });
  }

  const featuredCar = carCampaigns[activeIndex];

  // Preload adjacent featured images for smooth transitions
  useEffect(() => {
    const nextIdx = (activeIndex + 1) % total;
    const prevIdx = (activeIndex - 1 + total) % total;
    [nextIdx, prevIdx].forEach((i) => {
      const img = new Image();
      img.src = carCampaigns[i].featured;
    });
  }, [activeIndex, total]);

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

  const [featuredTouchStart, setFeaturedTouchStart] = useState<number | null>(null);
  const handleFeaturedTouchStart = (e: React.TouchEvent) => setFeaturedTouchStart(e.touches[0].clientX);
  const handleFeaturedTouchEnd = (e: React.TouchEvent) => {
    if (featuredTouchStart === null) return;
    const diff = featuredTouchStart - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      goTo(diff > 0 ? (activeIndex + 1) % total : (activeIndex - 1 + total) % total);
    }
    setFeaturedTouchStart(null);
  };

  const goFeaturedPrev = useCallback(() => {
    goTo((activeIndex - 1 + total) % total);
  }, [activeIndex, total, goTo]);

  const goFeaturedNext = useCallback(() => {
    goTo((activeIndex + 1) % total);
  }, [activeIndex, total, goTo]);

  const MIN_BALANCE = 100;
  const isRestricted = profile?.status === "suspended";
  const isCycleCompleted = (profile as any)?.task_cycle_completed === true;

  // Match Ad handler
  const handleMatchAd = () => {
    if (isRestricted) {
      toast.error("Your account is currently restricted. Please contact support.");
      return;
    }
    if (isCycleCompleted) {
      toast.error("Your task sets are completed. Please contact customer service to renew or upgrade your plan.");
      return;
    }
    const currentBalance = Number(profile?.balance ?? 0);

    if (currentBalance < MIN_BALANCE) {
      toast.error("Minimum balance of $100 required to start tasks.");
      return;
    }
    if (completedCount >= DAILY_LIMIT) {
      toast.error("Daily task limit reached.");
      return;
    }

    // Pick a random car whose totalAmount fits within balance
    const affordable = carCampaigns.filter(c => c.totalAmount <= currentBalance);
    const pool = affordable.length > 0 ? affordable : carCampaigns;
    const car = pool[Math.floor(Math.random() * pool.length)];

    setMatchedCar(car);
    setAssignmentCode(generateAssignmentCode());
    setMatchProgress(0);
    setMatchState("matching");

    // Animate progress bar
    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setMatchProgress(100);
        setTimeout(() => {
          setMatchedAt(new Date());
          setMatchState("matched");
        }, 400);
      } else {
        setMatchProgress(progress);
      }
    }, 200);
  };

  // Promote (submit) handler
  const handlePromote = async () => {
    if (!user || !matchedCar || !profile || submitting) return;
    if (isRestricted) {
      toast.error("Your account is currently restricted. Please contact support.");
      setMatchState("idle");
      setMatchedCar(null);
      return;
    }
    const currentBalance = Number(profile.balance);

    // Validate balance >= 100
    if (currentBalance < MIN_BALANCE) {
      toast.error("Minimum balance of $100 required to start tasks.");
      setMatchState("idle");
      setMatchedCar(null);
      return;
    }

    setSubmitting(true);
    try {
      // Simulate processing (1-3s)
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

      // Call secure server-side RPC
      const { data, error } = await supabase.rpc("complete_task", {
        _car_brand: matchedCar.brand,
        _car_name: matchedCar.name,
        _car_image_url: matchedCar.featured,
        _total_amount: matchedCar.totalAmount,
        _assignment_code: assignmentCode,
      });

      if (error) throw error;

      const result = data as any;
      if (result?.error) {
        if (result.status === "pending") {
          toast.error("Insufficient balance for this task. Record saved as pending.");
        } else {
          toast.error(result.error);
        }
        setMatchState("idle");
        setMatchedCar(null);
        return;
      }

      await refreshProfile();
      setMatchState("idle");
      setMatchedCar(null);
    } catch (e: any) {
      toast.error("Failed to submit: " + e.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div
        className="px-4 py-5 pb-8 min-h-screen relative"
        style={{
          background: "radial-gradient(ellipse at 50% 20%, hsl(var(--primary) / 0.04) 0%, transparent 50%), radial-gradient(ellipse at 80% 80%, hsl(var(--primary) / 0.03) 0%, transparent 40%), linear-gradient(180deg, hsl(var(--background)) 0%, hsl(var(--background) / 0.97) 100%)",
        }}
      >
        {/* Subtle tire track accent */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.03]">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-foreground to-transparent" />
          <div className="absolute top-0 left-[calc(50%-3px)] w-px h-full bg-gradient-to-b from-transparent via-foreground/50 to-transparent" />
          <div className="absolute top-0 left-[calc(50%+3px)] w-px h-full bg-gradient-to-b from-transparent via-foreground/50 to-transparent" />
        </div>
        <div className="relative z-10">
          {/* Header */}
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="glass-card p-4 mb-5">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">Start Promoting</h1>
                <p className="text-[10px] text-muted-foreground/60 mt-0.5">
                  {setProgress.tasksInCurrentSet}/{vipTier.tasksPerSet} tasks
                </p>
              </div>
              <div className="relative px-4 py-1.5">
                <span className="text-[11px] font-bold tracking-[0.18em] uppercase bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">{profile?.vip_level || "Junior"} Promoter</span>
              </div>
            </div>
          </motion.div>

          {/* Balance Cards */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }} className="glass-card p-4">
              <Wallet className="h-4 w-4 text-primary mb-2" strokeWidth={1.5} />
              <div className="text-xl font-bold tabular-nums tracking-tight">{profile?.balance ?? 0} AC</div>
              <span className="text-[10px] text-muted-foreground">Wallet Balance</span>
              <p className="text-[9px] text-muted-foreground/60 mt-1.5 leading-snug">The total balance reflects both the deposited amount and profits earned.</p>
            </motion.div>
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15, duration: 0.5 }} className="glass-card p-4">
              <DollarSign className="h-4 w-4 text-success mb-2" strokeWidth={1.5} />
              <div className="text-xl font-bold tabular-nums tracking-tight">{Number(profile?.advertising_salary ?? 0).toFixed(2)} AC</div>
              <span className="text-[10px] text-muted-foreground">Advertising Salary</span>
              <p className="text-[9px] text-muted-foreground/60 mt-1.5 leading-snug">Fixed balance where there is a mixed product pending in process.</p>
            </motion.div>
          </div>

          {/* 3D Car Carousel */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 0.6 }} className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Campaigns</h2>
              <span className="text-[10px] text-muted-foreground">{total} available</span>
            </div>

            <div
              className="relative h-[340px] md:h-[420px] flex items-center justify-center overflow-hidden"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              style={{ background: "radial-gradient(ellipse at center bottom, hsl(var(--primary) / 0.06) 0%, transparent 70%)" }}
            >
              {visibleCards.map(({ idx, offset, car }) => {
                const style = getCardStyle(offset);
                const isCenter = offset === 0;
                return (
                  <motion.div
                    key={`${idx}-${car.brand}`}
                    className="absolute cursor-pointer"
                    onClick={() => goTo(idx)}
                    animate={{ transform: style.transform, opacity: style.opacity, zIndex: style.zIndex, filter: style.filter }}
                    transition={{ type: "spring", stiffness: 220, damping: 28, mass: 0.9 }}
                    style={{ zIndex: style.zIndex }}
                  >
                    <div className="flex flex-col items-center">
                      <div
                        className="w-40 h-56 sm:w-48 sm:h-64 md:w-44 md:h-60 rounded-2xl overflow-hidden relative"
                        style={{ boxShadow: isCenter ? "0 20px 60px rgba(0,0,0,0.5), 0 0 30px hsl(var(--primary) / 0.12)" : "0 8px 24px rgba(0,0,0,0.35)" }}
                      >
                        <img src={car.image} alt={car.brand} loading="lazy" className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                      </div>
                      <div
                        className="w-36 sm:w-44 md:w-40 h-12 mt-0.5 rounded-b-2xl overflow-hidden opacity-30"
                        style={{ transform: "scaleY(-1) scaleX(0.92)", maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)", WebkitMaskImage: "linear-gradient(to bottom, rgba(0,0,0,0.4), transparent)" }}
                      >
                        <img src={car.image} alt="" className="w-full h-56 sm:h-64 md:h-60 object-cover object-bottom" style={{ filter: "blur(2px)" }} />
                      </div>
                      {isCenter && (
                        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-24 h-4 rounded-full" style={{ background: "radial-gradient(ellipse, hsl(var(--primary) / 0.15) 0%, transparent 70%)" }} />
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            <div className="flex justify-center gap-1 mt-3">
              {carCampaigns.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === activeIndex ? "w-5 h-1.5 bg-primary" : "w-1.5 h-1.5 bg-muted-foreground/30"}`} />
              ))}
            </div>
          </motion.div>

          {/* Featured Car Showcase */}
          <motion.div initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3, duration: 0.5 }} className="mb-6 relative">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold tracking-wide uppercase text-muted-foreground">Showcase</h2>
            </div>

            <div
              className="relative rounded-2xl overflow-hidden bg-white"
              onTouchStart={handleFeaturedTouchStart}
              onTouchEnd={handleFeaturedTouchEnd}
            >

              <div className="relative flex items-center justify-center py-6 md:py-10 overflow-hidden z-10">
                <AnimatePresence initial={false} mode="popLayout">
                  <motion.div
                    key={`showcase-${activeIndex}`}
                    className="relative w-full flex items-center justify-center"
                    style={{ willChange: "transform, opacity" }}
                    initial={{ opacity: 0, x: "30%", scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: "-20%", scale: 0.97 }}
                    transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
                  >
                    <img
                      src={featuredCar.featured}
                      alt={featuredCar.name}
                      className="w-[80%] md:w-[60%] lg:w-[50%] aspect-[2/1] object-contain"
                      style={{ filter: "brightness(1.02) contrast(1.02) saturate(1.05)" }}
                      draggable={false}
                    />
                  </motion.div>
                </AnimatePresence>
              </div>

              <button onClick={goFeaturedPrev} className="absolute left-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-white transition-colors">
                <ChevronLeft className="h-4 w-4 text-foreground/50" />
              </button>
              <button onClick={goFeaturedNext} className="absolute right-2 top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full bg-white/80 backdrop-blur-sm border border-border/30 flex items-center justify-center hover:bg-white transition-colors">
                <ChevronRight className="h-4 w-4 text-foreground/50" />
              </button>
            </div>

            <AnimatePresence mode="wait">
              <motion.p key={`name-${activeIndex}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="text-center text-xs font-medium text-muted-foreground mt-3 tracking-widest uppercase">
                {featuredCar.name}
              </motion.p>
            </AnimatePresence>

            <div className="flex justify-center gap-1 mt-2">
              {carCampaigns.map((_, i) => (
                <button key={i} onClick={() => goTo(i)} className={`rounded-full transition-all duration-300 ${i === activeIndex ? "w-4 h-1 bg-primary/70" : "w-1 h-1 bg-muted-foreground/20"}`} />
              ))}
            </div>
          </motion.div>

          {/* Match Ad Button */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35, duration: 0.5 }} className="mb-6">
            <button
              onClick={handleMatchAd}
              disabled={isRestricted || Number(profile?.balance ?? 0) < MIN_BALANCE || completedCount >= DAILY_LIMIT}
              className="w-full py-4 rounded-full font-semibold text-sm tracking-wide flex items-center justify-center gap-2 btn-press transition-all duration-300 bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-primary"
              style={{ boxShadow: isRestricted ? "none" : "0 4px 20px hsl(var(--primary) / 0.3)" }}
            >
              <Play className="h-4 w-4" fill="currentColor" />
              Match Ad
              <ChevronRight className="h-4 w-4" />
            </button>
          </motion.div>

          {/* Daily Earnings */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4, duration: 0.5 }} className="glass-card p-4 mb-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" strokeWidth={1.5} />
                <span className="text-xs text-muted-foreground">Today Advertising Salary</span>
              </div>
              <span className="text-base font-bold tabular-nums">{todaySalary}</span>
            </div>
          </motion.div>

          {/* Important Notes */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45, duration: 0.5 }} className="glass-card p-5 border border-border/50">
            <h3 className="text-sm font-semibold mb-3">Important Notes</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Clock className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-medium">Support Hours</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Mon – Fri, 9:00 AM – 6:00 PM (UTC)</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Headphones className="h-3.5 w-3.5 text-muted-foreground mt-0.5 flex-shrink-0" strokeWidth={1.5} />
                <div>
                  <p className="text-xs font-medium">Contact Support</p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">Please contact customer support service for further questions.</p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Assignment Submission Modal */}
      <AnimatePresence>
        {(matchState === "matching" || matchState === "matched") && matchedCar && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm"
            onClick={() => { if (matchState === "matched") { setMatchState("idle"); setMatchedCar(null); } }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="w-full max-w-md bg-card rounded-t-3xl p-6 pb-8 relative shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close button */}
              <button
                onClick={() => { setMatchState("idle"); setMatchedCar(null); }}
                className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors"
              >
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <h3 className="text-lg font-semibold text-primary mb-6">Assignment Submission</h3>

              {/* Car Image */}
              <div className="flex justify-center mb-4">
                <img
                  src={matchedCar.featured}
                  alt={matchedCar.name}
                  className="h-28 object-contain"
                />
              </div>

              {/* Car Name */}
              <p className="text-center text-sm font-semibold mb-4 px-4">{matchedCar.name}</p>

              {/* Progress / Slider */}
              <div className="flex justify-center mb-5">
                <div className="w-48 h-8 rounded-full bg-muted/50 border border-border/50 relative overflow-hidden">
                  <motion.div
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/30 to-primary/60 rounded-full"
                    animate={{ width: `${matchProgress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                  <div
                    className="absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-2 border-primary shadow-lg transition-all duration-200"
                    style={{ left: `calc(${Math.min(matchProgress, 95)}% - 12px)` }}
                  />
                </div>
              </div>

              {/* Amount details */}
              <div className="grid grid-cols-2 gap-4 mb-5 border-t border-border/30 pt-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-primary">AC {matchedCar.totalAmount}</p>
                </div>
                <div className="text-center border-l border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Advertising salary</p>
                  <p className="text-lg font-bold text-primary">AC {matchedCar.adSalary}</p>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created At</span>
                  <span className="font-medium text-foreground">
                    {matchedAt ? matchedAt.toISOString().replace('T', ' ').substring(0, 19) : "Matching..."}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assignment Code</span>
                  <span className="font-mono text-xs text-primary">{assignmentCode}</span>
                </div>
              </div>

              {/* Promote Button */}
              <button
                onClick={handlePromote}
                disabled={matchState !== "matched" || submitting}
                className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.3)" }}
              >
                {submitting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</>
                ) : matchState === "matching" ? (
                  "Matching..."
                ) : (
                  "Promote"
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Starting;
