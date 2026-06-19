"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  action?: React.ReactNode
  example?: {
    label: string
    items: string[]
  }
  className?: string
}

export function EmptyState({ icon, title, description, action, example, className }: EmptyStateProps) {
  return (
    <motion.div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-6 text-center",
        className
      )}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.div
        className="mb-6 text-6xl"
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", bounce: 0.5, delay: 0.1 }}
      >
        {icon}
      </motion.div>
      <h3 className="mb-2 text-lg font-semibold text-deep-charcoal">{title}</h3>
      <p className="mb-6 max-w-sm text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
      {action && <div className="mb-6">{action}</div>}
      {example && (
        <div className="w-full max-w-sm rounded-xl bg-secondary/50 p-4">
          <p className="mb-2 text-xs font-medium text-muted-foreground">{example.label}</p>
          <div className="space-y-2">
            {example.items.map((item, i) => (
              <motion.div
                key={i}
                className="flex items-center gap-2 rounded-lg bg-white/60 px-3 py-2 text-sm text-muted-foreground"
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.08 }}
              >
                <span className="text-xs">📝</span>
                {item}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )
}
