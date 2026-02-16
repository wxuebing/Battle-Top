import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"

const schema = z.object({
  email: z.string().email("请输入正确的邮箱"),
  answer: z.string().min(1, "请输入答案"),
  newPassword: z.string().min(6, "密码至少6个字符"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, answer, newPassword } = schema.parse(body)

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      select: { id: true, securityAnswer: true },
    })

    if (!user || !user.securityAnswer) {
      return NextResponse.json({ success: false, error: "账户不存在" }, { status: 404 })
    }

    const isValid = await bcrypt.compare(answer.toLowerCase().trim(), user.securityAnswer)

    if (!isValid) {
      return NextResponse.json({ success: false, error: "答案错误" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Reset password error:", error)
    return NextResponse.json({ success: false, error: "重置失败" }, { status: 500 })
  }
}
