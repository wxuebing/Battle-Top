import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const VIP_PLANS = {
  MONTHLY_CONTINUOUS: { price: 9, days: 30, type: "MONTHLY_CONTINUOUS", name: "连续包月" },
  YEARLY_CONTINUOUS: { price: 99, days: 365, type: "YEARLY_CONTINUOUS", name: "连续包年" },
  MONTHLY: { price: 10, days: 30, type: "MONTHLY", name: "包月" },
  YEARLY: { price: 120, days: 365, type: "YEARLY", name: "包年" },
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const membership = await prisma.vIPMembership.findUnique({
      where: { userId: session.user.id },
    })

    const now = new Date()
    let isActive = false
    let remainingDays = 0

    if (membership && membership.endDate > now) {
      isActive = membership.isActive
      remainingDays = Math.ceil((membership.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    }

    return NextResponse.json({
      success: true,
      data: {
        membership,
        isActive,
        remainingDays,
        plans: VIP_PLANS,
      },
    })
  } catch (error) {
    console.error("Get VIP error:", error)
    return NextResponse.json({ success: false, error: "获取VIP信息失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { planType, autoRenew = false } = body

    const plan = Object.values(VIP_PLANS).find((p) => p.type === planType)
    if (!plan) {
      return NextResponse.json({ success: false, error: "无效的套餐" }, { status: 400 })
    }

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet || wallet.balance < plan.price * 10) {
      return NextResponse.json({ success: false, error: "战斗币不足" }, { status: 400 })
    }

    const existingMembership = await prisma.vIPMembership.findUnique({
      where: { userId: session.user.id },
    })

    const now = new Date()
    let startDate = now
    if (existingMembership && existingMembership.endDate > now) {
      startDate = existingMembership.endDate
    }

    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + plan.days)

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: session.user.id },
        data: { balance: { decrement: plan.price * 10 } },
      }),
      prisma.vIPMembership.upsert({
        where: { userId: session.user.id },
        create: {
          userId: session.user.id,
          type: planType,
          startDate,
          endDate,
          autoRenew,
        },
        update: {
          type: planType,
          startDate,
          endDate,
          autoRenew,
          isActive: true,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "VIP_PURCHASE",
          amount: plan.price * 10,
          description: `开通${plan.name}VIP会员`,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        message: `成功开通${plan.name}VIP会员`,
        endDate,
      },
    })
  } catch (error) {
    console.error("Purchase VIP error:", error)
    return NextResponse.json({ success: false, error: "开通VIP失败" }, { status: 500 })
  }
}
