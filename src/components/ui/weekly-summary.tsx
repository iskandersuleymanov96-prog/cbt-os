"use client"

import { motion } from "framer-motion"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"
import { cn } from "@/lib/utils"

interface WeeklySummaryProps {
  entriesThisWeek: number
  entriesLastWeek: number
  avgMoodThisWeek: number
  avgMoodLastWeek: number
  topDistortion?: string
  className?: string
}

export function WeeklySummary({
  entriesThisWeek,
  entriesLastWeek,
  avgMoodThisWeek,
  avgMoodLastWeek,
  topDistortion,
  className,
}: WeeklySummaryProps) {
  const moodDiff = avgMoodThisWeek - avgMoodLastWeek
  const entriesDiff = entriesThisWeek - entriesLastWeek

  const TrendIcon = moodDiff > 0 ? TrendingUp : moodDiff < 0 ? TrendingDown : Minus
  const trendColor = moodDiff > 0 ? "text-emerald-500" : moodDiff < 0 ? "text-red-400" : "text-muted-foreground"

  return (
    <motion.div
      className={cn(
        "rounded-2xl border border-white/40 bg-white/60 p-5 backdrop-blur-xl",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
    >
      <h3 className="mb-4 text-sm font-semibold text-deep-charcoal">Неделя</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Записей</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-deep-charcoal">{entriesThisWeek}</span>
            <span className={cn(
              "text-[10px] font-medium",
              entriesDiff > 0 ? "text-emerald-500" : entriesDiff < 0 ? "text-red-400" : "text-muted-foreground"
            )}>
              {entriesDiff > 0 ? `+${entriesDiff}` : entriesDiff}
            </span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Настроение</span>
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-deep-charcoal">{avgMoodThisWeek}</span>
            <TrendIcon className={cn("h-3 w-3", trendColor)} />
          </div>
        </div>
        {topDistortion && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Топ искажение</span>
            <span className="text-xs font-medium text-deep-charcoal">{topDistortion}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}
