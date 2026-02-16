import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const SECURITY_QUESTIONS: Record<string, string> = {
  pet: "您的第一只宠物叫什么名字？",
  school: "您就读的第一所学校名称？",
  city: "您出生的城市？",
  movie: "您最喜欢的电影名称？",
  book: "对您影响最大的一本书？",
  food: "您最喜欢的食物？",
}

const schema = z.object({
  email: z.string().email("请输入正确的邮箱"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = schema.parse(body)

    const user = await prisma.user.findFirst({
      where: { email: email.toLowerCase() },
      select: { securityQuestion: true },
    })

    if (!user || !user.securityQuestion) {
      return NextResponse.json({ success: false, error: "账户不存在或未设置安全问题" }, { status: 404 })
    }

    const questionText = SECURITY_QUESTIONS[user.securityQuestion] || user.securityQuestion

    return NextResponse.json({
      success: true,
      question: user.securityQuestion,
      questionText,
    })
  } catch (error) {
    console.error("Get security question error:", error)
    return NextResponse.json({ success: false, error: "查询失败" }, { status: 500 })
  }
}
