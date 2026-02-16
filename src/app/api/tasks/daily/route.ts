import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const DEFAULT_TASKS = [
  { type: "DAILY_CHECKIN", name: "每日签到", description: "每日登录签到", reward: 1, requirement: 1 },
  { type: "CREATE_RANKING", name: "发布榜单", description: "创建并发布一个榜单", reward: 2, requirement: 1 },
  { type: "LIKE_RANKING", name: "点赞榜单", description: "为3个榜单点赞", reward: 1, requirement: 3 },
  { type: "COMMENT_RANKING", name: "发表评论", description: "发表2条评论", reward: 2, requirement: 2 },
  { type: "SHARE_RANKING", name: "分享榜单", description: "分享一个榜单", reward: 1, requirement: 1 },
]

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    let tasks = await prisma.dailyTask.findMany({
      where: { isActive: true },
    })

    if (tasks.length === 0) {
      for (const task of DEFAULT_TASKS) {
        await prisma.dailyTask.create({ data: task })
      }
      tasks = await prisma.dailyTask.findMany({ where: { isActive: true } })
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const userTasks = await prisma.userDailyTask.findMany({
      where: {
        userId: session.user.id,
        date: today,
      },
      include: { task: true },
    })

    const tasksWithStatus = tasks.map((task) => {
      const userTask = userTasks.find((ut) => ut.taskId === task.id)
      return {
        ...task,
        progress: userTask?.progress || 0,
        completed: userTask?.completed || false,
        claimed: userTask?.claimed || false,
        userTaskId: userTask?.id,
      }
    })

    return NextResponse.json({ success: true, data: tasksWithStatus })
  } catch (error) {
    console.error("Get daily tasks error:", error)
    return NextResponse.json({ success: false, error: "获取任务失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { taskId, action } = body

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const task = await prisma.dailyTask.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json({ success: false, error: "任务不存在" }, { status: 404 })
    }

    let userTask = await prisma.userDailyTask.findUnique({
      where: {
        userId_taskId_date: {
          userId: session.user.id,
          taskId,
          date: today,
        },
      },
    })

    if (action === "progress") {
      if (userTask?.completed) {
        return NextResponse.json({ success: true, data: userTask })
      }

      if (!userTask) {
        userTask = await prisma.userDailyTask.create({
          data: {
            userId: session.user.id,
            taskId,
            date: today,
            progress: 1,
            completed: task.requirement <= 1,
          },
        })
      } else {
        userTask = await prisma.userDailyTask.update({
          where: { id: userTask.id },
          data: {
            progress: { increment: 1 },
            completed: userTask.progress + 1 >= task.requirement,
          },
        })
      }

      return NextResponse.json({ success: true, data: userTask })
    }

    if (action === "claim") {
      if (!userTask || !userTask.completed || userTask.claimed) {
        return NextResponse.json({ success: false, error: "无法领取奖励" }, { status: 400 })
      }

      const [updatedUserTask, _] = await prisma.$transaction([
        prisma.userDailyTask.update({
          where: { id: userTask.id },
          data: { claimed: true },
        }),
        prisma.wallet.update({
          where: { userId: session.user.id },
          data: { balance: { increment: task.reward } },
        }),
        prisma.transaction.create({
          data: {
            userId: session.user.id,
            type: "DAILY_TASK",
            amount: task.reward,
            description: `完成任务「${task.name}」`,
          },
        }),
      ])

      if (task.type === "DAILY_CHECKIN") {
        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: { dailyStreak: true, lastDailyAt: true },
        })

        const lastDaily = user?.lastDailyAt
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)

        let newStreak = 1
        if (lastDaily) {
          const lastDailyDate = new Date(lastDaily)
          lastDailyDate.setHours(0, 0, 0, 0)
          if (lastDailyDate.getTime() === yesterday.getTime()) {
            newStreak = (user?.dailyStreak || 0) + 1
          }
        }

        await prisma.user.update({
          where: { id: session.user.id },
          data: {
            dailyStreak: newStreak,
            lastDailyAt: new Date(),
          },
        })
      }

      return NextResponse.json({ success: true, data: updatedUserTask })
    }

    return NextResponse.json({ success: false, error: "无效操作" }, { status: 400 })
  } catch (error) {
    console.error("Daily task action error:", error)
    return NextResponse.json({ success: false, error: "操作失败" }, { status: 500 })
  }
}
