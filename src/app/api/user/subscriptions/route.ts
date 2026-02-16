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

    const subscriptions = await prisma.subscription.findMany({
      where: { subscriberId: session.user.id },
      include: {
        subscribedTo: {
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
        users: subscriptions.map((s: { subscribedTo: any }) => s.subscribedTo),
        totalSubscriptions,
        totalSubscribers,
      },
    })
  } catch (error) {
    console.error("Get subscriptions error:", error)
    return NextResponse.json({ success: false, error: "获取订阅列表失败" }, { status: 500 })
  }
}
