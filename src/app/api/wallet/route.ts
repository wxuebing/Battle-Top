import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { calculateExpFromRecharge, getLevelByExp, getLevelConfig, CHAT_FRAME_STYLES, NAME_STYLES } from "@/lib/level"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: session.user.id },
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { level: true, exp: true, totalRecharged: true, chatFrame: true, nameStyle: true },
    })

    return NextResponse.json({ 
      success: true, 
      data: { 
        ...wallet,
        level: user?.level || 1,
        exp: user?.exp || 0,
        totalRecharged: user?.totalRecharged || 0,
        chatFrame: user?.chatFrame || "bronze",
        nameStyle: user?.nameStyle || "default",
      } 
    })
  } catch (error) {
    console.error("Get wallet error:", error)
    return NextResponse.json({ success: false, error: "获取钱包失败" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: "充值金额无效" }, { status: 400 })
    }

    const battleCoins = Math.floor(amount * 10)
    const expGained = calculateExpFromRecharge(amount)

    let wallet = await prisma.wallet.findUnique({
      where: { userId: session.user.id },
    })

    if (!wallet) {
      wallet = await prisma.wallet.create({
        data: { userId: session.user.id },
      })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { exp: true, level: true },
    })

    const currentExp = (user?.exp || 0) + expGained
    const newLevel = getLevelByExp(currentExp)
    const levelConfig = getLevelConfig(newLevel)

    const [updatedWallet, updatedUser] = await prisma.$transaction([
      prisma.wallet.update({
        where: { userId: session.user.id },
        data: {
          balance: { increment: battleCoins },
          totalRecharged: { increment: battleCoins },
        },
      }),
      prisma.user.update({
        where: { id: session.user.id },
        data: {
          exp: currentExp,
          level: newLevel,
          totalRecharged: { increment: amount },
          chatFrame: levelConfig.chatFrame,
          nameStyle: levelConfig.nameStyle,
        },
      }),
      prisma.transaction.create({
        data: {
          userId: session.user.id,
          type: "RECHARGE",
          amount: battleCoins,
          description: `充值 ¥${amount}，获得 ${battleCoins} 战斗币，+${expGained} 经验值`,
        },
      }),
    ])

    const levelUp = newLevel > (user?.level || 1)

    return NextResponse.json({
      success: true,
      data: {
        wallet: updatedWallet,
        battleCoins,
        expGained,
        newLevel,
        levelUp,
        levelName: levelConfig.name,
        message: `成功充值 ${battleCoins} 战斗币${levelUp ? `，升级到 ${levelConfig.name}！` : ""}`,
      },
    })
  } catch (error) {
    console.error("Recharge error:", error)
    return NextResponse.json({ success: false, error: "充值失败" }, { status: 500 })
  }
}
