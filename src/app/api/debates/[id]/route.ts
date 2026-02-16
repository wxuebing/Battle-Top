import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const debate = await prisma.debate.findUnique({
      where: { id: params.id },
      include: {
        creator: {
          select: { id: true, name: true, image: true, level: true, chatFrame: true },
        },
        challenger: {
          select: { id: true, name: true, image: true, level: true, chatFrame: true },
        },
        votes: {
          include: {
            user: {
              select: { id: true, name: true, image: true },
            },
          },
        },
      },
    })

    if (!debate) {
      return NextResponse.json({ success: false, error: "辩论不存在" }, { status: 404 })
    }

    return NextResponse.json({ success: true, data: debate })
  } catch (error) {
    console.error("Get debate error:", error)
    return NextResponse.json({ success: false, error: "获取辩论失败" }, { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { action, rankingId, voteFor } = body

    const debate = await prisma.debate.findUnique({
      where: { id: params.id },
    })

    if (!debate) {
      return NextResponse.json({ success: false, error: "辩论不存在" }, { status: 404 })
    }

    if (action === "challenge") {
      if (debate.status !== "open") {
        return NextResponse.json({ success: false, error: "该辩论已不可应战" }, { status: 400 })
      }

      if (debate.creatorId === session.user.id) {
        return NextResponse.json({ success: false, error: "不能应战自己的辩论" }, { status: 400 })
      }

      const ranking = await prisma.ranking.findUnique({
        where: { id: rankingId },
      })

      if (!ranking || ranking.authorId !== session.user.id) {
        return NextResponse.json({ success: false, error: "只能用自己的榜单应战" }, { status: 403 })
      }

      const updatedDebate = await prisma.debate.update({
        where: { id: params.id },
        data: {
          challengerId: session.user.id,
          challengerRankingId: rankingId,
          status: "active",
          startedAt: new Date(),
        },
      })

      await prisma.notification.create({
        data: {
          userId: debate.creatorId,
          type: "DEBATE_CHALLENGE",
          title: "有人应战了你的辩论！",
          message: `用户接受了你的辩论邀请「${debate.title}」`,
          data: JSON.stringify({ debateId: params.id }),
        },
      })

      return NextResponse.json({ success: true, data: updatedDebate })
    }

    if (action === "vote") {
      if (debate.status !== "active") {
        return NextResponse.json({ success: false, error: "该辩论未在进行中" }, { status: 400 })
      }

      const existingVote = await prisma.debateVote.findUnique({
        where: {
          debateId_userId: {
            debateId: params.id,
            userId: session.user.id,
          },
        },
      })

      if (existingVote) {
        return NextResponse.json({ success: false, error: "你已经投过票了" }, { status: 400 })
      }

      if (!["creator", "challenger"].includes(voteFor)) {
        return NextResponse.json({ success: false, error: "无效的投票选项" }, { status: 400 })
      }

      const vote = await prisma.debateVote.create({
        data: {
          debateId: params.id,
          userId: session.user.id,
          voteFor,
        },
      })

      const updatedDebate = await prisma.debate.update({
        where: { id: params.id },
        data: {
          creatorVotes: voteFor === "creator" ? { increment: 1 } : undefined,
          challengerVotes: voteFor === "challenger" ? { increment: 1 } : undefined,
        },
      })

      return NextResponse.json({ success: true, data: { vote, debate: updatedDebate } })
    }

    if (action === "end") {
      if (debate.creatorId !== session.user.id && debate.challengerId !== session.user.id) {
        return NextResponse.json({ success: false, error: "只有辩论参与者可以结束辩论" }, { status: 403 })
      }

      if (debate.status !== "active") {
        return NextResponse.json({ success: false, error: "该辩论未在进行中" }, { status: 400 })
      }

      let winnerId = null
      if (debate.creatorVotes > debate.challengerVotes) {
        winnerId = debate.creatorId
      } else if (debate.challengerVotes > debate.creatorVotes) {
        winnerId = debate.challengerId
      }

      const updatedDebate = await prisma.debate.update({
        where: { id: params.id },
        data: {
          status: "ended",
          winnerId,
          endedAt: new Date(),
        },
      })

      if (winnerId) {
        await prisma.$transaction([
          prisma.wallet.update({
            where: { userId: winnerId },
            data: { balance: { increment: debate.reward * 2 } },
          }),
          prisma.user.update({
            where: { id: winnerId },
            data: { battleWins: { increment: 1 } },
          }),
          prisma.user.update({
            where: { id: winnerId === debate.creatorId ? debate.challengerId! : debate.creatorId },
            data: { battleLosses: { increment: 1 } },
          }),
          prisma.transaction.create({
            data: {
              userId: winnerId,
              type: "DEBATE_WIN",
              amount: debate.reward * 2,
              description: `赢得辩论「${debate.title}」`,
            },
          }),
        ])
      }

      return NextResponse.json({ success: true, data: updatedDebate })
    }

    return NextResponse.json({ success: false, error: "无效操作" }, { status: 400 })
  } catch (error) {
    console.error("Debate action error:", error)
    return NextResponse.json({ success: false, error: "操作失败" }, { status: 500 })
  }
}
