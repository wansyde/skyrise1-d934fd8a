export interface VipTier {
  level: string;
  tasksPerSet: number;
  totalSets: number;
  totalTasks: number;
  rewardPercent: number;
}

export const VIP_TIERS: Record<string, VipTier> = {
  Junior:       { level: "Junior",       tasksPerSet: 40, totalSets: 3, totalTasks: 120, rewardPercent: 0.004 },
  Professional: { level: "Professional", tasksPerSet: 45, totalSets: 3, totalTasks: 135, rewardPercent: 0.006 },
  Expert:       { level: "Expert",       tasksPerSet: 50, totalSets: 3, totalTasks: 150, rewardPercent: 0.008 },
  Elite:        { level: "Elite",        tasksPerSet: 55, totalSets: 3, totalTasks: 165, rewardPercent: 0.010 },
};

export const getVipTier = (level: string): VipTier => {
  return VIP_TIERS[level] || VIP_TIERS.Junior;
};

export const VIP_LEVELS = Object.keys(VIP_TIERS);

/** Given tasks completed today, return current set (1-based) and tasks done in current set */
export const getSetProgress = (tasksCompleted: number, tier: VipTier) => {
  const currentSet = Math.min(Math.floor(tasksCompleted / tier.tasksPerSet) + 1, tier.totalSets);
  const tasksInCurrentSet = tasksCompleted - (currentSet - 1) * tier.tasksPerSet;
  const allDone = tasksCompleted >= tier.totalTasks;
  return { currentSet, tasksInCurrentSet, allDone };
};
