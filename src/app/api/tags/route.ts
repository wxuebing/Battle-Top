import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const tags = await prisma.tag.findMany({
      include: {
        _count: {
          select: { rankingTags: true },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ success: true, data: tags })
  } catch (error) {
    console.error("Get tags error:", error)
    return NextResponse.json(
      { success: false, error: "获取标签失败" },
      { status: 500 }
    )
  }
}
