"use client"

import { useState } from "react"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui"
import { cn } from "@/lib/utils"

interface LikeButtonProps {
  rankingId: string
  initialLiked: boolean
  initialCount: number
  onLikeChange?: (liked: boolean, count: number) => void
}

export function LikeButton({
  rankingId,
  initialLiked,
  initialCount,
  onLikeChange,
}: LikeButtonProps) {
  const [isLiked, setIsLiked] = useState(initialLiked)
  const [likeCount, setLikeCount] = useState(initialCount)
  const [isLoading, setIsLoading] = useState(false)

  async function handleLike() {
    setIsLoading(true)
    try {
      const response = await fetch(`/api/rankings/${rankingId}/like`, {
        method: "POST",
      })

      if (response.ok) {
        const data = await response.json()
        setIsLiked(data.liked)
        setLikeCount(data.count)
        onLikeChange?.(data.liked, data.count)
      }
    } catch (error) {
      console.error("Failed to toggle like:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLike}
      disabled={isLoading}
      className={cn(
        "gap-2",
        isLiked && "border-red-200 bg-red-50 hover:bg-red-100"
      )}
    >
      <Heart
        className={cn(
          "h-4 w-4 transition-all",
          isLiked && "fill-red-500 text-red-500"
        )}
      />
      <span>{likeCount}</span>
    </Button>
  )
}
