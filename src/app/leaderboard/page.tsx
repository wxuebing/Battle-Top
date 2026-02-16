"use client"

import { useState, useEffect } from "react"
import { Button, Card, CardContent, CardHeader } from "@/components/ui"
import { 
  Trophy, Medal, Crown, Flame, 
  Swords, Star, Users, TrendingUp,
  ChevronRight, Target
} from "lucide-react"
import { Navbar, Footer } from "@/components/layout"
import { cn, formatNumber } from "@/lib/utils"
import Link from "next/link"

interface UserRank {
  id: string
  name: string | null
  image: string | null
  level: number
  chatFrame: string
  credibilityScore: number
  totalLikesReceived: number
  totalRankingsPublished: number
  battleWins: number
  mvpCount: number
  _count: {
    subscribers: number
  }
}

interface RankingRank {
  id: string
  title: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
    level: number
  }
  category: {
    name: string
  } | null
}

const TABS = [
  { key: "credibility", label: "战斗力榜", icon: Flame },
  { key: "likes", label: "人气榜", icon: Star },
  { key: "rankings", label: "创作榜", icon: Trophy },
  { key: "battle", label: "辩论榜", icon: Swords },
  { key: "level", label: "等级榜", icon: Crown },
]

const RANK_COLORS = [
  "from-yellow-400 to-orange-500",
  "from-gray-300 to-gray-400",
  "from-orange-400 to-orange-600",
]

const LEVEL_NAMES: Record<number, string> = {
  1: "新兵", 2: "列兵", 3: "上等兵", 4: "下士", 5: "伍长",
  6: "军士", 7: "上士", 8: "军士长", 9: "准尉", 10: "百夫长",
  11: "少校", 12: "中校", 13: "上校", 14: "大校", 15: "准将",
  16: "少将", 17: "中将", 18: "上将", 19: "大将", 20: "将军",
}

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("credibility")
  const [users, setUsers] = useState<UserRank[]>([])
  const [rankings, setRankings] = useState<RankingRank[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchLeaderboard()
  }, [activeTab])

  const fetchLeaderboard = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/leaderboard?type=${activeTab}`)
      const data = await res.json()
      if (data.success) {
        setUsers(data.data.users || [])
        setRankings(data.data.rankings || [])
      }
    } catch (error) {
      console.error("Fetch leaderboard error:", error)
    } finally {
      setLoading(false)
    }
  }

  const getUserValue = (user: UserRank) => {
    switch (activeTab) {
      case "credibility":
        return { label: "战斗力", value: user.credibilityScore }
      case "likes":
        return { label: "获赞", value: user.totalLikesReceived }
      case "rankings":
        return { label: "榜单", value: user.totalRankingsPublished }
      case "battle":
        return { label: "胜场", value: user.battleWins }
      case "level":
        return { label: "等级", value: `Lv.${user.level}` }
      default:
        return { label: "战斗力", value: user.credibilityScore }
    }
  }

  const getLevelName = (level: number) => {
    return LEVEL_NAMES[level] || "新兵"
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Trophy className="h-8 w-8 text-yellow-400" />
              排行榜
            </h1>
            <p className="text-gray-400 mt-2">看看谁是最强的战士！</p>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all flex items-center gap-2",
                  activeTab === tab.key
                    ? "bg-primary-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <h2 className="text-xl font-semibold text-white">
                    {TABS.find((t) => t.key === activeTab)?.label}
                  </h2>
                </CardHeader>
                <CardContent className="pt-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
                    </div>
                  ) : users.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      暂无数据
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {users.map((user, index) => {
                        const valueInfo = getUserValue(user)
                        const levelName = getLevelName(user.level)
                        
                        return (
                          <div
                            key={user.id}
                            className={cn(
                              "flex items-center gap-4 p-4 rounded-lg transition-all",
                              index < 3
                                ? "bg-gradient-to-r from-gray-700/50 to-gray-800/50 border border-gray-600"
                                : "bg-gray-700/30"
                            )}
                          >
                            <div className={cn(
                              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                              index === 0
                                ? "bg-gradient-to-br from-yellow-400 to-orange-500 text-white"
                                : index === 1
                                ? "bg-gradient-to-br from-gray-300 to-gray-400 text-gray-800"
                                : index === 2
                                ? "bg-gradient-to-br from-orange-400 to-orange-600 text-white"
                                : "bg-gray-600 text-gray-300"
                            )}>
                              {index < 3 ? (
                                <Crown className="h-5 w-5" />
                              ) : (
                                index + 1
                              )}
                            </div>

                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold ring-2 ring-primary-500/30">
                              {user.name?.[0] || "?"}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <p className="font-semibold text-white">{user.name}</p>
                                <span className="text-xs px-2 py-0.5 rounded-full bg-primary-500/20 text-primary-400">
                                  Lv.{user.level} {levelName}
                                </span>
                              </div>
                              <p className="text-sm text-gray-400">
                                {user._count.subscribers} 关注者 · {user.totalRankingsPublished} 榜单
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xl font-bold text-white">
                                {typeof valueInfo.value === "number" ? formatNumber(valueInfo.value) : valueInfo.value}
                              </p>
                              <p className="text-xs text-gray-400">{valueInfo.label}</p>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div>
              <Card className="bg-gray-800/50 border-gray-700">
                <CardHeader className="border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    热门榜单
                  </h2>
                </CardHeader>
                <CardContent className="pt-4">
                  {rankings.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      暂无数据
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {rankings.slice(0, 10).map((ranking, index) => (
                        <Link key={ranking.id} href={`/rankings/${ranking.id}`}>
                          <div className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-700/50 transition-all">
                            <span className={cn(
                              "w-6 h-6 rounded flex items-center justify-center text-xs font-bold",
                              index < 3
                                ? `bg-gradient-to-br ${RANK_COLORS[index]} text-white`
                                : "bg-gray-600 text-gray-300"
                            )}>
                              {index + 1}
                            </span>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm text-white truncate">{ranking.title}</p>
                              <p className="text-xs text-gray-400">
                                {ranking.author.name} · {formatNumber(ranking.likeCount)} 赞
                              </p>
                            </div>
                            <ChevronRight className="h-4 w-4 text-gray-500" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
