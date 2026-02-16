export interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  bio: string | null
  credibilityScore: number
  isAuthoritative: boolean
  totalLikesReceived: number
  totalRankingsPublished: number
  createdAt: Date
  updatedAt: Date
}

export interface Category {
  id: string
  name: string
  type: CategoryType
  description: string | null
  icon: string | null
  color: string | null
}

export interface Tag {
  id: string
  name: string
}

export interface RankingItem {
  id: string
  rankingId: string
  name: string
  description: string | null
  imageUrl: string | null
  position: number
  justification: string | null
}

export interface Ranking {
  id: string
  title: string
  description: string | null
  status: RankingStatus
  authorId: string
  categoryId: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  rejectionReason: string | null
  reviewedAt: Date | null
  reviewedBy: string | null
  createdAt: Date
  updatedAt: Date
  publishedAt: Date | null
  author: User
  category: Category | null
  items: RankingItem[]
  tags: Tag[]
  isLiked?: boolean
}

export interface Like {
  id: string
  userId: string
  rankingId: string
  createdAt: Date
}

export interface Comment {
  id: string
  content: string
  userId: string
  rankingId: string
  createdAt: Date
  updatedAt: Date
  user: Pick<User, "id" | "name" | "image">
}

export interface Notification {
  id: string
  userId: string
  type: string
  title: string
  message: string
  read: boolean
  data: string | null
  createdAt: Date
}

export type RankingStatus = "DRAFT" | "PENDING_REVIEW" | "PUBLISHED" | "REJECTED"
export type CategoryType = "AI_MODEL" | "ANIME_CHARACTER" | "EDUCATIONAL_INSTITUTION" | "CUSTOM"

export interface ApiResponse<T = unknown> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
