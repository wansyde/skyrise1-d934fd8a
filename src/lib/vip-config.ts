export interface VipTier {
  level: string;
  tasksPerSet: number;
  totalSets: number;
  totalTasks: number;
  rewardPercent: number;
  minBalance: number;
  incrementRate: number;
}

export const VIP_TIERS: Record<string, VipTier> = {
  Junior:       { level: "Junior",       tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.004, minBalance: 100,  incrementRate: 0.0005 },
  Professional: { level: "Professional", tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.006, minBalance: 500,  incrementRate: 0.0004 },
  Expert:       { level: "Expert",       tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.008, minBalance: 1500, incrementRate: 0.0003 },
  Elite:        { level: "Elite",        tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.010, minBalance: 5000, incrementRate: 0.0002 },
};

export const getVipTier = (level: string): VipTier => {
  return VIP_TIERS[level] || VIP_TIERS.Junior;
};

export const VIP_LEVELS = Object.keys(VIP_TIERS);

/** Calculate dynamic earning percentage based on balance */
export const getDynamicPercent = (balance: number, tier: VipTier): number => {
  const growthFactor = Math.max((balance - tier.minBalance) / tier.minBalance, 0);
  const dynamicPercent = tier.rewardPercent + (growthFactor * tier.incrementRate);
  const maxPercent = tier.rewardPercent * 1.5; // Cap at +50%
  return Math.max(Math.min(dynamicPercent, maxPercent), tier.rewardPercent);
};

/** Calculate task value based on balance (midpoint for display) */
export const getTaskValue = (balance: number, tier: VipTier): number => {
  const growthFactor = Math.max((balance - tier.minBalance) / tier.minBalance, 0);
  const taskRatio = 0.6 + (Math.min(growthFactor, 5) / 5.0) * 0.2;
  return Math.round(balance * taskRatio * 100) / 100;
};

/** Generate a controlled-random task value within [balance*0.55, balance*0.75] */
export const generateRandomTaskValue = (balance: number): number => {
  const min = balance * 0.55;
  const max = balance * 0.75;
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
