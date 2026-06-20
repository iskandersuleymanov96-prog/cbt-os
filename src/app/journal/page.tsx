"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { Plus, Search, ChevronRight, Calendar } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { GradientButton } from "@/components/ui/gradient-button"
import { SkeletonCard } from "@/components/ui/skeleton"
import { DEMO_ENTRIES, EMOTION_ICONS } from "@/lib/demo-data"

export default function JournalPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading] = useState(false)

  const filteredEntries = useMemo(() => {
    return DEMO_ENTRIES.filter(
      (entry) =>
        entry.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.emotion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">Дневник</h1>
          <p className="text-muted-foreground">
            {DEMO_ENTRIES.length} записей
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

      {/* Loading State */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredEntries.length > 0 ? (
        <div className="space-y-3">
          {filteredEntries.map((entry) => (
            <Link key={entry.id} href={`/journal/${entry.id}`}>
              <Card className="glass-card transition-all hover:-translate-y-0.5 hover:card-shadow-hover cursor-pointer">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4">
                    <span className="text-3xl">{EMOTION_ICONS[entry.emotion] || "😐"}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <Badge variant="outline" className="text-xs">
                          {entry.emotion}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          Интенсивность: {entry.emotion_intensity}/10
                        </span>
                      </div>
                      <p className="text-sm text-foreground mb-2 line-clamp-2">
                        {entry.situation}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {new Date(entry.created_at).toLocaleDateString("ru-RU", {
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
