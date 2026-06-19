"use client"

import Link from "next/link"
import { useState } from "react"
import { Plus, Search, ChevronRight, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { GradientButton } from "@/components/ui/gradient-button"

const mockEntries = [
  {
    id: "1",
    date: "2026-06-19T14:30:00",
    situation: "Совещание по проекту — начальник критиковал мою работу перед командой",
    emotion: "Тревога",
    emotionIcon: "😟",
    intensity: 7,
    mood: 3,
    stress: 7,
    anxiety: 8,
    tags: ["работа", "стресс"],
    distortions: ["Катастрофизация", "Чтение мыслей"],
  },
  {
    id: "2",
    date: "2026-06-18T21:15:00",
    situation: "Вечерняя прогулка в парке. Почувствовал себя расслабленным и спокойным",
    emotion: "Спокойствие",
    emotionIcon: "😌",
    intensity: 3,
    mood: 4,
    stress: 2,
    anxiety: 1,
    tags: ["природа", "отдых"],
    distortions: [],
  },
  {
    id: "3",
    date: "2026-06-17T10:00:00",
    situation: "Получил положительный отзыв от клиента по завершённому проекту",
    emotion: "Радость",
    emotionIcon: "😊",
    intensity: 8,
    mood: 5,
    stress: 1,
    anxiety: 1,
    tags: ["работа", "успех"],
    distortions: ["Обесценивание позитива"],
  },
  {
    id: "4",
    date: "2026-06-16T16:45:00",
    situation: "Спор с другом из-за мелочи. Почувствовал вину и раздражение",
    emotion: "Вина",
    emotionIcon: "😔",
    intensity: 6,
    mood: 2,
    stress: 5,
    anxiety: 4,
    tags: ["отношения"],
    distortions: ["Персонализация", "Долженствование"],
  },
  {
    id: "5",
    date: "2026-06-15T09:30:00",
    situation: "Утренняя медитация. Смог сосредоточиться на дыхании на 15 минут",
    emotion: "Удовлетворение",
    emotionIcon: "🙂",
    intensity: 5,
    mood: 4,
    stress: 2,
    anxiety: 2,
    tags: ["медитация", "здоровье"],
    distortions: [],
  },
]

export default function JournalPage() {
  const [searchQuery, setSearchQuery] = useState("")

  const filteredEntries = mockEntries.filter(
    (entry) =>
      entry.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.emotion.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">Дневник</h1>
          <p className="text-muted-foreground">
            {mockEntries.length} записей
          </p>
        </div>
        <Link href="/journal/new">
          <GradientButton size="md" className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="h-4 w-4" />
            Новая запись
          </GradientButton>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Поиск по записям..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
          aria-label="Поиск по записям"
        />
      </div>

      {/* Entries List */}
      {filteredEntries.length > 0 ? (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Link key={entry.id} href={`/journal/${entry.id}`}>
              <Card className="glass-card transition-all hover:-translate-y-0.5 hover:card-shadow-hover cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{entry.emotionIcon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {entry.emotion}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Интенсивность: {entry.intensity}/10
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2 line-clamp-2">
                        {entry.situation}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(entry.date).toLocaleDateString("ru-RU", {
                            day: "numeric",
                            month: "short",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span>😐 {entry.mood}/5</span>
                        <span>😰 {entry.stress}/10</span>
                      </div>
                      {entry.distortions.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {entry.distortions.map((d) => (
                            <Badge key={d} variant="secondary" className="text-[10px]">
                              {d}
                            </Badge>
                          ))}
                        </div>
                      )}
                      {entry.tags.length > 0 && (
                        <div className="flex gap-1 mt-2">
                          {entry.tags.map((tag) => (
                            <Badge key={tag} variant="outline" className="text-[10px]">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground mt-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : searchQuery ? (
        <EmptyState
          icon="🔍"
          title="Ничего не найдено"
          description="Попробуйте изменить поисковый запрос или очистить фильтры"
        />
      ) : (
        <EmptyState
          icon="📝"
          title="Пока нет записей"
          description="Начните вести дневник, чтобы понять свои мысли и эмоции. Каждая запись — шаг к осознанности."
          action={
            <Link href="/journal/new">
              <GradientButton size="md" className="gap-2">
                <Plus className="h-4 w-4" />
                Создать первую запись
              </GradientButton>
            </Link>
          }
          example={{
            label: "Пример записи:",
            items: [
              "Совещание — начальник критиковал мою работу",
              "Эмоция: Тревога (7/10)",
              "Мысль: «Я一定 справлюсь»",
            ],
          }}
        />
      )}
    </div>
  )
}
