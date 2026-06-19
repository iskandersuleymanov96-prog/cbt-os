"use client"

import { cn } from "@/lib/utils"

type MoodSize = "sm" | "md" | "lg"

interface MoodOption {
  value: number
  emoji: string
  label: string
  color: string
}

interface MoodPickerProps {
  value?: number | null | undefined
  onChange?: (value: number) => void
  moods?: MoodOption[]
  size?: MoodSize
  className?: string
}

const moods = [
  { value: 1, emoji: "😢", label: "Плохо", color: "bg-red-100 border-red-200 text-red-700" },
  { value: 2, emoji: "😟", label: "Тревожно", color: "bg-orange-100 border-orange-200 text-orange-700" },
  { value: 3, emoji: "😐", label: "Нормально", color: "bg-yellow-100 border-yellow-200 text-yellow-700" },
  { value: 4, emoji: "😌", label: "Хорошо", color: "bg-blue-100 border-blue-200 text-blue-700" },
  { value: 5, emoji: "😊", label: "Отлично", color: "bg-green-100 border-green-200 text-green-700" },
]

export function MoodPicker({ value, onChange, size = "md", className }: MoodPickerProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {moods.map((mood) => (
        <button
          key={mood.value}
          onClick={() => onChange?.(mood.value)}
          className={cn(
            "flex flex-col items-center gap-1 rounded-xl border-2 transition-all duration-200",
            "hover:scale-105 active:scale-95",
            size === "sm" && "p-2 min-w-[52px]",
            size === "md" && "p-3 min-w-[64px]",
            size === "lg" && "p-4 min-w-[80px]",
            value === mood.value
              ? cn(mood.color, "border-current shadow-premium")
              : "bg-secondary/50 border-transparent hover:bg-secondary"
          )}
        >
          <span className={cn(
            "transition-transform duration-200",
            size === "sm" && "text-xl",
            size === "md" && "text-2xl",
            size === "lg" && "text-3xl",
            value === mood.value && "scale-110"
          )}>
            {mood.emoji}
          </span>
          <span className={cn(
            "font-medium",
            size === "sm" && "text-[10px]",
            size === "md" && "text-xs",
            size === "lg" && "text-sm",
            value === mood.value ? "text-current" : "text-muted-foreground"
          )}>
            {mood.label}
          </span>
        </button>
      ))}
    </div>
  )
}
