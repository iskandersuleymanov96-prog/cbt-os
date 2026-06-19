"use client"

import { cn } from "@/lib/utils"

interface EmotionGridProps {
  value?: string[]
  onChange?: (value: string[]) => void
  max?: number
}

type EmotionCategory = "positive" | "negative" | "neutral"

interface Emotion {
  name: string
  icon: string
  category: EmotionCategory
}

const emotions: Emotion[] = [
  { name: "Радость", icon: "😊", category: "positive" },
  { name: "Спокойствие", icon: "😌", category: "positive" },
  { name: "Удовлетворение", icon: "🙂", category: "positive" },
  { name: "Гордость", icon: "🥳", category: "positive" },
  { name: "Благодарность", icon: "🙏", category: "positive" },
  { name: "Надежда", icon: "🌟", category: "positive" },
  { name: "Тревога", icon: "😟", category: "negative" },
  { name: "Страх", icon: "😨", category: "negative" },
  { name: "Грусть", icon: "😢", category: "negative" },
  { name: "Злость", icon: "😠", category: "negative" },
  { name: "Вина", icon: "😔", category: "negative" },
  { name: "Стыд", icon: "😳", category: "negative" },
  { name: "Разочарование", icon: "😞", category: "negative" },
  { name: "Одиночество", icon: "🥺", category: "negative" },
  { name: "Раздражение", icon: "😤", category: "negative" },
  { name: "Нейтрально", icon: "😐", category: "neutral" },
  { name: "Усталость", icon: "😩", category: "neutral" },
  { name: "Скука", icon: "🥱", category: "neutral" },
  { name: "Растерянность", icon: "😵", category: "neutral" },
  { name: "Волнение", icon: "🫨", category: "neutral" },
]

const categoryColors: Record<EmotionCategory, string> = {
  positive: "ring-green-300 bg-green-50",
  negative: "ring-red-300 bg-red-50",
  neutral: "ring-yellow-300 bg-yellow-50",
}

export function EmotionGrid({ value = [], onChange, max = 3 }: EmotionGridProps) {
  const toggle = (name: string) => {
    if (value.includes(name)) {
      onChange?.(value.filter((e) => e !== name))
    } else if (value.length < max) {
      onChange?.([...value, name])
    }
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        {emotions.map((emotion) => {
          const isSelected = value.includes(emotion.name)
          return (
            <button
              key={emotion.name}
              onClick={() => toggle(emotion.name)}
              disabled={!isSelected && value.length >= max}
              className={cn(
                "flex flex-col items-center gap-1 rounded-xl p-2.5 transition-all duration-200",
                "hover:scale-105 active:scale-95",
                "disabled:opacity-40 disabled:cursor-not-allowed",
                isSelected
                  ? cn("ring-2 shadow-premium", categoryColors[emotion.category])
                  : "bg-secondary/50 hover:bg-secondary"
              )}
            >
              <span className={cn("text-xl transition-transform duration-200", isSelected && "scale-110")}>
                {emotion.icon}
              </span>
              <span className={cn("text-[10px] font-medium", isSelected ? "text-foreground" : "text-muted-foreground")}>
                {emotion.name}
              </span>
            </button>
          )
        })}
      </div>
      {value.length > 0 && (
        <p className="text-xs text-muted-foreground text-center">
          Выбрано {value.length} из {max}
        </p>
      )}
    </div>
  )
}
