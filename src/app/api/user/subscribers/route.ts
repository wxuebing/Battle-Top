import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const subscribers = await prisma.subscription.findMany({
      where: { subscribedToId: session.user.id },
      include: {
        subscriber: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            title: true,
            createdAt: true,
            _count: {
              select: {
                rankings: true,
                subscribers: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const totalSubscriptions = await prisma.subscription.count({
      where: { subscriberId: session.user.id },
    })

    const totalSubscribers = await prisma.subscription.count({
      where: { subscribedToId: session.user.id },
    })

    return NextResponse.json({
      success: true,
      data: {
        users: subscribers.map((s: { subscriber: any }) => s.subscriber),
        totalSubscriptions,
        totalSubscribers,
      },
    })
  } catch (error) {
    console.error("Get subscribers error:", error)
    return NextResponse.json({ success: false, error: "获取粉丝列表失败" }, { status: 500 })
  }
}
