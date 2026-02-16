"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, Button } from "@/components/ui"
import { RankingCard } from "@/components/ranking"
import { SubscribeButton } from "@/components/user/SubscribeButton"
import { DonateButton } from "@/components/user/DonateButton"
import { 
  Swords, Shield, Trophy, Crown, Flame, 
  Award, ArrowLeft, Users, Target, ExternalLink,
  Globe, Github, Twitter
} from "lucide-react"
import { formatNumber, formatDate } from "@/lib/utils"
import { cn } from "@/lib/utils"
import { isFeatureEnabled } from "@/lib/features"
import { Ranking } from "@/types"

interface UserProfile {
  id: string
  name: string | null
  image: string | null
  bio: string | null
  title: string | null
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
  createdAt: string
  rankings: Ranking[]
  _count: {
    rankings: number
    likes: number
    subscribers: number
  }
}

export default function UserPage() {
  const params = useParams()
  const [user, setUser] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchUser()
  }, [params.id])

  async function fetchUser() {
    try {
      const response = await fetch(`/api/users/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setUser(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch user:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <p className="text-gray-500">用户不存在</p>
      </div>
    )
  }

  const winRate = user.battleWins + user.battleLosses > 0
    ? Math.round((user.battleWins / (user.battleWins + user.battleLosses)) * 100)
    : 0

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href="/explore"
            className="inline-flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回发现
          </Link>

          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 via-accent-500 to-orange-500 p-1">
            <div className="bg-gray-900 rounded-xl p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-shrink-0">
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center overflow-hidden ring-4 ring-primary-500/30">
                    {user.image ? (
                      <img src={user.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-4xl font-bold text-gray-400">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h1 className="text-2xl font-bold text-white">{user.name}</h1>
                    {user.title && (
                      <span className="px-3 py-1 text-xs font-medium bg-gradient-to-r from-primary-500 to-accent-500 text-white rounded-full">
                        {user.title}
                      </span>
                    )}
                    {user.isAuthoritative && (
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full p-1">
                        <Shield className="h-4 w-4 text-white" />
                      </div>
                    )}
                    {user.idCardVerified && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs bg-green-500/20 text-green-400 rounded-full">
                        已实名
                      </span>
                    )}
                  </div>
                  {user.bio && <p className="text-gray-300 mt-2">{user.bio}</p>}
                  <p className="text-sm text-gray-500 mt-2">
                    加入于 {formatDate(user.createdAt)}
                  </p>
                  <div className="flex gap-2 mt-3">
                    {user.website && (
                      <a
                        href={user.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Globe className="h-4 w-4" />
                      </a>
                    )}
                    {user.github && (
                      <a
                        href={`https://github.com/${user.github}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        <Github className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  <SubscribeButton userId={user.id} />
                  {isFeatureEnabled("DONATION") && (
                    <DonateButton userId={user.id} userName={user.name || "用户"} />
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard
              icon={<Swords className="h-6 w-6" />}
              value={user.credibilityScore}
              label="战斗力"
              color="from-red-500 to-orange-500"
            />
            <StatCard
              icon={<Trophy className="h-6 w-6" />}
              value={user._count.rankings}
              label="发布榜单"
              color="from-blue-500 to-cyan-500"
            />
            <StatCard
              icon={<Flame className="h-6 w-6" />}
              value={formatNumber(user.totalLikesReceived)}
              label="获得助威"
              color="from-orange-500 to-red-500"
            />
            <StatCard
              icon={<Users className="h-6 w-6" />}
              value={user._count.subscribers}
              label="追随者"
              color="from-purple-500 to-pink-500"
            />
          </div>

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
                  <span className="text-green-400">{user.battleWins} 胜</span>
                  <span className="text-red-400">{user.battleLosses} 负</span>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">MVP 评论</p>
                    <p className="text-2xl font-bold text-white">{user.mvpCount}</p>
                  </div>
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-500/20 to-orange-600/20 flex items-center justify-center">
                    <Crown className="h-8 w-8 text-yellow-400" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-gray-500">获得榜单作者认可</p>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm">权威等级</p>
                    <p className="text-2xl font-bold text-white">
                      {user.isAuthoritative ? "已认证" : "待认证"}
                    </p>
                  </div>
                  <div className={cn(
                    "w-16 h-16 rounded-full flex items-center justify-center",
                    user.isAuthoritative
                      ? "bg-gradient-to-br from-yellow-500/20 to-orange-600/20"
                      : "bg-gradient-to-br from-gray-500/20 to-gray-600/20"
                  )}>
                    <Award className={cn("h-8 w-8", user.isAuthoritative ? "text-yellow-400" : "text-gray-500")} />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader className="border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary-400" />
                发布的榜单
              </h2>
            </CardHeader>
            <CardContent className="pt-6">
              {user.rankings.length === 0 ? (
                <p className="text-center text-gray-500 py-8">
                  该用户还没有发布任何榜单
                </p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {user.rankings.map((ranking) => (
                    <RankingCard
                      key={ranking.id}
                      ranking={ranking}
                      showAuthor={false}
                    />
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
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
          <div className={cn("p-2 rounded-lg bg-gradient-to-br text-white", color)}>
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
