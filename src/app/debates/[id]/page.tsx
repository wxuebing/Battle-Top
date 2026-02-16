"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button, Card, CardContent, CardHeader } from "@/components/ui"
import { 
  Swords, Trophy, Users, Flame, 
  Clock, Medal, Crown, Coins,
  Vote, CheckCircle, AlertCircle, ChevronRight
} from "lucide-react"
import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface Debate {
  id: string
  title: string
  description: string | null
  status: string
  creatorVotes: number
  challengerVotes: number
  reward: number
  winnerId: string | null
  createdAt: string
  startedAt: string | null
  endedAt: string | null
  creator: {
    id: string
    name: string | null
    image: string | null
    level: number
    chatFrame: string
  }
  challenger: {
    id: string
    name: string | null
    image: string | null
    level: number
    chatFrame: string
  } | null
  votes: {
    id: string
    voteFor: string
    user: {
      id: string
      name: string | null
      image: string | null
    }
  }[]
}

export default function DebateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [debate, setDebate] = useState<Debate | null>(null)
  const [loading, setLoading] = useState(true)
  const [userRankings, setUserRankings] = useState<any[]>([])
  const [showChallengeModal, setShowChallengeModal] = useState(false)
  const [selectedRankingId, setSelectedRankingId] = useState("")
  const [challenging, setChallenging] = useState(false)
  const [voting, setVoting] = useState(false)
  const [myVote, setMyVote] = useState<string | null>(null)

  useEffect(() => {
    fetchDebate()
  }, [params.id])

  const fetchDebate = async () => {
    try {
      const res = await fetch(`/api/debates/${params.id}`)
      const data = await res.json()
      if (data.success) {
        setDebate(data.data)
      }
    } catch (error) {
      console.error("Fetch debate error:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchUserRankings = async () => {
    try {
      const res = await fetch("/api/rankings?author=me&status=PUBLISHED")
      const data = await res.json()
      if (data.success) {
        setUserRankings(data.data.rankings || [])
      }
    } catch (error) {
      console.error("Fetch rankings error:", error)
    }
  }

  const handleChallenge = async () => {
    if (!selectedRankingId) {
      alert("请选择一个榜单")
      return
    }

    setChallenging(true)
    try {
      const res = await fetch(`/api/debates/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "challenge", rankingId: selectedRankingId }),
      })
      const data = await res.json()
      if (data.success) {
        setShowChallengeModal(false)
        fetchDebate()
      } else {
        alert(data.error || "应战失败")
      }
    } catch (error) {
      console.error("Challenge error:", error)
      alert("应战失败")
    } finally {
      setChallenging(false)
    }
  }

  const handleVote = async (voteFor: string) => {
    setVoting(true)
    try {
      const res = await fetch(`/api/debates/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "vote", voteFor }),
      })
      const data = await res.json()
      if (data.success) {
        setMyVote(voteFor)
        fetchDebate()
      } else {
        alert(data.error || "投票失败")
      }
    } catch (error) {
      console.error("Vote error:", error)
      alert("投票失败")
    } finally {
      setVoting(false)
    }
  }

  const handleEnd = async () => {
    if (!confirm("确定要结束辩论吗？")) return

    try {
      const res = await fetch(`/api/debates/${params.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "end" }),
      })
      const data = await res.json()
      if (data.success) {
        fetchDebate()
      } else {
        alert(data.error || "结束失败")
      }
    } catch (error) {
      console.error("End debate error:", error)
      alert("结束失败")
    }
  }

  const getTotalVotes = () => (debate?.creatorVotes || 0) + (debate?.challengerVotes || 0)
  
  const getCreatorPercent = () => {
    const total = getTotalVotes()
    return total > 0 ? Math.round((debate!.creatorVotes / total) * 100) : 50
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!debate) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <p className="text-gray-400">辩论不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <Link href="/debates" className="text-gray-400 hover:text-white flex items-center gap-1">
              <ChevronRight className="h-4 w-4 rotate-180" />
              返回辩论列表
            </Link>
          </div>

          <Card className="bg-gray-800/50 border-gray-700 mb-6">
            <CardContent className="pt-6">
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-white mb-2">{debate.title}</h1>
                {debate.description && (
                  <p className="text-gray-400">{debate.description}</p>
                )}
                <div className="flex items-center justify-center gap-4 mt-4 text-sm text-gray-400">
                  <span className="flex items-center gap-1">
                    <Coins className="h-4 w-4 text-yellow-400" />
                    奖池 {debate.reward * 2} 战斗币
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {getTotalVotes()} 人投票
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-4 mb-8">
                <div className="flex-1 text-center">
                  <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2 ring-4 ring-blue-500/30">
                    {debate.creator.name?.[0] || "?"}
                  </div>
                  <p className="font-semibold text-white">{debate.creator.name}</p>
                  <p className="text-xs text-gray-400">Lv.{debate.creator.level}</p>
                  <p className="text-sm text-blue-400 mt-1 font-bold">{debate.creatorVotes} 票</p>
                </div>

                <div className="flex-1">
                  <div className="text-center mb-2">
                    <span className="text-2xl font-bold text-white">VS</span>
                  </div>
                  <div className="h-4 bg-gray-700 rounded-full overflow-hidden flex">
                    <div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all"
                      style={{ width: `${getCreatorPercent()}%` }}
                    />
                    <div 
                      className="h-full bg-gradient-to-r from-red-500 to-orange-500 transition-all"
                      style={{ width: `${100 - getCreatorPercent()}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>{getCreatorPercent()}%</span>
                    <span>{100 - getCreatorPercent()}%</span>
                  </div>
                </div>

                <div className="flex-1 text-center">
                  {debate.challenger ? (
                    <>
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2 ring-4 ring-red-500/30">
                        {debate.challenger.name?.[0] || "?"}
                      </div>
                      <p className="font-semibold text-white">{debate.challenger.name}</p>
                      <p className="text-xs text-gray-400">Lv.{debate.challenger.level}</p>
                      <p className="text-sm text-red-400 mt-1 font-bold">{debate.challengerVotes} 票</p>
                    </>
                  ) : (
                    <>
                      <div className="w-20 h-20 rounded-full bg-gray-700 border-2 border-dashed border-gray-500 flex items-center justify-center mx-auto mb-2">
                        <Users className="h-8 w-8 text-gray-500" />
                      </div>
                      <p className="text-yellow-400">等待挑战者</p>
                    </>
                  )}
                </div>
              </div>

              {debate.status === "open" && !debate.challenger && (
                <div className="text-center">
                  <Button
                    onClick={() => {
                      fetchUserRankings()
                      setShowChallengeModal(true)
                    }}
                    className="bg-gradient-to-r from-red-500 to-orange-500"
                  >
                    <Swords className="h-4 w-4 mr-2" />
                    应战！
                  </Button>
                </div>
              )}

              {debate.status === "active" && !myVote && (
                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={() => handleVote("creator")}
                    isLoading={voting}
                    className="bg-gradient-to-r from-blue-500 to-cyan-500"
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    投给 {debate.creator.name}
                  </Button>
                  <Button
                    onClick={() => handleVote("challenger")}
                    isLoading={voting}
                    className="bg-gradient-to-r from-red-500 to-orange-500"
                  >
                    <Vote className="h-4 w-4 mr-2" />
                    投给 {debate.challenger?.name}
                  </Button>
                </div>
              )}

              {myVote && (
                <div className="text-center">
                  <p className="text-green-400 flex items-center justify-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    已投票
                  </p>
                </div>
              )}

              {debate.status === "ended" && debate.winnerId && (
                <div className="text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/50 rounded-full">
                    <Crown className="h-5 w-5 text-yellow-400" />
                    <span className="text-yellow-400 font-bold">
                      {debate.winnerId === debate.creator.id ? debate.creator.name : debate.challenger?.name} 获胜！
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {debate.status === "active" && (
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="pt-6 text-center">
                <p className="text-gray-400 mb-4">辩论进行中，投票决定胜负！</p>
                <Button onClick={handleEnd} variant="outline" className="border-gray-600">
                  结束辩论
                </Button>
              </CardContent>
            </Card>
          )}

          {debate.votes.length > 0 && (
            <Card className="bg-gray-800/50 border-gray-700 mt-6">
              <CardHeader className="border-b border-gray-700">
                <h3 className="text-lg font-semibold text-white">投票记录</h3>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="space-y-2">
                  {debate.votes.slice(0, 10).map((vote) => (
                    <div key={vote.id} className="flex items-center justify-between py-2 border-b border-gray-700/50">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-sm">
                          {vote.user.name?.[0] || "?"}
                        </div>
                        <span className="text-gray-300">{vote.user.name}</span>
                      </div>
                      <span className={cn(
                        "text-sm font-medium",
                        vote.voteFor === "creator" ? "text-blue-400" : "text-red-400"
                      )}>
                        投给 {vote.voteFor === "creator" ? debate.creator.name : debate.challenger?.name}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {showChallengeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="bg-gray-800 border-gray-700 w-full max-w-md">
            <CardHeader className="border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">选择你的榜单应战</h2>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              {userRankings.length === 0 ? (
                <div className="text-center py-8">
                  <AlertCircle className="h-12 w-12 text-yellow-400 mx-auto mb-2" />
                  <p className="text-gray-400">你还没有发布的榜单</p>
                  <Link href="/create">
                    <Button className="mt-4">创建榜单</Button>
                  </Link>
                </div>
              ) : (
                <>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userRankings.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => setSelectedRankingId(r.id)}
                        className={cn(
                          "w-full p-3 rounded-lg text-left transition-all",
                          selectedRankingId === r.id
                            ? "bg-primary-500/20 border border-primary-500"
                            : "bg-gray-700/50 border border-gray-600 hover:border-gray-500"
                        )}
                      >
                        <p className="text-white font-medium">{r.title}</p>
                        <p className="text-xs text-gray-400 mt-1">
                          {r._count?.items || 0} 个项目 · {r.likeCount || 0} 赞
                        </p>
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-3 pt-4">
                    <Button
                      variant="outline"
                      onClick={() => setShowChallengeModal(false)}
                      className="flex-1 border-gray-600"
                    >
                      取消
                    </Button>
                    <Button
                      onClick={handleChallenge}
                      isLoading={challenging}
                      disabled={!selectedRankingId}
                      className="flex-1 bg-gradient-to-r from-red-500 to-orange-500"
                    >
                      确认应战
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      <Footer />
    </div>
  )
}
