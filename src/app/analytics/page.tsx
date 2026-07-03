"use client"

import { useState, useMemo, Suspense } from "react"
import dynamic from "next/dynamic"
import Link from "next/link"
import {
  TrendingUp, Flame, BookOpen,
  Brain, Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EmptyState } from "@/components/ui/empty-state"
import { GradientButton } from "@/components/ui/gradient-button"
import {
  getWeeklyData,
  getYearInPixels,
  getEmotionDistribution,
  getDistortionFrequency,
  getGrowthPercentage,
  calculateStreak,
} from "@/lib/demo-data"
import { useJournalStore } from "@/stores/journal"

const ChartsSection = dynamic(
  () => import("./charts-section"),
  {
    ssr: false,
    loading: () => (
      <Card className="glass-card">
        <CardContent className="flex items-center justify-center py-20">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </CardContent>
      </Card>
    ),
  }
)

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("week")

  const entries = useJournalStore((s) => s.entries)
  const weeklyData = useMemo(() => getWeeklyData(entries), [entries])
  const emotionDistribution = useMemo(() => getEmotionDistribution(entries), [entries])
  const distortionFrequency = useMemo(() => getDistortionFrequency(entries), [entries])
  const yearInPixels = useMemo(() => getYearInPixels(entries), [entries])
  const streak = useMemo(() => calculateStreak(entries), [entries])
  const growthPct = useMemo(() => getGrowthPercentage(entries), [entries])
  const totalDistortions = useMemo(() => {
    return entries.reduce(
      (s, e) => s + (e as typeof e & { distortions: string[] }).distortions.length,
      0
    )
  }, [entries])

  if (entries.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">Аналитика</h1>
          <p className="text-muted-foreground">Ваш прогресс и динамика</p>
        </div>
        <EmptyState
          icon="📊"
          title="Пока нет данных для анализа"
          description="Создайте несколько записей в дневнике, чтобы увидеть статистику, графики и тенденции."
          action={
            <Link href="/journal/new">
              <GradientButton size="md" className="gap-2">
                Создать первую запись
              </GradientButton>
            </Link>
          }
        />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">Аналитика</h1>
          <p className="text-muted-foreground">Ваш прогресс и динамика</p>
        </div>
        <div className="flex gap-2">
          {["week", "month", "3months", "year"].map((range) => (
            <Button
              key={range}
              variant={timeRange === range ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeRange(range)}
            >
              {range === "week" && "Неделя"}
              {range === "month" && "Месяц"}
              {range === "3months" && "3 месяца"}
              {range === "year" && "Год"}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Записей</p>
                <p className="text-2xl font-bold text-deep-charcoal">{entries.length}</p>
              </div>
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Средний рост</p>
                <p className="text-2xl font-bold text-green-600">+{growthPct}%</p>
              </div>
              <TrendingUp className="h-5 w-5 text-green-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Стрик</p>
                <p className="text-2xl font-bold text-orange-500">{streak} дней</p>
              </div>
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Искажений оспорено</p>
                <p className="text-2xl font-bold text-purple-600">{totalDistortions}</p>
              </div>
              <Brain className="h-5 w-5 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Suspense fallback={
        <Card className="glass-card">
          <CardContent className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </CardContent>
        </Card>
      }>
        <ChartsSection
          moodData={weeklyData}
          emotionDistribution={emotionDistribution}
          distortionFrequency={distortionFrequency}
        />
      </Suspense>

      {/* Year in Pixels */}
      <Card className="glass-card">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">Год в пикселях</CardTitle>
          <Button variant="outline" size="sm" className="gap-1">
            <Download className="h-3.5 w-3.5" />
            Экспорт
          </Button>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-[3px]">
            {yearInPixels.map((pixel) => (
              <div
                key={pixel.day}
                className="w-[14px] h-[14px] rounded-sm transition-transform hover:scale-150"
                style={{ backgroundColor: pixel.color }}
                title={`День ${pixel.day}`}
              />
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4">
            {["Плохо", "Нормально", "Хорошо", "Отлично", "Превосходно"].map((label, i) => (
              <div key={label} className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: ["#ef4444", "#f97316", "#eab308", "#4a6fa5", "#22c55e"][i] }} />
                <span className="text-[10px] text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
