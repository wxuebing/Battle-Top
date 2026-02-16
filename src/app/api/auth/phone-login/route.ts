import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const phoneLoginSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),
  code: z.string().length(6, "验证码为6位数字"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = phoneLoginSchema.parse(body)

    const smsCode = await prisma.smsCode.findFirst({
      where: {
        phone: validatedData.phone,
        code: validatedData.code,
        purpose: "login",
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!smsCode) {
      return NextResponse.json({ success: false, error: "验证码无效或已过期" }, { status: 400 })
    }

    await prisma.smsCode.update({
      where: { id: smsCode.id },
      data: { used: true },
    })

    let user = await prisma.user.findFirst({
      where: { phone: validatedData.phone },
    })

    if (!user) {
      const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10)
      user = await prisma.user.create({
        data: {
          phone: validatedData.phone,
          phoneVerified: true,
          name: `用户${validatedData.phone.slice(-4)}`,
          password: hashedPassword,
        },
      })
    } else if (!user.phoneVerified) {
      await prisma.user.update({
        where: { id: user.id },
        data: { phoneVerified: true },
      })
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        isNewUser: !user.password || user.createdAt > new Date(Date.now() - 60000),
      },
    })
  } catch (error) {
    console.error("Phone login error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "登录失败" }, { status: 500 })
  }
}
