"use client"

import Link from "next/link"
import { Heart, Eye, MessageCircle, Award, Clock } from "lucide-react"
import { Card } from "@/components/ui"
import { Ranking } from "@/types"
import { formatNumber, formatDate, cn } from "@/lib/utils"

interface RankingCardProps {
  ranking: Ranking
  showAuthor?: boolean
}

export function RankingCard({ ranking, showAuthor = true }: RankingCardProps) {
  const topItems = ranking.items.slice(0, 3)

  return (
    <Link href={`/ranking/${ranking.id}`}>
      <Card hover className="h-full">
        <div className="p-5 space-y-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-gray-900 truncate text-lg">
                {ranking.title}
              </h3>
              {ranking.category && (
                <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-primary-50 text-primary-700 rounded-full">
                  {ranking.category.name}
                </span>
              )}
            </div>
          </div>

          <div className="space-y-2">
            {topItems.map((item, index) => (
              <div key={item.id} className="flex items-center space-x-3">
                <span
                  className={cn(
                    "flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold",
                    index === 0 && "bg-yellow-100 text-yellow-700",
                    index === 1 && "bg-gray-100 text-gray-700",
                    index === 2 && "bg-orange-100 text-orange-700"
                  )}
                >
                  {item.position}
                </span>
                <span className="text-sm text-gray-700 truncate">{item.name}</span>
              </div>
            ))}
            {ranking.items.length > 3 && (
              <p className="text-xs text-gray-400 pl-9">
                还有 {ranking.items.length - 3} 项...
              </p>
            )}
          </div>

          {showAuthor && ranking.author && (
            <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
              <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {ranking.author.image ? (
                  <img
                    src={ranking.author.image}
                    alt={ranking.author.name || ""}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <span className="text-xs text-gray-500">
                    {ranking.author.name?.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <span className="text-sm text-gray-600">{ranking.author.name}</span>
              {ranking.author.isAuthoritative && (
                <Award className="h-4 w-4 text-yellow-500" />
              )}
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <span className="flex items-center space-x-1">
                <Heart
                  className={cn(
                    "h-4 w-4",
                    ranking.isLiked ? "fill-red-500 text-red-500" : ""
                  )}
                />
                <span>{formatNumber(ranking.likeCount)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <MessageCircle className="h-4 w-4" />
                <span>{formatNumber(ranking.commentCount)}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Eye className="h-4 w-4" />
                <span>{formatNumber(ranking.viewCount)}</span>
              </span>
            </div>
            <span className="flex items-center space-x-1 text-xs">
              <Clock className="h-3 w-3" />
              <span>{formatDate(ranking.createdAt)}</span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
