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

    const toUserId = params.userId
    const fromUserId = session.user.id
    const body = await request.json()
    const { amount, message, rankingId } = body

    if (toUserId === fromUserId) {
      return NextResponse.json(
        { success: false, error: "不能给自己打赏" },
        { status: 400 }
      )
    }

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: "请输入有效金额" },
        { status: 400 }
      )
    }

    const donation = await prisma.donation.create({
      data: {
        fromUserId,
        toUserId,
        amount: parseFloat(amount),
        message,
        rankingId,
        status: "pending",
      },
      include: {
        fromUser: {
          select: { id: true, name: true, image: true },
        },
        toUser: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    return NextResponse.json({
      success: true,
      data: donation,
      message: "打赏请求已创建，请完成支付",
    })
  } catch (error) {
    console.error("Donation error:", error)
    return NextResponse.json(
      { success: false, error: "打赏失败" },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const userId = params.userId
    const { searchParams } = new URL(request.url)
    const type = searchParams.get("type") || "received"

    const where = type === "sent" 
      ? { fromUserId: userId } 
      : { toUserId: userId }

    const donations = await prisma.donation.findMany({
      where,
      include: {
        fromUser: {
          select: { id: true, name: true, image: true },
        },
        toUser: {
          select: { id: true, name: true, image: true },
        },
        ranking: {
          select: { id: true, title: true },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 20,
    })

    const totalAmount = await prisma.donation.aggregate({
      where: { toUserId: userId, status: "completed" },
      _sum: { amount: true },
    })

    return NextResponse.json({
      success: true,
      data: {
        donations,
        totalReceived: totalAmount._sum.amount || 0,
      },
    })
  } catch (error) {
    console.error("Get donations error:", error)
    return NextResponse.json(
      { success: false, error: "获取打赏记录失败" },
      { status: 500 }
    )
  }
}
