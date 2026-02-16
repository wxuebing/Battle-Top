import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123456", 12)

  const existingAdmin = await prisma.user.findFirst({
    where: { email: "admin@battletop.com" },
  })

  if (existingAdmin) {
    console.log("✅ 管理员账号已存在!")
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
    console.log("📧 邮箱: admin@battletop.com")
    console.log("🔑 密码: admin123456")
    return
  }

  const admin = await prisma.user.create({
    data: {
      email: "admin@battletop.com",
      name: "BattleTop创始人",
      password: hashedPassword,
      emailVerified: new Date(),
      role: "admin",
      isAuthoritative: true,
      credibilityScore: 9999,
      title: "平台创始人",
      bio: "Battle Top 平台创始人 | 观点竞技场守护者",
      battleWins: 100,
      mvpCount: 50,
      image: "/avatars/admin.png",
    },
  })

  console.log("✅ 管理员账号创建成功!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("📧 邮箱: admin@battletop.com")
  console.log("🔑 密码: admin123456")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("👑 权限: 管理员")
  console.log("⭐ 威望: 9999")
  console.log("🏆 称号: 平台创始人")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
