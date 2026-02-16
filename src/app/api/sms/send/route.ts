import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const sendCodeSchema = z.object({
  phone: z.string().regex(/^1[3-9]\d{9}$/, "请输入正确的手机号"),
  purpose: z.enum(["login", "register"]),
})

function generateCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = sendCodeSchema.parse(body)

    const existingCode = await prisma.smsCode.findFirst({
      where: {
        phone: validatedData.phone,
        purpose: validatedData.purpose,
        used: false,
        expiresAt: { gt: new Date() },
      },
    })

    if (existingCode) {
      const timeDiff = existingCode.expiresAt.getTime() - Date.now()
      if (timeDiff > 4 * 60 * 1000) {
        return NextResponse.json({
          success: false,
          error: "验证码发送过于频繁，请稍后再试",
        }, { status: 429 })
      }
    }

    const code = generateCode()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    await prisma.smsCode.create({
      data: {
        phone: validatedData.phone,
        code,
        purpose: validatedData.purpose,
        expiresAt,
      },
    })

    console.log(`[SMS] 发送验证码到 ${validatedData.phone}: ${code}`)

    return NextResponse.json({
      success: true,
      message: "验证码已发送",
      debugCode: process.env.NODE_ENV === "development" ? code : undefined,
    })
  } catch (error) {
    console.error("Send SMS code error:", error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ success: false, error: error.errors[0].message }, { status: 400 })
    }
    return NextResponse.json({ success: false, error: "发送验证码失败" }, { status: 500 })
  }
}
