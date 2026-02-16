"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, RankingDetailSkeleton } from "@/components/ui"
import { LikeButton, BattleCommentSection } from "@/components/ranking"
import { SubscribeButton, DonateButton } from "@/components/user"
import { Award, Eye, MessageCircle, Clock, ArrowLeft, Share2, Trophy, Medal, Crown, Sparkles, Tag } from "lucide-react"
import { formatDate, cn } from "@/lib/utils"
import { isFeatureEnabled } from "@/lib/features"
import { Ranking } from "@/types"

function getRankBadge(index: number) {
  if (index === 0) {
    return {
      bg: "bg-gradient-to-br from-yellow-400 to-amber-500",
      text: "text-white",
      icon: Crown,
      label: "冠军"
    }
  }
  if (index === 1) {
    return {
      bg: "bg-gradient-to-br from-gray-300 to-gray-400",
      text: "text-white",
      icon: Medal,
      label: "亚军"
    }
  }
  if (index === 2) {
    return {
      bg: "bg-gradient-to-br from-orange-400 to-orange-500",
      text: "text-white",
      icon: Medal,
      label: "季军"
    }
  }
  return null
}

export default function RankingDetailPage() {
  const params = useParams()
  const [ranking, setRanking] = useState<Ranking | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRanking()
  }, [params.id])

  async function fetchRanking() {
    try {
      const response = await fetch(`/api/rankings/${params.id}`)
      const data = await response.json()
      if (data.success) {
        setRanking(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch ranking:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <RankingDetailSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (!ranking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">榜单不存在</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <Link
            href="/explore"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回发现
          </Link>

          <Card className="overflow-hidden">
            <div className="bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-8 text-white">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {ranking.category && (
                      <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium bg-white/20 rounded-full backdrop-blur-sm">
                        <Sparkles className="h-3 w-3" />
                        {ranking.category.name}
                      </span>
                    )}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-bold mb-3">
                    {ranking.title}
                  </h1>
                  {ranking.description && (
                    <p className="text-white/80 text-sm md:text-base">{ranking.description}</p>
                  )}
                </div>
                <button className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors">
                  <Share2 className="h-5 w-5" />
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-4 mt-6 pt-4 border-t border-white/20">
                <Link
                  href={`/user/${ranking.author.id}`}
                  className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                >
                  <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center overflow-hidden backdrop-blur-sm">
                    {ranking.author.image ? (
                      <img
                        src={ranking.author.image}
                        alt={ranking.author.name || ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm font-medium">
                        {ranking.author.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="font-medium">{ranking.author.name}</span>
                      {ranking.author.isAuthoritative && (
                        <Award className="h-4 w-4 text-yellow-300" />
                      )}
                    </div>
                    <p className="text-xs text-white/70">
                      信誉分数: {ranking.author.credibilityScore}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-2">
                  <SubscribeButton userId={ranking.author.id} className="bg-white/20 text-white hover:bg-white/30 border border-white/30" />
                  {isFeatureEnabled("DONATION") && (
                    <DonateButton userId={ranking.author.id} userName={ranking.author.name || undefined} rankingId={ranking.id} />
                  )}
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-4 text-sm text-white/80">
                  <span className="flex items-center gap-1">
                    <Eye className="h-4 w-4" />
                    {ranking.viewCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    {ranking.commentCount}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {formatDate(ranking.createdAt)}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {ranking.tags && ranking.tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              <Tag className="h-4 w-4 text-gray-400 mt-1" />
              {ranking.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-full hover:bg-gray-200 transition-colors cursor-pointer"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}

          <Card>
            <CardHeader className="border-b bg-gray-50">
              <div className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-primary-600" />
                <h2 className="text-lg font-semibold">排名列表</h2>
                <span className="text-sm text-gray-500">共 {ranking.items.length} 项</span>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y">
                {ranking.items.map((item, index) => {
                  const badge = getRankBadge(index)
                  const BadgeIcon = badge?.icon

                  return (
                    <div
                      key={item.id}
                      className={cn(
                        "flex gap-4 p-4 md:p-6 transition-colors",
                        index < 3 && "bg-gradient-to-r",
                        index === 0 && "from-yellow-50 to-transparent",
                        index === 1 && "from-gray-50 to-transparent",
                        index === 2 && "from-orange-50 to-transparent",
                        "hover:bg-gray-50"
                      )}
                    >
                      <div className="flex-shrink-0">
                        {badge ? (
                          <div className={cn("w-12 h-12 rounded-xl flex flex-col items-center justify-center shadow-md", badge.bg)}>
                            {BadgeIcon && <BadgeIcon className="h-5 w-5 text-white" />}
                            <span className="text-[10px] font-medium text-white/90">{badge.label}</span>
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center">
                            <span className="text-lg font-bold text-gray-500">{item.position}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-4">
                          {item.imageUrl && (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-20 h-20 rounded-xl object-cover flex-shrink-0 shadow-sm"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900 text-lg">
                              {item.name}
                            </h3>
                            {item.description && (
                              <p className="text-sm text-gray-600 mt-1 leading-relaxed">
                                {item.description}
                              </p>
                            )}
                            {item.justification && (
                              <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200 shadow-sm">
                                <p className="text-sm text-gray-600">
                                  <span className="font-medium text-gray-700">排名理由：</span>
                                  {item.justification}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <LikeButton
                  rankingId={ranking.id}
                  initialLiked={ranking.isLiked || false}
                  initialCount={ranking.likeCount}
                />
                <p className="text-sm text-gray-500">
                  觉得这个榜单有帮助？点个赞支持作者吧！
                </p>
              </div>
            </CardContent>
          </Card>

          <BattleCommentSection
            rankingId={ranking.id}
            authorId={ranking.author.id}
          />
        </div>
      </div>
    </div>
  )
}