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
    level: "Professional", tasksPerSet: 40, totalSets: 3, totalTasks: 120,
    rewardPercent: 0.006, minBalance: 500,
    setTargets: [[25, 30], [23, 28], [25, 30]],
  },
  Expert: {
    level: "Expert", tasksPerSet: 40, totalSets: 3, totalTasks: 120,
    rewardPercent: 0.008, minBalance: 1500,
    setTargets: [[60, 80], [55, 75], [60, 80]],
  },
  Elite: {
    level: "Elite", tasksPerSet: 40, totalSets: 3, totalTasks: 120,
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
  const rangeMin = Math.max(30, 0.4 * balance);
  const rangeMax = 0.98 * balance;

  if (rangeMax <= rangeMin) {
    return Math.round(rangeMin * 100) / 100;
  }

  const range = rangeMax - rangeMin;

  // Weighted band selection: LOW 30%, MID 40%, HIGH 30%
  const roll = Math.random();
  let bandMin: number, bandMax: number;
  if (roll < 0.3) {
    // LOW band (bottom 33%)
    bandMin = rangeMin;
    bandMax = rangeMin + range * 0.33;
  } else if (roll < 0.7) {
    // MID band (middle 34%)
    bandMin = rangeMin + range * 0.33;
    bandMax = rangeMin + range * 0.67;
  } else {
    // HIGH band (top 33%)
    bandMin = rangeMin + range * 0.67;
    bandMax = rangeMax;
  }

  // Generate with jitter (two random sources for non-uniform spread)
  let taskValue: number;
  let attempts = 0;
  do {
    const r1 = Math.random();
    const r2 = Math.random();
    const pick = r1 * 0.6 + r2 * 0.4;
    taskValue = bandMin + pick * (bandMax - bandMin);

    // Add decimal variation
    taskValue += (Math.random() - 0.5) * 2;

    attempts++;
    // Check not too similar to recent values (±5)
  } while (
    attempts < 10 &&
    lastValues.some((v) => Math.abs(v - taskValue) < 5)
  );

  // Hard cap: never exceed balance
  taskValue = Math.min(taskValue, balance);
  taskValue = Math.max(taskValue, rangeMin);
  taskValue = Math.round(taskValue * 100) / 100;

  // Track last 5 values for anti-repeat
  lastValues.push(taskValue);
  if (lastValues.length > 5) lastValues.shift();

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
