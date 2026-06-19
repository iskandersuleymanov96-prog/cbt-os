"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatCardProps {
  label: string
  value: string | number
  change?: string
  changeType?: "positive" | "negative" | "neutral"
  icon: React.ReactNode
  gradient?: string
  className?: string
}

function StatCard({
  label,
  value,
  change,
  changeType = "neutral",
  icon,
  gradient = "from-primary/8 to-primary/3",
  className,
}: StatCardProps) {
  return (
    <motion.div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-white/40 p-5",
        "bg-gradient-to-br backdrop-blur-xl",
        "shadow-soft transition-premium",
        "hover:shadow-medium hover:-translate-y-0.5",
        gradient,
        className
      )}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight text-deep-charcoal">{value}</p>
          {change && (
            <p className={cn(
              "text-xs font-medium",
              changeType === "positive" && "text-emerald-600",
              changeType === "negative" && "text-red-500",
              changeType === "neutral" && "text-muted-foreground"
            )}>
              {change}
            </p>
          )}
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/60 text-primary shadow-subtle">
          {icon}
        </div>
      </div>
      <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-white/20 blur-2xl" />
    </motion.div>
  )
}

export { StatCard, type StatCardProps }
