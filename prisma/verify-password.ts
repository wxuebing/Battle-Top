import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.findFirst({
    where: { email: "admin@battletop.com" },
  })
  
  if (!user) {
    console.log("用户不存在!")
    return
  }
  
  console.log("用户信息:")
  console.log("- ID:", user.id)
  console.log("- 邮箱:", user.email)
  console.log("- 密码哈希:", user.password)
  
  const testResult = await bcrypt.compare("admin123456", user.password || "")
  console.log("- 密码验证结果:", testResult ? "✅ 正确" : "❌ 错误")
  
  if (!testResult) {
    const hashedPassword = await bcrypt.hash("admin123456", 12)
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })
    console.log("\n✅ 密码已重置为: admin123456")
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
