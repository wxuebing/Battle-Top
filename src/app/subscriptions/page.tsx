"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui"
import { SubscribeButton } from "@/components/user"
import { ArrowLeft, Users, Bell, FileText, Calendar } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface Subscription {
  id: string
  name: string | null
  image: string | null
  bio: string | null
  title: string | null
  createdAt: string
  _count: {
    rankings: number
    subscribers: number
  }
}

interface SubscriptionStats {
  totalSubscriptions: number
  totalSubscribers: number
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([])
  const [stats, setStats] = useState<SubscriptionStats>({ totalSubscriptions: 0, totalSubscribers: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"subscriptions" | "subscribers">("subscriptions")

  const fetchSubscriptions = useCallback(async () => {
    setIsLoading(true)
    try {
      const endpoint = activeTab === "subscriptions" ? "/api/user/subscriptions" : "/api/user/subscribers"
      const response = await fetch(endpoint)
      const data = await response.json()
      if (data.success) {
        setSubscriptions(data.data.users || [])
        setStats({
          totalSubscriptions: data.data.totalSubscriptions || 0,
          totalSubscribers: data.data.totalSubscribers || 0,
        })
      }
    } catch (error) {
      console.error("Failed to fetch subscriptions:", error)
    } finally {
      setIsLoading(false)
    }
  }, [activeTab])

  useEffect(() => {
    fetchSubscriptions()
  }, [fetchSubscriptions])

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <Link
            href="/profile"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors mb-6"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回个人中心
          </Link>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-xl font-semibold text-gray-900">订阅管理</h1>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <Bell className="h-4 w-4" />
                    {stats.totalSubscriptions} 订阅
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {stats.totalSubscribers} 粉丝
                  </span>
                </div>
              </div>

              <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-lg">
                <button
                  onClick={() => setActiveTab("subscriptions")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "subscriptions"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Bell className="h-4 w-4" />
                  我的订阅
                </button>
                <button
                  onClick={() => setActiveTab("subscribers")}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all ${
                    activeTab === "subscribers"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                >
                  <Users className="h-4 w-4" />
                  我的粉丝
                </button>
              </div>

              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg animate-pulse">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1">
                        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : subscriptions.length === 0 ? (
                <div className="text-center py-12">
                  {activeTab === "subscriptions" ? (
                    <>
                      <Bell className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">暂无订阅</p>
                      <p className="text-sm text-gray-400">去发现页面关注感兴趣的用户吧</p>
                      <Link
                        href="/explore"
                        className="inline-block mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        去发现
                      </Link>
                    </>
                  ) : (
                    <>
                      <Users className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">暂无粉丝</p>
                      <p className="text-sm text-gray-400">创建更多优质榜单来吸引粉丝吧</p>
                    </>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {subscriptions.map((user) => (
                    <div
                      key={user.id}
                      className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                      <Link href={`/user/${user.id}`} className="flex-shrink-0">
                        {user.image ? (
                          <div className="relative w-12 h-12 rounded-full overflow-hidden">
                            <Image
                              src={user.image}
                              alt={user.name || ""}
                              fill
                              className="object-cover"
                              sizes="48px"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
                            <span className="text-lg font-medium text-primary-600">
                              {user.name?.charAt(0).toUpperCase() || "U"}
                            </span>
                          </div>
                        )}
                      </Link>
                      <div className="flex-1 min-w-0">
                        <Link
                          href={`/user/${user.id}`}
                          className="font-medium text-gray-900 hover:text-primary-600 transition-colors"
                        >
                          {user.name || "用户"}
                        </Link>
                        {user.title && (
                          <p className="text-sm text-primary-600">{user.title}</p>
                        )}
                        <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <FileText className="h-3 w-3" />
                            {user._count.rankings} 榜单
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            {user._count.subscribers} 粉丝
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {formatDate(user.createdAt)}
                          </span>
                        </div>
                      </div>
                      {activeTab === "subscriptions" && (
                        <SubscribeButton userId={user.id} showCount={false} />
                      )}
                    </div>
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
