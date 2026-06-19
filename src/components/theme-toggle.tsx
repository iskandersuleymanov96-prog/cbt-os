"use client"

import { useTheme } from "@/components/theme-provider"
import { Sun, Moon, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  className?: string
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()

  const options = [
    { value: "light" as const, icon: Sun, label: "Светлая" },
    { value: "dark" as const, icon: Moon, label: "Тёмная" },
    { value: "system" as const, icon: Monitor, label: "Системная" },
  ]

  return (
    <div className={cn("flex gap-2", className)}>
      {options.map((option) => (
        <button
          key={option.value}
          onClick={() => setTheme(option.value)}
          className={cn(
            "flex items-center gap-2 rounded-xl px-4 py-3 border-2 transition-all duration-200",
            theme === option.value
              ? "border-primary bg-primary/10 text-primary shadow-premium"
              : "border-transparent bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground"
          )}
        >
          <option.icon className="h-5 w-5" />
          <span className="text-sm font-medium">{option.label}</span>
        </button>
      ))}
    </div>
  )
}
