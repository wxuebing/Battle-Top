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

    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
      include: {
        ranking: {
          select: { authorId: true },
        },
      },
    })

    if (!comment) {
      return NextResponse.json(
        { success: false, error: "评论不存在" },
        { status: 404 }
      )
    }

    if (comment.ranking.authorId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: "只有榜单作者可以设置MVP评论" },
        { status: 403 }
      )
    }

    await prisma.comment.updateMany({
      where: {
        rankingId: comment.rankingId,
        isMVP: true,
      },
      data: { isMVP: false },
    })

    const updatedComment = await prisma.comment.update({
      where: { id: commentId },
      data: { isMVP: true },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            isAuthoritative: true,
          },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedComment,
      message: "已设置为MVP评论",
    })
  } catch (error) {
    console.error("Set MVP error:", error)
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 }
    )
  }
}
