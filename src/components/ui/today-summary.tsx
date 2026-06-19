"use client"

import { motion } from "framer-motion"
import { BookOpen, Brain, Clock } from "lucide-react"
import { cn } from "@/lib/utils"

interface TodaySummaryProps {
  entriesCount: number
  avgMood: number
  distortionsCount: number
  lastActive?: string
  className?: string
}

export function TodaySummary({
  entriesCount,
  avgMood,
  distortionsCount,
  lastActive,
  className,
}: TodaySummaryProps) {
  const moodEmoji = avgMood >= 4 ? "😊" : avgMood >= 3 ? "😐" : "😟"

  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/40 bg-gradient-to-br from-primary/[0.06] to-violet-500/[0.03] p-5",
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-primary/[0.04] blur-2xl" />
      <div className="relative">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-deep-charcoal">Сегодня</h3>
          {lastActive && (
            <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
              <Clock className="h-3 w-3" />
              {lastActive}
            </span>
          )}
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
              <BookOpen className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-deep-charcoal leading-none">{entriesCount}</p>
              <p className="text-[10px] text-muted-foreground">записей</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10">
              <span className="text-sm">{moodEmoji}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-deep-charcoal leading-none">{avgMood}</p>
              <p className="text-[10px] text-muted-foreground">настроение</p>
            </div>
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-500/10">
              <Brain className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <p className="text-lg font-bold text-deep-charcoal leading-none">{distortionsCount}</p>
              <p className="text-[10px] text-muted-foreground">искажений</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
