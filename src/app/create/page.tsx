"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button, Input, Textarea, Card, CardContent, CardHeader } from "@/components/ui"
import { RankingEditor } from "@/components/ranking"
import { ArrowLeft, Save, Send, AlertTriangle } from "lucide-react"

interface Category {
  id: string
  name: string
  type: string
}

interface RankingItem {
  id: string
  name: string
  description?: string
  imageUrl?: string
  justification?: string
}

export default function CreateRankingPage() {
  const router = useRouter()
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    categoryId: "",
    items: [
      { id: `temp-${Date.now()}-1`, name: "", description: "", imageUrl: "", justification: "" },
      { id: `temp-${Date.now()}-2`, name: "", description: "", imageUrl: "", justification: "" },
    ] as RankingItem[],
  })

  useEffect(() => {
    fetchCategories()
  }, [])

  async function fetchCategories() {
    try {
      const response = await fetch("/api/categories")
      const data = await response.json()
      if (data.success) {
        setCategories(data.data)
      }
    } catch (error) {
      console.error("Failed to fetch categories:", error)
    }
  }

  async function handleSave(publish: boolean = false) {
    if (!formData.title.trim()) {
      alert("请输入榜单标题")
      return
    }

    const validItems = formData.items.filter((item) => item.name.trim())
    if (validItems.length < 2) {
      alert("至少需要2个有效项目")
      return
    }

    setIsSaving(true)
    try {
      const response = await fetch("/api/rankings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: validItems.map((item, index) => ({
            ...item,
            position: index + 1,
          })),
        }),
      })

      const data = await response.json()
      if (data.success) {
        if (publish) {
          const publishResponse = await fetch(`/api/rankings/${data.data.id}/publish`, {
            method: "POST",
          })
          if (publishResponse.ok) {
            router.push(`/ranking/${data.data.id}`)
          }
        } else {
          router.push("/profile")
        }
      } else {
        alert(data.error || "保存失败")
      }
    } catch (error) {
      console.error("Failed to save ranking:", error)
      alert("保存失败，请稍后重试")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-primary-600"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            返回
          </button>

          <Card>
            <CardHeader>
              <h1 className="text-xl font-semibold">创建新榜单</h1>
              <p className="text-sm text-gray-500">
                创建您的排名榜单，拖动项目调整顺序
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">内容发布规范</p>
                    <ul className="text-red-600/80 mt-1 space-y-1 text-xs">
                      <li>• 禁止发布违法违规内容（涉黄、涉暴、涉政等）</li>
                      <li>• 禁止发布侵犯他人权益的内容</li>
                      <li>• 禁止发布虚假、诽谤、歧视性内容</li>
                      <li>• 违规内容将被删除，严重者将封禁账户</li>
                    </ul>
                  </div>
                </div>
              </div>

              <Input
                label="榜单标题"
                value={formData.title}
                onChange={(e) =>
                  setFormData({ ...formData, title: e.target.value })
                }
                placeholder="例如：2024年最佳AI大模型排名"
              />

              <Textarea
                label="榜单描述"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="描述这个榜单的评选标准或背景..."
                rows={3}
              />

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700">
                  分类
                </label>
                <select
                  value={formData.categoryId}
                  onChange={(e) =>
                    setFormData({ ...formData, categoryId: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">选择分类（可选）</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-700">
                  排名项目
                </label>
                <RankingEditor
                  items={formData.items}
                  onChange={(items) => setFormData({ ...formData, items })}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handleSave(false)}
                  disabled={isSaving}
                >
                  <Save className="h-4 w-4 mr-2" />
                  保存草稿
                </Button>
                <Button
                  onClick={() => handleSave(true)}
                  disabled={isSaving}
                >
                  <Send className="h-4 w-4 mr-2" />
                  发布榜单
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
