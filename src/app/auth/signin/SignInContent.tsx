"use client"

import { useState } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button, Card, CardContent } from "@/components/ui"
import { Swords, Flame, Mail, Smartphone, CheckCircle, Eye, EyeOff } from "lucide-react"
import { cn } from "@/lib/utils"

type LoginMethod = "email" | "phone"

export default function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams.get("callbackUrl") || "/"
  const [loginMethod, setLoginMethod] = useState<LoginMethod>("email")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [debugCode, setDebugCode] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  async function handleEmailLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("邮箱或密码错误")
      } else {
        setSuccess("登录成功，正在跳转...")
        setTimeout(() => {
          router.push(callbackUrl)
          router.refresh()
        }, 500)
      }
    } catch {
      setError("登录失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  async function sendSmsCode() {
    if (!phone.match(/^1[3-9]\d{9}$/)) {
      setError("请输入正确的手机号")
      return
    }

    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, purpose: "login" }),
      })
      const data = await response.json()
      
      if (data.success) {
        setCountdown(60)
        setSuccess("验证码已发送")
        if (data.debugCode) {
          setDebugCode(data.debugCode)
        }
        const timer = setInterval(() => {
          setCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(data.error || "发送验证码失败")
      }
    } catch {
      setError("发送验证码失败")
    }
  }

  async function handlePhoneLogin(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    setSuccess("")
    setIsLoading(true)

    try {
      const verifyResponse = await fetch("/api/auth/phone-login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      })
      const verifyData = await verifyResponse.json()

      if (!verifyData.success) {
        setError(verifyData.error || "验证码错误")
        setIsLoading(false)
        return
      }

      const result = await signIn("phone", {
        phone,
        userId: verifyData.data.id,
        redirect: false,
      })

      if (result?.error) {
        setError("登录失败")
      } else {
        setSuccess("登录成功，正在跳转...")
        setTimeout(() => {
          router.push(callbackUrl)
          router.refresh()
        }, 500)
      }
    } catch {
      setError("登录失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center space-x-3 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary-500 to-accent-500 rounded-xl blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-primary-500 to-accent-500 p-3 rounded-xl">
                <Swords className="h-8 w-8 text-white" />
              </div>
            </div>
            <div className="text-left">
              <span className="text-2xl font-bold text-white">Battle Top</span>
              <p className="text-xs text-gray-400">观点竞技场</p>
            </div>
          </Link>
        </div>

        <Card className="bg-gray-800/50 border-gray-700 backdrop-blur-sm">
          <CardContent className="pt-8">
            <h1 className="text-xl font-semibold text-white text-center">登录账户</h1>
            <p className="mt-2 text-sm text-gray-400 text-center mb-6">
              欢迎回来，继续你的战斗
            </p>

            <div className="flex gap-2 mb-6 p-1 bg-gray-700/50 rounded-lg">
              <button
                onClick={() => { setLoginMethod("email"); setError(""); setSuccess("") }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all",
                  loginMethod === "email"
                    ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Mail className="h-4 w-4" />
                邮箱登录
              </button>
              <button
                onClick={() => { setLoginMethod("phone"); setError(""); setSuccess("") }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all",
                  loginMethod === "phone"
                    ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Smartphone className="h-4 w-4" />
                手机登录
              </button>
            </div>

            {loginMethod === "email" ? (
              <form onSubmit={handleEmailLogin} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">邮箱</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="请输入邮箱"
                    required
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">密码</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码"
                      required
                      className="w-full px-4 py-2.5 pr-12 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Link
                    href="/auth/reset-password"
                    className="text-sm text-primary-400 hover:text-primary-300"
                  >
                    忘记密码？
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600"
                  isLoading={isLoading}
                >
                  <Flame className="h-4 w-4 mr-2" />
                  登录
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePhoneLogin} className="space-y-4">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="p-3 text-sm text-green-400 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" />
                    {success}
                  </div>
                )}

                {debugCode && (
                  <div className="p-3 text-sm text-yellow-400 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    开发模式 - 验证码: <span className="font-mono font-bold">{debugCode}</span>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">手机号</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="请输入手机号"
                    required
                    maxLength={11}
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">验证码</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                      placeholder="请输入验证码"
                      required
                      maxLength={6}
                      className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={sendSmsCode}
                      disabled={countdown > 0 || !phone.match(/^1[3-9]\d{9}$/)}
                      className="px-4 py-2.5 bg-gradient-to-r from-primary-500 to-accent-500 rounded-lg text-sm font-medium text-white hover:from-primary-600 hover:to-accent-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all whitespace-nowrap"
                    >
                      {countdown > 0 ? `${countdown}s` : "获取验证码"}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600"
                  isLoading={isLoading}
                >
                  <Flame className="h-4 w-4 mr-2" />
                  登录
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-gray-400">
              还没有账户？{" "}
              <Link
                href="/auth/signup"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                立即注册
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
