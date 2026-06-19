"use client"

import * as React from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface PageHeaderProps {
  title: string
  description?: string
  action?: React.ReactNode
  className?: string
}

function PageHeader({
  title,
  description,
  action,
  className,
}: PageHeaderProps) {
  return (
    <motion.div
      className={cn("flex items-start justify-between", className)}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight text-deep-charcoal">
          {title}
        </h1>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action && <div>{action}</div>}
    </motion.div>
  )
}

export { PageHeader, type PageHeaderProps }
