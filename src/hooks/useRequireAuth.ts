"use client"

import { useSession } from "./useSession"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export function useRequireAuth(redirectTo: string = "/auth/signin") {
  const { isAuthenticated, isLoading } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push(redirectTo)
    }
  }, [isAuthenticated, isLoading, redirectTo, router])

  return { isAuthenticated, isLoading }
}
