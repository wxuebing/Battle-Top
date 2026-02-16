import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { commentId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "请先登录" },
        { status: 401 }
      )
    }

    const commentId = params.commentId
    const userId = session.user.id

    const existingLike = await prisma.commentLike.findUnique({
      where: {
        userId_commentId: {
          userId,
          commentId,
        },
      },
    })

    if (existingLike) {
      await prisma.commentLike.delete({
        where: { id: existingLike.id },
      })
      await prisma.comment.update({
        where: { id: commentId },
        data: { likeCount: { decrement: 1 } },
      })
      return NextResponse.json({
        success: true,
        liked: false,
        message: "已取消点赞",
      })
    }

    await prisma.commentLike.create({
      data: {
        userId,
        commentId,
      },
    })
    await prisma.comment.update({
      where: { id: commentId },
      data: { likeCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      liked: true,
      message: "点赞成功",
    })
  } catch (error) {
    console.error("Comment like error:", error)
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 }
    )
  }
}
