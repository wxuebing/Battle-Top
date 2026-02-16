import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rankingSchema } from "@/lib/validations"

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)

    const ranking = await prisma.ranking.findUnique({
      where: { id: params.id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            image: true,
            bio: true,
            isAuthoritative: true,
            credibilityScore: true,
          },
        },
        category: true,
        items: {
          orderBy: { position: "asc" },
        },
        rankingTags: {
          include: { tag: true },
        },
        likes: session?.user?.id
          ? {
              where: { userId: session.user.id },
              select: { id: true },
            }
          : false,
      },
    })

    if (!ranking) {
      return NextResponse.json({ success: false, error: "榜单不存在" }, { status: 404 })
    }

    await prisma.ranking.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...ranking,
        tags: ranking.rankingTags.map((t) => t.tag),
        isLiked: ranking.likes && ranking.likes.length > 0,
      },
    })
  } catch (error) {
    console.error("Get ranking error:", error)
    return NextResponse.json(
      { success: false, error: "获取榜单失败" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 })
    }

    const existingRanking = await prisma.ranking.findUnique({
      where: { id: params.id },
    })

    if (!existingRanking) {
      return NextResponse.json({ success: false, error: "榜单不存在" }, { status: 404 })
    }

    if (existingRanking.authorId !== session.user.id) {
      return NextResponse.json({ success: false, error: "无权限修改" }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = rankingSchema.parse(body)

    await prisma.rankingItem.deleteMany({
      where: { rankingId: params.id },
    })

    const ranking = await prisma.ranking.update({
      where: { id: params.id },
      data: {
        title: validatedData.title,
        description: validatedData.description,
        categoryId: validatedData.categoryId,
        items: {
          create: validatedData.items.map((item, index) => ({
            name: item.name,
            description: item.description,
            imageUrl: item.imageUrl,
            justification: item.justification,
            position: index + 1,
          })),
        },
      },
      include: {
        items: true,
      },
    })

    return NextResponse.json({ success: true, data: ranking })
  } catch (error) {
    console.error("Update ranking error:", error)
    return NextResponse.json(
      { success: false, error: "更新榜单失败" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 })
    }

    const existingRanking = await prisma.ranking.findUnique({
      where: { id: params.id },
    })

    if (!existingRanking) {
      return NextResponse.json({ success: false, error: "榜单不存在" }, { status: 404 })
    }

    if (existingRanking.authorId !== session.user.id) {
      return NextResponse.json({ success: false, error: "无权限删除" }, { status: 403 })
    }

    await prisma.ranking.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete ranking error:", error)
    return NextResponse.json(
      { success: false, error: "删除榜单失败" },
      { status: 500 }
    )
  }
}
