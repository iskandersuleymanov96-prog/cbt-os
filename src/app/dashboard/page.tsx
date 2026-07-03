"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  BookOpen, Brain, Sparkles, ArrowRight, Plus,
  TrendingUp, Calendar, ChevronRight, Clock, Mic, Bell
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MoodPicker } from "@/components/ui/mood-picker"
import { StatCard } from "@/components/ui/stat-card"
import { PageHeader } from "@/components/ui/page-header"
import { Button } from "@/components/ui/button"
import { GradientButton } from "@/components/ui/gradient-button"
import { StreakCounter } from "@/components/ui/streak-counter"
import { ProgressRing } from "@/components/ui/progress-ring"
import { TodaySummary } from "@/components/ui/today-summary"
import { WeeklySummary } from "@/components/ui/weekly-summary"
import { SuccessToast } from "@/components/ui/success-toast"
import { InstallPrompt } from "@/components/ui/install-prompt"
import { NotificationBanner } from "@/components/ui/notification-banner"
import { isSupported, requestPermission } from "@/lib/notifications/service"
import { useFormattedDate } from "@/hooks/use-client-date"
import {
  EMOTION_ICONS,
  calculateStreak,
  getWeeklyData,
  getTodayStats,
  getWeekStats,
} from "@/lib/demo-data"
import { useJournalStore } from "@/stores/journal"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.06 },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] },
  },
}

export default function DashboardPage() {
  const [selectedMood, setSelectedMood] = useState<number | undefined>(undefined)
  const [showToast, setShowToast] = useState(false)
  const [notifEnabled, setNotifEnabled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const todayStr = useFormattedDate({ weekday: "long", day: "numeric", month: "long" })

  const entries = useJournalStore((s) => s.entries)

  useEffect(() => {
    setMounted(true)
  }, [])

  const streak = useMemo(() => calculateStreak(entries), [entries])
  const weeklyData = useMemo(() => getWeeklyData(entries), [entries])
  const todayStats = useMemo(() => getTodayStats(entries), [entries])
  const weekStats = useMemo(() => getWeekStats(entries), [entries])

  const recentEntries = useMemo(() => {
    if (!mounted) return []
    return [...entries]
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 3)
      .map((e) => {
        const diff = Date.now() - new Date(e.created_at).getTime()
        const hours = Math.floor(diff / 3600000)
        let dateLabel: string
        if (hours < 1) dateLabel = "Только что"
        else if (hours < 24) dateLabel = `Сегодня, ${new Date(e.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
        else if (hours < 48) dateLabel = `Вчера, ${new Date(e.created_at).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
        else dateLabel = `${Math.floor(hours / 24)} дн. назад`

        return {
          id: e.id,
          date: dateLabel,
          emotion: EMOTION_ICONS[e.emotion] || "😐",
          emotionLabel: e.emotion,
          situation: e.situation,
          mood: e.mood,
          stress: e.stress,
        }
      })
  }, [entries, mounted])

  const totalDistortions = useMemo(() => {
    return entries.reduce(
      (s, e) => s + (e as typeof e & { distortions: string[] }).distortions.length,
      0
    )
  }, [entries])

  useEffect(() => {
    if (isSupported()) {
      setNotifEnabled(Notification.permission === "granted")
    }
  }, [])

  const handleToggleNotif = async () => {
    if (notifEnabled) return
    const perm = await requestPermission()
    setNotifEnabled(perm === "granted")
  }

  const handleMoodChange = (mood: number | undefined) => {
    setSelectedMood(mood)
    if (mood) {
      setShowToast(true)
    }
  }

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <NotificationBanner />

      <InstallPrompt />

      <SuccessToast
        show={showToast}
        type="streak"
        title={`${streak} дней подряд!`}
        message="Отличная работа! Вы не прерываете свой streak"
        onClose={() => setShowToast(false)}
      />

      {/* Header with greeting */}
      <motion.div variants={itemVariants}>
        <PageHeader
          title={`Привет! 👋`}
          description={todayStr ? `Сегодня, ${todayStr}` : "Загрузка..."}
          action={
            <Link href="/journal/new">
              <GradientButton size="md" className="gap-2 shadow-lg shadow-primary/20">
                <Plus className="h-4 w-4" />
                Новая запись
              </GradientButton>
            </Link>
          }
        />
      </motion.div>

      {/* Quick Mood */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card overflow-hidden">
          <CardContent className="p-5">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Как ваше настроение сейчас?
            </p>
            <MoodPicker value={selectedMood} onChange={handleMoodChange} />
          </CardContent>
        </Card>
      </motion.div>

      {/* Today's Summary + Streak */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-2">
          <TodaySummary
            entriesCount={todayStats.entriesCount}
            avgMood={todayStats.avgMood}
            distortionsCount={todayStats.distortionsCount}
            lastActive={todayStats.lastActive}
          />
          <motion.div
            className="rounded-2xl border border-white/40 bg-gradient-to-br from-orange-500/[0.06] to-amber-500/[0.03] p-5 backdrop-blur-xl"
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-sm font-semibold text-deep-charcoal">Стрик</h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleToggleNotif}
                  className={`flex items-center gap-1 rounded-lg px-2 py-1 text-[10px] transition-colors ${
                    notifEnabled
                      ? "bg-green-50 text-green-600"
                      : "text-orange-500 hover:text-orange-600"
                  }`}
                >
                  <Bell className="h-3 w-3" />
                  {notifEnabled ? "Уведомления вкл." : "Включить"}
                </button>
                <button
                  onClick={() => setShowToast(true)}
                  className="text-[10px] text-orange-500 hover:text-orange-600 transition-colors"
                >
                  Тест уведомления
                </button>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <StreakCounter streak={streak} />
              <div className="flex-1">
                <ProgressRing
                  value={streak}
                  max={30}
                  size={72}
                  strokeWidth={5}
                  color="#f97316"
                  bgColor="rgba(249,115,22,0.1)"
                >
                  <span className="text-xs font-bold text-orange-600">{Math.round((streak / 30) * 100)}%</span>
                </ProgressRing>
              </div>
            </div>
            <p className="mt-3 text-[10px] text-muted-foreground">
              До следующей цели: {Math.max(0, 30 - streak)} дней
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div
        className="grid gap-4 md:grid-cols-3"
        variants={itemVariants}
      >
        <StatCard
          label="Записей за неделю"
          value={String(weekStats.entriesThisWeek)}
          change={`${weekStats.entriesThisWeek - weekStats.entriesLastWeek > 0 ? "+" : ""}${weekStats.entriesThisWeek - weekStats.entriesLastWeek} к прошлой неделе`}
          changeType={weekStats.entriesThisWeek >= weekStats.entriesLastWeek ? "positive" : "negative"}
          icon={<BookOpen className="h-5 w-5" />}
          gradient="from-blue-500/8 to-indigo-500/3"
        />
        <StatCard
          label="Среднее настроение"
          value={String(weekStats.avgMoodThisWeek)}
          change={`${weekStats.avgMoodThisWeek - weekStats.avgMoodLastWeek >= 0 ? "+" : ""}${(weekStats.avgMoodThisWeek - weekStats.avgMoodLastWeek).toFixed(1)} к прошлой неделе`}
          changeType={weekStats.avgMoodThisWeek >= weekStats.avgMoodLastWeek ? "positive" : "negative"}
          icon={<TrendingUp className="h-5 w-5" />}
          gradient="from-emerald-500/8 to-teal-500/3"
        />
        <StatCard
          label="Искажений оспорено"
          value={String(totalDistortions)}
          change="За всё время"
          icon={<Brain className="h-5 w-5" />}
          gradient="from-violet-500/8 to-purple-500/3"
        />
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Weekly Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="glass-card">
            <CardContent className="p-6">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-deep-charcoal">Неделя</p>
                  <p className="text-xs text-muted-foreground">Настроение и стресс</p>
                </div>
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    Настроение
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-red-300" />
                    Стресс
                  </span>
                </div>
              </div>
              {weeklyData.some((d) => d.mood > 0 || d.stress > 0) ? (
                <div className="flex items-end gap-2">
                  {weeklyData.map((day, i) => (
                    <motion.div
                      key={day.day}
                      className="flex flex-1 flex-col items-center gap-1.5"
                      initial={{ opacity: 0, scaleY: 0 }}
                      animate={{ opacity: 1, scaleY: 1 }}
                      transition={{ delay: 0.3 + i * 0.05, duration: 0.4 }}
                      style={{ transformOrigin: "bottom" }}
                    >
                      <div className="flex w-full flex-col gap-1">
                        <div
                          className="w-full rounded-full bg-gradient-to-t from-primary/40 to-primary/20"
                          style={{ height: `${day.mood * 5}px` }}
                        />
                        <div
                          className="w-full rounded-full bg-gradient-to-t from-red-300/60 to-red-200/40"
                          style={{ height: `${day.stress * 4}px` }}
                        />
                      </div>
                      <span className="text-[10px] font-medium text-muted-foreground">{day.day}</span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <TrendingUp className="h-10 w-10 text-muted-foreground/40 mb-3" />
                  <p className="text-sm font-medium text-deep-charcoal">Начните вести дневник, чтобы увидеть аналитику</p>
                  <p className="text-xs text-muted-foreground mt-1 mb-3">Записывайте настроение и стресс каждый день</p>
                  <Link href="/diary/new">
                    <Button size="sm" className="gap-1.5 gradient-primary text-white">
                      <Plus className="h-3.5 w-3.5" />
                      Первая запись
                    </Button>
                  </Link>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* AI Insights */}
        <motion.div variants={itemVariants}>
          <Card className="glass-card h-full">
            <CardContent className="flex h-full flex-col p-5">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary/10 to-violet-500/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm font-semibold">AI-инсайт</p>
                </div>
              </div>
              <p className="mb-3 flex-1 text-sm leading-relaxed text-muted-foreground">
                Инсайты появятся после нескольких записей в дневнике
              </p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                  <span className="text-xs">💡</span>
                  <p className="text-[11px] text-muted-foreground">
                    {weekStats.topDistortion ? `Паттерн: ${weekStats.topDistortion.toLowerCase()}` : "Паттерны появятся позже"}
                  </p>
                </div>
                <div className="flex items-center gap-2 rounded-lg bg-secondary/50 px-3 py-2">
                  <span className="text-xs">📈</span>
                  <p className="text-[11px] text-muted-foreground">
                    {weekStats.avgMoodThisWeek > weekStats.avgMoodLastWeek
                      ? `Настроение растёт +${Math.round(((weekStats.avgMoodThisWeek - weekStats.avgMoodLastWeek) / Math.max(weekStats.avgMoodLastWeek, 0.1)) * 100)}%`
                      : "Продолжайте вести дневник для анализа"}
                  </p>
                </div>
              </div>
              <Link
                href="/ai/insights"
                className="mt-3 group flex items-center gap-1 text-sm font-medium text-primary transition-smooth hover:gap-2"
              >
                Все инсайты
                <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Weekly Summary + Last Active */}
      <motion.div variants={itemVariants}>
        <div className="grid gap-4 md:grid-cols-2">
          <WeeklySummary
            entriesThisWeek={weekStats.entriesThisWeek}
            entriesLastWeek={weekStats.entriesLastWeek}
            avgMoodThisWeek={weekStats.avgMoodThisWeek}
            avgMoodLastWeek={weekStats.avgMoodLastWeek}
            topDistortion={weekStats.topDistortion}
          />
          <motion.div
            className="rounded-2xl border border-white/40 bg-white/60 p-5 backdrop-blur-xl"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h3 className="mb-3 text-sm font-semibold text-deep-charcoal">Последняя активность</h3>
            <div className="space-y-3">
              {recentEntries.length > 0 ? recentEntries.slice(0, 3).map((entry, i) => (
                <div key={entry.id} className="flex items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10">
                    <BookOpen className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-deep-charcoal">{entry.emotionLabel}</p>
                    <p className="text-[10px] text-muted-foreground">{entry.date}</p>
                  </div>
                  <Clock className="h-3 w-3 text-muted-foreground" />
                </div>
              )) : (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Здесь появятся ваши последние записи
                </p>
              )}
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Recent Entries */}
      <motion.div variants={itemVariants}>
        <Card className="glass-card">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg">Последние записи</CardTitle>
            <Link
              href="/journal"
              className="group flex items-center gap-1 text-sm font-medium text-primary transition-smooth"
            >
              Все записи
              <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentEntries.length > 0 ? recentEntries.map((entry, i) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 + i * 0.08, duration: 0.3 }}
                >
                  <Link
                    href={`/journal/${entry.id}`}
                    className="flex items-start gap-4 rounded-xl p-3 transition-smooth hover:bg-secondary/50"
                  >
                    <span className="text-2xl">{entry.emotion}</span>
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">{entry.date}</span>
                        <Badge variant="outline" className="text-[10px]">{entry.emotionLabel}</Badge>
                      </div>
                      <p className="truncate text-sm text-foreground">{entry.situation}</p>
                      <div className="mt-1 flex gap-3">
                        <span className="text-[10px] text-muted-foreground">Настроение: {entry.mood}/5</span>
                        <span className="text-[10px] text-muted-foreground">Стресс: {entry.stress}/10</span>
                      </div>
                    </div>
                    <ChevronRight className="mt-1 h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </motion.div>
              )) : (
                <div className="text-center py-8">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground mb-2">Пока нет записей</p>
                  <Link href="/journal/new">
                    <GradientButton size="sm" className="gap-2">
                      <Plus className="h-3.5 w-3.5" />
                      Создать первую запись
                    </GradientButton>
                  </Link>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Quick Actions */}
      <motion.div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4" variants={itemVariants}>
        <Link href="/journal/voice">
          <Card className="glass-card group cursor-pointer transition-premium hover:-translate-y-1 hover:shadow-elevated">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-red-100 to-red-50 transition-transform group-hover:scale-110">
                <Mic className="h-6 w-6 text-red-500" />
              </div>
              <div>
                <p className="font-medium">Голосовая запись</p>
                <p className="text-sm text-muted-foreground">Расскажите о ситуации</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/patterns">
          <Card className="glass-card group cursor-pointer transition-premium hover:-translate-y-1 hover:shadow-elevated">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 transition-transform group-hover:scale-110">
                <Brain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-medium">Мои паттерны</p>
                <p className="text-sm text-muted-foreground">Откройте повторяющиеся модели</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/exercises">
          <Card className="glass-card group cursor-pointer transition-premium hover:-translate-y-1 hover:shadow-elevated">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-100 to-emerald-50 transition-transform group-hover:scale-110">
                <BookOpen className="h-6 w-6 text-emerald-600" />
              </div>
              <div>
                <p className="font-medium">Упражнение дня</p>
                <p className="text-sm text-muted-foreground">Дыхательная практика — 5 мин</p>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Link href="/analytics">
          <Card className="glass-card group cursor-pointer transition-premium hover:-translate-y-1 hover:shadow-elevated">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-violet-100 to-violet-50 transition-transform group-hover:scale-110">
                <Calendar className="h-6 w-6 text-violet-600" />
              </div>
              <div>
                <p className="font-medium">Аналитика</p>
                <p className="text-sm text-muted-foreground">Ваш прогресс за месяц</p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </motion.div>
    </motion.div>
  )
}
