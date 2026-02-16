"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui"
import { Swords, Lightbulb, Plus, Search, User, MessageSquare, X, ChevronLeft, ChevronRight, Github, Mail } from "lucide-react"
import { cn } from "@/lib/utils"

const guideSteps = [
  {
    title: "欢迎来到 Battle Top！",
    description: "这是一个观点竞技场，你可以创建、发布和发现各类排名榜单，与其他用户一起探讨和辩论。",
    icon: Swords,
    color: "from-primary-500 to-accent-500",
  },
  {
    title: "创建榜单",
    description: "点击导航栏的「创建榜单」，为你的排名添加项目、描述和标签，发布后让其他用户参与讨论。",
    icon: Plus,
    color: "from-green-500 to-emerald-500",
  },
  {
    title: "发现榜单",
    description: "在「发现」页面浏览各类榜单，点赞支持你认同的排名，在评论区发表你的观点。",
    icon: Search,
    color: "from-blue-500 to-cyan-500",
  },
  {
    title: "个人中心",
    description: "完善你的个人资料，查看你创建的榜单和收到的点赞，订阅感兴趣的创作者。",
    icon: User,
    color: "from-purple-500 to-pink-500",
  },
  {
    title: "有想法？联系我们！",
    description: "你的意见对我们很重要！有任何建议或想法，欢迎通过 GitHub 或邮件联系开发者。",
    icon: MessageSquare,
    color: "from-orange-500 to-red-500",
    isContact: true,
  },
]

let openGuideCallback: (() => void) | null = null

export function openUserGuide() {
  if (openGuideCallback) {
    openGuideCallback()
  }
}

interface UserGuideProps {
  onComplete?: () => void
}

export function UserGuide({ onComplete }: UserGuideProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)

  const openGuide = useCallback(() => {
    setCurrentStep(0)
    setIsOpen(true)
  }, [])

  useEffect(() => {
    openGuideCallback = openGuide
    
    const hasSeenGuide = localStorage.getItem("battletop_guide_completed")
    if (!hasSeenGuide) {
      setTimeout(() => setIsOpen(true), 1000)
    }
    
    return () => {
      openGuideCallback = null
    }
  }, [openGuide])

  function handleClose() {
    setIsOpen(false)
    localStorage.setItem("battletop_guide_completed", "true")
    onComplete?.()
  }

  function handleNext() {
    if (currentStep < guideSteps.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      handleClose()
    }
  }

  function handlePrev() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  function handleSkip() {
    handleClose()
  }

  if (!isOpen) return null

  const step = guideSteps[currentStep]
  const Icon = step.icon

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-lg mx-4 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700 overflow-hidden">
        <button
          onClick={handleSkip}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="p-8">
          <div className="flex justify-center mb-6">
            <div className={cn(
              "p-4 rounded-full bg-gradient-to-r",
              step.color
            )}>
              <Icon className="h-10 w-10 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-bold text-white text-center mb-3">
            {step.title}
          </h2>
          
          <p className="text-gray-400 text-center mb-6 leading-relaxed">
            {step.description}
          </p>

          {step.isContact && (
            <div className="flex justify-center gap-4 mb-6">
              <a
                href="https://github.com/wxuebing"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
              <a
                href="mailto:3252140949@qq.com"
                className="flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-lg text-gray-300 hover:text-white hover:bg-gray-700 transition-colors"
              >
                <Mail className="h-4 w-4" />
                发送邮件
              </a>
            </div>
          )}

          <div className="flex justify-center gap-2 mb-6">
            {guideSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentStep
                    ? "w-6 bg-gradient-to-r from-primary-500 to-accent-500"
                    : "bg-gray-600 hover:bg-gray-500"
                )}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              className={cn(
                "flex items-center gap-1 text-sm text-gray-400 hover:text-white transition-colors",
                currentStep === 0 && "opacity-50 cursor-not-allowed"
              )}
            >
              <ChevronLeft className="h-4 w-4" />
              上一步
            </button>

            <Button
              onClick={handleNext}
              className="bg-gradient-to-r from-primary-500 to-accent-500 hover:from-primary-600 hover:to-accent-600"
            >
              {currentStep === guideSteps.length - 1 ? "开始使用" : "下一步"}
              {currentStep < guideSteps.length - 1 && <ChevronRight className="h-4 w-4 ml-1" />}
            </Button>
          </div>
        </div>

        <div className="px-8 py-4 bg-gray-800/50 border-t border-gray-700">
          <button
            onClick={handleSkip}
            className="w-full text-sm text-gray-500 hover:text-gray-300 transition-colors"
          >
            跳过引导，稍后再看
          </button>
        </div>
      </div>
    </div>
  )
}
