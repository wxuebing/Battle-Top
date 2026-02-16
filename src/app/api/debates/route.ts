import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULT_REWARD = 100

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") || "all"

    const where = status !== "all" ? { status } : {}

    const debates = await prisma.debate.findMany({
      where,
      include: {
        creator: {
          select: { id: true, name: true, image: true, level: true },
        },
        challenger: {
          select: { id: true, name: true, image: true, level: true },
        },
        votes: true,
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    return NextResponse.json({ success: true, data: debates })
  } catch (error) {
    console.error("Get debates error:", error)
    return NextResponse.json({ success: false, error: "获取辩论失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, rankingId, reward = DEFAULT_REWARD } = body

    const ranking = await prisma.ranking.findUnique({
      where: { id: rankingId },
    })

    if (!ranking) {
      return NextResponse.json({ success: false, error: "榜单不存在" }, { status: 404 })
    }

    if (ranking.authorId !== session.user.id) {
      return NextResponse.json({ success: false, error: "只能用自己的榜单发起辩论" }, { status: 403 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet || wallet.balance < reward) {
      return NextResponse.json({ success: false, error: "战斗币不足" }, { status: 400 })
    }

    const debate = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: session.user.id },
        data: { balance: { decrement: reward } },
      }),
      prisma.debate.create({
        data: {
          title,
          description,
          creatorId: session.user.id,
          creatorRankingId: rankingId,
          reward,
          status: "open",
        },
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "DEBATE_CREATE",
          amount: -reward,
          description: `创建辩论「${title}」`,
        },
      }),
    ])

    return NextResponse.json({ success: true, data: debate[1] })
  } catch (error) {
    console.error("Create debate error:", error)
    return NextResponse.json({ success: false, error: "创建辩论失败" }, { status: 500 })
  }
}
