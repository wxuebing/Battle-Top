import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const registerSchema = z.object({
  name: z.string().min(1, "用户名不能为空").max(20, "用户名最多20个字符"),
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),
  code: z.string().length(6, "验证码为6位数字"),
  securityQuestion: z.string().min(1, "请选择安全问题"),
  securityAnswer: z.string().min(1, "请输入安全问题答案"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const smsCode = await prisma.smsCode.findFirst({
      where: {
        phone: validatedData.phone,
        code: validatedData.code,
        purpose: "register",
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (!smsCode) {
      return NextResponse.json({ success: false, error: "验证码无效或已过期" }, { status: 400 })
    }

    const existingPhone = await prisma.user.findFirst({
      where: { phone: validatedData.phone },
    })

    if (existingPhone) {
      return NextResponse.json({ success: false, error: "该手机号已注册" }, { status: 400 })
    }

    const existingName = await prisma.user.findFirst({
      where: { name: validatedData.name },
    })

    if (existingName) {
      return NextResponse.json({ success: false, error: "用户名已被使用" }, { status: 400 })
    }

    await prisma.smsCode.update({
      where: { id: smsCode.id },
      data: { used: true },
    })

    const hashedPassword = await bcrypt.hash(Math.random().toString(36), 10)
    const hashedSecurityAnswer = await bcrypt.hash(validatedData.securityAnswer.toLowerCase().trim(), 10)

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        phone: validatedData.phone,
        phoneVerified: true,
        password: hashedPassword,
        securityQuestion: validatedData.securityQuestion,
        securityAnswer: hashedSecurityAnswer,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        phone: user.phone,
      },
    })
  } catch (error) {
    console.error("Register error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "注册失败" }, { status: 500 })
  }
}
