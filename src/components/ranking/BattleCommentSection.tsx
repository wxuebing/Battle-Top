"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Swords, Flame, Trophy, MessageSquare, ChevronDown, ChevronUp, Send, Crown, Shield, Zap, AlertTriangle } from "lucide-react"
import { cn, formatTimeAgo } from "@/lib/utils"
import { Button } from "@/components/ui"

interface Comment {
  id: string
  content: string
  likeCount: number
  replyCount: number
  isMVP: boolean
  createdAt: string
  isLiked: boolean
  user: {
    id: string
    name: string | null
    image: string | null
    isAuthoritative: boolean
    credibilityScore: number
  }
  replies?: Comment[]
}

interface BattleCommentSectionProps {
  rankingId: string
  authorId: string
}

export function BattleCommentSection({ rankingId, authorId }: BattleCommentSectionProps) {
  const { data: session } = useSession()
  const [comments, setComments] = useState<Comment[]>([])
  const [total, setTotal] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [sortBy, setSortBy] = useState<"hot" | "new">("hot")
  const [newComment, setNewComment] = useState("")
  const [replyTo, setReplyTo] = useState<Comment | null>(null)
  const [replyContent, setReplyContent] = useState("")
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchComments()
  }, [rankingId, sortBy])

  async function fetchComments() {
    try {
      const response = await fetch(`/api/rankings/${rankingId}/comments?sortBy=${sortBy}`)
      const data = await response.json()
      if (data.success) {
        setComments(data.data.comments)
        setTotal(data.data.total)
      }
    } catch (error) {
      console.error("Failed to fetch comments:", error)
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSubmitComment(e: React.FormEvent) {
    e.preventDefault()
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/rankings/${rankingId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newComment }),
      })
      const data = await response.json()
      if (data.success) {
        setComments([data.data, ...comments])
        setTotal(total + 1)
        setNewComment("")
      }
    } catch (error) {
      console.error("Failed to post comment:", error)
    }
  }

  async function handleSubmitReply(parentId: string) {
    if (!replyContent.trim()) return

    try {
      const response = await fetch(`/api/rankings/${rankingId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: replyContent, parentId }),
      })
      const data = await response.json()
      if (data.success) {
        fetchComments()
        setReplyTo(null)
        setReplyContent("")
      }
    } catch (error) {
      console.error("Failed to post reply:", error)
    }
  }

  async function handleLike(commentId: string) {
    if (!session) return

    try {
      const response = await fetch(`/api/comments/${commentId}/like`, {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        setComments(
          comments.map((c) => {
            if (c.id === commentId) {
              return {
                ...c,
                isLiked: data.liked,
                likeCount: data.liked ? c.likeCount + 1 : c.likeCount - 1,
              }
            }
            if (c.replies) {
              return {
                ...c,
                replies: c.replies.map((r) =>
                  r.id === commentId
                    ? {
                        ...r,
                        isLiked: data.liked,
                        likeCount: data.liked ? r.likeCount + 1 : r.likeCount - 1,
                      }
                    : r
                ),
              }
            }
            return c
          })
        )
      }
    } catch (error) {
      console.error("Failed to like comment:", error)
    }
  }

  async function handleSetMVP(commentId: string) {
    try {
      const response = await fetch(`/api/comments/${commentId}/mvp`, {
        method: "POST",
      })
      const data = await response.json()
      if (data.success) {
        fetchComments()
      }
    } catch (error) {
      console.error("Failed to set MVP:", error)
    }
  }

  function toggleReplies(commentId: string) {
    const newExpanded = new Set(expandedReplies)
    if (newExpanded.has(commentId)) {
      newExpanded.delete(commentId)
    } else {
      newExpanded.add(commentId)
    }
    setExpandedReplies(newExpanded)
  }

  const mvpComment = comments.find((c) => c.isMVP)
  const regularComments = comments.filter((c) => !c.isMVP)

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
              <Swords className="h-5 w-5 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">观点竞技场</h3>
              <p className="text-sm text-gray-400">{total} 位战士已发声</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortBy("hot")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                sortBy === "hot"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              <Flame className="h-4 w-4 inline mr-1" />
              最热
            </button>
            <button
              onClick={() => setSortBy("new")}
              className={cn(
                "px-3 py-1.5 text-sm rounded-lg transition-colors",
                sortBy === "new"
                  ? "bg-orange-500 text-white"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600"
              )}
            >
              <Zap className="h-4 w-4 inline mr-1" />
              最新
            </button>
          </div>
        </div>
      </div>

      {session && (
        <form onSubmit={handleSubmitComment} className="p-4 border-b border-gray-100 bg-gray-50">
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-3">
            <div className="flex items-center gap-1.5 text-xs text-red-600">
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>请文明发言，禁止发布违法违规内容</span>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center text-white font-bold">
              {session.user?.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="发表你的观点，加入战斗..."
                rows={2}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              />
              <div className="flex justify-between items-center mt-2">
                <span className="text-xs text-gray-400">{newComment.length}/500</span>
                <Button type="submit" size="sm" disabled={!newComment.trim()}>
                  <Send className="h-4 w-4 mr-1" />
                  发表观点
                </Button>
              </div>
            </div>
          </div>
        </form>
      )}

      <div className="divide-y divide-gray-100">
        {mvpComment && (
          <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 border-l-4 border-yellow-500">
            <div className="flex items-center gap-2 mb-3">
              <Crown className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-bold text-yellow-700">MVP 最佳观点</span>
              <span className="text-xs text-yellow-600">由榜单作者选出</span>
            </div>
            <CommentCard
              comment={mvpComment}
              isAuthor={session?.user?.id === authorId}
              onLike={handleLike}
              onSetMVP={handleSetMVP}
              onReply={() => setReplyTo(mvpComment)}
              isMVP
            />
          </div>
        )}

        {isLoading ? (
          <div className="p-8 text-center text-gray-400">加载中...</div>
        ) : regularComments.length === 0 ? (
          <div className="p-8 text-center">
            <Swords className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">还没有人发表观点</p>
            <p className="text-sm text-gray-400 mt-1">成为第一个加入战斗的人吧！</p>
          </div>
        ) : (
          regularComments.map((comment) => (
            <div key={comment.id} className="p-4">
              <CommentCard
                comment={comment}
                isAuthor={session?.user?.id === authorId}
                onLike={handleLike}
                onSetMVP={handleSetMVP}
                onReply={() => setReplyTo(comment)}
              />
              
              {comment.replies && comment.replies.length > 0 && (
                <div className="mt-3 ml-12 space-y-2">
                  {comment.replies.slice(0, expandedReplies.has(comment.id) ? undefined : 2).map((reply) => (
                    <ReplyCard
                      key={reply.id}
                      comment={reply}
                      onLike={handleLike}
                    />
                  ))}
                  {(comment.replyCount > 2 || expandedReplies.has(comment.id)) && (
                    <button
                      onClick={() => toggleReplies(comment.id)}
                      className="text-sm text-primary-600 hover:text-primary-700 flex items-center gap-1"
                    >
                      {expandedReplies.has(comment.id) ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          收起回复
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          展开 {comment.replyCount - 2} 条回复
                        </>
                      )}
                    </button>
                  )}
                </div>
              )}

              {replyTo?.id === comment.id && (
                <div className="mt-3 ml-12 flex gap-2">
                  <input
                    type="text"
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder={`回复 ${comment.user.name}...`}
                    className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary-500"
                  />
                  <Button size="sm" onClick={() => handleSubmitReply(comment.id)}>
                    回复
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => setReplyTo(null)}>
                    取消
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

function CommentCard({
  comment,
  isAuthor,
  onLike,
  onSetMVP,
  onReply,
  isMVP = false,
}: {
  comment: Comment
  isAuthor: boolean
  onLike: (id: string) => void
  onSetMVP: (id: string) => void
  onReply: () => void
  isMVP?: boolean
}) {
  return (
    <div className="flex gap-3">
      <div className="flex-shrink-0">
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold overflow-hidden",
          comment.user.isAuthoritative
            ? "bg-gradient-to-br from-yellow-400 to-orange-500"
            : "bg-gradient-to-br from-gray-400 to-gray-500"
        )}>
          {comment.user.image ? (
            <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
          ) : (
            comment.user.name?.charAt(0).toUpperCase() || "U"
          )}
        </div>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-gray-900">{comment.user.name}</span>
          {comment.user.isAuthoritative && (
            <Shield className="h-4 w-4 text-yellow-500" />
          )}
          <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-gray-700 mt-1 leading-relaxed">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <button
            onClick={() => onLike(comment.id)}
            className={cn(
              "flex items-center gap-1 text-sm transition-colors",
              comment.isLiked
                ? "text-orange-500"
                : "text-gray-400 hover:text-orange-500"
            )}
          >
            <Flame className={cn("h-4 w-4", comment.isLiked && "fill-current")} />
            <span>{comment.likeCount > 0 ? comment.likeCount : "助威"}</span>
          </button>
          <button
            onClick={onReply}
            className="flex items-center gap-1 text-sm text-gray-400 hover:text-primary-600"
          >
            <MessageSquare className="h-4 w-4" />
            <span>回应</span>
          </button>
          {isAuthor && !isMVP && (
            <button
              onClick={() => onSetMVP(comment.id)}
              className="flex items-center gap-1 text-sm text-gray-400 hover:text-yellow-600"
            >
              <Trophy className="h-4 w-4" />
              <span>设为MVP</span>
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

function ReplyCard({
  comment,
  onLike,
}: {
  comment: Comment
  onLike: (id: string) => void
}) {
  return (
    <div className="flex gap-2 p-2 bg-gray-50 rounded-lg">
      <div className="flex-shrink-0 w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-white text-xs font-bold overflow-hidden">
        {comment.user.image ? (
          <img src={comment.user.image} alt="" className="w-full h-full object-cover" />
        ) : (
          comment.user.name?.charAt(0).toUpperCase() || "U"
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-800">{comment.user.name}</span>
          <span className="text-xs text-gray-400">{formatTimeAgo(comment.createdAt)}</span>
        </div>
        <p className="text-sm text-gray-600">{comment.content}</p>
        <button
          onClick={() => onLike(comment.id)}
          className={cn(
            "flex items-center gap-1 text-xs mt-1 transition-colors",
            comment.isLiked
              ? "text-orange-500"
              : "text-gray-400 hover:text-orange-500"
          )}
        >
          <Flame className={cn("h-3 w-3", comment.isLiked && "fill-current")} />
          <span>{comment.likeCount > 0 ? comment.likeCount : "助威"}</span>
        </button>
      </div>
    </div>
  )
}
