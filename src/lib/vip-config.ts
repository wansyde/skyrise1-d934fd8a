export interface VipTier {
  level: string;
  tasksPerSet: number;
  totalSets: number;
  totalTasks: number;
  rewardPercent: number;
  minBalance: number;
}

export const VIP_TIERS: Record<string, VipTier> = {
  Junior:       { level: "Junior",       tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.004, minBalance: 100 },
  Professional: { level: "Professional", tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.006, minBalance: 500 },
  Expert:       { level: "Expert",       tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.008, minBalance: 1500 },
  Elite:        { level: "Elite",        tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.010, minBalance: 5000 },
};

export const getVipTier = (level: string): VipTier => {
  return VIP_TIERS[level] || VIP_TIERS.Junior;
};

export const VIP_LEVELS = Object.keys(VIP_TIERS);

/** Profit per task = taskValue × tier percentage */
export const getTaskProfit = (taskValue: number, tier: VipTier): number => {
  return Math.round(taskValue * tier.rewardPercent * 100) / 100;
};

/** Generate a controlled-random task value within [balance*0.55, balance*0.70] — always less than the user's balance */
export const generateRandomTaskValue = (balance: number): number => {
  const min = balance * 0.55;
  const max = balance * 0.70;
  const value = min + Math.random() * (max - min);
  return Math.round(value * 100) / 100;
};

/** Given tasks completed today, return current set (1-based) and tasks done in current set */
export const getSetProgress = (tasksCompleted: number, tier: VipTier) => {
  const currentSet = Math.min(Math.floor(tasksCompleted / tier.tasksPerSet) + 1, tier.totalSets);
  const tasksInCurrentSet = tasksCompleted - (currentSet - 1) * tier.tasksPerSet;
  const allDone = tasksCompleted >= tier.totalTasks;
  return { currentSet, tasksInCurrentSet, allDone };
};
