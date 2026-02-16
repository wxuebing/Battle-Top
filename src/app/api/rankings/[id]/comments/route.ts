import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const rankingId = params.id
    const { searchParams } = new URL(request.url)
    const sortBy = searchParams.get("sortBy") || "hot"
    const session = await getServerSession(authOptions)

    const orderBy = sortBy === "hot" 
      ? { likeCount: "desc" as const }
      : { createdAt: "desc" as const }

    const comments = await prisma.comment.findMany({
      where: {
        rankingId,
        parentId: null,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isAuthoritative: true,
            credibilityScore: true,
          },
        },
        replies: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true,
                isAuthoritative: true,
              },
            },
            likes: session?.user?.id
              ? {
                  where: { userId: session.user.id },
                  select: { id: true },
                }
              : false,
          },
          orderBy: { createdAt: "asc" },
          take: 5,
        },
        likes: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { id: true },
            }
          : false,
      },
      orderBy,
    })

    const totalComments = await prisma.comment.count({
      where: { rankingId },
    })

    const formattedComments = comments.map((comment) => ({
      ...comment,
      isLiked: comment.likes ? (comment.likes as any[]).length > 0 : false,
      replies: comment.replies.map((reply) => ({
        ...reply,
        isLiked: reply.likes ? (reply.likes as any[]).length > 0 : false,
      })),
    }))

    return NextResponse.json({
      success: true,
      data: {
        comments: formattedComments,
        total: totalComments,
      },
    })
  } catch (error) {
    console.error("Get comments error:", error)
    return NextResponse.json(
      { success: false, error: "获取评论失败" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      )
    }

    const rankingId = params.id
    const body = await request.json()
    const { content, parentId } = body

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: "评论内容不能为空" },
        { status: 400 }
      )
    }

    if (content.length > 500) {
      return NextResponse.json(
        { success: false, error: "评论内容不能超过500字" },
        { status: 400 }
      )
    }

    const comment = await prisma.comment.create({
      data: {
        content: content.trim(),
        userId: session.user.id,
        rankingId,
        parentId: parentId || undefined,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isAuthoritative: true,
            credibilityScore: true,
          },
        },
      },
    })

    if (parentId) {
      await prisma.comment.update({
        where: { id: parentId },
        data: { replyCount: { increment: 1 } },
      })
    }

    await prisma.ranking.update({
      where: { id: rankingId },
      data: { commentCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: { ...comment, isLiked: false, replies: [] },
    })
  } catch (error) {
    console.error("Create comment error:", error)
    return NextResponse.json(
      { success: false, error: "发表评论失败" },
      { status: 500 }
    )
  }
}
