import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"

const DEFAULT_ITEMS = [
  {
    id: "highlight_comment",
    name: "评论高亮卡",
    description: "让你的评论在榜单中高亮显示",
    price: 90,
    type: "HIGHLIGHT",
    icon: "✨",
    effect: "comment_highlight",
  },
  {
    id: "anonymous_comment",
    name: "匿名评论卡",
    description: "发表匿名评论（5次）",
    price: 250,
    type: "ANONYMOUS",
    icon: "🎭",
    effect: "anonymous_comment",
  },
  {
    id: "boost_ranking",
    name: "榜单冲刺卡",
    description: "让你的榜单在首页展示3天",
    price: 500,
    type: "BOOST",
    icon: "🚀",
    effect: "ranking_boost",
  },
  {
    id: "change_title",
    name: "称号变更卡",
    description: "自定义你的专属称号",
    price: 666,
    type: "TITLE",
    icon: "👑",
    effect: "custom_title",
  },
]

export async function GET() {
  try {
    const existingItems = await prisma.item.findMany({
      where: { isActive: true },
    })

    if (existingItems.length > 0) {
      const itemsToDelete = existingItems.filter(
        (item) => !DEFAULT_ITEMS.some((d) => d.id === item.id)
      )
      
      for (const item of itemsToDelete) {
        await prisma.item.update({
          where: { id: item.id },
          data: { isActive: false },
        })
      }

      for (const defaultItem of DEFAULT_ITEMS) {
        const existing = existingItems.find((e) => e.id === defaultItem.id)
        if (existing) {
          await prisma.item.update({
            where: { id: defaultItem.id },
            data: {
              name: defaultItem.name,
              description: defaultItem.description,
              price: defaultItem.price,
              icon: defaultItem.icon,
            },
          })
        } else {
          await prisma.item.create({ data: defaultItem })
        }
      }
    } else {
      for (const item of DEFAULT_ITEMS) {
        await prisma.item.create({ data: item })
      }
    }

    const items = await prisma.item.findMany({
      where: { isActive: true },
      orderBy: { price: "asc" },
    })

    const session = await getServerSession(authOptions)
    let userItems: any[] = []
    
    if (session?.user?.id) {
      userItems = await prisma.userItem.findMany({
        where: { userId: session.user.id },
        include: { item: true },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        items,
        userItems,
      },
    })
  } catch (error) {
    console.error("Get items error:", error)
    return NextResponse.json({ success: false, error: "获取道具失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { itemId, quantity = 1 } = body

    const item = await prisma.item.findUnique({
      where: { id: itemId },
    })

    if (!item || !item.isActive) {
      return NextResponse.json({ success: false, error: "道具不存在" }, { status: 400 })
    }

    const totalCost = item.price * quantity

    const wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet || wallet.balance < totalCost) {
      return NextResponse.json({ success: false, error: "战斗币不足" }, { status: 400 })
    }

    await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: session.user.id },
        data: { balance: { decrement: totalCost } },
      }),
      prisma.userItem.upsert({
        where: {
          userId_itemId: {
            userId: session.user.id,
            itemId: item.id,
          },
        },
        create: {
          userId: session.user.id,
          itemId: item.id,
          quantity,
        },
        update: {
          quantity: { increment: quantity },
        },
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "ITEM_PURCHASE",
          amount: totalCost,
          description: `购买 ${item.name} x${quantity}`,
          relatedId: item.id,
        },
      }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        message: `成功购买 ${item.name} x${quantity}`,
        totalCost,
      },
    })
  } catch (error) {
    console.error("Purchase item error:", error)
    return NextResponse.json({ success: false, error: "购买失败" }, { status: 500 })
  }
}
