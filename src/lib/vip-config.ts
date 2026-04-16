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
    setTargets: [[85, 95], [85, 95], [85, 95]],
  },
  Expert: {
    level: "Expert", tasksPerSet: 50, totalSets: 3, totalTasks: 150,
    rewardPercent: 0.008, minBalance: 1500,
    setTargets: [[280, 320], [270, 310], [280, 320]],
  },
  Elite: {
    level: "Elite", tasksPerSet: 55, totalSets: 3, totalTasks: 165,
    rewardPercent: 0.010, minBalance: 5000,
    setTargets: [[2300, 2500], [2200, 2400], [2300, 2500]],
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

/** Spike tracking: how many high-value spikes have been injected in the current set */
let spikeCount = 0;
let taskIndexInSet = 0;

/**
 * Generate a wide-range random task value with anti-clustering,
 * natural decimals, micro-variation, and occasional high-value spikes.
 */
export const generateRandomTaskValue = (
  balance: number,
  tierLevel?: string,
  _setIndex?: number,
): number => {
  const isElite = tierLevel === 'Elite';
  const isExpert = tierLevel === 'Expert';
  const isPro = tierLevel === 'Professional';

  taskIndexInSet++;

  // --- Spike logic: 1–3 high-value tasks per set ---
  const tasksPerSet = isElite ? 55 : isExpert ? 50 : isPro ? 45 : 40;
  const maxSpikes = 1 + Math.floor(Math.random() * 3); // 1–3
  const shouldSpike =
    spikeCount < maxSpikes &&
    taskIndexInSet > 3 && // not the very first tasks
    Math.random() < (maxSpikes - spikeCount) / (tasksPerSet - taskIndexInSet + 1);

  if (shouldSpike) {
    spikeCount++;
    const spikeRaw = balance * (0.85 + Math.random() * 0.13); // 0.85–0.98 × balance
    // Apply natural decimal
    let spike = Math.floor(spikeRaw) + 0.01 + Math.random() * 0.98;
    // Micro variation
    spike *= 0.985 + Math.random() * 0.03;
    spike = Math.min(spike, balance);
    spike = Math.round(spike * 100) / 100;
    lastValues.push(spike);
    if (lastValues.length > 12) lastValues.shift();
    return spike;
  }

  // --- Normal generation ---
  // Tier-specific range floors
  const rangeMin = isElite
    ? Math.max(500, 0.25 * balance)
    : isExpert
      ? Math.max(300, 0.30 * balance)
      : isPro
        ? Math.max(100, 0.35 * balance)
        : Math.max(50, 0.35 * balance);
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
    // Junior: wider spread with guaranteed high-value zone
    lowMin = rangeMin; lowMax = 0.50 * balance;
    midMin = 0.50 * balance; midMax = 0.70 * balance;
    highMin = 0.70 * balance; highMax = rangeMax;
  }

  // Weighted zone selection – 30/40/30
  const roll = Math.random();
  let bandMin: number, bandMax: number;
  if (roll < 0.3) {
    bandMin = lowMin; bandMax = lowMax;
  } else if (roll < 0.7) {
    bandMin = midMin; bandMax = midMax;
  } else {
    bandMin = highMin; bandMax = highMax;
  }

  // Strict anti-repeat thresholds per tier
  const antiRepeatThreshold = isElite
    ? Math.max(50, Math.min(150, balance * 0.02))
    : isExpert
      ? Math.max(20, Math.min(50, balance * 0.015))
      : isPro
        ? Math.max(5, Math.min(15, balance * 0.01))
        : Math.max(2, Math.min(5, balance * 0.005));

  let taskValue: number;
  let attempts = 0;

  do {
    const r1 = Math.random();
    const r2 = Math.random();
    const pick = r1 * 0.6 + r2 * 0.4;
    taskValue = bandMin + pick * (bandMax - bandMin);

    // Layer 1: Tier-scaled jitter
    taskValue += (Math.random() - 0.5) * (isElite ? 15 : isExpert ? 8 : isPro ? 4 : 2);

    // Layer 2: Natural decimal (replace any .00/.50 pattern)
    taskValue = Math.floor(taskValue) + 0.01 + Math.random() * 0.98;

    // Layer 3: Micro variation (×0.985 → ×1.015)
    taskValue *= 0.985 + Math.random() * 0.03;

    attempts++;
  } while (
    attempts < 20 &&
    lastValues.some((v) => Math.abs(v - taskValue) < antiRepeatThreshold)
  );

  // Hard cap: never exceed balance
  taskValue = Math.min(taskValue, balance);
  taskValue = Math.max(taskValue, rangeMin);
  taskValue = Math.round(taskValue * 100) / 100;

  // Track last 12 values for stronger anti-repeat
  lastValues.push(taskValue);
  if (lastValues.length > 12) lastValues.shift();

  return taskValue;
};

/** Reset the anti-repeat tracker (call on new set / new session) */
export const resetTaskValueHistory = () => {
  lastValues = [];
  spikeCount = 0;
  taskIndexInSet = 0;
};

/** Given tasks completed today, return current set (1-based) and tasks done in current set */
export const getSetProgress = (tasksCompleted: number, tier: VipTier) => {
  const currentSet = Math.min(Math.floor(tasksCompleted / tier.tasksPerSet) + 1, tier.totalSets);
  const tasksInCurrentSet = tasksCompleted - (currentSet - 1) * tier.tasksPerSet;
  const allDone = tasksCompleted >= tier.totalTasks;
  return { currentSet, tasksInCurrentSet, allDone };
};
