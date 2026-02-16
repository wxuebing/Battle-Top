"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Input, RankingCardSkeleton } from "@/components/ui"
import { RankingCard } from "@/components/ranking"
import { Search, TrendingUp, Sparkles, GraduationCap, MoreHorizontal, ChevronLeft, ChevronRight, SlidersHorizontal, X, Heart, Eye, MessageCircle, Clock, FileText, PlusCircle } from "lucide-react"
import { Ranking, Category } from "@/types"
import { cn } from "@/lib/utils"

const categoryIcons: Record<string, any> = {
  AI_MODEL: Sparkles,
  ANIME_CHARACTER: TrendingUp,
  EDUCATIONAL_INSTITUTION: GraduationCap,
  CUSTOM: MoreHorizontal,
}

const SORT_OPTIONS = [
  { value: "newest", label: "最新发布", icon: Clock },
  { value: "popular", label: "最受欢迎", icon: Heart },
  { value: "views", label: "浏览最多", icon: Eye },
  { value: "comments", label: "评论最多", icon: MessageCircle },
]

const TIME_RANGE_OPTIONS = [
  { value: "all", label: "全部时间" },
  { value: "today", label: "今天" },
  { value: "week", label: "本周" },
  { value: "month", label: "本月" },
  { value: "year", label: "今年" },
]

const MIN_LIKES_OPTIONS = [
  { value: "", label: "不限点赞" },
  { value: "10", label: "10+ 点赞" },
  { value: "50", label: "50+ 点赞" },
  { value: "100", label: "100+ 点赞" },
]

export default function ExplorePage() {
  const [rankings, setRankings] = useState<Ranking[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [timeRange, setTimeRange] = useState<string>("all")
  const [minLikes, setMinLikes] = useState<string>("")
  const [showFilters, setShowFilters] = useState(false)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchRankings = useCallback(async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams()
      if (selectedCategory) params.append("categoryId", selectedCategory)
      if (search) params.append("search", search)
      if (sortBy) params.append("sortBy", sortBy)
      if (timeRange && timeRange !== "all") params.append("timeRange", timeRange)
      if (minLikes) params.append("minLikes", minLikes)
      params.append("page", page.toString())
      params.append("limit", "12")

      const response = await fetch(`/api/rankings?${params}`)
      const data = await response.json()
      if (data.success) {
        setRankings(data.data.items)
        setTotalPages(data.data.totalPages)
      }
    } catch (error) {
      console.error("Failed to fetch rankings:", error)
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory, sortBy, timeRange, minLikes, page, search])

  useEffect(() => {
    fetchRankings()
  }, [fetchRankings])

  useEffect(() => {
    async function fetchCategories() {
      try {
        const response = await fetch("/api/categories")
        const data = await response.json()
        if (data.success) {
          setCategories(data.data)
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error)
      }
    }
    fetchCategories()
  }, [])

  function handleSearch(e: React.FormEvent) {
    e.preventDefault()
    setPage(1)
    fetchRankings()
  }

  function clearFilters() {
    setSelectedCategory("")
    setSortBy("newest")
    setTimeRange("all")
    setMinLikes("")
    setSearch("")
    setPage(1)
  }

  const hasActiveFilters = selectedCategory || timeRange !== "all" || minLikes || search

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-6 md:py-8">
        <div className="max-w-6xl mx-auto space-y-6 md:space-y-8">
          <div className="text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">发现精彩榜单</h1>
            <p className="text-gray-500 mt-2 text-sm md:text-base">浏览社区成员创建的各类排名榜单</p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
            <form onSubmit={handleSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="搜索榜单标题、描述..."
                  className="pl-10"
                />
              </div>
            </form>

            <div className="flex gap-2">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm md:text-base bg-white"
              >
                {SORT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>

              <button
                onClick={() => setShowFilters(!showFilters)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-2 border rounded-lg text-sm transition-colors",
                  showFilters || hasActiveFilters
                    ? "border-primary-500 bg-primary-50 text-primary-600"
                    : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                )}
              >
                <SlidersHorizontal className="h-4 w-4" />
                <span className="hidden sm:inline">筛选</span>
                {hasActiveFilters && (
                  <span className="w-2 h-2 bg-primary-500 rounded-full" />
                )}
              </button>
            </div>
          </div>

          {showFilters && (
            <div className="bg-white border border-gray-200 rounded-xl p-4 space-y-4 animate-fade-in">
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-gray-900">高级筛选</h3>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                  >
                    <X className="h-4 w-4" />
                    清除筛选
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">时间范围</label>
                  <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    {TIME_RANGE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">最低点赞数</label>
                  <select
                    value={minLikes}
                    onChange={(e) => setMinLikes(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    {MIN_LIKES_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">分类</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm"
                  >
                    <option value="">全部分类</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
            <button
              onClick={() => setSelectedCategory("")}
              className={cn(
                "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors whitespace-nowrap",
                !selectedCategory
                  ? "bg-primary-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              )}
            >
              全部
            </button>
            {categories.map((category) => {
              const Icon = categoryIcons[category.type] || MoreHorizontal
              return (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-3 md:px-4 py-1.5 md:py-2 rounded-full text-xs md:text-sm font-medium transition-colors flex items-center gap-1.5 md:gap-2 whitespace-nowrap",
                    selectedCategory === category.id
                      ? "bg-primary-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                >
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4" />
                  {category.name}
                </button>
              )
            })}
          </div>

          {hasActiveFilters && (
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>当前筛选：</span>
              {search && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  搜索: {search}
                  <button onClick={() => setSearch("")} className="hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {timeRange !== "all" && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  {TIME_RANGE_OPTIONS.find(o => o.value === timeRange)?.label}
                  <button onClick={() => setTimeRange("all")} className="hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
              {minLikes && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs">
                  {minLikes}+ 点赞
                  <button onClick={() => setMinLikes("")} className="hover:text-gray-700">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}
            </div>
          )}

          {isLoading ? (
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <RankingCardSkeleton key={i} />
              ))}
            </div>
          ) : rankings.length === 0 ? (
            <div className="text-center py-16">
              <FileText className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg mb-2">暂无符合条件的榜单</p>
              {hasActiveFilters ? (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">尝试调整筛选条件或</p>
                  <button
                    onClick={clearFilters}
                    className="text-primary-600 hover:text-primary-700 font-medium"
                  >
                    清除所有筛选
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-gray-400">成为第一个创建榜单的人吧</p>
                  <Link
                    href="/create"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    <PlusCircle className="h-4 w-4" />
                    创建第一个榜单
                  </Link>
                </div>
              )}
            </div>
          ) : (
            <div className="grid gap-4 md:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {rankings.map((ranking) => (
                <RankingCard key={ranking.id} ranking={ranking} />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 md:gap-4">
              <button
                onClick={() => setPage(Math.max(1, page - 1))}
                disabled={page === 1}
                className="flex items-center gap-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="hidden sm:inline">上一页</span>
              </button>
              <span className="px-3 md:px-4 py-2 text-gray-600 text-sm">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage(Math.min(totalPages, page + 1))}
                disabled={page === totalPages}
                className="flex items-center gap-1 px-3 md:px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 text-sm"
              >
                <span className="hidden sm:inline">下一页</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
