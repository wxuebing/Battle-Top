import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const registerSchema = z.object({
  name: z.string().min(1, "用户名不能为空").max(20, "用户名最多20个字符"),
  email: z.string().email("请输入正确的邮箱"),
  password: z.string().min(6, "密码至少6个字符"),
  securityQuestion: z.string().min(1, "请选择安全问题"),
  securityAnswer: z.string().min(1, "请输入安全问题答案"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = registerSchema.parse(body)

    const existingEmail = await prisma.user.findFirst({
      where: { email: validatedData.email },
    })

    if (existingEmail) {
      return NextResponse.json(
        { success: false, error: "该邮箱已被注册" },
        { status: 400 }
      )
    }

    const existingName = await prisma.user.findFirst({
      where: { name: validatedData.name },
    })

    if (existingName) {
      return NextResponse.json(
        { success: false, error: "用户名已被使用" },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validatedData.password, 12)
    const hashedSecurityAnswer = await bcrypt.hash(validatedData.securityAnswer.toLowerCase().trim(), 10)

    const user = await prisma.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
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
        email: user.email,
      },
    })
  } catch (error) {
    console.error("Registration error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json(
      { success: false, error: "注册失败，请稍后重试" },
      { status: 500 }
    )
  }
}
