"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Card, CardContent, CardHeader, Input, Textarea } from "@/components/ui"
import { 
  Swords, Trophy, Users, Flame, Zap, 
  Plus, Search, Clock, Medal, Crown,
  ChevronRight, Target, Coins
} from "lucide-react"
import { Navbar, Footer } from "@/components/layout"
import { cn, formatNumber, formatDate } from "@/lib/utils"
import Link from "next/link"

interface Debate {
  id: string
  title: string
  description: string | null
  status: string
  creatorVotes: number
  challengerVotes: number
  reward: number
  createdAt: string
  startedAt: string | null
  endedAt: string | null
  creator: {
    id: string
    name: string | null
    image: string | null
    level: number
  }
  challenger: {
    id: string
    name: string | null
    image: string | null
    level: number
  } | null
  votes: any[]
}

const STATUS_CONFIG = {
  open: { label: "等待应战", color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/50" },
  active: { label: "辩论进行中", color: "bg-green-500/20 text-green-400 border-green-500/50" },
  ended: { label: "已结束", color: "bg-gray-500/20 text-gray-400 border-gray-500/50" },
}

export default function DebatesPage() {
  const router = useRouter()
  const [debates, setDebates] = useState<Debate[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState("all")
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [userRankings, setUserRankings] = useState<any[]>([])
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    rankingId: "",
    reward: 100,
  })
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchDebates()
  }, [statusFilter])

  const fetchDebates = async () => {
    try {
      const status = statusFilter !== "all" ? `?status=${statusFilter}` : ""
      const res = await fetch(`/api/debates${status}`)
      const data = await res.json()
      if (data.success) {
        setDebates(data.data || [])
      }
    } catch (error) {
      console.error("Fetch debates error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRankings = async () => {
    try {
      const res = await fetch("/api/rankings?author=me")
      const data = await res.json()
      if (data.success) {
        setUserRankings(data.data?.rankings || [])
      }
    } catch (error) {
      console.error("Fetch rankings error:", error)
    }
  }

  const handleCreateDebate = async () => {
    if (!createForm.title || !createForm.rankingId) {
      alert("请填写完整信息")
      return
    }

    setCreating(true)
    try {
      const res = await fetch("/api/debates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(createForm),
      })
      const data = await res.json()
      if (data.success) {
        setShowCreateModal(false)
        setCreateForm({ title: "", description: "", rankingId: "", reward: 100 })
        fetchDebates()
      } else {
        alert(data.error || "创建失败")
      }
    } catch (error) {
      console.error("Create debate error:", error)
      alert("创建失败")
    } finally {
      setCreating(false)
    }
  }

  const openCreateModal = () => {
    fetchUserRankings()
    setShowCreateModal(true)
  }

  const getTotalVotes = (debate: Debate) => debate.creatorVotes + debate.challengerVotes
  
  const getCreatorPercent = (debate: Debate) => {
    const total = getTotalVotes(debate)
    return total > 0 ? Math.round((debate.creatorVotes / total) * 100) : 50
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <Swords className="h-8 w-8 text-red-500" />
                辩论竞技场
              </h1>
              <p className="text-gray-400 mt-2">用榜单对决，赢取战斗币奖励！</p>
            </div>
            <Button
              onClick={openCreateModal}
              className="bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Plus className="h-4 w-4 mr-2" />
              发起辩论
            </Button>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {[
              { key: "all", label: "全部" },
              { key: "open", label: "等待应战" },
              { key: "active", label: "进行中" },
              { key: "ended", label: "已结束" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setStatusFilter(tab.key)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all",
                  statusFilter === tab.key
                    ? "bg-primary-500 text-white"
                    : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="text-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500 mx-auto"></div>
              <p className="text-gray-400 mt-4">加载中...</p>
            </div>
          ) : debates.length === 0 ? (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="py-20 text-center">
                <Swords className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">暂无辩论</p>
                <Button onClick={openCreateModal} className="mt-4">
                  发起第一场辩论
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {debates.map((debate) => (
                <Link key={debate.id} href={`/debates/${debate.id}`}>
                  <Card className="bg-gray-800/50 border-gray-700 hover:border-red-500/50 transition-all cursor-pointer">
                    <CardContent className="pt-6">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="text-lg font-semibold text-white">{debate.title}</h3>
                          {debate.description && (
                            <p className="text-sm text-gray-400 mt-1">{debate.description}</p>
                          )}
                        </div>
                        <span className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          STATUS_CONFIG[debate.status as keyof typeof STATUS_CONFIG]?.color
                        )}>
                          {STATUS_CONFIG[debate.status as keyof typeof STATUS_CONFIG]?.label}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 mb-4">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-bold">
                            {debate.creator.name?.[0] || "?"}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{debate.creator.name}</p>
                            <p className="text-xs text-gray-400">Lv.{debate.creator.level}</p>
                          </div>
                        </div>
                        
                        <div className="flex-1 text-center">
                          <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                            <span className="text-blue-400 font-bold">{debate.creatorVotes}</span>
                            <span>VS</span>
                            <span className="text-red-400 font-bold">{debate.challengerVotes}</span>
                          </div>
                          <div className="h-2 bg-gray-700 rounded-full mt-1 overflow-hidden flex">
                            <div 
                              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                              style={{ width: `${getCreatorPercent(debate)}%` }}
                            />
                            <div 
                              className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                              style={{ width: `${100 - getCreatorPercent(debate)}%` }}
                            />
                          </div>
                        </div>

                        {debate.challenger ? (
                          <div className="flex items-center gap-2">
                            <div>
                              <p className="text-sm font-medium text-white text-right">{debate.challenger.name}</p>
                              <p className="text-xs text-gray-400 text-right">Lv.{debate.challenger.level}</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white font-bold">
                              {debate.challenger.name?.[0] || "?"}
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm text-yellow-400">等待挑战者</p>
                            </div>
                            <div className="w-10 h-10 rounded-full bg-gray-700 border-2 border-dashed border-gray-500 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-500" />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Coins className="h-4 w-4 text-yellow-400" />
                            奖池 {debate.reward * 2} 战斗币
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {getTotalVotes(debate)} 人投票
                          </span>
                        </div>
                        <span>{formatDate(debate.createdAt)}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
            <CardHeader className="border-b border-gray-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Swords className="h-5 w-5 text-red-500" />
                发起辩论
              </h2>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">辩论标题</label>
                <Input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="给你的辩论起个响亮的名字"
                  className="bg-gray-900 border-gray-600"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">描述（可选）</label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="描述你的辩论主题..."
                  className="bg-gray-900 border-gray-600"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">选择你的榜单</label>
                <select
                  value={createForm.rankingId}
                  onChange={(e) => setCreateForm({ ...createForm, rankingId: e.target.value })}
                  className="w-full bg-gray-900 border border-gray-600 rounded-md px-3 py-2 text-white"
                >
                  <option value="">选择一个榜单</option>
                  {userRankings.map((r) => (
                    <option key={r.id} value={r.id}>{r.title}</option>
                  ))}
                </select>
                {userRankings.length === 0 && (
                  <p className="text-xs text-yellow-400 mt-1">你还没有发布的榜单</p>
                )}
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-1">押注战斗币</label>
                <div className="grid grid-cols-4 gap-2">
                  {[50, 100, 200, 500].map((amount) => (
                    <button
                      key={amount}
                      onClick={() => setCreateForm({ ...createForm, reward: amount })}
                      className={cn(
                        "py-2 rounded-md text-sm font-medium transition-all",
                        createForm.reward === amount
                          ? "bg-primary-500 text-white"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      )}
                    >
                      {amount}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">胜者将获得双方押注的总和</p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 border-gray-600"
                >
                  取消
                </Button>
                <Button
                  onClick={handleCreateDebate}
                  isLoading={creating}
                  className="flex-1 bg-gradient-to-r from-red-500 to-orange-500"
                >
                  发起辩论
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
