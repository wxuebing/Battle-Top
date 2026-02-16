"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Navbar, Footer } from "@/components/layout"
import { Button, Card, CardContent, CardHeader } from "@/components/ui"
import { 
  Swords, Wallet, Crown, ShoppingBag, Coins, Zap, 
  Check, Star, Gift, Sparkles, ChevronRight, Shield,
  Flame, Award, Rocket, Pin, MessageSquare, User,
  TrendingUp, Target, Medal
} from "lucide-react"
import { cn } from "@/lib/utils"
import { LEVEL_CONFIG, getLevelConfig, getNextLevelExp, getExpProgress, getLevelUnlocks, CHAT_FRAME_STYLES, NAME_STYLES } from "@/lib/level"

export const dynamic = 'force-dynamic'

interface WalletData {
  balance: number
  totalRecharged: number
  totalSpent: number
  level: number
  exp: number
  chatFrame: string
  nameStyle: string
}

interface VIPData {
  membership: any
  isActive: boolean
  remainingDays: number
}

interface ShopItem {
  id: string
  name: string
  description: string | null
  price: number
  icon: string | null
  type: string
  effect: string | null
}

interface UserItem {
  id: string
  itemId: string
  quantity: number
  item: ShopItem
}

const VIP_PLANS = [
  {
    type: "MONTHLY_CONTINUOUS",
    name: "连续包月",
    price: 9,
    originalPrice: 10,
    days: 30,
    highlight: false,
    autoRenew: true,
    badge: "省10%",
  },
  {
    type: "YEARLY_CONTINUOUS",
    name: "连续包年",
    price: 99,
    originalPrice: 120,
    days: 365,
    highlight: true,
    autoRenew: true,
    badge: "省17%",
  },
  {
    type: "MONTHLY",
    name: "包月",
    price: 10,
    originalPrice: 10,
    days: 30,
    highlight: false,
    autoRenew: false,
    badge: null,
  },
  {
    type: "YEARLY",
    name: "包年",
    price: 120,
    originalPrice: 120,
    days: 365,
    highlight: false,
    autoRenew: false,
    badge: null,
  },
]

const RECHARGE_OPTIONS = [
  { amount: 6, bonus: 0, popular: false },
  { amount: 30, bonus: 10, popular: false },
  { amount: 68, bonus: 30, popular: true },
  { amount: 128, bonus: 80, popular: false },
  { amount: 298, bonus: 200, popular: false },
  { amount: 648, bonus: 500, popular: false },
]

const LEVEL_DISPLAY = [
  { level: 1, name: "新兵", unlocks: ["青铜聊天框"] },
  { level: 5, name: "伍长", unlocks: ["白银聊天框"] },
  { level: 10, name: "百夫长", unlocks: ["黄金聊天框", "用户名炫彩"] },
  { level: 20, name: "将军", unlocks: ["钻石聊天框", "全部特权"] },
]

export default function ShopPage() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<"items" | "vip" | "recharge">("items")
  const [wallet, setWallet] = useState<WalletData | null>(null)
  const [vipInfo, setVipInfo] = useState<VIPData | null>(null)
  const [items, setItems] = useState<ShopItem[]>([])
  const [userItems, setUserItems] = useState<UserItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [purchasingItem, setPurchasingItem] = useState<string | null>(null)
  const [purchasingVip, setPurchasingVip] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  async function fetchData() {
    try {
      const [walletRes, vipRes, shopRes] = await Promise.all([
        fetch("/api/wallet"),
        fetch("/api/vip"),
        fetch("/api/shop"),
      ])

      const walletData = await walletRes.json()
      const vipData = await vipRes.json()
      const shopData = await shopRes.json()

      if (walletData.success) setWallet(walletData.data)
      if (vipData.success) setVipInfo(vipData.data)
      if (shopData.success) {
        setItems(shopData.data.items)
        setUserItems(shopData.data.userItems)
      }
    } catch (error) {
      console.error("Failed to fetch shop data:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleRecharge(amount: number) {
    try {
      const response = await fetch("/api/wallet", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })
      const data = await response.json()
      if (data.success) {
        setWallet({
          ...wallet!,
          balance: data.data.wallet.balance,
          level: data.data.newLevel || wallet?.level || 1,
          exp: (wallet?.exp || 0) + data.data.expGained,
        })
        let message = data.data.message
        if (data.data.levelUp) {
          message += `\n恭喜升级到 ${data.data.levelName}！`
        }
        alert(message)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error("Recharge failed:", error)
    }
  }

  async function handlePurchaseItem(itemId: string) {
    setPurchasingItem(itemId)
    try {
      const response = await fetch("/api/shop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity: 1 }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchData()
        alert(data.data.message)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error("Purchase failed:", error)
    } finally {
      setPurchasingItem(null)
    }
  }

  async function handlePurchaseVip(planType: string) {
    setPurchasingVip(planType)
    try {
      const plan = VIP_PLANS.find((p) => p.type === planType)
      const response = await fetch("/api/vip", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ planType, autoRenew: plan?.autoRenew || false }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchData()
        alert(data.data.message)
      } else {
        alert(data.error)
      }
    } catch (error) {
      console.error("VIP purchase failed:", error)
    } finally {
      setPurchasingVip(null)
    }
  }

  function getUserItemQuantity(itemId: string): number {
    const userItem = userItems.find((ui) => ui.itemId === itemId)
    return userItem?.quantity || 0
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <Navbar />
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
        </div>
      </div>
    )
  }

  const currentLevel = wallet?.level || 1
  const currentExp = wallet?.exp || 0
  const levelConfig = getLevelConfig(currentLevel)
  const expProgress = getExpProgress(currentExp, currentLevel)
  const nextLevelExp = getNextLevelExp(currentLevel)

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-6 md:mb-8">
            <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-primary-600/20 to-accent-500/20 rounded-full border border-primary-500/30 mb-3 md:mb-4">
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 text-primary-400" />
              <span className="text-primary-300 font-medium text-sm md:text-base">战斗补给站</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
              Battle <span className="bg-gradient-to-r from-primary-400 to-accent-400 bg-clip-text text-transparent">Shop</span>
            </h1>
            <p className="text-gray-400 text-sm md:text-base">装备自己，成为战场上的传奇</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6 md:mb-8">
            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm flex items-center gap-1">
                      <Coins className="h-3 w-3 md:h-4 md:w-4" />
                      战斗币余额
                    </p>
                    <p className="text-xl md:text-3xl font-bold text-white mt-1">
                      {wallet?.balance.toLocaleString() || 0}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-600/20 flex items-center justify-center">
                    <Coins className="h-5 w-5 md:h-7 md:w-7 text-yellow-400" />
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-2 hidden md:block">
                  ≈ ¥{((wallet?.balance || 0) / 10).toFixed(2)}
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm flex items-center gap-1">
                      <Medal className="h-3 w-3 md:h-4 md:w-4" />
                      当前等级
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-white mt-1">
                      Lv.{currentLevel} {levelConfig.name}
                    </p>
                  </div>
                  <div className="w-10 h-10 md:w-14 md:h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center">
                    <Medal className="h-5 w-5 md:h-7 md:w-7 text-purple-400" />
                  </div>
                </div>
                <div className="mt-2">
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>{currentExp}</span>
                    <span>{nextLevelExp}</span>
                  </div>
                  <div className="h-1.5 md:h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-primary-500 to-accent-500 transition-all"
                      style={{ width: `${expProgress}%` }}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm flex items-center gap-1">
                      <Crown className="h-3 w-3 md:h-4 md:w-4" />
                      VIP状态
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-white mt-1">
                      {vipInfo?.isActive ? `${vipInfo.remainingDays}天` : "未开通"}
                    </p>
                  </div>
                  <div className={cn(
                    "w-10 h-10 md:w-14 md:h-14 rounded-full flex items-center justify-center",
                    vipInfo?.isActive
                      ? "bg-gradient-to-br from-yellow-500/20 to-orange-600/20"
                      : "bg-gradient-to-br from-gray-600/20 to-gray-700/20"
                  )}>
                    <Crown className={cn("h-5 w-5 md:h-7 md:w-7", vipInfo?.isActive ? "text-yellow-400" : "text-gray-500")} />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-gray-700">
              <CardContent className="pt-4 md:pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-xs md:text-sm flex items-center gap-1">
                      <Gift className="h-3 w-3 md:h-4 md:w-4" />
                      我的道具
                    </p>
                    <p className="text-lg md:text-2xl font-bold text-white mt-1">
                      {userItems.reduce((sum, ui) => sum + ui.quantity, 0)} 件
                    </p>
                  </div>
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 flex items-center justify-center">
                    <Gift className="h-7 w-7 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0">
            <button
              onClick={() => setActiveTab("items")}
              className={cn(
                "px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm md:text-base",
                activeTab === "items"
                  ? "bg-gradient-to-r from-primary-600 to-accent-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <ShoppingBag className="h-4 w-4 md:h-5 md:w-5 inline mr-1.5 md:mr-2" />
              道具商城
            </button>
            <button
              onClick={() => setActiveTab("vip")}
              className={cn(
                "px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm md:text-base",
                activeTab === "vip"
                  ? "bg-gradient-to-r from-primary-600 to-accent-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <Crown className="h-4 w-4 md:h-5 md:w-5 inline mr-1.5 md:mr-2" />
              VIP会员
            </button>
            <button
              onClick={() => setActiveTab("recharge")}
              className={cn(
                "px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all whitespace-nowrap text-sm md:text-base",
                activeTab === "recharge"
                  ? "bg-gradient-to-r from-primary-600 to-accent-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <Coins className="h-4 w-4 md:h-5 md:w-5 inline mr-1.5 md:mr-2" />
              充值中心
            </button>
          </div>

          {activeTab === "items" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((item) => {
                const owned = getUserItemQuantity(item.id)
                const rmbPrice = (item.price / 10).toFixed(1)
                return (
                  <Card key={item.id} className="bg-gray-800/50 border-gray-700 hover:border-primary-500/50 transition-colors">
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary-500/20 to-accent-500/20 flex items-center justify-center text-2xl flex-shrink-0">
                          {item.icon || "🎁"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate">{item.name}</h3>
                          <p className="text-sm text-gray-400 mt-1 line-clamp-2">{item.description}</p>
                          {owned > 0 && (
                            <p className="text-xs text-primary-400 mt-1">已拥有 {owned} 个</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-700">
                        <div>
                          <div className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-yellow-400" />
                            <span className="font-bold text-white">{item.price}</span>
                            <span className="text-xs text-gray-400">战斗币</span>
                          </div>
                          <p className="text-xs text-gray-500">≈ ¥{rmbPrice}</p>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handlePurchaseItem(item.id)}
                          isLoading={purchasingItem === item.id}
                          className="bg-gradient-to-r from-primary-500 to-accent-500"
                        >
                          购买
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}

          {activeTab === "vip" && (
            <div className="space-y-6">
              <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50">
                <CardHeader className="border-b border-purple-700/50">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    用户成长体系 - 军衔段位
                  </h3>
                </CardHeader>
                <CardContent className="pt-6">
                  <p className="text-gray-400 mb-4 text-sm">
                    充值 ¥1000 即可达到 Lv20 将军等级，解锁全部特权！后续将开放更高等级。
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {LEVEL_DISPLAY.map((lvl) => (
                      <div
                        key={lvl.level}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all",
                          currentLevel >= lvl.level
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-gray-700 bg-gray-800/50"
                        )}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold",
                            currentLevel >= lvl.level
                              ? "bg-gradient-to-br from-primary-500 to-accent-500 text-white"
                              : "bg-gray-700 text-gray-400"
                          )}>
                            Lv{lvl.level}
                          </div>
                          <div>
                            <p className={cn(
                              "font-semibold",
                              currentLevel >= lvl.level ? "text-white" : "text-gray-400"
                            )}>{lvl.name}</p>
                          </div>
                        </div>
                        <div className="space-y-1">
                          {lvl.unlocks.map((unlock, i) => (
                            <p key={i} className="text-xs text-gray-400 flex items-center gap-1">
                              <Check className="h-3 w-3 text-green-400" />
                              {unlock}
                            </p>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {VIP_PLANS.map((plan) => (
                  <Card
                    key={plan.type}
                    className={cn(
                      "relative bg-gray-800/50 border transition-all cursor-pointer",
                      plan.highlight
                        ? "border-yellow-500 ring-2 ring-yellow-500/20"
                        : "border-gray-700 hover:border-primary-500/50"
                    )}
                  >
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs font-bold rounded-full">
                        {plan.badge}
                      </div>
                    )}
                    <CardContent className="pt-8 pb-6 text-center">
                      <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-600/20 flex items-center justify-center mb-4">
                        <Crown className="h-8 w-8 text-yellow-400" />
                      </div>
                      <h3 className="text-lg font-bold text-white">{plan.name}</h3>
                      {plan.autoRenew && (
                        <p className="text-xs text-gray-400 mt-1">自动续费</p>
                      )}
                      <div className="mt-4">
                        <div className="flex items-center justify-center gap-1">
                          <Coins className="h-5 w-5 text-yellow-400" />
                          <span className="text-2xl font-bold text-white">{plan.price * 10}</span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          ¥{plan.price}/{plan.days === 365 ? "年" : "月"}
                        </p>
                      </div>
                      <Button
                        className={cn(
                          "w-full mt-4",
                          plan.highlight
                            ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                            : "bg-gradient-to-r from-primary-500 to-accent-500"
                        )}
                        onClick={() => handlePurchaseVip(plan.type)}
                        isLoading={purchasingVip === plan.type}
                      >
                        立即开通
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Star className="h-5 w-5 text-yellow-400" />
                    VIP专属特权
                  </h3>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { icon: <Rocket className="h-5 w-5" />, text: "榜单优先展示", desc: "你的榜单将获得更高曝光" },
                      { icon: <Flame className="h-5 w-5" />, text: "专属VIP标识", desc: "彰显尊贵身份" },
                      { icon: <Shield className="h-5 w-5" />, text: "评论置顶特权", desc: "每月3次置顶机会" },
                      { icon: <Gift className="h-5 w-5" />, text: "每月战斗币礼包", desc: "每月赠送100战斗币" },
                    ].map((benefit, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-700/30 rounded-lg">
                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-600/20 flex items-center justify-center text-yellow-400">
                          {benefit.icon}
                        </div>
                        <div>
                          <p className="font-medium text-white">{benefit.text}</p>
                          <p className="text-sm text-gray-400">{benefit.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                    <p className="text-sm text-yellow-400 flex items-center gap-2">
                      <Sparkles className="h-4 w-4" />
                      VIP权限开发中，如有建议欢迎联系作者！
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "recharge" && (
            <div className="space-y-6">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Coins className="h-5 w-5 text-yellow-400" />
                    充值战斗币
                  </h3>
                </CardHeader>
                <CardContent className="pt-6">
                  <div className="mb-4 p-4 bg-primary-500/10 border border-primary-500/30 rounded-lg">
                    <p className="text-sm text-primary-400">
                      <strong>充值规则：</strong>1元 = 10战斗币 = 100经验值
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      充值 ¥1000 可达到 Lv20 将军等级，解锁全部特权！
                    </p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {RECHARGE_OPTIONS.map((option) => (
                      <button
                        key={option.amount}
                        onClick={() => handleRecharge(option.amount)}
                        className={cn(
                          "relative p-4 rounded-xl border-2 transition-all text-left",
                          option.popular
                            ? "border-primary-500 bg-primary-500/10"
                            : "border-gray-600 bg-gray-800 hover:border-primary-500/50"
                        )}
                      >
                        {option.popular && (
                          <div className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary-500 text-white text-xs rounded-full">
                            热门
                          </div>
                        )}
                        <p className="text-xl font-bold text-white">¥{option.amount}</p>
                        <p className="text-sm text-gray-400 mt-1">
                          {option.amount * 10} 战斗币
                        </p>
                        <p className="text-xs text-purple-400 mt-1">
                          +{option.amount * 100} 经验值
                        </p>
                        {option.bonus > 0 && (
                          <p className="text-xs text-primary-400 mt-2">
                            +{option.bonus} 赠送
                          </p>
                        )}
                      </button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 text-gray-400">
                    <Shield className="h-5 w-5" />
                    <p className="text-sm">
                      充值即表示同意《Battle Top用户协议》。战斗币仅限本平台使用，不支持退款。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
