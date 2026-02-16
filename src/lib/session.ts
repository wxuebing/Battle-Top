import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function getCurrentUser() {
  const session = await getServerSession(authOptions)
  return session?.user
}

export async function getCurrentUserWithDetails() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return null

  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      bio: true,
      credibilityScore: true,
      isAuthoritative: true,
      totalLikesReceived: true,
      totalRankingsPublished: true,
      createdAt: true,
    },
  })
}
