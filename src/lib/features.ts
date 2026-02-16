export const FEATURES = {
  WALLET: {
    enabled: false,
    name: "钱包系统",
    description: "战斗币充值、余额管理",
  },
  SHOP: {
    enabled: false,
    name: "商城系统",
    description: "道具购买、VIP开通",
  },
  VIP: {
    enabled: false,
    name: "VIP系统",
    description: "会员特权、订阅管理",
  },
  DEBATE: {
    enabled: false,
    name: "辩论系统",
    description: "榜单辩论、投票对决",
  },
  TASKS: {
    enabled: false,
    name: "任务系统",
    description: "每日任务、奖励领取",
  },
  ACHIEVEMENTS: {
    enabled: false,
    name: "成就系统",
    description: "成就解锁、奖励展示",
  },
  LEADERBOARD: {
    enabled: false,
    name: "排行榜",
    description: "用户排行、榜单排行",
  },
  COLLABORATION: {
    enabled: false,
    name: "共创功能",
    description: "榜单协作、多人编辑",
  },
  DONATION: {
    enabled: false,
    name: "捐赠功能",
    description: "用户打赏、收益管理",
  },
  VERIFICATION: {
    enabled: false,
    name: "实名认证",
    description: "身份证验证、实名标识",
  },
  LEVEL_SYSTEM: {
    enabled: false,
    name: "等级系统",
    description: "军衔等级、经验值",
  },
  SUBSCRIPTION: {
    enabled: true,
    name: "订阅功能",
    description: "关注用户、更新通知",
  },
} as const

export type FeatureKey = keyof typeof FEATURES

export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature].enabled
}

export function getEnabledFeatures(): FeatureKey[] {
  return Object.entries(FEATURES)
    .filter(([_, config]) => config.enabled)
    .map(([key]) => key as FeatureKey)
}

export function getDisabledFeatures(): FeatureKey[] {
  return Object.entries(FEATURES)
    .filter(([_, config]) => !config.enabled)
    .map(([key]) => key as FeatureKey)
}