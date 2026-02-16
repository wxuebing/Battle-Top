const { PrismaClient } = require("@prisma/client")

const prisma = new PrismaClient()

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

async function main() {
  console.log("开始初始化数据库...")

  for (const category of defaultCategories) {
    const existing = await prisma.category.findFirst({
      where: { name: category.name },
    })

    if (!existing) {
      await prisma.category.create({
        data: category,
      })
      console.log(`创建分类: ${category.name}`)
    } else {
      console.log(`分类已存在: ${category.name}`)
    }
  }

  console.log("数据库初始化完成！")
}

main()
  .catch((e) => {
    console.error("初始化失败:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
