import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { rankings: { where: { status: "PUBLISHED" } } },
        },
      },
      orderBy: { name: "asc" },
    })

    return NextResponse.json({ success: true, data: categories })
  } catch (error) {
    console.error("Get categories error:", error)
    return NextResponse.json(
      { success: false, error: "获取分类失败" },
      { status: 500 }
    )
  }
}
