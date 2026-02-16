"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, CardContent, CardHeader } from "@/components/ui"
import { 
  Swords, Shield, Trophy, Crown, Flame, Zap, 
  Edit3, Camera, Check, X, Globe,
  Target, Lock, UserCheck, Github,
  Coins, ShoppingBag, Medal, Users
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { formatNumber, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { isFeatureEnabled } from "@/lib/features"
import { ProfileSkeleton } from "@/components/ui"

interface UserProfile {
  id: string
  name: string | null
  email: string
  image: string | null
  bio: string | null
  title: string | null
  imageSource: string
  credibilityScore: number
  isAuthoritative: boolean
  totalLikesReceived: number
  totalRankingsPublished: number
  idCardVerified: boolean
  website: string | null
  weibo: string | null
  twitter: string | null
  github: string | null
  battleWins: number
  battleLosses: number
  mvpCount: number
  level: number
  exp: number
  chatFrame: string
  nameStyle: string
  createdAt: string
  _count: {
    rankings: number
    likes: number
    subscribers: number
    subscriptions: number
  }
}

const AVATAR_PRESETS = [
  { id: "warrior-1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=warrior1", name: "战士" },
  { id: "warrior-2", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=warrior2", name: "勇士" },
  { id: "mage-1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=mage1", name: "法师" },
  { id: "knight-1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=knight1", name: "骑士" },
  { id: "archer-1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=archer1", name: "弓手" },
  { id: "ninja-1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=ninja1", name: "忍者" },
  { id: "samurai-1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=samurai1", name: "武士" },
  { id: "viking-1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=viking1", name: "维京" },
  { id: "random-1", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=random1", name: "神秘" },
  { id: "random-2", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=random2", name: "传说" },
  { id: "random-3", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=random3", name: "史诗" },
  { id: "random-4", url: "https://api.dicebear.com/7.x/adventurer/svg?seed=random4", name: "稀有" },
]

const TITLE_OPTIONS = [
  { value: "", label: "无称号" },
  { value: "榜单新秀", label: "榜单新秀" },
  { value: "观点先锋", label: "观点先锋" },
  { value: "辩论达人", label: "辩论达人" },
  { value: "排行榜专家", label: "排行榜专家" },
  { value: "榜单大师", label: "榜单大师" },
  { value: "传奇创作者", label: "传奇创作者" },
]

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "edit" | "avatar" | "verify">("overview")
  const [editForm, setEditForm] = useState({
    name: "",
    bio: "",
    title: "",
    website: "",
    weibo: "",
    twitter: "",
    github: "",
  })
  const [isSaving, setIsSaving] = useState(false)
  const [verifyForm, setVerifyForm] = useState({ realName: "", idCardNumber: "" })
  const [isVerifying, setIsVerifying] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch("/api/user/profile")
      const data = await response.json()
      if (data.success) {
        setProfile(data.data)
        setEditForm({
          name: data.data.name || "",
          bio: data.data.bio || "",
          title: data.data.title || "",
          website: data.data.website || "",
          weibo: data.data.weibo || "",
          twitter: data.data.twitter || "",
          github: data.data.github || "",
        })
      } else {
        router.push("/auth/signin")
      }
    } catch (error) {
      console.error("Failed to fetch profile:", error)
    } finally {
      setIsLoading(false)
    }
  }, [router])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  async function handleSave() {
    setIsSaving(true)
    try {
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })
      const data = await response.json()
      if (data.success) {
        setProfile({ ...profile!, ...data.data })
        setActiveTab("overview")
      }
    } catch (error) {
      console.error("Failed to save profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  async function handleAvatarSelect(avatarUrl: string) {
    try {
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ avatarUrl, imageSource: "preset" }),
      })
      const data = await response.json()
      if (data.success) {
        setProfile({ ...profile!, image: avatarUrl, imageSource: "preset" })
      }
    } catch (error) {
      console.error("Failed to update avatar:", error)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const formData = new FormData()
    formData.append("file", file)
    formData.append("imageSource", "upload")

    try {
      const response = await fetch("/api/user/avatar", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (data.success) {
        setProfile({ ...profile!, image: data.data.image, imageSource: "upload" })
      }
    } catch (error) {
      console.error("Failed to upload avatar:", error)
    }
  }

  async function handleVerify() {
    setIsVerifying(true)
    try {
      const response = await fetch("/api/user/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(verifyForm),
      })
      const data = await response.json()
      if (data.success) {
        setProfile({ ...profile!, idCardVerified: true })
        setActiveTab("overview")
      }
    } catch (error) {
      console.error("Failed to verify:", error)
    } finally {
      setIsVerifying(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <ProfileSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!profile) return null

  const winRate = profile.battleWins + profile.battleLosses > 0
    ? Math.round((profile.battleWins / (profile.battleWins + profile.battleLosses)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-accent-500 to-orange-500 p-1">
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0 relative group">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden ring-4 ring-primary-500/30">
                    {profile.image ? (
                      <Image src={profile.image} alt="" fill className="object-cover" sizes="112px" />
                    ) : (
                      <span className="text-4xl font-bold text-gray-400">
                        {profile.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setActiveTab("avatar")}
                    className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    <Camera className="h-8 w-8 text-white" />
                  </button>
                  {profile.isAuthoritative && (
                    <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1.5">
                      <Shield className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-white">{profile.name}</h1>
                    {profile.title && (
                      <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full">
                        {profile.title}
                      </span>
                    )}
                    {profile.idCardVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                        <Check className="h-3 w-3" />
                        已实名
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 mt-1">{profile.email}</p>
                  {profile.bio && <p className="text-gray-300 mt-2">{profile.bio}</p>}
                  <p className="text-sm text-gray-500 mt-2">
                    加入于 {formatDate(profile.createdAt)}
                  </p>
                </div>

                <div className="flex flex-col gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setActiveTab("edit")}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    <Edit3 className="h-4 w-4 mr-1" />
                    编辑资料
                  </Button>
                  {isFeatureEnabled("VERIFICATION") && !profile.idCardVerified && (
                    <Button
                      size="sm"
                      onClick={() => setActiveTab("verify")}
                      className="bg-gradient-to-r from-primary-500 to-accent-500"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      实名认证
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {isFeatureEnabled("LEVEL_SYSTEM") && (
              <StatCard
                icon={<Medal className="h-6 w-6" />}
                value={`Lv.${profile.level || 1}`}
                label="等级"
                color="from-purple-500 to-pink-500"
              />
            )}
            <StatCard
              icon={<Swords className="h-6 w-6" />}
              value={profile.credibilityScore}
              label="战斗力"
              color="from-red-500 to-orange-500"
            />
            <StatCard
              icon={<Trophy className="h-6 w-6" />}
              value={profile._count.rankings}
              label="发布榜单"
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Flame className="h-6 w-6" />}
              value={formatNumber(profile.totalLikesReceived)}
              label="获得助威"
              color="from-orange-500 to-red-500"
            />
          </div>

          <Link href="/subscriptions">
            <Card className="bg-gray-800/50 border-gray-700 hover:border-primary-500/50 transition-colors cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Users className="h-5 w-5 text-primary-400" />
                    <span className="text-gray-300">订阅管理</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="text-gray-400">
                      {profile._count.subscriptions} 订阅
                    </span>
                    <span className="text-gray-400">
                      {profile._count.subscribers} 粉丝
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          {isFeatureEnabled("LEVEL_SYSTEM") && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Medal className="h-5 w-5 text-purple-400" />
                    <span className="text-gray-300">等级进度</span>
                    <span className="text-white font-bold">Lv.{profile.level || 1}</span>
                  </div>
                  <span className="text-sm text-gray-400">
                    {profile.exp || 0} EXP
                  </span>
                </div>
                <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all"
                    style={{ width: `${Math.min(100, (profile.exp || 0) % 100)}%` }}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {isFeatureEnabled("WALLET") && isFeatureEnabled("SHOP") && isFeatureEnabled("VIP") && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {isFeatureEnabled("WALLET") && (
                <Link href="/shop?tab=recharge">
                  <Card className="bg-gradient-to-br from-yellow-900/30 to-orange-900/30 border-yellow-700/50 hover:border-yellow-500/50 transition-colors cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-yellow-400 text-sm flex items-center gap-1">
                            <Coins className="h-4 w-4" />
                            战斗币钱包
                          </p>
                          <p className="text-2xl font-bold text-white mt-1">点击充值</p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/30 to-orange-600/30 flex items-center justify-center">
                          <Coins className="h-8 w-8 text-yellow-400" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-yellow-400/60">前往商城充值战斗币</p>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {isFeatureEnabled("VIP") && (
                <Link href="/shop?tab=vip">
                  <Card className="bg-gradient-to-br from-purple-900/30 to-pink-900/30 border-purple-700/50 hover:border-purple-500/50 transition-colors cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-purple-400 text-sm flex items-center gap-1">
                            <Crown className="h-4 w-4" />
                            VIP会员
                          </p>
                          <p className="text-2xl font-bold text-white mt-1">开通特权</p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/30 to-pink-600/30 flex items-center justify-center">
                          <Crown className="h-8 w-8 text-purple-400" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-purple-400/60">享受专属VIP特权</p>
                    </CardContent>
                  </Card>
                </Link>
              )}

              {isFeatureEnabled("SHOP") && (
                <Link href="/shop">
                  <Card className="bg-gradient-to-br from-primary-900/30 to-accent-900/30 border-primary-700/50 hover:border-primary-500/50 transition-colors cursor-pointer">
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-primary-400 text-sm flex items-center gap-1">
                            <ShoppingBag className="h-4 w-4" />
                            道具商城
                          </p>
                          <p className="text-2xl font-bold text-white mt-1">装备自己</p>
                        </div>
                        <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-500/30 to-accent-600/30 flex items-center justify-center">
                          <ShoppingBag className="h-8 w-8 text-primary-400" />
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-primary-400/60">购买道具增强实力</p>
                    </CardContent>
                  </Card>
                </Link>
              )}
            </div>
          )}

          {isFeatureEnabled("DEBATE") && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardContent className="pt-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">战斗胜率</p>
                      <p className="text-2xl font-bold text-white">{winRate}%</p>
                    </div>
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center">
                      <Target className="h-8 w-8 text-green-400" />
                    </div>
                  </div>
                  <div className="mt-3 flex gap-4 text-sm">
                    <span className="text-green-400">{profile.battleWins} 胜</span>
                    <span className="text-red-400">{profile.battleLosses} 负</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === "edit" && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">编辑资料</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("overview")} className="text-gray-400">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">用户名</label>
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">称号</label>
                    <select
                      value={editForm.title}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                    >
                      {TITLE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">个人简介</label>
                  <textarea
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 resize-none"
                    placeholder="介绍一下自己..."
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      <Globe className="h-4 w-4 inline mr-1" />
                      个人网站
                    </label>
                    <input
                      type="url"
                      value={editForm.website}
                      onChange={(e) => setEditForm({ ...editForm, website: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      placeholder="https://"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      <Github className="h-4 w-4 inline mr-1" />
                      GitHub
                    </label>
                    <input
                      type="text"
                      value={editForm.github}
                      onChange={(e) => setEditForm({ ...editForm, github: e.target.value })}
                      className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                      placeholder="username"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-2">
                  <Button onClick={handleSave} isLoading={isSaving} className="bg-gradient-to-r from-primary-500 to-accent-500">
                    保存更改
                  </Button>
                  <Button variant="outline" onClick={() => setActiveTab("overview")} className="border-gray-600 text-gray-300">
                    取消
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "avatar" && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">选择头像</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("overview")} className="text-gray-400">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-300 mb-3">本地上传</h3>
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="border-2 border-dashed border-gray-600 rounded-xl p-8 text-center cursor-pointer hover:border-primary-500 transition-colors"
                  >
                    <Camera className="h-12 w-12 text-gray-500 mx-auto mb-3" />
                    <p className="text-gray-400">点击上传头像</p>
                    <p className="text-xs text-gray-500 mt-1">支持 JPG、PNG 格式</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-300 mb-3">头像库</h3>
                  <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                    {AVATAR_PRESETS.map((avatar) => (
                      <button
                        key={avatar.id}
                        onClick={() => handleAvatarSelect(avatar.url)}
                        className={cn(
                          "relative p-1 rounded-xl transition-all",
                          profile.image === avatar.url
                            ? "ring-2 ring-primary-500 bg-primary-500/10"
                            : "hover:bg-gray-700"
                        )}
                      >
                        <div className="relative w-full aspect-square">
                          <Image
                            src={avatar.url}
                            alt={avatar.name}
                            fill
                            className="rounded-lg bg-gray-700 object-cover"
                            sizes="(max-width: 768px) 25vw, 16vw"
                          />
                        </div>
                        {profile.image === avatar.url && (
                          <div className="absolute -top-1 -right-1 bg-primary-500 rounded-full p-0.5">
                            <Check className="h-3 w-3 text-white" />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6 p-4 bg-gray-700/50 rounded-xl">
                  <h3 className="text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                    <Zap className="h-4 w-4 text-yellow-400" />
                    AI 生成头像（即将推出）
                  </h3>
                  <p className="text-xs text-gray-500">
                    使用 AI 根据您的风格偏好生成独一无二的战斗头像
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {activeTab === "verify" && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader className="border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-white">实名认证</h2>
                  <Button variant="ghost" size="sm" onClick={() => setActiveTab("overview")} className="text-gray-400">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                {profile.idCardVerified ? (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Check className="h-8 w-8 text-green-400" />
                    </div>
                    <h3 className="text-lg font-medium text-white">已通过实名认证</h3>
                    <p className="text-gray-400 mt-1">您的账号已完成实名认证</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-sm text-yellow-400">
                        实名认证可提升账号可信度，认证后将在个人主页显示认证标识
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">真实姓名</label>
                      <input
                        type="text"
                        value={verifyForm.realName}
                        onChange={(e) => setVerifyForm({ ...verifyForm, realName: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                        placeholder="请输入真实姓名"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">身份证号</label>
                      <input
                        type="text"
                        value={verifyForm.idCardNumber}
                        onChange={(e) => setVerifyForm({ ...verifyForm, idCardNumber: e.target.value })}
                        className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500"
                        placeholder="请输入身份证号"
                      />
                    </div>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Lock className="h-4 w-4" />
                      您的信息将被加密存储，仅用于身份验证
                    </div>
                    <Button
                      onClick={handleVerify}
                      isLoading={isVerifying}
                      className="bg-gradient-to-r from-primary-500 to-accent-500"
                    >
                      提交认证
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, value, label, color }: { icon: React.ReactNode; value: string | number; label: string; color: string }) {
  return (
    <Card className="bg-gray-800/50 border-gray-700">
      <CardContent className="pt-4">
        <div className="flex items-center gap-3">
          <div className={cn("p-2 rounded-lg bg-gradient-to-br", color)}>
            {icon}
          </div>
          <div>
            <p className="text-xl font-bold text-white">{value}</p>
            <p className="text-xs text-gray-400">{label}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}