import { cn } from "@/lib/utils"

interface SkeletonProps {
  className?: string
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div className={cn("animate-pulse bg-gray-200 rounded-md", className)} />
  )
}

export function RankingCardSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-4">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <Skeleton className="h-6 w-3/4 mb-2" />
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      
      <div className="space-y-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center space-x-3">
            <Skeleton className="w-6 h-6 rounded-full" />
            <Skeleton className="h-4 flex-1" />
          </div>
        ))}
      </div>
      
      <div className="flex items-center space-x-2 pt-2 border-t border-gray-100">
        <Skeleton className="w-6 h-6 rounded-full" />
        <Skeleton className="h-4 w-24" />
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
          <Skeleton className="h-4 w-12" />
        </div>
        <Skeleton className="h-3 w-20" />
      </div>
    </div>
  )
}

export function RankingDetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-primary-600 to-accent-500 rounded-xl p-6">
        <Skeleton className="h-8 w-3/4 bg-white/30 mb-3" />
        <Skeleton className="h-4 w-1/2 bg-white/30" />
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="flex gap-4 p-4 border-b border-gray-100 last:border-0">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-1/3" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 rounded-xl p-6 text-white">
        <div className="flex items-center gap-4">
          <Skeleton className="w-20 h-20 rounded-full bg-white/20" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-32 bg-white/30" />
            <Skeleton className="h-4 w-24 bg-white/20" />
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white rounded-xl border p-4 text-center">
            <Skeleton className="h-8 w-16 mx-auto mb-2" />
            <Skeleton className="h-4 w-12 mx-auto" />
          </div>
        ))}
      </div>
    </div>
  )
}

export function TaskSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="bg-gray-800/50 rounded-xl border border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Skeleton className="w-10 h-10 rounded-full bg-gray-700" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-24 bg-gray-700" />
                <Skeleton className="h-3 w-32 bg-gray-700" />
              </div>
            </div>
            <Skeleton className="h-8 w-16 bg-gray-700" />
          </div>
        </div>
      ))}
    </div>
  )
}
