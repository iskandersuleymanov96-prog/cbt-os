"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { TrendingUp, ChevronRight, Eye, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { GradientButton } from "@/components/ui/gradient-button"
import { PATTERN_TYPE_LABELS, PATTERN_TYPE_COLORS } from "@/lib/demo-data"

export default function PatternsPage() {
  const [activeTab, setActiveTab] = useState("thought")

  const hasAnyPatterns = false

  if (!hasAnyPatterns) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">Ваши паттерны</h1>
          <p className="text-muted-foreground">
            Повторяющиеся модели мышления и поведения
          </p>
        </div>
        <EmptyState
          icon="🧠"
          title="Паттерны пока не обнаружены"
          description="Добавьте больше записей в дневник, и AI автоматически выявит повторяющиеся модели вашего мышления."
          action={
            <Link href="/journal/new">
              <GradientButton size="md" className="gap-2">
                Добавить запись
              </GradientButton>
            </Link>
          }
          example={{
            label: "Какие паттерны ищет AI:",
            items: [
              "Повторяющиеся автоматические мысли",
              "Эмоциональные триггеры",
              "Типичные когнитивные искажения",
            ],
          }}
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-deep-charcoal">Ваши паттерны</h1>
        <p className="text-muted-foreground">
          Повторяющиеся модели мышления и поведения
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          {Object.keys(PATTERN_TYPE_LABELS).map((type) => (
            <TabsTrigger key={type} value={type} className="gap-1">
              {PATTERN_TYPE_LABELS[type]}
              <Badge variant="secondary" className="ml-1 text-[10px]">
                0
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.keys(PATTERN_TYPE_LABELS).map((type) => (
          <TabsContent key={type} value={type} className="space-y-3 mt-4">
            <EmptyState
              icon="🔍"
              title={`Нет паттернов типа «${PATTERN_TYPE_LABELS[type]}»`}
              description="Продолжайте вести дневник, и мы обнаружим повторяющиеся модели."
            />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
