import { NextResponse } from "next/server"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const key = searchParams.get("key")
  
  if (key !== process.env.DEV_MASTER_KEY && key !== "BattleTop2024Init") {
    return NextResponse.json({ error: "无效的密钥" }, { status: 403 })
  }

  try {
    const defaultCategories = [
      {
        name: "AI大模型",
        type: "AI_MODEL",
        description: "人工智能大语言模型排名",
        icon: "sparkles",
        color: "purple",
      },
      {
        name: "动漫角色",
        type: "ANIME_CHARACTER",
        description: "动漫角色人气排名",
        icon: "star",
        color: "pink",
      },
      {
        name: "教育机构",
        type: "EDUCATIONAL_INSTITUTION",
        description: "大学、学院等教育机构排名",
        icon: "graduation-cap",
        color: "blue",
      },
    ]

    let categoriesCreated = 0
    for (const category of defaultCategories) {
      const existing = await prisma.category.findFirst({
        where: { name: category.name },
      })

      if (!existing) {
        await prisma.category.create({ data: category })
        categoriesCreated++
      }
    }

    const hashedPassword = await bcrypt.hash("admin123", 10)
    let adminCreated = false
    
    const existingAdmin = await prisma.user.findFirst({
      where: { email: "admin@battletop.com" },
    })

    if (!existingAdmin) {
      await prisma.user.create({
        data: {
          email: "admin@battletop.com",
          name: "Battle Top 官方",
          password: hashedPassword,
          isAuthoritative: true,
          credibilityScore: 100,
          role: "admin",
        },
      })
      adminCreated = true
    }

    return NextResponse.json({
      success: true,
      message: "数据库初始化完成",
      data: {
        categoriesCreated,
        adminCreated,
        adminEmail: "admin@battletop.com",
        adminPassword: "admin123",
      },
    })
  } catch (error) {
    console.error("初始化失败:", error)
    return NextResponse.json(
      { error: "初始化失败", details: String(error) },
      { status: 500 }
    )
  }
}
