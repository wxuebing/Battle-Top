"use client"

import { useState } from "react"
import { Send } from "lucide-react"
import { Button, Textarea } from "@/components/ui"
import { Comment } from "@/types"
import { formatDate } from "@/lib/utils"
import Link from "next/link"

interface CommentSectionProps {
  rankingId: string
  initialComments: Comment[]
}

export function CommentSection({
  rankingId,
  initialComments,
}: CommentSectionProps) {
  const [comments, setComments] = useState(initialComments)
  const [content, setContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!content.trim()) return

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/rankings/${rankingId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      })

      if (response.ok) {
        const data = await response.json()
        setComments([data.comment, ...comments])
        setContent("")
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-3">
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="写下你的评论..."
          rows={3}
        />
        <div className="flex justify-end">
          <Button type="submit" disabled={!content.trim() || isSubmitting}>
            <Send className="h-4 w-4 mr-2" />
            发表评论
          </Button>
        </div>
      </form>

      <div className="space-y-4">
        {comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            暂无评论，成为第一个评论的人吧！
          </p>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-2">
                <Link href={`/user/${comment.user.id}`}>
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                    {comment.user.image ? (
                      <img
                        src={comment.user.image}
                        alt={comment.user.name || ""}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <span className="text-sm text-gray-500">
                        {comment.user.name?.charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                </Link>
                <div>
                  <Link
                    href={`/user/${comment.user.id}`}
                    className="font-medium text-gray-900 hover:text-primary-600"
                  >
                    {comment.user.name}
                  </Link>
                  <p className="text-xs text-gray-500">
                    {formatDate(comment.createdAt)}
                  </p>
                </div>
              </div>
              <p className="text-gray-700 pl-11">{comment.content}</p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
