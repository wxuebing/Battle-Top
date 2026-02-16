"use client"

import { useState, useEffect } from "react"
import { Bell, BellOff, Users } from "lucide-react"
import { cn } from "@/lib/utils"

interface SubscribeButtonProps {
  userId: string
  className?: string
  showCount?: boolean
}

export function SubscribeButton({ userId, className, showCount = true }: SubscribeButtonProps) {
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [subscriberCount, setSubscriberCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchSubscriptionStatus()
  }, [userId])

  async function fetchSubscriptionStatus() {
    try {
      const response = await fetch(`/api/user/${userId}/subscribe`)
      const data = await response.json()
      if (data.success) {
        setIsSubscribed(data.data.isSubscribed)
        setSubscriberCount(data.data.subscriberCount)
      }
    } catch (error) {
      console.error("Failed to fetch subscription status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubscribe() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/${userId}/subscribe`, {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        setIsSubscribed(data.subscribed)
        setSubscriberCount((prev) => (data.subscribed ? prev + 1 : prev - 1))
      }
    } catch (error) {
      console.error("Failed to toggle subscription:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading && subscriberCount === 0) {
    return (
      <button
        disabled
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-400",
          className
        )}
      >
        <Users className="h-4 w-4" />
        加载中...
      </button>
    )
  }

  return (
    <button
      onClick={handleSubscribe}
      disabled={isLoading}
      className={cn(
        "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
        isSubscribed
          ? "bg-primary-100 text-primary-700 hover:bg-primary-200"
          : "bg-primary-600 text-white hover:bg-primary-700",
        isLoading && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {isSubscribed ? (
        <>
          <BellOff className="h-4 w-4" />
          已订阅
        </>
      ) : (
        <>
          <Bell className="h-4 w-4" />
          订阅
        </>
      )}
      {showCount && (
        <span className={cn(
          "text-xs px-1.5 py-0.5 rounded-full",
          isSubscribed ? "bg-primary-200" : "bg-white/20"
        )}>
          {subscriberCount}
        </span>
      )}
    </button>
  )
}
