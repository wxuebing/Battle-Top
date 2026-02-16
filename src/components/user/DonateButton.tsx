"use client"

import { useState } from "react"
import { Heart, X, Coffee, Gift, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface DonateButtonProps {
  userId: string
  userName?: string
  rankingId?: string
  className?: string
}

const PRESET_AMOUNTS = [1, 5, 10, 20, 50, 100]

export function DonateButton({ userId, userName, rankingId, className }: DonateButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState<number>(5)
  const [customAmount, setCustomAmount] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [step, setStep] = useState<"select" | "payment">("select")

  async function handleDonate() {
    const finalAmount = customAmount ? parseFloat(customAmount) : amount
    if (finalAmount <= 0) return

    setIsLoading(true)
    try {
      const response = await fetch(`/api/user/${userId}/donate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: finalAmount,
          message,
          rankingId,
        }),
      })
      const data = await response.json()
      if (data.success) {
        setStep("payment")
      }
    } catch (error) {
      console.error("Failed to create donation:", error)
    } finally {
      setIsLoading(false)
    }
  }

  function handleClose() {
    setIsOpen(false)
    setStep("select")
    setAmount(5)
    setCustomAmount("")
    setMessage("")
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all",
          "bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:from-pink-600 hover:to-rose-600",
          className
        )}
      >
        <Heart className="h-4 w-4" />
        打赏
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden">
            <div className="bg-gradient-to-r from-pink-500 to-rose-500 px-6 py-4 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  <h3 className="text-lg font-semibold">
                    打赏 {userName || "作者"}
                  </h3>
                </div>
                <button
                  onClick={handleClose}
                  className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {step === "select" ? (
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    选择打赏金额
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {PRESET_AMOUNTS.map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setAmount(preset)
                          setCustomAmount("")
                        }}
                        className={cn(
                          "py-3 rounded-lg font-medium transition-all",
                          amount === preset && !customAmount
                            ? "bg-pink-500 text-white"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        )}
                      >
                        ¥{preset}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    或输入自定义金额
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">¥</span>
                    <input
                      type="number"
                      value={customAmount}
                      onChange={(e) => setCustomAmount(e.target.value)}
                      placeholder="输入金额"
                      className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    留言（可选）
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="给作者留言..."
                    rows={2}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent resize-none"
                  />
                </div>

                <button
                  onClick={handleDonate}
                  disabled={isLoading || (!customAmount && amount <= 0)}
                  className={cn(
                    "w-full py-3 rounded-lg font-medium transition-all",
                    "bg-gradient-to-r from-pink-500 to-rose-500 text-white",
                    "hover:from-pink-600 hover:to-rose-600",
                    "disabled:opacity-50 disabled:cursor-not-allowed"
                  )}
                >
                  {isLoading ? "处理中..." : `确认打赏 ¥${customAmount || amount}`}
                </button>
              </div>
            ) : (
              <div className="p-6 text-center">
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Sparkles className="h-8 w-8 text-green-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  打赏请求已创建
                </h4>
                <p className="text-gray-600 mb-4">
                  请使用以下方式完成支付（原型演示）
                </p>
                <div className="bg-gray-100 rounded-lg p-4 mb-4">
                  <div className="text-sm text-gray-500 mb-2">收款二维码</div>
                  <div className="w-32 h-32 bg-gray-200 rounded-lg mx-auto flex items-center justify-center">
                    <Coffee className="h-12 w-12 text-gray-400" />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    金额: ¥{customAmount || amount}
                  </div>
                </div>
                <button
                  onClick={handleClose}
                  className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  关闭
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
