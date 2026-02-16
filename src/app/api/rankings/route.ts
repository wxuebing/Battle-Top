import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { rankingSchema } from "@/lib/validations"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const categoryId = searchParams.get("categoryId")
    const authorId = searchParams.get("authorId")
    const search = searchParams.get("search")
    const sortBy = searchParams.get("sortBy") || "newest"
    const minLikes = searchParams.get("minLikes")
    const timeRange = searchParams.get("timeRange")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "12")

    const where: any = { status: "PUBLISHED" }

    if (status && status !== "all") {
      where.status = status
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (authorId) {
      where.authorId = authorId
    }

    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ]
    }

    if (minLikes) {
      where.likeCount = { gte: parseInt(minLikes) }
    }

    if (timeRange) {
      const now = new Date()
      let startDate: Date
      switch (timeRange) {
        case "today":
          startDate = new Date(now.setHours(0, 0, 0, 0))
          break
        case "week":
          startDate = new Date(now.setDate(now.getDate() - 7))
          break
        case "month":
          startDate = new Date(now.setMonth(now.getMonth() - 1))
          break
        case "year":
          startDate = new Date(now.setFullYear(now.getFullYear() - 1))
          break
        default:
          startDate = new Date(0)
      }
      where.createdAt = { gte: startDate }
    }

    let orderBy: any = { createdAt: "desc" }
    switch (sortBy) {
      case "popular":
        orderBy = { likeCount: "desc" }
        break
      case "views":
        orderBy = { viewCount: "desc" }
        break
      case "comments":
        orderBy = { commentCount: "desc" }
        break
      case "newest":
      default:
        orderBy = { createdAt: "desc" }
    }

    const [rankings, total] = await Promise.all([
      prisma.ranking.findMany({
        where,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              image: true,
              isAuthoritative: true,
            },
          },
          category: true,
          items: {
            orderBy: { position: "asc" },
          },
          rankingTags: {
            include: { tag: true },
          },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.ranking.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        items: rankings.map((r) => ({
          ...r,
          tags: r.rankingTags.map((t) => t.tag),
        })),
        total,
        page,
        pageSize: limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Get rankings error:", error)
    return NextResponse.json(
      { success: false, error: "获取榜单失败" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = rankingSchema.parse(body)

    const ranking = await prisma.ranking.create({
      data: {
        title: validatedData.title,
        description: validatedData.description,
        authorId: session.user.id,
        categoryId: validatedData.categoryId,
        status: "DRAFT",
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
    console.error("Create ranking error:", error)
    return NextResponse.json(
      { success: false, error: "创建榜单失败" },
      { status: 500 }
    )
  }
}
