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

    const existingLike = await prisma.like.findUnique({
      where: {
        userId_rankingId: {
          userId: session.user.id,
          rankingId: params.id,
        },
      },
    })

    if (existingLike) {
      await prisma.like.delete({
        where: { id: existingLike.id },
      })

      const ranking = await prisma.ranking.update({
        where: { id: params.id },
        data: { likeCount: { decrement: 1 } },
        select: { authorId: true, likeCount: true },
      })

      await prisma.user.update({
        where: { id: ranking.authorId },
        data: { totalLikesReceived: { decrement: 1 } },
      })

      const author = await prisma.user.findUnique({
        where: { id: ranking.authorId },
        select: { totalLikesReceived: true, totalRankingsPublished: true },
      })

      if (author) {
        const newScore = calculateCredibilityScore(
          author.totalLikesReceived,
          author.totalRankingsPublished
        )
        const isAuthoritative = checkAuthoritative(
          newScore,
          author.totalRankingsPublished
        )

        await prisma.user.update({
          where: { id: ranking.authorId },
          data: {
            credibilityScore: newScore,
            isAuthoritative: isAuthoritative,
          },
        })
      }

      return NextResponse.json({
        success: true,
        liked: false,
        count: ranking.likeCount,
      })
    } else {
      await prisma.like.create({
        data: {
          userId: session.user.id,
          rankingId: params.id,
        },
      })

      const ranking = await prisma.ranking.update({
        where: { id: params.id },
        data: { likeCount: { increment: 1 } },
        select: { authorId: true, likeCount: true },
      })

      await prisma.user.update({
        where: { id: ranking.authorId },
        data: { totalLikesReceived: { increment: 1 } },
      })

      const author = await prisma.user.findUnique({
        where: { id: ranking.authorId },
        select: { totalLikesReceived: true, totalRankingsPublished: true },
      })

      if (author) {
        const newScore = calculateCredibilityScore(
          author.totalLikesReceived,
          author.totalRankingsPublished
        )
        const isAuthoritative = checkAuthoritative(
          newScore,
          author.totalRankingsPublished
        )

        await prisma.user.update({
          where: { id: ranking.authorId },
          data: {
            credibilityScore: newScore,
            isAuthoritative: isAuthoritative,
          },
        })
      }

      return NextResponse.json({
        success: true,
        liked: true,
        count: ranking.likeCount,
      })
    }
  } catch (error) {
    console.error("Toggle like error:", error)
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 }
    )
  }
}
