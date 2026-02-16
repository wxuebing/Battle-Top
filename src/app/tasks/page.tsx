"use client"

import { useState, useEffect } from "react"
import { Button, Card, CardContent, CardHeader, useToast, TaskSkeleton } from "@/components/ui"
import { 
  Calendar, Gift, CheckCircle, Clock, 
  Coins, Target, Trophy, Star, Flame
} from "lucide-react"
import { Navbar, Footer } from "@/components/layout"
import { cn } from "@/lib/utils"

interface DailyTask {
  id: string
  type: string
  name: string
  description: string
  reward: number
  requirement: number
  progress: number
  completed: boolean
  claimed: boolean
  userTaskId?: string
}

interface Achievement {
  id: string
  type: string
  name: string
  description: string
  icon: string | null
  requirement: number
  reward: number
  currentProgress: number
  unlocked: boolean
  claimed: boolean
  userAchievementId?: string
}

const TASK_ICONS: Record<string, any> = {
  DAILY_CHECKIN: Calendar,
  CREATE_RANKING: Target,
  LIKE_RANKING: Star,
  COMMENT_RANKING: Flame,
  SHARE_RANKING: Trophy,
}

export default function TasksPage() {
  const { showToast } = useToast()
  const [dailyTasks, setDailyTasks] = useState<DailyTask[]>([])
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"daily" | "achievements">("daily")

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [tasksRes, achievementsRes] = await Promise.all([
        fetch("/api/tasks/daily"),
        fetch("/api/achievements"),
      ])
      
      const tasksData = await tasksRes.json()
      const achievementsData = await achievementsRes.json()
      
      if (tasksData.success) {
        setDailyTasks(tasksData.data || [])
      } else if (tasksData.error === "未登录") {
        setDailyTasks([])
      }
      if (achievementsData.success) {
        setAchievements(achievementsData.data || [])
      } else if (achievementsData.error === "未登录") {
        setAchievements([])
      }
    } catch (error) {
      console.error("Fetch data error:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleTaskAction = async (taskId: string, action: "progress" | "claim") => {
    try {
      const res = await fetch("/api/tasks/daily", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, action }),
      })
      const data = await res.json()
      if (data.success) {
        fetchData()
        if (action === "claim") {
          showToast("奖励领取成功！", "success")
        }
      } else {
        showToast(data.error || "操作失败", "error")
      }
    } catch (error) {
      console.error("Task action error:", error)
      showToast("操作失败", "error")
    }
  }

  const handleClaimAchievement = async (achievementId: string) => {
    try {
      const res = await fetch("/api/achievements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ achievementId }),
      })
      const data = await res.json()
      if (data.success) {
        fetchData()
        showToast("成就奖励领取成功！", "success")
      } else {
        showToast(data.error || "领取失败", "error")
      }
    } catch (error) {
      console.error("Claim achievement error:", error)
      showToast("领取失败", "error")
    }
  }

  const getProgressPercent = (task: DailyTask) => {
    return Math.min(100, Math.round((task.progress / task.requirement) * 100))
  }

  const getAchievementProgressPercent = (achievement: Achievement) => {
    return Math.min(100, Math.round((achievement.currentProgress / achievement.requirement) * 100))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      <Navbar />
      
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white flex items-center gap-3">
              <Target className="h-8 w-8 text-green-400" />
              任务中心
            </h1>
            <p className="text-gray-400 mt-2">完成任务获取战斗币奖励！</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setActiveTab("daily")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "daily"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <Calendar className="h-4 w-4" />
              每日任务
            </button>
            <button
              onClick={() => setActiveTab("achievements")}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                activeTab === "achievements"
                  ? "bg-primary-500 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              )}
            >
              <Trophy className="h-4 w-4" />
              成就
            </button>
          </div>

          {loading ? (
            <TaskSkeleton />
          ) : activeTab === "daily" ? (
            <div className="space-y-4">
              {dailyTasks.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700">
                  <CardContent className="py-20 text-center">
                    <Calendar className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">暂无每日任务</p>
                  </CardContent>
                </Card>
              ) : (
                dailyTasks.map((task) => {
                  const IconComponent = TASK_ICONS[task.type] || Target
                  
                  return (
                    <Card key={task.id} className="bg-gray-800/50 border-gray-700">
                      <CardContent className="pt-6">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary-500 to-accent-500 flex items-center justify-center">
                            <IconComponent className="h-6 w-6 text-white" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-1">
                              <h3 className="font-semibold text-white">{task.name}</h3>
                              <span className="text-sm text-yellow-400 flex items-center gap-1">
                                <Coins className="h-4 w-4" />
                                {task.reward}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">{task.description}</p>
                            
                            <div className="mt-2">
                              <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                                <span>进度: {task.progress}/{task.requirement}</span>
                                <span>{getProgressPercent(task)}%</span>
                              </div>
                              <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className={cn(
                                    "h-full transition-all",
                                    task.completed
                                      ? "bg-gradient-to-r from-green-500 to-emerald-500"
                                      : "bg-gradient-to-r from-primary-500 to-accent-500"
                                  )}
                                  style={{ width: `${getProgressPercent(task)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                          
                          <div>
                            {task.claimed ? (
                              <span className="flex items-center gap-1 text-green-400 text-sm">
                                <CheckCircle className="h-4 w-4" />
                                已领取
                              </span>
                            ) : task.completed ? (
                              <Button
                                onClick={() => handleTaskAction(task.id, "claim")}
                                className="bg-gradient-to-r from-yellow-500 to-orange-500"
                              >
                                <Gift className="h-4 w-4 mr-1" />
                                领取
                              </Button>
                            ) : (
                              <span className="text-gray-500 text-sm">进行中</span>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {achievements.length === 0 ? (
                <Card className="bg-gray-800/50 border-gray-700 md:col-span-2">
                  <CardContent className="py-20 text-center">
                    <Trophy className="h-16 w-16 text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-400">暂无成就</p>
                  </CardContent>
                </Card>
              ) : (
                achievements.map((achievement) => (
                  <Card 
                    key={achievement.id} 
                    className={cn(
                      "bg-gray-800/50 border-gray-700 transition-all",
                      achievement.unlocked && "border-yellow-500/50"
                    )}
                  >
                    <CardContent className="pt-6">
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "w-14 h-14 rounded-lg flex items-center justify-center text-2xl",
                          achievement.unlocked
                            ? "bg-gradient-to-br from-yellow-500 to-orange-500"
                            : "bg-gray-700"
                        )}>
                          {achievement.icon || "🏆"}
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-white">{achievement.name}</h3>
                            <span className="text-sm text-yellow-400 flex items-center gap-1">
                              <Coins className="h-4 w-4" />
                              {achievement.reward}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 mt-1">{achievement.description}</p>
                          
                          <div className="mt-3">
                            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                              <span>进度: {achievement.currentProgress}/{achievement.requirement}</span>
                              <span>{getAchievementProgressPercent(achievement)}%</span>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                              <div 
                                className={cn(
                                  "h-full transition-all",
                                  achievement.unlocked
                                    ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                                    : "bg-gradient-to-r from-primary-500 to-accent-500"
                                )}
                                style={{ width: `${getAchievementProgressPercent(achievement)}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {achievement.unlocked && !achievement.claimed && (
                        <Button
                          onClick={() => handleClaimAchievement(achievement.id)}
                          className="w-full mt-4 bg-gradient-to-r from-yellow-500 to-orange-500"
                        >
                          <Gift className="h-4 w-4 mr-2" />
                          领取奖励
                        </Button>
                      )}
                      
                      {achievement.claimed && (
                        <div className="flex items-center justify-center gap-1 text-green-400 text-sm mt-4">
                          <CheckCircle className="h-4 w-4" />
                          已领取
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}
