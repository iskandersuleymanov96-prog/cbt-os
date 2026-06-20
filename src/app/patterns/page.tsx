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
import { DEMO_PATTERNS, PATTERN_TYPE_LABELS, PATTERN_TYPE_COLORS } from "@/lib/demo-data"

export default function PatternsPage() {
  const [activeTab, setActiveTab] = useState("thought")

  const hasAnyPatterns = useMemo(() => {
    return Object.values(DEMO_PATTERNS).some((arr) => arr.length > 0)
  }, [])

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
          {Object.keys(DEMO_PATTERNS).map((type) => (
            <TabsTrigger key={type} value={type} className="gap-1">
              {PATTERN_TYPE_LABELS[type]}
              <Badge variant="secondary" className="ml-1 text-[10px]">
                {DEMO_PATTERNS[type].length}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(DEMO_PATTERNS).map(([type, items]) => (
          <TabsContent key={type} value={type} className="space-y-3 mt-4">
            {items.length === 0 ? (
              <EmptyState
                icon="🔍"
                title={`Нет паттернов типа «${PATTERN_TYPE_LABELS[type]}»`}
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
                              <Badge className={PATTERN_TYPE_COLORS[type]}>
                                {PATTERN_TYPE_LABELS[type]}
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
