"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button, Card, CardContent } from "@/components/ui"
import { Swords, Key, Shield, CheckCircle } from "lucide-react"

const SECURITY_QUESTIONS: Record<string, string> = {
  pet: "您的第一只宠物叫什么名字？",
  school: "您就读的第一所学校名称？",
  city: "您出生的城市？",
  movie: "您最喜欢的电影名称？",
  book: "对您影响最大的一本书？",
  food: "您最喜欢的食物？",
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<"email" | "question" | "reset" | "success">("email")
  const [email, setEmail] = useState("")
  const [securityQuestion, setSecurityQuestion] = useState("")
  const [securityAnswer, setSecurityAnswer] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleFindAccount = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/security-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (data.success) {
        setSecurityQuestion(data.question)
        setStep("question")
      } else {
        setError(data.error || "账户不存在")
      }
    } catch {
      setError("查询失败")
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyAnswer = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const res = await fetch("/api/auth/verify-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answer: securityAnswer }),
      })
      const data = await res.json()

      if (data.success) {
        setStep("reset")
      } else {
        setError(data.error || "答案错误")
      }
    } catch {
      setError("验证失败")
    } finally {
      setLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (newPassword !== confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }

    if (newPassword.length < 6) {
      setError("密码至少需要6个字符")
      return
    }

    setLoading(true)

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, answer: securityAnswer, newPassword }),
      })
      const data = await res.json()

      if (data.success) {
        setStep("success")
        setTimeout(() => router.push("/auth/signin"), 2000)
      } else {
        setError(data.error || "重置失败")
      }
    } catch {
      setError("重置失败")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900 px-4 py-8">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
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
          <CardContent className="pt-6">
            <div className="text-center mb-6">
              <Key className="h-12 w-12 text-primary-400 mx-auto mb-3" />
              <h1 className="text-xl font-semibold text-white">找回密码</h1>
            </div>

            {step === "email" && (
              <form onSubmit={handleFindAccount} className="space-y-4">
                <p className="text-sm text-gray-400 text-center mb-4">
                  请输入注册时使用的邮箱地址
                </p>

                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
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

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500"
                  isLoading={loading}
                >
                  查找账户
                </Button>
              </form>
            )}

            {step === "question" && (
              <form onSubmit={handleVerifyAnswer} className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Shield className="h-5 w-5 text-primary-400" />
                  <span className="text-sm font-medium text-gray-300">安全问题验证</span>
                </div>

                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">问题</label>
                  <p className="text-white">{SECURITY_QUESTIONS[securityQuestion] || securityQuestion}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">答案</label>
                  <input
                    type="text"
                    value={securityAnswer}
                    onChange={(e) => setSecurityAnswer(e.target.value)}
                    placeholder="请输入答案"
                    required
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500"
                  isLoading={loading}
                >
                  验证答案
                </Button>

                <button
                  type="button"
                  onClick={() => { setStep("email"); setError("") }}
                  className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                >
                  返回上一步
                </button>
              </form>
            )}

            {step === "reset" && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-gray-400 text-center mb-4">
                  验证成功，请设置新密码
                </p>

                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">新密码</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="请输入新密码（至少6位）"
                    required
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">确认密码</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="请再次输入新密码"
                    required
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500"
                  isLoading={loading}
                >
                  重置密码
                </Button>
              </form>
            )}

            {step === "success" && (
              <div className="text-center py-4">
                <CheckCircle className="h-16 w-16 text-green-400 mx-auto mb-4" />
                <h2 className="text-xl font-semibold text-white mb-2">密码重置成功</h2>
                <p className="text-gray-400">正在跳转到登录页面...</p>
              </div>
            )}

            {step !== "success" && (
              <div className="mt-6 text-center text-sm text-gray-400">
                想起密码了？{" "}
                <Link
                  href="/auth/signin"
                  className="text-primary-400 hover:text-primary-300 font-medium"
                >
                  返回登录
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
