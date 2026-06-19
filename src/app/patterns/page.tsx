"use client"

import { useState } from "react"
import Link from "next/link"
import { TrendingUp, ChevronRight, Eye, Clock } from "lucide-react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { EmptyState } from "@/components/ui/empty-state"
import { GradientButton } from "@/components/ui/gradient-button"

const patterns = {
  thought: [
    { id: "t1", name: "«Я не справлюсь»", frequency: 15, strength: 8, firstSeen: "2026-05-01", lastSeen: "2026-06-19" },
    { id: "t2", name: "«Меня будут критиковать»", frequency: 12, strength: 7, firstSeen: "2026-05-10", lastSeen: "2026-06-18" },
    { id: "t3", name: "«Я должен быть идеальным»", frequency: 8, strength: 6, firstSeen: "2026-05-15", lastSeen: "2026-06-17" },
  ],
  emotion: [
    { id: "e1", name: "Тревога перед встречами", frequency: 18, strength: 9, firstSeen: "2026-04-20", lastSeen: "2026-06-19" },
    { id: "e2", name: "Вина после конфликтов", frequency: 10, strength: 6, firstSeen: "2026-05-05", lastSeen: "2026-06-16" },
  ],
  trigger: [
    { id: "tr1", name: "Рабочие совещания", frequency: 20, strength: 10, firstSeen: "2026-04-15", lastSeen: "2026-06-19" },
    { id: "tr2", name: "Критика от руководства", frequency: 14, strength: 8, firstSeen: "2026-05-01", lastSeen: "2026-06-18" },
    { id: "tr3", name: "Конфликты с близкими", frequency: 7, strength: 5, firstSeen: "2026-05-20", lastSeen: "2026-06-16" },
  ],
  distortion: [
    { id: "d1", name: "Катастрофизация", frequency: 12, strength: 7, firstSeen: "2026-05-01", lastSeen: "2026-06-19" },
    { id: "d2", name: "Чтение мыслей", frequency: 9, strength: 6, firstSeen: "2026-05-10", lastSeen: "2026-06-18" },
    { id: "d3", name: "Долженствование", frequency: 8, strength: 5, firstSeen: "2026-05-15", lastSeen: "2026-06-17" },
  ],
  behavior: [
    { id: "b1", name: "Избегание совещаний", frequency: 11, strength: 7, firstSeen: "2026-05-01", lastSeen: "2026-06-19" },
    { id: "b2", name: "Перфекционизм в работе", frequency: 14, strength: 8, firstSeen: "2026-04-25", lastSeen: "2026-06-18" },
  ],
}

const typeLabels: Record<string, string> = {
  thought: "Мысли",
  emotion: "Эмоции",
  trigger: "Триггеры",
  distortion: "Искажения",
  behavior: "Поведение",
}

const typeColors: Record<string, string> = {
  thought: "bg-blue-100 text-blue-700",
  emotion: "bg-purple-100 text-purple-700",
  trigger: "bg-orange-100 text-orange-700",
  distortion: "bg-red-100 text-red-700",
  behavior: "bg-green-100 text-green-700",
}

export default function PatternsPage() {
  const [activeTab, setActiveTab] = useState("thought")

  const hasAnyPatterns = Object.values(patterns).some((arr) => arr.length > 0)

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
            label: "Какие паттерны мы ищем:",
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
          {Object.keys(patterns).map((type) => (
            <TabsTrigger key={type} value={type} className="gap-1">
              {typeLabels[type]}
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {patterns[type as keyof typeof patterns].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(patterns).map(([type, items]) => (
          <TabsContent key={type} value={type} className="space-y-3 mt-4">
            {items.length === 0 ? (
              <EmptyState
                icon="🔍"
                title={`Нет паттернов типа «${typeLabels[type]}»`}
                description="Продолжайте вести дневник, и мы обнаружим повторяющиеся модели."
              />
            ) : (
              items.map((pattern, i) => (
                <motion.div
                  key={pattern.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link href={`/patterns/${pattern.id}`}>
                    <Card className="glass-card transition-all hover:-translate-y-0.5 hover:card-shadow-hover cursor-pointer">
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-deep-charcoal">{pattern.name}</h3>
                              <Badge className={typeColors[type]}>
                                {typeLabels[type]}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                {pattern.frequency}×</span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                Сила: {pattern.strength}/10
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {new Date(pattern.lastSeen).toLocaleDateString("ru-RU")}
                              </span>
                            </div>
                          </div>
                          <ChevronRight className="h-4 w-4 text-muted-foreground mt-1" />
                        </div>
                        {/* Strength bar */}
                        <div className="mt-3">
                          <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pattern.strength * 10}%` }}
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))
            )}
          </TabsContent>
        ))}
      </Tabs>
    </div>
  )
}
