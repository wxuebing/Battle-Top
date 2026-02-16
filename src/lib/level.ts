export const LEVEL_CONFIG = {
  1: { name: "新兵", title: "新兵", expRequired: 0, chatFrame: "bronze", nameStyle: "default" },
  2: { name: "列兵", title: "列兵", expRequired: 500, chatFrame: "bronze", nameStyle: "default" },
  3: { name: "上等兵", title: "上等兵", expRequired: 1500, chatFrame: "bronze", nameStyle: "default" },
  4: { name: "下士", title: "下士", expRequired: 3000, chatFrame: "bronze", nameStyle: "default" },
  5: { name: "伍长", title: "伍长", expRequired: 5000, chatFrame: "silver", nameStyle: "default" },
  6: { name: "军士", title: "军士", expRequired: 7500, chatFrame: "silver", nameStyle: "default" },
  7: { name: "上士", title: "上士", expRequired: 10500, chatFrame: "silver", nameStyle: "default" },
  8: { name: "军士长", title: "军士长", expRequired: 14000, chatFrame: "silver", nameStyle: "default" },
  9: { name: "准尉", title: "准尉", expRequired: 18000, chatFrame: "silver", nameStyle: "default" },
  10: { name: "百夫长", title: "百夫长", expRequired: 22500, chatFrame: "gold", nameStyle: "colorful" },
  11: { name: "少校", title: "少校", expRequired: 28000, chatFrame: "gold", nameStyle: "colorful" },
  12: { name: "中校", title: "中校", expRequired: 34000, chatFrame: "gold", nameStyle: "colorful" },
  13: { name: "上校", title: "上校", expRequired: 41000, chatFrame: "gold", nameStyle: "colorful" },
  14: { name: "大校", title: "大校", expRequired: 49000, chatFrame: "gold", nameStyle: "colorful" },
  15: { name: "准将", title: "准将", expRequired: 58000, chatFrame: "gold", nameStyle: "colorful" },
  16: { name: "少将", title: "少将", expRequired: 68000, chatFrame: "gold", nameStyle: "colorful" },
  17: { name: "中将", title: "中将", expRequired: 79000, chatFrame: "gold", nameStyle: "colorful" },
  18: { name: "上将", title: "上将", expRequired: 91000, chatFrame: "gold", nameStyle: "colorful" },
  19: { name: "大将", title: "大将", expRequired: 100000, chatFrame: "diamond", nameStyle: "colorful" },
  20: { name: "将军", title: "将军", expRequired: 100000, chatFrame: "diamond", nameStyle: "colorful" },
}

export const VIP_BENEFITS = {
  monthlyCoins: 100,
  priorityDisplay: true,
  exclusiveBadge: true,
  pinComments: 3,
}

export const CHAT_FRAME_STYLES = {
  bronze: {
    name: "青铜聊天框",
    style: "border-2 border-amber-700 bg-gradient-to-r from-amber-900/20 to-amber-800/20",
    preview: "border-amber-700",
  },
  silver: {
    name: "白银聊天框",
    style: "border-2 border-gray-400 bg-gradient-to-r from-gray-300/20 to-gray-400/20",
    preview: "border-gray-400",
  },
  gold: {
    name: "黄金聊天框",
    style: "border-2 border-yellow-500 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 shadow-lg shadow-yellow-500/20",
    preview: "border-yellow-500",
  },
  diamond: {
    name: "钻石聊天框",
    style: "border-2 border-cyan-400 bg-gradient-to-r from-cyan-400/20 to-blue-500/20 shadow-xl shadow-cyan-400/30",
    preview: "border-cyan-400",
  },
}

export const NAME_STYLES = {
  default: {
    name: "默认样式",
    style: "text-white",
  },
  colorful: {
    name: "炫彩样式",
    style: "bg-gradient-to-r from-primary-400 via-accent-400 to-pink-400 bg-clip-text text-transparent",
  },
}

export function getLevelByExp(exp: number): number {
  let level = 1
  for (const [lvl, config] of Object.entries(LEVEL_CONFIG)) {
    if (exp >= config.expRequired) {
      level = parseInt(lvl)
    }
  }
  return level
}

export function getLevelConfig(level: number) {
  return LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG] || LEVEL_CONFIG[1]
}

export function getNextLevelExp(level: number): number {
  const nextLevel = level + 1
  return LEVEL_CONFIG[nextLevel as keyof typeof LEVEL_CONFIG]?.expRequired || LEVEL_CONFIG[20].expRequired
}

export function getExpProgress(exp: number, level: number): number {
  const currentLevelExp = LEVEL_CONFIG[level as keyof typeof LEVEL_CONFIG]?.expRequired || 0
  const nextLevelExp = getNextLevelExp(level)
  const progress = ((exp - currentLevelExp) / (nextLevelExp - currentLevelExp)) * 100
  return Math.min(Math.max(progress, 0), 100)
}

export function calculateExpFromRecharge(amountInYuan: number): number {
  return Math.floor(amountInYuan * 100)
}

export function getLevelUnlocks(level: number): string[] {
  const unlocks: string[] = []
  
  if (level >= 1) {
    unlocks.push("青铜聊天框")
  }
  if (level >= 5) {
    unlocks.push("白银聊天框")
  }
  if (level >= 10) {
    unlocks.push("黄金聊天框")
    unlocks.push("用户名炫彩")
  }
  if (level >= 20) {
    unlocks.push("钻石聊天框")
  }
  
  return unlocks
}
