"use client"

import { useState } from "react"
import { useRouter, useParams } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, TrendingUp, Clock, Eye, ChevronRight,
  CheckCircle2, Sparkles, BookOpen, Calendar, AlertCircle
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const mockPatterns: Record<string, {
  id: string
  type: string
  name: string
  frequency: number
  strength: number
  first_seen: string
  last_seen: string
  is_worked_on: boolean
  progress_notes: string
  related_entries: { id: string; date: string; situation: string; emotion: string }[]
  ai_analysis: string
  suggested_exercises: { name: string; description: string; duration: string; difficulty: string }[]
  frequency_data: { month: string; count: number }[]
}> = {
  t1: {
    id: "t1",
    type: "thought",
    name: "«Я не справлюсь»",
    frequency: 15,
    strength: 8,
    first_seen: "2026-05-01",
    last_seen: "2026-06-19",
    is_worked_on: false,
    progress_notes: "",
    related_entries: [
      { id: "1", date: "2026-06-19", situation: "Совещание по проекту — критика руководства", emotion: "Тревога" },
      { id: "2", date: "2026-06-15", situation: "Новая задача без инструкций", emotion: "Страх" },
      { id: "3", date: "2026-06-10", situation: "Презентация перед клиентом", emotion: "Тревога" },
      { id: "4", date: "2026-06-05", situation: "Дедлайн завтра, не всё готово", emotion: "Паника" },
      { id: "5", date: "2026-06-01", situation: "Ревью кода — много замечаний", emotion: "Вина" },
    ],
    ai_analysis: "Эта мысль чаще всего появляется в ситуациях, связанных с оценкой вашей работы другими людьми (руководство, клиенты, коллеги). Вероятно, за ней стоит глубинное убеждение «Я должен быть идеальным, чтобы быть принятым». Часто сочетается с катастрофизацией и чтением мыслей.\n\nВажно: за 30 дней вы успешно справились с 8 из 15 ситуаций, где появлялась эта мысль. Это показывает, что信念 не всегда соответствует реальности.",
    suggested_exercises: [
      { name: "Дневник достижений", description: "Каждый вечер записывайте 3 вещи, которые удались сегодня. Фокус на конкретных результатах.", duration: "5 мин/день", difficulty: "Легко" },
      { name: "Эксперимент с предсказаниями", description: "Запишите «Я не справлюсь» и его альтернативу. Через неделю проверьте, что сбылось.", duration: "10 мин", difficulty: "Средне" },
      { name: "Градуированное столкновение", description: "Начните с маленьких задач, где риск «не справиться» минимален, постепенно увеличивая сложность.", duration: "Постоянно", difficulty: "Сложно" },
    ],
    frequency_data: [
      { month: "Май", count: 8 },
      { month: "Июнь", count: 7 },
    ],
  },
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

export default function PatternDetailPage() {
  const router = useRouter()
  const params = useParams()
  const patternId = params.id as string

  const [isWorkedOn, setIsWorkedOn] = useState(mockPatterns[patternId]?.is_worked_on ?? false)
  const [progressNotes, setProgressNotes] = useState(mockPatterns[patternId]?.progress_notes ?? "")
  const [activeTab, setActiveTab] = useState("overview")

  const pattern = mockPatterns[patternId] ?? mockPatterns.t1

  const maxFreq = Math.max(...pattern.frequency_data.map((d) => d.count))

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <Button
          variant={isWorkedOn ? "default" : "outline"}
          onClick={() => setIsWorkedOn(!isWorkedOn)}
          className="gap-1"
        >
          <CheckCircle2 className="h-4 w-4" />
          {isWorkedOn ? "Работаю над этим" : "Начать работать"}
        </Button>
      </div>

      {/* Pattern Title */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold text-deep-charcoal">{pattern.name}</h1>
          <Badge className={typeColors[pattern.type]}>
            {typeLabels[pattern.type]}
          </Badge>
          {isWorkedOn && (
            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
              В работе
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            {pattern.frequency} раз
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-3.5 w-3.5" />
            Сила: {pattern.strength}/10
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            Впервые: {new Date(pattern.first_seen).toLocaleDateString("ru-RU")}
          </span>
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Последний: {new Date(pattern.last_seen).toLocaleDateString("ru-RU")}
          </span>
        </div>
      </div>

      {/* Strength Indicator */}
      <Card className="glass-card">
        <CardContent className="p-5">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Сила паттерна</span>
            <span className="text-sm font-bold text-deep-charcoal">{pattern.strength}/10</span>
          </div>
          <div className="h-3 bg-secondary rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                pattern.strength >= 7 ? "bg-red-400" : pattern.strength >= 4 ? "bg-yellow-400" : "bg-green-400"
              }`}
              style={{ width: `${pattern.strength * 10}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {pattern.strength >= 7 ? "Высокая частота — стоит уделить особое внимание" : pattern.strength >= 4 ? "Умеренная частота — отслеживайте изменения" : "Низкая частота — паттерн ослабевает"}
          </p>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="overview" className="gap-1">
            <TrendingUp className="h-3.5 w-3.5" />
            Обзор
          </TabsTrigger>
          <TabsTrigger value="entries" className="gap-1">
            <BookOpen className="h-3.5 w-3.5" />
            Записи
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" />
            AI-анализ
          </TabsTrigger>
          <TabsTrigger value="exercises" className="gap-1">
            <AlertCircle className="h-3.5 w-3.5" />
            Упражнения
          </TabsTrigger>
          <TabsTrigger value="progress" className="gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            Прогресс
          </TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Частота по месяцам</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-4 h-40">
                {pattern.frequency_data.map((d) => (
                  <div key={d.month} className="flex-1 flex flex-col items-center gap-2">
                    <span className="text-xs font-medium text-deep-charcoal">{d.count}</span>
                    <div
                      className="w-full bg-primary rounded-t-lg transition-all"
                      style={{ height: `${(d.count / maxFreq) * 100}%`, minHeight: "8px" }}
                    />
                    <span className="text-xs text-muted-foreground">{d.month}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Характерные триггеры</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { trigger: "Оценка работы руководством", percentage: 40 },
                  { trigger: "Новые сложные задачи", percentage: 30 },
                  { trigger: "Публичные выступления", percentage: 20 },
                  { trigger: "Дедлайны", percentage: 10 },
                ].map((t) => (
                  <div key={t.trigger}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm">{t.trigger}</span>
                      <span className="text-xs text-muted-foreground">{t.percentage}%</span>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary rounded-full"
                        style={{ width: `${t.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entries Tab */}
        <TabsContent value="entries" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground">
            {pattern.related_entries.length} записей связано с этим паттерном
          </p>
          {pattern.related_entries.map((entry) => (
            <Link key={entry.id} href={`/journal/${entry.id}`}>
              <Card className="glass-card transition-all hover:-translate-y-0.5 hover:card-shadow-hover cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-[10px]">{entry.emotion}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(entry.date).toLocaleDateString("ru-RU", { day: "numeric", month: "short" })}
                        </span>
                      </div>
                      <p className="text-sm text-foreground">{entry.situation}</p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </TabsContent>

        {/* AI Analysis Tab */}
        <TabsContent value="ai" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                AI-анализ паттерна
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {pattern.ai_analysis}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-3 mt-4">
          <p className="text-sm text-muted-foreground">
            Рекомендованные упражнения для работы с этим паттерном
          </p>
          {pattern.suggested_exercises.map((ex, i) => (
            <Card key={i} className="glass-card">
              <CardContent className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-deep-charcoal">{ex.name}</h3>
                  <Badge variant={ex.difficulty === "Легко" ? "secondary" : ex.difficulty === "Средне" ? "outline" : "default"}>
                    {ex.difficulty}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground mb-3">{ex.description}</p>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {ex.duration}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Progress Tab */}
        <TabsContent value="progress" className="mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Отслеживание прогресса</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-primary/5">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="font-medium text-sm">
                    {isWorkedOn ? "Вы работаете над этим паттерном" : "Начните отслеживать прогресс"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {isWorkedOn ? "Отмечайте ситуации, где вам удалось применить новые стратегии" : "Нажмите кнопку «Начать работать» above"}
                  </p>
                </div>
              </div>
              <div>
                <Label htmlFor="progress-notes">Заметки о прогрессе</Label>
                <Textarea
                  id="progress-notes"
                  placeholder="Запишите, что получается, что сложно, какие стратегии помогают..."
                  value={progressNotes}
                  onChange={(e) => setProgressNotes(e.target.value)}
                  className="mt-1 min-h-[120px]"
                />
              </div>
              <Button>Сохранить заметки</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
