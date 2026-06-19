"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface ProgressRingProps {
  value: number
  max?: number
  size?: number
  strokeWidth?: number
  className?: string
  color?: string
  bgColor?: string
  children?: React.ReactNode
}

export function ProgressRing({
  value,
  max = 100,
  size = 80,
  strokeWidth = 6,
  className,
  color = "var(--color-primary)",
  bgColor = "rgba(0,0,0,0.06)",
  children,
}: ProgressRingProps) {
  const [offset, setOffset] = useState(0)
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const percent = Math.min(value / max, 1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setOffset(circumference * (1 - percent))
    }, 100)
    return () => clearTimeout(timer)
  }, [circumference, percent])

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-[1200ms] ease-[cubic-bezier(0.16,1,0.3,1)]"
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  )
}
