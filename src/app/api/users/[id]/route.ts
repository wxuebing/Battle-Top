import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        image: true,
        bio: true,
        title: true,
        credibilityScore: true,
        isAuthoritative: true,
        totalLikesReceived: true,
        totalRankingsPublished: true,
        idCardVerified: true,
        website: true,
        weibo: true,
        twitter: true,
        github: true,
        battleWins: true,
        battleLosses: true,
        mvpCount: true,
        createdAt: true,
        rankings: {
          where: { status: "PUBLISHED" },
          select: {
            id: true,
            title: true,
            description: true,
            likeCount: true,
            viewCount: true,
            commentCount: true,
            createdAt: true,
            category: {
              select: { id: true, name: true },
            },
            items: {
              select: { id: true, name: true, position: true },
              orderBy: { position: "asc" },
              take: 3,
            },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        },
        _count: {
          select: {
            rankings: { where: { status: "PUBLISHED" } },
            likes: true,
            subscribers: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Get user error:", error)
    return NextResponse.json({ success: false, error: "获取用户信息失败" }, { status: 500 })
  }
}
