import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const verifySchema = z.object({
  realName: z.string().min(2).max(20),
  idCardNumber: z.string().regex(/^[1-9]\d{5}(18|19|20)\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\d|3[01])\d{3}[\dXx]$/, "身份证号格式不正确"),
})

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = verifySchema.parse(body)

    const existingUser = await prisma.user.findFirst({
      where: {
        idCardNumber: validatedData.idCardNumber,
        NOT: { id: session.user.id },
      },
    })

    if (existingUser) {
      return NextResponse.json({ success: false, error: "该身份证已被其他账号认证" }, { status: 400 })
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        realName: validatedData.realName,
        idCardNumber: validatedData.idCardNumber,
        idCardSubmittedAt: new Date(),
        idCardVerified: true,
        idCardVerifiedAt: new Date(),
      },
      select: {
        id: true,
        realName: true,
        idCardVerified: true,
        idCardSubmittedAt: true,
        idCardVerifiedAt: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: user,
      message: "实名认证成功",
    })
  } catch (error) {
    console.error("Verify identity error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "实名认证失败" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ success: false, error: "未授权" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        realName: true,
        idCardVerified: true,
        idCardSubmittedAt: true,
        idCardVerifiedAt: true,
      },
    })

    return NextResponse.json({ success: true, data: user })
  } catch (error) {
    console.error("Get verification status error:", error)
    return NextResponse.json({ success: false, error: "获取认证状态失败" }, { status: 500 })
  }
}
