"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button, Card, CardContent } from "@/components/ui"
import { FormValidator, validateEmail, validatePhone, PasswordStrengthIndicator, InputFeedback } from "@/components/ui"
import { Swords, Flame, Mail, Smartphone, AlertTriangle, Shield, Eye, EyeOff, Check, X } from "lucide-react"
import { cn } from "@/lib/utils"

type RegisterMethod = "email" | "phone"

const SECURITY_QUESTIONS = [
  { value: "pet", label: "您的第一只宠物叫什么名字？" },
  { value: "school", label: "您就读的第一所学校名称？" },
  { value: "city", label: "您出生的城市？" },
  { value: "movie", label: "您最喜欢的电影名称？" },
  { value: "book", label: "对您影响最大的一本书？" },
  { value: "food", label: "您最喜欢的食物？" },
]

export default function SignUpPage() {
  const router = useRouter()
  const [registerMethod, setRegisterMethod] = useState<RegisterMethod>("email")
  const [emailForm, setEmailForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    securityQuestion: "",
    securityAnswer: "",
  })
  const [phoneForm, setPhoneForm] = useState({
    name: "",
    phone: "",
    code: "",
    securityQuestion: "",
    securityAnswer: "",
  })
  const [agreed, setAgreed] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [emailTouched, setEmailTouched] = useState(false)
  const [phoneTouched, setPhoneTouched] = useState(false)

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEmailForm({ ...emailForm, [e.target.name]: e.target.value })
  }

  function handlePhoneChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setPhoneForm({ ...phoneForm, [e.target.name]: e.target.value })
  }

  async function handleEmailRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!agreed) {
      setError("请阅读并同意用户协议和内容规范")
      return
    }

    if (emailForm.password !== emailForm.confirmPassword) {
      setError("两次输入的密码不一致")
      return
    }

    if (emailForm.password.length < 6) {
      setError("密码至少需要6个字符")
      return
    }

    if (!emailForm.securityQuestion || !emailForm.securityAnswer) {
      setError("请设置安全问题")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: emailForm.name,
          email: emailForm.email,
          password: emailForm.password,
          securityQuestion: emailForm.securityQuestion,
          securityAnswer: emailForm.securityAnswer,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "注册失败")
      } else {
        router.push("/auth/signin?registered=true")
      }
    } catch {
      setError("注册失败，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  async function sendSmsCode() {
    if (!phoneForm.phone.match(/^1[3-9]\d{9}$/)) {
      setError("请输入正确的手机号")
      return
    }

    try {
      const response = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: phoneForm.phone, purpose: "register" }),
      })
      const data = await response.json()
      
      if (data.success) {
        setCountdown(60)
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

  async function handlePhoneRegister(e: React.FormEvent) {
    e.preventDefault()
    setError("")

    if (!agreed) {
      setError("请阅读并同意用户协议和内容规范")
      return
    }

    if (!phoneForm.securityQuestion || !phoneForm.securityAnswer) {
      setError("请设置安全问题")
      return
    }

    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/register-phone", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(phoneForm),
      })
      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "注册失败")
      } else {
        router.push("/auth/signin?registered=true")
      }
    } catch {
      setError("注册失败，请稍后重试")
    } finally {
      setIsLoading(false)
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
            <h1 className="text-xl font-semibold text-white text-center">创建账户</h1>
            <p className="mt-2 text-sm text-gray-400 text-center mb-4">
              加入战斗，开始你的榜单之旅
            </p>

            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 mb-4">
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-200">
                  <p className="font-medium">内容规范警告</p>
                  <ul className="text-red-300/80 mt-1 space-y-1 text-xs">
                    <li>• 禁止发布违法违规内容（涉黄、涉暴、涉政等）</li>
                    <li>• 禁止发布侵犯他人权益的内容</li>
                    <li>• 禁止发布虚假、诽谤、歧视性内容</li>
                    <li>• 违规内容将被删除，严重者将封禁账户</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex gap-2 mb-4 p-1 bg-gray-700/50 rounded-lg">
              <button
                onClick={() => { setRegisterMethod("email"); setError("") }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all",
                  registerMethod === "email"
                    ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Mail className="h-4 w-4" />
                邮箱注册
              </button>
              <button
                onClick={() => { setRegisterMethod("phone"); setError("") }}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md text-sm font-medium transition-all",
                  registerMethod === "phone"
                    ? "bg-gradient-to-r from-primary-500 to-accent-500 text-white"
                    : "text-gray-400 hover:text-white"
                )}
              >
                <Smartphone className="h-4 w-4" />
                手机注册
              </button>
            </div>

            {registerMethod === "email" ? (
              <form onSubmit={handleEmailRegister} className="space-y-3">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">用户名</label>
                  <input
                    name="name"
                    value={emailForm.name}
                    onChange={handleEmailChange}
                    placeholder="请输入用户名"
                    required
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                  {emailForm.name && (
                    <InputFeedback 
                      isValid={emailForm.name.length >= 2} 
                      message={emailForm.name.length >= 2 ? "用户名有效" : "用户名至少2个字符"} 
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">邮箱</label>
                  <input
                    type="email"
                    name="email"
                    value={emailForm.email}
                    onChange={handleEmailChange}
                    onBlur={() => setEmailTouched(true)}
                    placeholder="请输入邮箱"
                    required
                    className={cn(
                      "w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
                      emailTouched && emailForm.email && !validateEmail(emailForm.email) ? "border-red-500" : "border-gray-600"
                    )}
                  />
                  {emailTouched && emailForm.email && (
                    <InputFeedback 
                      isValid={validateEmail(emailForm.email)} 
                      message={validateEmail(emailForm.email) ? "邮箱格式正确" : "请输入有效的邮箱地址"} 
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">密码</label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={emailForm.password}
                      onChange={handleEmailChange}
                      placeholder="请输入密码（至少6位）"
                      required
                      className="w-full px-4 py-2.5 pr-10 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {emailForm.password && <PasswordStrengthIndicator password={emailForm.password} />}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">确认密码</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={emailForm.confirmPassword}
                      onChange={handleEmailChange}
                      placeholder="请再次输入密码"
                      required
                      className={cn(
                        "w-full px-4 py-2.5 pr-10 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
                        emailForm.confirmPassword && emailForm.password !== emailForm.confirmPassword ? "border-red-500" : "border-gray-600"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {emailForm.confirmPassword && (
                    <InputFeedback 
                      isValid={emailForm.password === emailForm.confirmPassword} 
                      message={emailForm.password === emailForm.confirmPassword ? "密码一致" : "两次密码不一致"} 
                    />
                  )}
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary-400" />
                    <span className="text-sm font-medium text-gray-300">安全问题（用于找回密码）</span>
                  </div>
                  <div className="space-y-2">
                    <select
                      name="securityQuestion"
                      value={emailForm.securityQuestion}
                      onChange={handleEmailChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    >
                      <option value="">请选择安全问题</option>
                      {SECURITY_QUESTIONS.map((q) => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="securityAnswer"
                      value={emailForm.securityAnswer}
                      onChange={handleEmailChange}
                      placeholder="请输入答案"
                      required
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="agree"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
                  />
                  <label htmlFor="agree" className="text-xs text-gray-400">
                    我已阅读并同意
                    <Link href="/legal/terms" className="text-primary-400 hover:text-primary-300 mx-1">《用户协议》</Link>
                    和
                    <Link href="/legal/guidelines" className="text-primary-400 hover:text-primary-300 mx-1">《内容规范》</Link>
                    ，承诺不发布违法违规内容
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600"
                  isLoading={isLoading}
                >
                  <Flame className="h-4 w-4 mr-2" />
                  注册
                </Button>
              </form>
            ) : (
              <form onSubmit={handlePhoneRegister} className="space-y-3">
                {error && (
                  <div className="p-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg">
                    {error}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">用户名</label>
                  <input
                    name="name"
                    value={phoneForm.name}
                    onChange={handlePhoneChange}
                    placeholder="请输入用户名"
                    required
                    className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                  />
                  {phoneForm.name && (
                    <InputFeedback 
                      isValid={phoneForm.name.length >= 2} 
                      message={phoneForm.name.length >= 2 ? "用户名有效" : "用户名至少2个字符"} 
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">手机号</label>
                  <input
                    type="tel"
                    name="phone"
                    value={phoneForm.phone}
                    onChange={handlePhoneChange}
                    onBlur={() => setPhoneTouched(true)}
                    placeholder="请输入手机号"
                    required
                    maxLength={11}
                    className={cn(
                      "w-full px-4 py-2.5 bg-gray-700 border rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors",
                      phoneTouched && phoneForm.phone && !validatePhone(phoneForm.phone) ? "border-red-500" : "border-gray-600"
                    )}
                  />
                  {phoneTouched && phoneForm.phone && (
                    <InputFeedback 
                      isValid={validatePhone(phoneForm.phone)} 
                      message={validatePhone(phoneForm.phone) ? "手机号格式正确" : "请输入有效的手机号"} 
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">验证码</label>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      name="code"
                      value={phoneForm.code}
                      onChange={(e) => setPhoneForm({ ...phoneForm, code: e.target.value.replace(/\D/g, "").slice(0, 6) })}
                      placeholder="请输入验证码"
                      required
                      maxLength={6}
                      className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    />
                    <button
                      type="button"
                      onClick={sendSmsCode}
                      disabled={countdown > 0 || !phoneForm.phone.match(/^1[3-9]\d{9}$/)}
                      className="px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-sm font-medium text-gray-300 hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                    >
                      {countdown > 0 ? `${countdown}s` : "获取验证码"}
                    </button>
                  </div>
                  {phoneForm.code && (
                    <InputFeedback 
                      isValid={phoneForm.code.length === 6} 
                      message={phoneForm.code.length === 6 ? "验证码已输入" : "请输入6位验证码"} 
                    />
                  )}
                </div>

                <div className="pt-2 border-t border-gray-700">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="h-4 w-4 text-primary-400" />
                    <span className="text-sm font-medium text-gray-300">安全问题（用于找回密码）</span>
                  </div>
                  <div className="space-y-2">
                    <select
                      name="securityQuestion"
                      value={phoneForm.securityQuestion}
                      onChange={handlePhoneChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    >
                      <option value="">请选择安全问题</option>
                      {SECURITY_QUESTIONS.map((q) => (
                        <option key={q.value} value={q.value}>{q.label}</option>
                      ))}
                    </select>
                    <input
                      type="text"
                      name="securityAnswer"
                      value={phoneForm.securityAnswer}
                      onChange={handlePhoneChange}
                      placeholder="请输入答案"
                      required
                      className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="agree-phone"
                    checked={agreed}
                    onChange={(e) => setAgreed(e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-gray-600 bg-gray-700 text-primary-500 focus:ring-primary-500"
                  />
                  <label htmlFor="agree-phone" className="text-xs text-gray-400">
                    我已阅读并同意
                    <Link href="/legal/terms" className="text-primary-400 hover:text-primary-300 mx-1">《用户协议》</Link>
                    和
                    <Link href="/legal/guidelines" className="text-primary-400 hover:text-primary-300 mx-1">《内容规范》</Link>
                    ，承诺不发布违法违规内容
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600"
                  isLoading={isLoading}
                >
                  <Flame className="h-4 w-4 mr-2" />
                  注册
                </Button>
              </form>
            )}

            <div className="mt-4 text-center text-sm text-gray-400">
              已有账户？{" "}
              <Link
                href="/auth/signin"
                className="text-primary-400 hover:text-primary-300 font-medium"
              >
                立即登录
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
