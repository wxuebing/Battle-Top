"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Swords, ArrowRight, Sparkles, Users, Award, Trophy } from "lucide-react"
import { cn } from "@/lib/utils"

interface Stats {
  rankingCount: number
  userCount: number
  authoritativeCount: number
}

export function HeroSection() {
  const [stats, setStats] = useState<Stats>({ rankingCount: 0, userCount: 0, authoritativeCount: 0 })

  useEffect(() => {
    fetchStats()
  }, [])

  async function fetchStats() {
    try {
      const res = await fetch("/api/stats")
      const data = await res.json()
      if (data.success) {
        setStats(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    }
  }

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-accent-50">
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
      <div className="container mx-auto px-4 py-12 md:py-16 lg:py-24">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 md:px-4 py-1.5 md:py-2 bg-gradient-to-r from-primary-100 to-accent-100 rounded-full text-primary-700 text-xs md:text-sm font-medium mb-4 md:mb-6">
            <Swords className="h-3.5 w-3.5 md:h-4 md:w-4" />
            发现、创建、分享排名榜单
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 md:mb-6">
            让你的观点
            <span className="bg-gradient-to-r from-primary-600 to-accent-500 bg-clip-text text-transparent"> 成为榜单</span>
          </h1>

          <p className="text-sm md:text-base lg:text-lg text-gray-600 mb-6 md:mb-8 px-2">
            Battle Top 是一个开放的排名平台，让你可以创建各类排名榜单，
            从AI大模型到动漫角色，从教育机构到任何你感兴趣的领域。
            分享你的专业见解，获得社区认可。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
            <Link
              href="/create"
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors h-12 px-6 text-base bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:opacity-90"
            >
              创建榜单
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center rounded-lg font-medium transition-colors h-12 px-6 text-base border border-gray-300 bg-transparent hover:bg-gray-50"
            >
              浏览榜单
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-8 mt-10 md:mt-16 pt-6 md:pt-8 border-t border-gray-200">
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mb-2 md:mb-3">
                <Trophy className="h-5 w-5 md:h-6 md:w-6 text-primary-600" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.rankingCount}+</p>
              <p className="text-xs md:text-sm text-gray-500">榜单数量</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-2 md:mb-3">
                <Users className="h-5 w-5 md:h-6 md:w-6 text-blue-600" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.userCount}+</p>
              <p className="text-xs md:text-sm text-gray-500">活跃用户</p>
            </div>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-full mb-2 md:mb-3">
                <Award className="h-5 w-5 md:h-6 md:w-6 text-yellow-600" />
              </div>
              <p className="text-xl md:text-2xl font-bold text-gray-900">{stats.authoritativeCount}+</p>
              <p className="text-xs md:text-sm text-gray-500">权威创作者</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
