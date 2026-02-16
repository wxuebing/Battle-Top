import { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { PrismaAdapter } from "@next-auth/prisma-adapter"
import { prisma } from "./prisma"
import bcrypt from "bcryptjs"

const DEV_MASTER_KEY = process.env.DEV_MASTER_KEY
const isDev = process.env.NODE_ENV === "development"

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        console.log("[Auth] 尝试登录:", credentials?.email)

        if (!credentials?.email || !credentials?.password) {
          console.log("[Auth] 缺少邮箱或密码")
          return null
        }

        const user = await prisma.user.findFirst({
          where: { 
            email: {
              equals: credentials.email.toLowerCase()
            }
          },
        })

        console.log("[Auth] 找到用户:", user ? user.email : "未找到")

        if (!user || !user.password) {
          console.log("[Auth] 用户不存在或无密码")
          return null
        }

        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        )

        console.log("[Auth] 密码匹配:", passwordMatch)

        if (!passwordMatch) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
    CredentialsProvider({
      id: "phone",
      name: "phone",
      credentials: {
        phone: { label: "Phone", type: "text" },
        userId: { label: "UserId", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.phone || !credentials?.userId) {
          return null
        }

        const user = await prisma.user.findFirst({
          where: { 
            id: credentials.userId,
            phone: credentials.phone,
          },
        })

        if (!user) {
          return null
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        }
      },
    }),
    CredentialsProvider({
      id: "dev-master",
      name: "dev-master",
      credentials: {
        masterKey: { label: "MasterKey", type: "password" },
      },
      async authorize(credentials) {
        if (!isDev || !DEV_MASTER_KEY) {
          console.log("[Auth] 开发者登录仅在开发环境可用")
          return null
        }

        if (credentials?.masterKey !== DEV_MASTER_KEY) {
          console.log("[Auth] 开发者密钥错误")
          return null
        }

        let masterUser = await prisma.user.findFirst({
          where: { role: "admin" },
        })

        if (!masterUser) {
          const hashedPassword = await bcrypt.hash("DevMaster2024!", 10)
          masterUser = await prisma.user.create({
            data: {
              email: "dev@battletop.com",
              name: "创始人",
              password: hashedPassword,
              role: "admin",
              credibilityScore: 9999,
              level: 20,
              totalLikesReceived: 9999,
              totalRankingsPublished: 999,
              battleWins: 999,
              mvpCount: 999,
            },
          })

          await prisma.wallet.create({
            data: {
              userId: masterUser.id,
              balance: 999999,
            },
          })

          console.log("[Auth] 创建创始人账户:", masterUser.email)
        }

        return {
          id: masterUser.id,
          email: masterUser.email,
          name: masterUser.name,
          image: masterUser.image,
        }
      },
    }),
  ],
  callbacks: {
    async session({ token, session }) {
      if (token) {
        session.user.id = token.id as string
        session.user.name = token.name as string | null
        session.user.email = token.email as string
        session.user.image = token.picture as string | null
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
      }

      if (token.email) {
        const dbUser = await prisma.user.findFirst({
          where: { email: token.email },
        })
        if (dbUser) {
          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            picture: dbUser.image,
          }
        }
      }

      if (token.id) {
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id as string },
        })
        if (dbUser) {
          return {
            id: dbUser.id,
            name: dbUser.name,
            email: dbUser.email,
            picture: dbUser.image,
          }
        }
      }

      return token
    },
  },
}
