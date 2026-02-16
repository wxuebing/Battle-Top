import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@/lib/prisma"
import { authOptions } from "@/lib/auth"

export async function POST(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: "未登录" },
        { status: 401 }
      )
    }

    const targetUserId = params.userId
    const subscriberId = session.user.id

    if (targetUserId === subscriberId) {
      return NextResponse.json(
        { success: false, error: "不能订阅自己" },
        { status: 400 }
      )
    }

    const existingSubscription = await prisma.subscription.findUnique({
      where: {
        subscriberId_subscribedToId: {
          subscriberId,
          subscribedToId: targetUserId,
        },
      },
    })

    if (existingSubscription) {
      await prisma.subscription.delete({
        where: { id: existingSubscription.id },
      })
      return NextResponse.json({
        success: true,
        subscribed: false,
        message: "已取消订阅",
      })
    }

    await prisma.subscription.create({
      data: {
        subscriberId,
        subscribedToId: targetUserId,
      },
    })

    return NextResponse.json({
      success: true,
      subscribed: true,
      message: "订阅成功",
    })
  } catch (error) {
    console.error("Subscription error:", error)
    return NextResponse.json(
      { success: false, error: "操作失败" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    const targetUserId = params.userId

    const subscriberCount = await prisma.subscription.count({
      where: { subscribedToId: targetUserId },
    })

    let isSubscribed = false
    if (session?.user?.id) {
      const subscription = await prisma.subscription.findUnique({
        where: {
          subscriberId_subscribedToId: {
            subscriberId: session.user.id,
            subscribedToId: targetUserId,
          },
        },
      })
      isSubscribed = !!subscription
    }

    return NextResponse.json({
      success: true,
      data: {
        subscriberCount,
        isSubscribed,
      },
    })
  } catch (error) {
    console.error("Get subscription error:", error)
    return NextResponse.json(
      { success: false, error: "获取订阅信息失败" },
      { status: 500 }
    )
  }
}
