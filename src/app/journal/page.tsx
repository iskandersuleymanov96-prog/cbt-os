"use client"

import Link from "next/link"
import { useState, useMemo } from "react"
import { Plus, Search, ChevronRight, Calendar, Trash2, Info, X } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { EmptyState } from "@/components/ui/empty-state"
import { GradientButton } from "@/components/ui/gradient-button"
import { SkeletonCard } from "@/components/ui/skeleton"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { DEMO_ENTRIES, EMOTION_ICONS } from "@/lib/demo-data"
import { useJournalStore } from "@/stores/journal"

export default function JournalPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [dismissBanner, setDismissBanner] = useState(false)
  const storeEntries = useJournalStore((s) => s.entries)
  const removeEntry = useJournalStore((s) => s.removeEntry)
  const removeAllEntries = useJournalStore((s) => s.removeAllEntries)

  const allEntries = useMemo(() => {
    const merged = [...storeEntries, ...DEMO_ENTRIES]
    const seen = new Set()
    return merged.filter((e) => {
      if (seen.has(e.id)) return false
      seen.add(e.id)
      return true
    })
  }, [storeEntries])

  const realEntries = useMemo(() => {
    return allEntries.filter((e) => !DEMO_ENTRIES.some((d) => d.id === e.id))
  }, [allEntries])

  const filteredEntries = useMemo(() => {
    return allEntries.filter(
      (entry) =>
        entry.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.emotion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))
    )
  }, [searchQuery, allEntries])

  const handleDelete = (id: string) => {
    removeEntry(id)
    setDeleteId(null)
  }

  const handleDeleteAll = () => {
    removeAllEntries()
    setShowDeleteAllDialog(false)
  }

  const isExampleEntry = (id: string) => DEMO_ENTRIES.some((d) => d.id === id)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">Дневник</h1>
          <p className="text-muted-foreground">
            {realEntries.length > 0 ? `${realEntries.length} записей` : "Пока нет записей"}
          </p>
        </div>
        <div className="flex gap-2">
          {realEntries.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1 text-destructive hover:bg-destructive/10"
              onClick={() => setShowDeleteAllDialog(true)}
            >
              <Trash2 className="h-3.5 w-3.5" />
              Удалить все
            </Button>
          )}
          <Link href="/journal/new">
            <GradientButton size="md" className="gap-2 shadow-lg shadow-primary/20">
              <Plus className="h-4 w-4" />
              Новая запись
            </GradientButton>
          </Link>
        </div>
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

      {/* Instruction Banner */}
      {!dismissBanner && storeEntries.length === 0 && (
        <div className="relative rounded-xl border border-primary/20 bg-primary/5 p-4">
          <button
            onClick={() => setDismissBanner(true)}
            className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Info className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-deep-charcoal">Как начать вести дневник</p>
              <p className="text-xs text-muted-foreground mt-1">
                Нажмите «Новая запись», чтобы описать ситуацию, мысли и эмоции.
                Записи помогут вам лучше понять себя и найти повторяющиеся паттерны.
              </p>
            </div>
          </div>
        </div>
      )}

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
            <div key={entry.id} className="group relative">
              <Link href={`/journal/${entry.id}`}>
                <Card className={`glass-card transition-all hover:-translate-y-0.5 hover:card-shadow-hover cursor-pointer ${isExampleEntry(entry.id) ? "border-dashed border-muted-foreground/30" : ""}`}>
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{EMOTION_ICONS[entry.emotion] || "😐"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {isExampleEntry(entry.id) && (
                            <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-700 border-amber-200">
                              Пример
                            </Badge>
                          )}
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
                        {"distortions" in entry && (entry as unknown as Record<string, string[]>).distortions?.length > 0 && (
                          <div className="flex gap-1 mt-2">
                            {(entry as unknown as Record<string, string[]>).distortions.map((d: string) => (
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
                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setDeleteId(entry.id)
                          }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                        <ChevronRight className="h-4 w-4 text-muted-foreground mt-2" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
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
        />
      )}

      {/* Delete Single Entry Dialog */}
      <Dialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить запись?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Запись будет удалена навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => deleteId && handleDelete(deleteId)}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete All Dialog */}
      <Dialog open={showDeleteAllDialog} onOpenChange={setShowDeleteAllDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Удалить все записи?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Все ваши записи дневника будут удалены навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteAllDialog(false)}>Отмена</Button>
            <Button variant="destructive" onClick={handleDeleteAll}>Удалить все</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
