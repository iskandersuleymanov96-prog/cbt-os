"use client"

import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("skeleton", className)}
      {...props}
    />
  )
}

function SkeletonCard({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-white/40 bg-white/60 p-5 space-y-3", className)}>
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-3 w-1/2" />
        </div>
      </div>
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
    </div>
  )
}

function SkeletonStat() {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 p-5 space-y-2">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-8 w-16" />
      <Skeleton className="h-3 w-24" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="rounded-2xl border border-white/40 bg-white/60 p-6 space-y-4">
      <div className="flex justify-between">
        <Skeleton className="h-5 w-32" />
        <Skeleton className="h-4 w-20" />
      </div>
      <div className="flex items-end gap-2 h-40">
        {[40, 65, 50, 80, 60, 75, 45].map((h, i) => (
          <Skeleton key={i} className="flex-1 rounded-full" style={{ height: `${h}%` }} />
        ))}
      </div>
    </div>
  )
}

export { Skeleton, SkeletonCard, SkeletonStat, SkeletonChart }
