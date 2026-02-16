"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui"
import { Sparkles, TrendingUp, GraduationCap, MoreHorizontal } from "lucide-react"
import { Category } from "@/types"
import { cn } from "@/lib/utils"

const categoryIcons: Record<string, any> = {
  AI_MODEL: Sparkles,
  ANIME_CHARACTER: TrendingUp,
  EDUCATIONAL_INSTITUTION: GraduationCap,
  CUSTOM: MoreHorizontal,
}

const categoryColors: Record<string, string> = {
  AI_MODEL: "bg-purple-100 text-purple-600",
  ANIME_CHARACTER: "bg-pink-100 text-pink-600",
  EDUCATIONAL_INSTITUTION: "bg-blue-100 text-blue-600",
  CUSTOM: "bg-gray-100 text-gray-600",
}

export function CategoriesSection() {
  const [categories, setCategories] = useState<Category[]>([])

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

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">浏览分类</h2>
          <p className="text-gray-500 mt-1">探索不同领域的排名榜单</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {categories.map((category) => {
            const Icon = categoryIcons[category.type] || MoreHorizontal
            const colorClass = categoryColors[category.type] || categoryColors.CUSTOM

            return (
              <Link key={category.id} href={`/explore?category=${category.id}`}>
                <Card hover className="h-full">
                  <CardContent className="pt-6 text-center">
                    <div
                      className={cn(
                        "inline-flex items-center justify-center w-12 h-12 rounded-full mb-3",
                        colorClass
                      )}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-gray-900">{category.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {(category as any)._count?.rankings || 0} 个榜单
                    </p>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
