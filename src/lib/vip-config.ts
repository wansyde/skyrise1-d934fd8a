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
  Professional: { level: "Professional", tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.006, minBalance: 500,  targetProfitMin: 25,  targetProfitMax: 35   },
  Expert:       { level: "Expert",       tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.008, minBalance: 1500, targetProfitMin: 60,  targetProfitMax: 80   },
  Elite:        { level: "Elite",        tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.010, minBalance: 5000, targetProfitMin: 150, targetProfitMax: 200  },
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
 * Generate a highly-random task value by first picking a random per-task profit
 * within the tier's target range, then reverse-engineering the task amount.
 * 
 * profit_i = random(minProfit, maxProfit)
 * task_amount = profit_i / tier_percentage
 * 
 * This ensures total earnings over 40 tasks stay within the defined target range
 * while individual values appear highly random with no visible pattern.
 */
export const generateRandomTaskValue = (balance: number, tierLevel?: string): number => {
  const tier = getVipTier(tierLevel || 'Junior');
  const tasksPerSet = tier.tasksPerSet; // 40

  // Per-task profit bounds derived from set targets
  const minProfit = tier.targetProfitMin / tasksPerSet;
  const maxProfit = tier.targetProfitMax / tasksPerSet;

  // Generate random profit with extra variation (non-uniform distribution)
  // Use a slight bias toward the middle for natural feel
  const r1 = Math.random();
  const r2 = Math.random();
  const blended = (r1 + r2) / 2; // triangular-ish distribution, clusters toward center
  const profit = minProfit + blended * (maxProfit - minProfit);

  // Derive task value from profit
  let taskValue = profit / tier.rewardPercent;

  // Safety: never exceed user balance
  taskValue = Math.min(taskValue, balance * 0.95);

  // Round to 2 decimals for realism
  return Math.round(taskValue * 100) / 100;
};

/** Given tasks completed today, return current set (1-based) and tasks done in current set */
export const getSetProgress = (tasksCompleted: number, tier: VipTier) => {
  const currentSet = Math.min(Math.floor(tasksCompleted / tier.tasksPerSet) + 1, tier.totalSets);
  const tasksInCurrentSet = tasksCompleted - (currentSet - 1) * tier.tasksPerSet;
  const allDone = tasksCompleted >= tier.totalTasks;
  return { currentSet, tasksInCurrentSet, allDone };
};
