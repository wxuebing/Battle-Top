import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const profileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  bio: z.string().max(200).optional(),
  image: z.string().url().optional().or(z.literal("")),
  title: z.string().max(30).optional(),
  website: z.string().url().optional().or(z.literal("")),
  weibo: z.string().max(50).optional(),
  twitter: z.string().max(50).optional(),
  github: z.string().max(50).optional(),
})

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        title: true,
        imageSource: true,
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
        level: true,
        exp: true,
        chatFrame: true,
        nameStyle: true,
        createdAt: true,
        _count: {
          select: {
            rankings: true,
            likes: true,
            subscribers: true,
            subscriptions: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ success: false, error: "用户不存在" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Get profile error:", error)
    return NextResponse.json({ success: false, error: "获取用户信息失败" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = profileSchema.parse(body)

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name: validatedData.name,
        bio: validatedData.bio,
        image: validatedData.image,
        title: validatedData.title,
        website: validatedData.website,
        weibo: validatedData.weibo,
        twitter: validatedData.twitter,
        github: validatedData.github,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        title: true,
        imageSource: true,
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
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Update profile error:", error)
    return NextResponse.json({ success: false, error: "更新用户信息失败" }, { status: 500 })
  }
}
