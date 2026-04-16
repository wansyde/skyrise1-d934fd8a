import AppLayout from "@/components/layout/AppLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Wallet, DollarSign, Play, ChevronRight, ChevronLeft, X, Loader2, Check, Headphones, Clock, Star } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { getVipTier, getSetProgress, getTaskProfit, generateRandomTaskValue, resetTaskValueHistory } from "@/lib/vip-config";
import { useWhatsAppNumber } from "@/hooks/useWhatsAppNumber";
import { useQuery } from "@tanstack/react-query";
import { getCarImage } from "@/lib/car-images";
import { useNavigate } from "react-router-dom";

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

import audiA1Featured from "@/assets/cars/featured/audi-a1.webp";
import audiA2Featured from "@/assets/cars/featured/audi-a2.webp";
import astonMartinGreenFeatured from "@/assets/cars/featured/aston-martin-green.webp";
import astonMartinYellowFeatured from "@/assets/cars/featured/aston-martin-yellow.webp";
import maybachFeatured from "@/assets/cars/featured/maybach.webp";
import mercedesRedFeatured from "@/assets/cars/featured/mercedes-red.webp";
import bmwBlueFeatured from "@/assets/cars/featured/bmw-blue.webp";
import bmwPurpleFeatured from "@/assets/cars/featured/bmw-purple.webp";
import ferrariYellowFeatured from "@/assets/cars/featured/ferrari-yellow.webp";
import bentleyWhiteFeatured from "@/assets/cars/featured/bentley-white.webp";
import bentleyBlueFeatured from "@/assets/cars/featured/bentley-blue.webp";
import fordMustangFeatured from "@/assets/cars/featured/ford-mustang.webp";
import ferrariRomaFeatured from "@/assets/cars/featured/ferrari-roma.webp";
import cadillacCt5Featured from "@/assets/cars/featured/cadillac-ct5.webp";
import rangeRoverFeatured from "@/assets/cars/featured/range-rover.webp";
import lexusLcFeatured from "@/assets/cars/featured/lexus-lc.webp";
import mclarenArturaFeatured from "@/assets/cars/featured/mclaren-artura.webp";
import mclarenGtFeatured from "@/assets/cars/featured/mclaren-gt.webp";
import lexusEsFeatured from "@/assets/cars/featured/lexus-es.webp";
import teslaModelSFeatured from "@/assets/cars/featured/tesla-model-s.webp";

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
  const { url: whatsappUrl } = useWhatsAppNumber();
  const navigate = useNavigate();
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

  // AAA state
  const [isAAATask, setIsAAATask] = useState(false);
  const [aaaAssignment, setAaaAssignment] = useState<any>(null);
  const [aaaCars, setAaaCars] = useState<string[]>([]);

  // Fetch active AAA assignments for this user
  const { data: aaaAssignments = [] } = useQuery({
    queryKey: ["user-aaa-assignments", user?.id],
    enabled: !!user,
    staleTime: 10000,
    queryFn: async () => {
      const { data } = await supabase
        .from("aaa_assignments" as any)
        .select("id,user_id,set_number,task_position,status,car_names,car_prices,car_commissions,total_assignment_amount,profit_percentage,commission_multiplier")
        .eq("status", "active")
        .order("task_position", { ascending: true });
      return (data || []) as any[];
    },
  });

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
  const currentUnlockedSet = (profile as any)?.current_unlocked_set ?? 1;
  const maxAllowedTasks = currentUnlockedSet * vipTier.tasksPerSet;
  const isSetLocked = completedCount >= maxAllowedTasks && completedCount < DAILY_LIMIT;

  const userBalance = Number(profile?.balance ?? 0);
  const [matchedTaskValue, setMatchedTaskValue] = useState<number | null>(null);
  const [previewReward, setPreviewReward] = useState<number | null>(null);
  const taskValue = matchedTaskValue ?? 0;
  const estimatedProfit = previewReward ?? 0;

  const userName = profile?.full_name || profile?.username || "User";
  const total = carCampaigns.length;

  useEffect(() => {
    if (profile) {
      setCompletedCount(profile.tasks_completed_today || 0);
    }
  }, [profile]);

  // Reset anti-repeat tracker when balance or VIP level changes
  useEffect(() => {
    resetTaskValueHistory();
  }, [userBalance, profile?.vip_level]);

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

  // Showcase matches the active carousel card exactly
  const featuredCar = carCampaigns[activeIndex];

  const stripOffset = -(activeIndex * cardStep);

  // Preload ALL car images upfront so nothing lags
  useEffect(() => {
    carCampaigns.forEach((car) => {
      const img1 = new Image();
      img1.src = car.image;
      const img2 = new Image();
      img2.src = car.featured;
    });
  }, []);

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
    // Steve is exempt from time restrictions
    if (user?.id === '4c1d14e8-45a6-416b-866c-6b6fd8aab39e') return true;
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
    if (currentBalance < MIN_BALANCE) { toast.error("Minimum 100 USDC required"); return; }
    if (completedCount >= DAILY_LIMIT) { toast.error("Daily limit reached"); return; }
    if (isSetLocked) { toast.error("Set completed. Contact support to unlock next set."); return; }

    // Check if next task is an AAA task (set-aware)
    const nextTaskNumber = completedCount + 1;
    const tasksPerSet = vipTier.tasksPerSet; // 40
    const currentSet = Math.floor(completedCount / tasksPerSet) + 1; // 1, 2, or 3
    const positionInSet = (completedCount % tasksPerSet) + 1; // 1–40
    const matchingAAA = aaaAssignments.find((a: any) =>
      a.status === "active" &&
      (a.user_id === null || a.user_id === user?.id) &&
      (a.set_number || 1) === currentSet &&
      a.task_position === positionInSet
    );

    if (matchingAAA) {
      // AAA Task
      setIsAAATask(true);
      setAaaAssignment(matchingAAA);
      setAaaCars(matchingAAA.car_names || []);
      setMatchedCar(carCampaigns[0]); // placeholder
      setMatchedTaskValue(matchingAAA.total_assignment_amount);
      const profitPct = matchingAAA.profit_percentage || 0.05;
      setPreviewReward(Math.round(matchingAAA.total_assignment_amount * profitPct * 100) / 100);
      setAssignmentCode(generateAssignmentCode());
      setMatchProgress(0);
      setMatchState("matching");

    let progress = 0;
      const interval = setInterval(() => {
        progress += Math.random() * 25 + 15;
        if (progress >= 100) {
          progress = 100;
          clearInterval(interval);
          setMatchProgress(100);
          setTimeout(() => { setMatchedAt(new Date()); setMatchState("matched"); }, 200);
        } else {
          setMatchProgress(progress);
        }
      }, 120);
      return;
    }

    // Regular task
    setIsAAATask(false);
    setAaaAssignment(null);
    setAaaCars([]);

    const affordable = carCampaigns.filter(c => c.totalAmount <= currentBalance);
    const pool = affordable.length > 0 ? affordable : carCampaigns;
    const car = pool[Math.floor(Math.random() * pool.length)];

    setMatchedCar(car);
    setAssignmentCode(generateAssignmentCode());
    setMatchProgress(0);
    setMatchState("matching");
    setMatchedTaskValue(null); setPreviewReward(null);
    setPreviewReward(null);

    // Call preview_task to get exact backend reward
    const fetchPreview = async () => {
      try {
        const dummyAmount = generateRandomTaskValue(currentBalance, profile?.vip_level);
        const { data: previewData } = await supabase.rpc("preview_task" as any, { _total_amount: dummyAmount });
        if (previewData && !previewData.error) {
          setMatchedTaskValue(Number(previewData.task_value));
          setPreviewReward(Number(previewData.reward));
        } else {
          // No fallback — show 0 until server responds
          setMatchedTaskValue(dummyAmount);
          setPreviewReward(0);
        }
      } catch {
        const fallback = generateRandomTaskValue(currentBalance, profile?.vip_level);
        setMatchedTaskValue(fallback);
        setPreviewReward(0);
      }
    };
    fetchPreview();

    let progress = 0;
    const interval = setInterval(() => {
      progress += Math.random() * 25 + 15;
      if (progress >= 100) {
        progress = 100;
        clearInterval(interval);
        setMatchProgress(100);
        setTimeout(() => { setMatchedAt(new Date()); setMatchState("matched"); }, 200);
      } else {
        setMatchProgress(progress);
      }
    }, 120);
  };

  const isProcessingRef = useRef(false);

  const handlePromote = async () => {
    if (!user || !matchedCar || !profile || submitting || isProcessingRef.current) return;
    if (isRestricted) { toast.error("Account restricted"); setMatchState("idle"); setMatchedCar(null); setMatchedTaskValue(null); setPreviewReward(null); return; }

    isProcessingRef.current = true;
    setSubmitting(true);
    try {
      if (isAAATask && aaaAssignment) {
        // AAA task submission - per-car processing
        const { data, error } = await supabase.rpc("complete_aaa_task" as any, {
          _assignment_id: aaaAssignment.id,
          _car_names: aaaCars,
          _total_amount: aaaAssignment.total_assignment_amount,
        });
        if (error) throw error;
        const result = data as any;
        if (result?.error) {
          toast.error(result.error);
          setMatchState("idle"); setMatchedCar(null); setMatchedTaskValue(null); setPreviewReward(null); setIsAAATask(false); return;
        }
        setCompletedCount(prev => prev + 1);
        await refreshProfile();
        if (!result.all_completed) {
          toast.error("Some cars could not be completed due to insufficient balance. Check Records → Pending for details.");
          setMatchState("idle"); setMatchedCar(null); setMatchedTaskValue(null); setPreviewReward(null); setIsAAATask(false);
          setTimeout(() => navigate("/app/records", { state: { tab: "pending" } }), 1500);
        } else {
          const multiplierText = result.multiplier > 1 ? ` (×${result.multiplier})` : '';
          console.log("AAA completed — raw:", result.raw_commission, "multiplier:", result.multiplier, "final:", result.total_commission, "new_balance:", result.new_balance);
          toast.success(`AAA assignment completed${multiplierText}. Earnings of ${result.total_commission} USDC added to your balance.`);
          setMatchState("submitted");
          setTimeout(() => { setMatchState("idle"); setMatchedCar(null); setMatchedTaskValue(null); setPreviewReward(null); setIsAAATask(false); }, 1000);
        }
      } else {
        // Regular task
        if (Number(profile.balance) < MIN_BALANCE) { toast.error("Minimum 100 USDC required"); setMatchState("idle"); setMatchedCar(null); setMatchedTaskValue(null); setPreviewReward(null); return; }
        const { data, error } = await supabase.rpc("complete_task", {
          _car_brand: matchedCar.brand,
          _car_name: matchedCar.name,
          _car_image_url: matchedCar.featured,
          _total_amount: taskValue,
          _assignment_code: assignmentCode,
        });
        if (error) throw error;
        const result = data as any;
        if (result?.error) {
          toast.error(result.error);
          setMatchState("idle"); setMatchedCar(null); setMatchedTaskValue(null); setPreviewReward(null); return;
        }
        setCompletedCount(prev => prev + 1);
        await refreshProfile();
        setMatchState("submitted");
        setTimeout(() => { setMatchState("idle"); setMatchedCar(null); setMatchedTaskValue(null); setPreviewReward(null); }, 1000);
      }
    } catch (e: any) {
      console.error("Task submission error:", e);
      toast.error(e?.message || "Submission failed. Please try again.");
    } finally {
      setSubmitting(false);
      isProcessingRef.current = false;
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
              <p className={`text-lg font-bold font-[Montserrat] tabular-nums ${Number(profile?.balance ?? 0) < 0 ? 'text-destructive' : 'text-success'}`}>{Number(profile?.balance ?? 0) >= 0 ? '+' : ''}{Number(profile?.balance ?? 0).toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground font-medium">USDC</p>
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
              <p className="text-lg font-bold font-[Montserrat] tabular-nums text-success">+{Number(profile?.advertising_salary ?? 0).toFixed(2)}</p>
              <p className="text-[10px] text-muted-foreground font-medium">USDC</p>
            </div>
          </div>
        </div>

        {/* Start Promoting Header with task count */}
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-bold font-[Montserrat] tracking-tight text-foreground">Start Promoting</h2>
          <span className="text-base font-bold font-[Montserrat] tabular-nums text-success">
            {isSetLocked || isCycleCompleted ? vipTier.tasksPerSet : setProgress.tasksInCurrentSet}/{vipTier.tasksPerSet}
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
              style={{ gap: CARD_GAP, top: 0, willChange: "transform" }}
              animate={{ x: stripOffset }}
              transition={{ duration: 0.5, ease: [0.32, 0.72, 0, 1] }}
            >
              {carCampaigns.map((car, i) => {
                const visibleCenter = activeIndex + (visibleCount - 1) / 2;
                const distFromCenter = Math.abs(i - visibleCenter);
                const maxDist = (visibleCount - 1) / 2;
                const normalizedDist = Math.min(distFromCenter / maxDist, 1);
                const curveY = (1 - normalizedDist * normalizedDist) * 14;
                const rotateY = (i - visibleCenter) * 3;
                const scale = 1 - normalizedDist * 0.06;

                return (
                  <div
                    key={i}
                    className="flex-shrink-0 rounded-xl overflow-hidden cursor-pointer"
                    style={{
                      width: cardWidth,
                      height: cardWidth * 1.3,
                      boxShadow: i === activeIndex
                        ? "0 8px 28px rgba(0,0,0,0.15)"
                        : "0 4px 16px rgba(0,0,0,0.08)",
                      transform: `perspective(800px) translateY(${curveY}px) rotateY(${rotateY}deg) scale(${scale})`,
                      transition: "transform 0.5s cubic-bezier(0.32,0.72,0,1), box-shadow 0.5s ease",
                      willChange: "transform",
                    }}
                    onClick={() => goTo(i)}
                  >
                    <img
                      src={car.image}
                      alt={car.brand}
                      loading="eager"
                      decoding="async"
                      className="w-full h-full object-cover"
                    />
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
            <div className="relative flex items-center justify-center py-3 overflow-hidden">
              <AnimatePresence initial={false} mode="popLayout">
                <motion.div
                  key={`showcase-${activeIndex}`}
                  className="relative w-full flex items-center justify-center"
                  style={{ willChange: "transform, opacity" }}
                  initial={{ opacity: 0, x: "20%", scale: 0.95 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: "-15%", scale: 0.97 }}
                  transition={{
                    duration: 0.35,
                    ease: [0.32, 0.72, 0, 1],
                    opacity: { duration: 0.25 },
                  }}
                >
                  <img
                    src={featuredCar.featured}
                    alt={featuredCar.name}
                    className="w-[85%] md:w-[65%] lg:w-[55%] aspect-[2/1] object-contain"
                    style={{
                      filter: "brightness(1.03) contrast(1.03) saturate(1.08)",
                    }}
                    draggable={false}
                    loading="eager"
                    decoding="async"
                    width={1536}
                    height={768}
                  />
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        </div>

        {/* Ad Match Button - CRITICAL: always visible */}
        <div className="mb-4">
          {(isCycleCompleted || isSetLocked) ? (
            <div className="rounded-2xl bg-card border border-border p-4 text-center space-y-2.5">
              <p className="text-sm font-semibold text-foreground">Task sets completed</p>
              <p className="text-xs text-muted-foreground">Contact support to renew or upgrade.</p>
              <a
                href={whatsappUrl || "#"}
                target={whatsappUrl ? "_blank" : undefined}
                rel={whatsappUrl ? "noopener noreferrer" : undefined}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-semibold tracking-wide bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
              >
                <Headphones className="h-3.5 w-3.5" />
                Contact Support
              </a>
            </div>
          ) : (
            <motion.button
              onClick={handleMatchAd}
              disabled={isRestricted || userBalance < MIN_BALANCE || completedCount >= DAILY_LIMIT}
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

              <h3 className="text-lg font-semibold text-primary mb-6 font-[Montserrat]">
                {isAAATask ? (
                  <span className="flex items-center gap-2">
                    <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                    Automotive Alliance Assignment
                  </span>
                ) : "Assignment Submission"}
              </h3>

              {isAAATask ? (
                <>
                  <div className="flex justify-center mb-4">
                    <img src={matchedCar.featured} alt={matchedCar.name} className="h-28 object-contain" />
                  </div>
                  <p className="text-center text-sm font-semibold mb-4 px-4">{matchedCar.name}</p>
                </>
              ) : (
                <>
                  <div className="flex justify-center mb-4">
                    <img src={matchedCar.featured} alt={matchedCar.name} className="h-28 object-contain" />
                  </div>
                  <p className="text-center text-sm font-semibold mb-4 px-4">{matchedCar.name}</p>
                </>
              )}

              <div className="flex justify-center mb-5">
                <div className="w-48 h-8 rounded-full bg-muted/50 border border-border/50 relative overflow-hidden">
                  <motion.div className="absolute inset-y-0 left-0 bg-gradient-to-r from-primary/30 to-primary/60 rounded-full" animate={{ width: `${matchProgress}%` }} transition={{ duration: 0.2 }} />
                  <div className="absolute top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-white border-2 border-primary shadow-lg transition-all duration-200" style={{ left: `calc(${Math.min(matchProgress, 95)}% - 12px)` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-5 border-t border-border/30 pt-4">
                <div className="text-center">
                  <p className="text-xs text-muted-foreground mb-1">Total Amount</p>
                  <p className="text-lg font-bold text-primary font-[Montserrat]">{taskValue.toFixed(2)} USDC</p>
                </div>
                <div className="text-center border-l border-border/30">
                  <p className="text-xs text-muted-foreground mb-1">Advertising salary</p>
                  <p className="text-lg font-bold text-primary font-[Montserrat]">{estimatedProfit.toFixed(2)} USDC</p>
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
