"use client"

import { Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import SignInContent from "./SignInContent"

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}
