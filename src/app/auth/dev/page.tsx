"use client"

import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button, Card, CardContent, CardHeader, Input } from "@/components/ui"
import { Key, AlertTriangle, Lock } from "lucide-react"
import Link from "next/link"

export default function DevLoginPage() {
  const router = useRouter()
  const [masterKey, setMasterKey] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [isDev, setIsDev] = useState<boolean | null>(null)

  useEffect(() => {
    fetch("/api/auth/dev-check")
      .then((res) => res.json())
      .then((data) => {
        setIsDev(data.isDev)
        if (!data.isDev) {
          router.push("/auth/signin")
        }
      })
      .catch(() => {
        setIsDev(false)
        router.push("/auth/signin")
      })
  }, [router])

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      const result = await signIn("dev-master", {
        masterKey,
        redirect: false,
      })

      if (result?.error) {
        setError("密钥错误或开发环境未启用")
      } else {
        router.push("/")
        router.refresh()
      }
    } catch (err) {
      setError("登录失败")
    } finally {
      setLoading(false)
    }
  }

  if (isDev === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-500"></div>
      </div>
    )
  }

  if (!isDev) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
          <CardContent className="pt-6 text-center">
            <Lock className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-white mb-2">访问受限</h1>
            <p className="text-gray-400">此页面仅在开发环境下可用</p>
            <Link href="/auth/signin">
              <Button className="mt-4">返回登录</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-gray-800/50 border-gray-700">
        <CardHeader className="text-center border-b border-gray-700">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-red-500 to-orange-500 p-2 rounded-lg">
              <Key className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-white">开发者入口</h1>
          <p className="text-gray-400 text-sm mt-1">仅限开发环境使用</p>
        </CardHeader>
        
        <CardContent className="pt-6">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-6">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-yellow-200">
                <p className="font-medium">警告：开发者专用</p>
                <p className="text-yellow-300/80 mt-1">
                  此页面仅在开发环境下可用，生产环境将无法访问。
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleDevLogin} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-1">开发者密钥</label>
              <Input
                type="password"
                value={masterKey}
                onChange={(e) => setMasterKey(e.target.value)}
                placeholder="输入开发者密钥"
                className="bg-gray-900 border-gray-600"
              />
            </div>

            {error && (
              <p className="text-red-400 text-sm">{error}</p>
            )}

            <Button
              type="submit"
              isLoading={loading}
              className="w-full bg-gradient-to-r from-red-500 to-orange-500 hover:from-red-600 hover:to-orange-600"
            >
              <Key className="h-4 w-4 mr-2" />
              开发者登录
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Link 
              href="/auth/signin" 
              className="text-sm text-gray-400 hover:text-white transition-colors"
            >
              返回普通登录
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
