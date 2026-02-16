import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File | null
    const avatarUrl = formData.get("avatarUrl") as string | null
    const imageSource = formData.get("imageSource") as string | null

    let imageUrl = ""

    if (avatarUrl) {
      imageUrl = avatarUrl
    } else if (file) {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString("base64")
      const mimeType = file.type
      imageUrl = `data:${mimeType};base64,${base64}`
    } else {
      return NextResponse.json({ success: false, error: "请提供头像" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        image: imageUrl,
        imageSource: imageSource || "custom",
      },
      select: {
        id: true,
        image: true,
        imageSource: true,
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Upload avatar error:", error)
    return NextResponse.json({ success: false, error: "上传头像失败" }, { status: 500 })
  }
}
