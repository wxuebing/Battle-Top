import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const hashedPassword = await bcrypt.hash("admin123456", 12)

  const admin = await prisma.user.update({
    where: { id: "cmloa510h0000cfpww3cdho29" },
    data: {
      password: hashedPassword,
      role: "admin",
      credibilityScore: 9999,
      title: "平台创始人",
      bio: "Battle Top 平台创始人 | 观点竞技场守护者",
      battleWins: 100,
      mvpCount: 50,
      name: "BattleTop创始人",
      emailVerified: new Date(),
    },
  })

  console.log("✅ 管理员账号已更新!")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("📧 邮箱: admin@battletop.com")
  console.log("🔑 密码: admin123456")
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━")
  console.log("👑 权限:", admin.role)
  console.log("⭐ 威望:", admin.credibilityScore)
  console.log("🏆 称号:", admin.title)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
