import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { calculateCredibilityScore, checkAuthoritative } from "@/lib/utils"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 })
    }

    const ranking = await prisma.ranking.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            totalLikesReceived: true,
            totalRankingsPublished: true,
          },
        },
      },
    })

    if (!ranking) {
      return NextResponse.json({ success: false, error: "榜单不存在" }, { status: 404 })
    }

    if (ranking.authorId !== session.user.id) {
      return NextResponse.json({ success: false, error: "无权限操作" }, { status: 403 })
    }

    if (ranking.status !== "DRAFT" && ranking.status !== "REJECTED") {
      return NextResponse.json({ success: false, error: "当前状态无法提交审核" }, { status: 400 })
    }

    const updatedRanking = await prisma.ranking.update({
      where: { id: params.id },
      data: {
        status: "PUBLISHED",
        publishedAt: new Date(),
      },
    })

    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        totalRankingsPublished: { increment: 1 },
      },
    })

    return NextResponse.json({ success: true, data: updatedRanking })
  } catch (error) {
    console.error("Publish ranking error:", error)
    return NextResponse.json(
      { success: false, error: "发布榜单失败" },
      { status: 500 }
    )
  }
}
