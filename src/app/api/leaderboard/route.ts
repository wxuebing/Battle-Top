import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "credibility"
    const limit = parseInt(searchParams.get("limit") || "20")

    let orderBy: any = { credibilityScore: "desc" }

    switch (type) {
      case "credibility":
        orderBy = { credibilityScore: "desc" }
        break
      case "likes":
        orderBy = { totalLikesReceived: "desc" }
        break
      case "rankings":
        orderBy = { totalRankingsPublished: "desc" }
        break
      case "battle":
        orderBy = { battleWins: "desc" }
        break
      case "mvp":
        orderBy = { mvpCount: "desc" }
        break
      case "subscribers":
        orderBy = { totalLikesReceived: "desc" }
        break
      case "level":
        orderBy = { level: "desc" }
        break
      default:
        orderBy = { credibilityScore: "desc" }
    }

    const users = await prisma.user.findMany({
      where: {
        role: "user",
      },
      select: {
        id: true,
        name: true,
        image: true,
        level: true,
        chatFrame: true,
        nameStyle: true,
        credibilityScore: true,
        totalLikesReceived: true,
        totalRankingsPublished: true,
        battleWins: true,
        mvpCount: true,
        _count: {
          select: {
            subscribers: true,
          },
        },
      },
      orderBy,
      take: limit,
    })

    const rankings = await prisma.ranking.findMany({
      where: { status: "PUBLISHED" },
      select: {
        id: true,
        title: true,
        viewCount: true,
        likeCount: true,
        commentCount: true,
        createdAt: true,
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            level: true,
          },
        },
        category: {
          select: { name: true },
        },
      },
      orderBy: { likeCount: "desc" },
      take: limit,
    })

    return NextResponse.json({
      success: true,
      data: {
        users,
        rankings,
      },
    })
  } catch (error) {
    console.error("Get leaderboard error:", error)
    return NextResponse.json({ success: false, error: "获取排行榜失败" }, { status: 500 })
  }
}
