import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULT_ACHIEVEMENTS = [
  { type: "FIRST_RANKING", name: "初出茅庐", description: "发布第一个榜单", icon: "🎯", requirement: 1, reward: 5 },
  { type: "RANKING_COUNT_5", name: "榜单达人", description: "发布5个榜单", icon: "📝", requirement: 5, reward: 10 },
  { type: "RANKING_COUNT_10", name: "榜单大师", description: "发布10个榜单", icon: "🏆", requirement: 10, reward: 20 },
  { type: "LIKE_RECEIVED_10", name: "小有名气", description: "累计获得10个赞", icon: "👍", requirement: 10, reward: 3 },
  { type: "LIKE_RECEIVED_100", name: "人气之星", description: "累计获得100个赞", icon: "⭐", requirement: 100, reward: 15 },
  { type: "LIKE_RECEIVED_500", name: "万众瞩目", description: "累计获得500个赞", icon: "🌟", requirement: 500, reward: 50 },
  { type: "COMMENT_COUNT_10", name: "评论新手", description: "发表10条评论", icon: "💬", requirement: 10, reward: 3 },
  { type: "COMMENT_COUNT_50", name: "评论达人", description: "发表50条评论", icon: "🗣️", requirement: 50, reward: 10 },
  { type: "MVP_COUNT_1", name: "MVP初体验", description: "获得1次MVP", icon: "🏅", requirement: 1, reward: 5 },
  { type: "MVP_COUNT_10", name: "MVP常客", description: "获得10次MVP", icon: "👑", requirement: 10, reward: 20 },
  { type: "BATTLE_WIN_1", name: "首战告捷", description: "赢得1场辩论", icon: "⚔️", requirement: 1, reward: 5 },
  { type: "BATTLE_WIN_10", name: "常胜将军", description: "赢得10场辩论", icon: "🗡️", requirement: 10, reward: 30 },
  { type: "SUBSCRIBER_10", name: "小有粉丝", description: "获得10个关注者", icon: "👥", requirement: 10, reward: 5 },
  { type: "SUBSCRIBER_100", name: "人气博主", description: "获得100个关注者", icon: "🎉", requirement: 100, reward: 30 },
  { type: "DAILY_STREAK_7", name: "坚持一周", description: "连续签到7天", icon: "📅", requirement: 7, reward: 10 },
  { type: "DAILY_STREAK_30", name: "月度达人", description: "连续签到30天", icon: "🗓️", requirement: 30, reward: 50 },
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    let achievements = await prisma.achievement.findMany({
      where: { isActive: true },
      orderBy: [{ type: "asc" }, { requirement: "asc" }],
    })

    if (achievements.length === 0) {
      for (const achievement of DEFAULT_ACHIEVEMENTS) {
        await prisma.achievement.create({ data: achievement })
      }
      achievements = await prisma.achievement.findMany({
        where: { isActive: true },
        orderBy: [{ type: "asc" }, { requirement: "asc" }],
      })
    }

    const userAchievements = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
      include: { achievement: true },
    })

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        totalRankingsPublished: true,
        totalLikesReceived: true,
        mvpCount: true,
        battleWins: true,
        dailyStreak: true,
        _count: {
          select: {
            comments: true,
            subscribers: true,
          },
        },
      },
    })

    const achievementsWithStatus = achievements.map((achievement) => {
      const userAchievement = userAchievements.find((ua) => ua.achievementId === achievement.id)
      let currentProgress = 0

      switch (achievement.type) {
        case "FIRST_RANKING":
        case "RANKING_COUNT_5":
        case "RANKING_COUNT_10":
          currentProgress = user?.totalRankingsPublished || 0
          break
        case "LIKE_RECEIVED_10":
        case "LIKE_RECEIVED_100":
        case "LIKE_RECEIVED_500":
          currentProgress = user?.totalLikesReceived || 0
          break
        case "COMMENT_COUNT_10":
        case "COMMENT_COUNT_50":
          currentProgress = user?._count.comments || 0
          break
        case "MVP_COUNT_1":
        case "MVP_COUNT_10":
          currentProgress = user?.mvpCount || 0
          break
        case "BATTLE_WIN_1":
        case "BATTLE_WIN_10":
          currentProgress = user?.battleWins || 0
          break
        case "SUBSCRIBER_10":
        case "SUBSCRIBER_100":
          currentProgress = user?._count.subscribers || 0
          break
        case "DAILY_STREAK_7":
        case "DAILY_STREAK_30":
          currentProgress = user?.dailyStreak || 0
          break
      }

      const unlocked = !!userAchievement
      const canUnlock = !unlocked && currentProgress >= achievement.requirement

      return {
        ...achievement,
        currentProgress,
        unlocked,
        canUnlock,
        unlockedAt: userAchievement?.unlockedAt,
      }
    })

    return NextResponse.json({ success: true, data: achievementsWithStatus })
  } catch (error) {
    console.error("Get achievements error:", error)
    return NextResponse.json({ success: false, error: "获取成就失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { achievementId } = body

    const achievement = await prisma.achievement.findUnique({
      where: { id: achievementId },
    })

    if (!achievement) {
      return NextResponse.json({ success: false, error: "成就不存在" }, { status: 404 })
    }

    const existing = await prisma.userAchievement.findUnique({
      where: {
        userId_achievementId: {
          userId: session.user.id,
          achievementId,
        },
      },
    })

    if (existing) {
      return NextResponse.json({ success: false, error: "已解锁该成就" }, { status: 400 })
    }

    const userAchievement = await prisma.$transaction([
      prisma.userAchievement.create({
        data: {
          userId: session.user.id,
          achievementId,
        },
      }),
      prisma.wallet.update({
        where: { userId: session.user.id },
        data: { balance: { increment: achievement.reward } },
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "ACHIEVEMENT",
          amount: achievement.reward,
          description: `解锁成就「${achievement.name}」`,
        },
      }),
    ])

    return NextResponse.json({ success: true, data: userAchievement[0] })
  } catch (error) {
    console.error("Unlock achievement error:", error)
    return NextResponse.json({ success: false, error: "解锁失败" }, { status: 500 })
  }
}
