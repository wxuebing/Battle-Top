import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const schema = z.object({
  email: z.string().email("请输入正确的邮箱"),
  answer: z.string().min(1, "请输入答案"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, answer } = schema.parse(body)

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      select: { securityAnswer: true },
    })

    if (!user || !user.securityAnswer) {
      return NextResponse.json({ success: false, error: "账户不存在或未设置安全问题" }, { status: 404 })
    }

    const isValid = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer)

    if (!isValid) {
      return NextResponse.json({ success: false, error: "答案错误" }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Verify answer error:", error)
    return NextResponse.json({ success: false, error: "验证失败" }, { status: 500 })
  }
}
