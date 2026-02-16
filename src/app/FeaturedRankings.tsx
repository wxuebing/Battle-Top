"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { RankingCard } from "@/components/ranking"
import { RankingCardSkeleton } from "@/components/ui"
import { Ranking } from "@/types"

export function FeaturedRankings() {
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRankings()
  }, [])

  async function fetchRankings() {
    try {
      const response = await fetch("/api/rankings?limit=6")
      const data = await response.json()
      if (data.success) {
        setRankings(data.data.items)
      }
    } catch (error) {
      console.error("Failed to fetch rankings:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">热门榜单</h2>
            <p className="text-gray-500 mt-1">发现社区中最受欢迎的排名榜单</p>
          </div>
          <Link
            href="/explore"
            className="text-primary-600 hover:text-primary-700 font-medium flex items-center gap-1"
          >
            查看全部
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <RankingCardSkeleton key={i} />
            ))}
          </div>
        ) : rankings.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 rounded-xl">
            <p className="text-gray-500">暂无榜单</p>
            <Link href="/create" className="text-primary-600 hover:text-primary-700 mt-2 inline-block">
              成为第一个创建榜单的人
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rankings.map((ranking) => (
              <RankingCard key={ranking.id} ranking={ranking} />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
