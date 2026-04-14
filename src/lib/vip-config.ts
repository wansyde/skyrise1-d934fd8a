export interface VipTier {
  level: string;
  tasksPerSet: number;
  totalSets: number;
  totalTasks: number;
  rewardPercent: number;
  minBalance: number;
  /** Per-set target profit ranges: [set1, set2, set3] */
  setTargets: [min: number, max: number][];
}

export const VIP_TIERS: Record<string, VipTier> = {
  Junior: {
    level: "Junior", tasksPerSet: 40, totalSets: 3, totalTasks: 120,
    rewardPercent: 0.004, minBalance: 100,
    setTargets: [[8, 10], [7, 9], [8, 10]],
  },
  Professional: {
    level: "Professional", tasksPerSet: 45, totalSets: 3, totalTasks: 135,
    rewardPercent: 0.006, minBalance: 500,
    setTargets: [[25, 30], [23, 28], [25, 30]],
  },
  Expert: {
    level: "Expert", tasksPerSet: 50, totalSets: 3, totalTasks: 150,
    rewardPercent: 0.008, minBalance: 1500,
    setTargets: [[60, 80], [55, 75], [60, 80]],
  },
  Elite: {
    level: "Elite", tasksPerSet: 55, totalSets: 3, totalTasks: 165,
    rewardPercent: 0.010, minBalance: 5000,
    setTargets: [[150, 250], [140, 230], [150, 250]],
  },
};

export const getVipTier = (level: string): VipTier => {
  return VIP_TIERS[level] || VIP_TIERS.Junior;
};

export const VIP_LEVELS = Object.keys(VIP_TIERS);

/** Backward-compat helpers */
export const getTargetProfitMin = (tier: VipTier, setIndex = 0): number =>
  tier.setTargets[Math.min(setIndex, tier.setTargets.length - 1)][0];
export const getTargetProfitMax = (tier: VipTier, setIndex = 0): number =>
  tier.setTargets[Math.min(setIndex, tier.setTargets.length - 1)][1];

/** Profit per task = taskValue × tier percentage */
export const getTaskProfit = (taskValue: number, tier: VipTier): number => {
  return Math.round(taskValue * tier.rewardPercent * 100) / 100;
};

// Track last generated values to avoid repetition
let lastValues: number[] = [];

/**
 * Generate a wide-range random task value with anti-clustering.
 *
 * Range: MIN = max(30, 0.4 × B) … MAX = 0.98 × B
 * Weighted band distribution: LOW 30%, MID 40%, HIGH 30%
 * Avoids repeating values within ±5 of recent tasks.
 *
 * The caller should use getSetProfitTarget() and adjust the final task(s)
 * to keep total profit within the per-set target range.
 */
export const generateRandomTaskValue = (
  balance: number,
  tierLevel?: string,
  _setIndex?: number,
): number => {
  const isElite = tierLevel === 'Elite';
  const isExpert = tierLevel === 'Expert';
  const isPro = tierLevel === 'Professional';

  // Tier-specific range floors
  const rangeMin = isElite
    ? Math.max(500, 0.25 * balance)
    : isExpert
      ? Math.max(300, 0.30 * balance)
      : isPro
        ? Math.max(100, 0.35 * balance)
        : Math.max(30, 0.4 * balance);
  const rangeMax = (isPro || isExpert || isElite) ? 0.95 * balance : 0.98 * balance;

  if (rangeMax <= rangeMin) {
    return Math.round(rangeMin * 100) / 100;
  }

  // Zone boundaries per tier
  let lowMin: number, lowMax: number, midMin: number, midMax: number, highMin: number, highMax: number;
  if (isElite) {
    lowMin = rangeMin; lowMax = 0.45 * balance;
    midMin = 0.45 * balance; midMax = 0.70 * balance;
    highMin = 0.70 * balance; highMax = rangeMax;
  } else if (isExpert) {
    lowMin = rangeMin; lowMax = 0.50 * balance;
    midMin = 0.50 * balance; midMax = 0.75 * balance;
    highMin = 0.75 * balance; highMax = rangeMax;
  } else if (isPro) {
    lowMin = rangeMin; lowMax = 0.55 * balance;
    midMin = 0.55 * balance; midMax = 0.75 * balance;
    highMin = 0.75 * balance; highMax = rangeMax;
  } else {
    lowMin = rangeMin; lowMax = 0.55 * balance;
    midMin = 0.55 * balance; midMax = 0.75 * balance;
    highMin = 0.75 * balance; highMax = rangeMax;
  }

  // Weighted zone selection – all tiers: 30/40/30
  const roll = Math.random();
  let bandMin: number, bandMax: number;
  if (roll < 0.3) {
    bandMin = lowMin; bandMax = lowMax;
  } else if (roll < 0.7) {
    bandMin = midMin; bandMax = midMax;
  } else {
    bandMin = highMin; bandMax = highMax;
  }

  // Generate with jitter + enhanced randomness
  let taskValue: number;
  let attempts = 0;
  // Tier-scaled duplicate threshold: small % of balance ensures no near-duplicates
  const antiRepeatThreshold = isElite
    ? Math.max(100, balance * 0.02)
    : isExpert
      ? Math.max(50, balance * 0.015)
      : isPro
        ? Math.max(20, balance * 0.01)
        : Math.max(5, balance * 0.005);

  do {
    const r1 = Math.random();
    const r2 = Math.random();
    const pick = r1 * 0.6 + r2 * 0.4;
    taskValue = bandMin + pick * (bandMax - bandMin);

    // Layer 1: Tier-scaled jitter
    taskValue += (Math.random() - 0.5) * (isElite ? 15 : isExpert ? 8 : isPro ? 4 : 2);

    // Layer 2: Decimal injection (0.11 → 0.97)
    taskValue += 0.11 + Math.random() * 0.86;

    // Layer 3: Micro variation (×0.985 → ×1.015)
    taskValue *= 0.985 + Math.random() * 0.03;

    attempts++;
  } while (
    attempts < 15 &&
    lastValues.some((v) => Math.abs(v - taskValue) < antiRepeatThreshold)
  );

  // Hard cap: never exceed balance
  taskValue = Math.min(taskValue, balance);
  taskValue = Math.max(taskValue, rangeMin);
  taskValue = Math.round(taskValue * 100) / 100;

  // Track last 8 values for stronger anti-repeat
  lastValues.push(taskValue);
  if (lastValues.length > 8) lastValues.shift();

  return taskValue;
};

/** Reset the anti-repeat tracker (call on new set / new session) */
export const resetTaskValueHistory = () => {
  lastValues = [];
};

/** Given tasks completed today, return current set (1-based) and tasks done in current set */
export const getSetProgress = (tasksCompleted: number, tier: VipTier) => {
  const currentSet = Math.min(Math.floor(tasksCompleted / tier.tasksPerSet) + 1, tier.totalSets);
  const tasksInCurrentSet = tasksCompleted - (currentSet - 1) * tier.tasksPerSet;
  const allDone = tasksCompleted >= tier.totalTasks;
  return { currentSet, tasksInCurrentSet, allDone };
};
