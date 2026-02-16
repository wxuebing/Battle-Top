import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const [rankingCount, userCount, authoritativeCount] = await Promise.all([
      prisma.ranking.count({ where: { status: "PUBLISHED" } }),
      prisma.user.count(),
      prisma.user.count({ where: { isAuthoritative: true } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        rankingCount,
        userCount,
        authoritativeCount,
      },
    })
  } catch (error) {
    console.error("Get stats error:", error)
    return NextResponse.json({ success: false, error: "获取统计失败" }, { status: 500 })
  }
}
