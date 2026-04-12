import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, DollarSign, Play, ChevronRight, ChevronLeft, X, Loader2, Check, Headphones, Clock } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getVipTier, getSetProgress, getDynamicPercent, getTaskValue } from "@/lib/vip-config";

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

const CARD_GAP = 8;

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

type MatchState = "idle" | "matching" | "matched" | "submitted";

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
  const carouselRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  useEffect(() => {
    const measure = () => {
      if (carouselRef.current) setContainerWidth(carouselRef.current.offsetWidth);
    };
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  const visibleCount = containerWidth > 0 ? (containerWidth < 480 ? 4 : containerWidth < 768 ? 5 : 7) : 4;
  const cardWidth = containerWidth > 0 ? (containerWidth - (visibleCount - 1) * CARD_GAP) / visibleCount : 80;
  const cardStep = cardWidth + CARD_GAP;

  const vipTier = useMemo(() => getVipTier(profile?.vip_level || "Junior"), [profile?.vip_level]);
  const DAILY_LIMIT = vipTier.totalTasks;
  const setProgress = useMemo(() => getSetProgress(completedCount, vipTier), [completedCount, vipTier]);

  const userName = profile?.full_name || profile?.username || "User";
  const total = carCampaigns.length;

  useEffect(() => {
    if (profile) {
      setCompletedCount(profile.tasks_completed_today || 0);
    }
  }, [profile]);

  // Auto-scroll
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

  // Showcase = rightmost visible card
  const half = Math.floor(visibleCount / 2);
  const showcaseIndex = ((activeIndex + half) % total + total) % total;
  const featuredCar = carCampaigns[showcaseIndex];

  const stripOffset = -(activeIndex * cardStep);

  // Preload adjacent featured images
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

  const goFeaturedPrev = useCallback(() => goTo((activeIndex - 1 + total) % total), [activeIndex, total, goTo]);
  const goFeaturedNext = useCallback(() => goTo((activeIndex + 1) % total), [activeIndex, total, goTo]);

  const MIN_BALANCE = 100;
  const isRestricted = profile?.status === "suspended";
  const isCycleCompleted = (profile as any)?.task_cycle_completed === true;

  const isWithinWorkingHours = () => {
    const now = new Date();
    const et = new Date(now.toLocaleString("en-US", { timeZone: "America/New_York" }));
    const hour = et.getHours();
    return hour >= 10 && hour < 22;
  };

  const handleMatchAd = () => {
    if (!isWithinWorkingHours()) { toast.error("Promotions are only available between 10:00 AM and 10:00 PM (ET)"); return; }
    if (isRestricted) { toast.error("Account restricted"); return; }
    if (isCycleCompleted) { toast.error("Task cycle completed"); return; }
    const currentBalance = Number(profile?.balance ?? 0);
    if (currentBalance < MIN_BALANCE) { toast.error("Minimum $100 required"); return; }
    if (completedCount >= DAILY_LIMIT) { toast.error("Daily limit reached"); return; }

    const affordable = carCampaigns.filter(c => c.totalAmount <= currentBalance);
    const pool = affordable.length > 0 ? affordable : carCampaigns;
    const car = pool[Math.floor(Math.random() * pool.length)];

    setMatchedCar(car);
    setAssignmentCode(generateAssignmentCode());
    setMatchProgress(0);
    setMatchState("matching");

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 15 + 5;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setMatchProgress(100);
        setTimeout(() => { setMatchedAt(new Date()); setMatchState("matched"); }, 400);
      } else {
        setMatchProgress(progress);
      }
    }, 200);
  };

  const handlePromote = async () => {
    if (!user || !matchedCar || !profile || submitting) return;
    if (isRestricted) { toast.error("Account restricted"); setMatchState("idle"); setMatchedCar(null); return; }
    if (Number(profile.balance) < MIN_BALANCE) { toast.error("Minimum $100 required"); setMatchState("idle"); setMatchedCar(null); return; }

    setSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 500));
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
        if (result.status === "pending") toast.error("Insufficient balance");
        else toast.error(result.error);
        setMatchState("idle"); setMatchedCar(null); return;
      }
      await refreshProfile();
      setMatchState("submitted");
      setTimeout(() => { setMatchState("idle"); setMatchedCar(null); }, 1500);
    } catch (e: any) {
      toast.error("Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <div className="px-4 pt-3 pb-8 min-h-[calc(100dvh-120px)] flex flex-col">
        {/* User Greeting + VIP Badge */}
        <div className="flex items-center gap-3 mb-4">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <span className="text-sm font-bold text-primary">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-base font-bold font-[Montserrat] tracking-tight truncate">Hi, {userName}</p>
          </div>
          <span className="px-3 py-1.5 rounded-full text-[11px] font-bold tracking-wide bg-primary/10 text-primary whitespace-nowrap">
            {profile?.vip_level || "Junior"} Promoter
          </span>
        </div>

        {/* Balance Cards - full width stacked like reference */}
        <div className="space-y-2.5 mb-4">
          <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4" style={{ boxShadow: "0 2px 12px hsl(var(--foreground) / 0.04)" }}>
            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <Wallet className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold font-[Montserrat]">Wallet Balance</p>
              <p className="text-[11px] text-muted-foreground leading-snug">The total balance reflects both the deposited amount and profits earned</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold font-[Montserrat] tabular-nums text-primary">{Number(profile?.balance ?? 0).toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground font-medium">AC</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl bg-card border border-border p-4" style={{ boxShadow: "0 2px 12px hsl(var(--foreground) / 0.04)" }}>
            <div className="h-10 w-10 rounded-xl bg-primary/15 flex items-center justify-center flex-shrink-0">
              <DollarSign className="h-5 w-5 text-primary" strokeWidth={1.5} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold font-[Montserrat]">Advertising Salary</p>
              <p className="text-[11px] text-muted-foreground leading-snug">Advertising salary</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-lg font-bold font-[Montserrat] tabular-nums text-primary">{Number(profile?.advertising_salary ?? 0).toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground font-medium">AC</p>
            </div>
          </div>
        </div>

        {/* Start Promoting Header with task count */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold font-[Montserrat] tracking-tight text-foreground">Start Promoting</h2>
          <span className="text-base font-bold font-[Montserrat] tabular-nums text-primary">
            {setProgress.tasksInCurrentSet}/{vipTier.tasksPerSet}
          </span>
        </div>

        {/* Car Carousel Strip */}
        <div className="mb-3">
          <div
            ref={carouselRef}
            className="relative overflow-hidden rounded-xl"
            style={{ height: cardWidth * 1.3 }}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
          >
            <motion.div
              className="flex absolute"
              style={{ gap: CARD_GAP, top: 0 }}
              animate={{ x: stripOffset }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              {carCampaigns.map((car, i) => {
                const visibleCenter = activeIndex + (visibleCount - 1) / 2;
                const distFromCenter = Math.abs(i - visibleCenter);
                const maxDist = (visibleCount - 1) / 2;
                const normalizedDist = Math.min(distFromCenter / maxDist, 1);
                const curveY = (1 - normalizedDist * normalizedDist) * 14;
                const rotateY = (i - visibleCenter) * 3;

                return (
                  <div
                    key={i}
                    className="flex-shrink-0 rounded-lg overflow-hidden cursor-pointer"
                    style={{
                      width: cardWidth,
                      height: cardWidth * 1.3,
                      boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
                      transform: `perspective(800px) translateY(${curveY}px) rotateY(${rotateY}deg)`,
                      transition: "transform 0.7s ease",
                    }}
                    onClick={() => goTo(i)}
                  >
                    <img src={car.image} alt={car.brand} loading="lazy" className="w-full h-full object-cover" />
                  </div>
                );
              })}
            </motion.div>
          </div>
        </div>

        {/* Featured Car Showcase */}
        <div className="mb-3 relative">
          <div
            className="relative rounded-2xl overflow-hidden bg-card"
            onTouchStart={handleFeaturedTouchStart}
            onTouchEnd={handleFeaturedTouchEnd}
          >
            <div className="relative flex items-center justify-center py-4 overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={`showcase-${activeIndex}`}
                  className="relative w-full flex items-center justify-center"
                  style={{ willChange: "transform, opacity" }}
                  initial={{ opacity: 0, x: "25%", scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: "-20%", scale: 0.97 }}
                  transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
                >
                  <img
                    src={featuredCar.featured}
                    alt={featuredCar.name}
                    className="w-[85%] aspect-[2/1] object-contain drop-shadow-lg"
                    style={{ filter: "brightness(1.02) contrast(1.02) saturate(1.05)" }}
                    draggable={false}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

            <button onClick={goFeaturedPrev} className="absolute left-1.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm border border-border/30 flex items-center justify-center">
              <ChevronLeft className="h-3.5 w-3.5 text-foreground/50" />
            </button>
            <button onClick={goFeaturedNext} className="absolute right-1.5 top-1/2 -translate-y-1/2 z-10 h-7 w-7 rounded-full bg-background/80 backdrop-blur-sm border border-border/30 flex items-center justify-center">
              <ChevronRight className="h-3.5 w-3.5 text-foreground/50" />
            </button>
          </div>
        </div>

        {/* Ad Match Button - CRITICAL: always visible */}
        <div className="mb-4">
          {isCycleCompleted ? (
            <div className="rounded-2xl bg-card border border-border p-4 text-center space-y-2.5">
              <p className="text-sm font-semibold text-foreground">Task sets completed</p>
              <p className="text-xs text-muted-foreground">Contact support to renew or upgrade.</p>
              <a
                href="#"
                onClick={(e) => e.preventDefault()}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Headphones className="h-3.5 w-3.5" />
                Contact Support
              </a>
            </div>
          ) : (
            <motion.button
              onClick={handleMatchAd}
              disabled={isRestricted || Number(profile?.balance ?? 0) < MIN_BALANCE || completedCount >= DAILY_LIMIT}
              whileTap={{ scale: 0.97 }}
              className="w-full py-4 rounded-2xl font-bold text-base tracking-wide flex items-center justify-center gap-2.5 transition-all duration-200 bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed font-[Montserrat]"
              style={{ boxShadow: "0 6px 24px hsl(var(--primary) / 0.4), 0 0 40px hsl(var(--primary) / 0.15)" }}
            >
              Ad Match ({setProgress.tasksInCurrentSet}/{vipTier.tasksPerSet})
            </motion.button>
          )}
        </div>

        {/* Important Notes */}
        <div className="rounded-2xl bg-card border border-border p-4 mt-auto" style={{ boxShadow: "0 2px 12px hsl(var(--foreground) / 0.04)" }}>
          <h3 className="text-sm font-semibold mb-2 font-[Montserrat]">Important Notes</h3>
          <div className="space-y-2">
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
                <p className="text-[11px] text-muted-foreground leading-relaxed">Please contact customer support for further questions.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Assignment Submission Modal */}
      <AnimatePresence>
        {(matchState === "matching" || matchState === "matched" || matchState === "submitted") && matchedCar && (
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
              <AnimatePresence>
                {matchState === "submitted" && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    className="absolute inset-0 z-10 flex items-center justify-center rounded-t-3xl bg-card/95 backdrop-blur-sm"
                  >
                    <div className="flex flex-col items-center gap-3">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", damping: 12, stiffness: 200, delay: 0.1 }} className="h-16 w-16 rounded-full bg-primary/15 flex items-center justify-center">
                        <Check className="h-8 w-8 text-primary" strokeWidth={2.5} />
                      </motion.div>
                      <motion.p initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="text-lg font-semibold tracking-tight">Submitted</motion.p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <button onClick={() => { setMatchState("idle"); setMatchedCar(null); }} className="absolute top-4 right-4 h-8 w-8 rounded-full bg-muted/50 flex items-center justify-center hover:bg-muted transition-colors">
                <X className="h-4 w-4 text-muted-foreground" />
              </button>

              <h3 className="text-lg font-semibold text-primary mb-6 font-[Montserrat]">Assignment Submission</h3>

              <div className="flex justify-center mb-4">
                <img src={matchedCar.featured} alt={matchedCar.name} className="h-28 object-contain" />
              </div>

              <p className="text-center text-sm font-semibold mb-4 px-4">{matchedCar.name}</p>

              <div className="flex justify-center mb-5">
                <div className="w-48 h-8 rounded-full bg-muted/50 border border-border/50 relative overflow-hidden">
                  <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/30 to-primary/60 rounded-full" animate={{ width: `${matchProgress}%` }} transition={{ duration: 0.2 }} />
                  <div className="absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-2 border-primary shadow-lg transition-all duration-200" style={{ left: `calc(${Math.min(matchProgress, 95)}% - 12px)` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 border-t border-border/30 pt-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-primary font-[Montserrat]">AC {matchedCar.totalAmount}</p>
                </div>
                <div className="text-center border-l border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Advertising salary</p>
                  <p className="text-lg font-bold text-primary font-[Montserrat]">AC {matchedCar.adSalary}</p>
                </div>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Created At</span>
                  <span className="font-medium">{matchedAt ? matchedAt.toISOString().replace('T', ' ').substring(0, 19) : "Matching..."}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Assignment Code</span>
                  <span className="font-mono text-xs text-primary">{assignmentCode}</span>
                </div>
              </div>

              <button
                onClick={handlePromote}
                disabled={matchState !== "matched" || submitting}
                className="w-full py-3.5 rounded-xl font-semibold text-sm tracking-wide flex items-center justify-center gap-2 transition-all duration-300 bg-primary text-primary-foreground disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90"
                style={{ boxShadow: "0 4px 16px hsl(var(--primary) / 0.3)" }}
              >
                {submitting ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting...</> : matchState === "matching" ? "Matching..." : "Promote"}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </AppLayout>
  );
};

export default Starting;
