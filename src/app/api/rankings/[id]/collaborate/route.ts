import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, role = "editor" } = body

    const ranking = await prisma.ranking.findUnique({
      where: { id: params.id },
      include: { collaborators: true },
    })

    if (!ranking) {
      return NextResponse.json({ success: false, error: "榜单不存在" }, { status: 404 })
    }

    if (ranking.authorId !== session.user.id) {
      return NextResponse.json({ success: false, error: "只有榜单创建者可以邀请协作者" }, { status: 403 })
    }

    const existingCollaborator = await prisma.rankingCollaborator.findUnique({
      where: {
        rankingId_userId: {
          rankingId: params.id,
          userId,
        },
      },
    })

    if (existingCollaborator) {
      return NextResponse.json({ success: false, error: "该用户已是协作者" }, { status: 400 })
    }

    const collaborator = await prisma.rankingCollaborator.create({
      data: {
        rankingId: params.id,
        userId,
        role,
        invitedBy: session.user.id,
      },
      include: {
        user: {
          select: { id: true, name: true, image: true },
        },
      },
    })

    await prisma.notification.create({
      data: {
        userId,
        type: "COLLABORATION_INVITE",
        title: "榜单协作邀请",
        message: `您被邀请参与榜单「${ranking.title}」的协作`,
        data: JSON.stringify({ rankingId: params.id }),
      },
    })

    if (!ranking.isCollaborative) {
      await prisma.ranking.update({
        where: { id: params.id },
        data: { isCollaborative: true },
      })
    }

    return NextResponse.json({ success: true, data: collaborator })
  } catch (error) {
    console.error("Invite collaborator error:", error)
    return NextResponse.json({ success: false, error: "邀请失败" }, { status: 500 })
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const collaborators = await prisma.rankingCollaborator.findMany({
      where: { rankingId: params.id },
      include: {
        user: {
          select: { id: true, name: true, image: true, level: true },
        },
      },
      orderBy: { createdAt: "asc" },
    })

    return NextResponse.json({ success: true, data: collaborators })
  } catch (error) {
    console.error("Get collaborators error:", error)
    return NextResponse.json({ success: false, error: "获取协作者失败" }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未登录" }, { status: 401 })
    }

    const body = await request.json()
    const { userId, action } = body

    const ranking = await prisma.ranking.findUnique({
      where: { id: params.id },
    })

    if (!ranking) {
      return NextResponse.json({ success: false, error: "榜单不存在" }, { status: 404 })
    }

    if (action === "accept") {
      const collaborator = await prisma.rankingCollaborator.update({
        where: {
          rankingId_userId: {
            rankingId: params.id,
            userId: session.user.id,
          },
        },
        data: { acceptedAt: new Date() },
      })

      return NextResponse.json({ success: true, data: collaborator })
    }

    if (action === "remove") {
      if (ranking.authorId !== session.user.id) {
        return NextResponse.json({ success: false, error: "只有榜单创建者可以移除协作者" }, { status: 403 })
      }

      await prisma.rankingCollaborator.delete({
        where: {
          rankingId_userId: {
            rankingId: params.id,
            userId,
          },
        },
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ success: false, error: "无效操作" }, { status: 400 })
  } catch (error) {
    console.error("Update collaborator error:", error)
    return NextResponse.json({ success: false, error: "操作失败" }, { status: 500 })
  }
}
