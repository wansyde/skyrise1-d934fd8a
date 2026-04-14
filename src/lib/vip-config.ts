export interface VipTier {
  level: string;
  tasksPerSet: number;
  totalSets: number;
  totalTasks: number;
  rewardPercent: number;
  minBalance: number;
  /** Target total profit range per 40-task set */
  targetProfitMin: number;
  targetProfitMax: number;
}

export const VIP_TIERS: Record<string, VipTier> = {
  Junior:       { level: "Junior",       tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.004, minBalance: 100,  targetProfitMin: 8,   targetProfitMax: 10   },
  Professional: { level: "Professional", tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.006, minBalance: 500,  targetProfitMin: 25,  targetProfitMax: 30   },
  Expert:       { level: "Expert",       tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.008, minBalance: 1500, targetProfitMin: 60,  targetProfitMax: 80   },
  Elite:        { level: "Elite",        tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.010, minBalance: 5000, targetProfitMin: 150, targetProfitMax: 250  },
};

export const getVipTier = (level: string): VipTier => {
  return VIP_TIERS[level] || VIP_TIERS.Junior;
};

export const VIP_LEVELS = Object.keys(VIP_TIERS);

/** Profit per task = taskValue × tier percentage */
export const getTaskProfit = (taskValue: number, tier: VipTier): number => {
  return Math.round(taskValue * tier.rewardPercent * 100) / 100;
};

/**
 * Generate a wide-range random task value.
 *
 * Range: MIN = max(30, 0.4 × B) … MAX = 0.98 × B
 * Uses stratified sampling across low/mid/high bands to prevent clustering,
 * then derives profit from tier percentage. The caller is responsible for
 * tracking cumulative profit and adjusting the final task if needed.
 */
export const generateRandomTaskValue = (balance: number, tierLevel?: string): number => {
  const tier = getVipTier(tierLevel || 'Junior');

  // Wide range based on balance
  const rangeMin = Math.max(30, 0.4 * balance);
  const rangeMax = 0.98 * balance;

  // If balance too low for meaningful range, just use what we can
  if (rangeMax <= rangeMin) {
    return Math.round(rangeMin * 100) / 100;
  }

  // Stratified random: pick a random band (low/mid/high) then random within it
  const bandCount = 3;
  const band = Math.floor(Math.random() * bandCount);
  const bandSize = (rangeMax - rangeMin) / bandCount;
  const bandMin = rangeMin + band * bandSize;
  const bandMax = bandMin + bandSize;

  // Add jitter with two random sources for non-uniform spread
  const r1 = Math.random();
  const r2 = Math.random();
  const pick = r1 * 0.7 + r2 * 0.3; // slight bias variation
  let taskValue = bandMin + pick * (bandMax - bandMin);

  // Hard cap: never exceed balance
  taskValue = Math.min(taskValue, balance);

  return Math.round(taskValue * 100) / 100;
};

/** Given tasks completed today, return current set (1-based) and tasks done in current set */
export const getSetProgress = (tasksCompleted: number, tier: VipTier) => {
  const currentSet = Math.min(Math.floor(tasksCompleted / tier.tasksPerSet) + 1, tier.totalSets);
  const tasksInCurrentSet = tasksCompleted - (currentSet - 1) * tier.tasksPerSet;
  const allDone = tasksCompleted >= tier.totalTasks;
  return { currentSet, tasksInCurrentSet, allDone };
};
