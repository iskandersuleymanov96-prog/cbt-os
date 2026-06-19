"use client"

import { motion } from "framer-motion"
import { Flame } from "lucide-react"
import { cn } from "@/lib/utils"

interface StreakCounterProps {
  streak: number
  className?: string
  compact?: boolean
}

export function StreakCounter({ streak, className, compact }: StreakCounterProps) {
  return (
    <motion.div
      className={cn(
        "relative inline-flex items-center gap-2",
        compact ? "gap-1.5" : "gap-2.5",
        className
      )}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", bounce: 0.4, duration: 0.6 }}
    >
      <div className="relative">
        <motion.div
          className="animate-fire"
          whileHover={{ scale: 1.2 }}
        >
          <Flame
            className={cn(
              "text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.4)]",
              compact ? "h-5 w-5" : "h-7 w-7"
            )}
          />
        </motion.div>
        <div className="absolute inset-0 animate-pulse-soft">
          <Flame
            className={cn(
              "text-orange-300 opacity-30 blur-[2px]",
              compact ? "h-5 w-5" : "h-7 w-7"
            )}
          />
        </div>
      </div>
      <div className="flex flex-col">
        <motion.span
          className={cn(
            "font-bold text-orange-600 leading-none",
            compact ? "text-lg" : "text-2xl"
          )}
          key={streak}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", bounce: 0.5 }}
        >
          {streak}
        </motion.span>
        {!compact && (
          <span className="text-[10px] font-medium text-orange-500/70 uppercase tracking-wider">
            дней подряд
          </span>
        )}
      </div>
    </motion.div>
  )
}
