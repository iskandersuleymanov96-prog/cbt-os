"use client"

import Link from "next/link"
import { useState, useMemo, useCallback, useRef } from "react"
import { Plus, Search, ChevronRight, Calendar, Trash2, Info, X, Download, Upload, ArrowUpDown, Filter } from "lucide-react"
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
import { EMOTION_ICONS } from "@/lib/demo-data"
import { useJournalStore } from "@/stores/journal"
import {
  exportAsJSON, exportAsCSV, importFromJSON, importFromCSV, downloadFile
} from "@/lib/data-management"
import { SuccessToast } from "@/components/ui/success-toast"

const EMOTIONS = Object.keys(EMOTION_ICONS)

export default function JournalPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isLoading] = useState(false)
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showDeleteAllDialog, setShowDeleteAllDialog] = useState(false)
  const [dismissBanner, setDismissBanner] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [toast, setToast] = useState<{ show: boolean; title: string; message: string; type: "saved" | "info" }>({
    show: false, title: "", message: "", type: "saved",
  })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const storeEntries = useJournalStore((s) => s.entries)
  const removeEntry = useJournalStore((s) => s.removeEntry)
  const removeAllEntries = useJournalStore((s) => s.removeAllEntries)
  const addEntry = useJournalStore((s) => s.addEntry)
  const sortBy = useJournalStore((s) => s.sortBy)
  const filterEmotion = useJournalStore((s) => s.filterEmotion)
  const filterDateFrom = useJournalStore((s) => s.filterDateFrom)
  const filterDateTo = useJournalStore((s) => s.filterDateTo)
  const filterTags = useJournalStore((s) => s.filterTags)
  const setSortBy = useJournalStore((s) => s.setSortBy)
  const setFilterEmotion = useJournalStore((s) => s.setFilterEmotion)
  const setFilterDateFrom = useJournalStore((s) => s.setFilterDateFrom)
  const setFilterDateTo = useJournalStore((s) => s.setFilterDateTo)
  const setFilterTags = useJournalStore((s) => s.setFilterTags)
  const clearFilters = useJournalStore((s) => s.clearFilters)

  const allEntries = useMemo(() => {
    return storeEntries
  }, [storeEntries])

  const filteredEntries = useMemo(() => {
    return allEntries.filter(
      (entry) =>
        (entry.situation.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.emotion.toLowerCase().includes(searchQuery.toLowerCase()) ||
        entry.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()))) &&
        (!filterEmotion || entry.emotion === filterEmotion) &&
        (!filterDateFrom || new Date(entry.created_at).getTime() >= new Date(filterDateFrom).getTime()) &&
        (!filterDateTo || new Date(entry.created_at).getTime() < new Date(filterDateTo).getTime() + 86400000) &&
        (filterTags.length === 0 || filterTags.some((t) => entry.tags.includes(t)))
    ).sort((a, b) => {
      switch (sortBy) {
        case "date-asc": return new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        case "mood-desc": return b.mood - a.mood
        case "mood-asc": return a.mood - b.mood
        default: return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      }
    })
  }, [searchQuery, allEntries, sortBy, filterEmotion, filterDateFrom, filterDateTo, filterTags])

  const allTags = useMemo(() => {
    const tags = new Set<string>()
    allEntries.forEach((e) => e.tags.forEach((t) => tags.add(t)))
    return Array.from(tags)
  }, [allEntries])

  const hasActiveFilters = filterEmotion || filterDateFrom || filterDateTo || filterTags.length > 0

  const handleDelete = (id: string) => {
    removeEntry(id)
    setDeleteId(null)
  }

  const handleDeleteAll = () => {
    removeAllEntries()
    setShowDeleteAllDialog(false)
  }

  const showToast = useCallback((title: string, message: string, type: "saved" | "info" = "saved") => {
    setToast({ show: true, title, message, type })
  }, [])

  const handleExportJSON = useCallback(() => {
    if (storeEntries.length === 0) {
      showToast("Нет данных", "Экспортируть нечего — создайте записи сначала", "info")
      return
    }
    const json = exportAsJSON(storeEntries)
    const date = new Date().toISOString().slice(0, 10)
    downloadFile(json, `cbt-os-export-${date}.json`, "application/json")
    showToast("Экспорт завершён", `${storeEntries.length} записей экспортировано в JSON`)
  }, [storeEntries, showToast])

  const handleExportCSV = useCallback(() => {
    if (storeEntries.length === 0) {
      showToast("Нет данных", "Экспортируть нечего — создайте записи сначала", "info")
      return
    }
    const csv = exportAsCSV(storeEntries)
    const date = new Date().toISOString().slice(0, 10)
    downloadFile(csv, `cbt-os-export-${date}.csv`, "text/csv;charset=utf-8")
    showToast("Экспорт завершён", `${storeEntries.length} записей экспортировано в CSV`)
  }, [storeEntries, showToast])

  const handleImport = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const isJSON = file.name.endsWith(".json")
      const result = isJSON ? importFromJSON(text) : importFromCSV(text)

      if (result.entries.length > 0) {
        const existingIds = new Set(storeEntries.map((se) => se.id))
        const newEntries = result.entries.filter((ne) => !existingIds.has(ne.id))
        newEntries.forEach((entry) => addEntry(entry))
        showToast(
          "Импорт завершён",
          `Добавлено ${newEntries.length} новых записей${result.errors.length > 0 ? ` (${result.errors.length} ошибок)` : ""}`
        )
      } else if (result.errors.length > 0) {
        showToast("Ошибка импорта", result.errors[0], "info")
      } else {
        showToast("Нет новых записей", "Все записи из файла уже существуют", "info")
      }
    }
    reader.readAsText(file)
    e.target.value = ""
  }, [storeEntries, addEntry, showToast])

  return (
    <div className="space-y-6">
      <SuccessToast
        show={toast.show}
        type={toast.type}
        title={toast.title}
        message={toast.message}
        onClose={() => setToast((p) => ({ ...p, show: false }))}
      />
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">Дневник</h1>
          <p className="text-muted-foreground">
            {storeEntries.length > 0 ? `${storeEntries.length} записей` : "Пока нет записей"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleExportJSON}
          >
            <Download className="h-3.5 w-3.5" />
            JSON
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={handleExportCSV}
          >
            <Download className="h-3.5 w-3.5" />
            CSV
          </Button>
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-3.5 w-3.5" />
            Импорт
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            className="hidden"
            onChange={handleImport}
          />
          {storeEntries.length > 0 && (
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

      {/* Search & Filters */}
      <div className="space-y-3">
        <div className="relative flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по записям..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              aria-label="Поиск по записям"
            />
          </div>
          <Button
            variant={hasActiveFilters ? "default" : "outline"}
            size="icon"
            onClick={() => setShowFilters(!showFilters)}
            className="shrink-0"
          >
            <Filter className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => {
              const next = sortBy === "date-desc" ? "date-asc" : sortBy === "date-asc" ? "mood-desc" : sortBy === "mood-desc" ? "mood-asc" : "date-desc"
              setSortBy(next)
            }}
            className="shrink-0"
            title={`Сортировка: ${sortBy === "date-desc" ? "Новые" : sortBy === "date-asc" ? "Старые" : sortBy === "mood-desc" ? "Настроение ↓" : "Настроение ↑"}`}
          >
            <ArrowUpDown className="h-4 w-4" />
          </Button>
        </div>

        {showFilters && (
          <Card className="glass-card">
            <CardContent className="p-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Эмоция</label>
                  <select
                    value={filterEmotion || ""}
                    onChange={(e) => setFilterEmotion(e.target.value || null)}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Все эмоции</option>
                    {EMOTIONS.map((em) => (
                      <option key={em} value={em}>{em}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Дата от</label>
                  <Input
                    type="date"
                    value={filterDateFrom || ""}
                    onChange={(e) => setFilterDateFrom(e.target.value || null)}
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Дата до</label>
                  <Input
                    type="date"
                    value={filterDateTo || ""}
                    onChange={(e) => setFilterDateTo(e.target.value || null)}
                  />
                </div>
              </div>
              {allTags.length > 0 && (
                <div>
                  <label className="text-xs font-medium text-muted-foreground mb-1 block">Теги</label>
                  <div className="flex flex-wrap gap-2">
                    {allTags.map((tag) => (
                      <Badge
                        key={tag}
                        variant={filterTags.includes(tag) ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => {
                          setFilterTags(
                            filterTags.includes(tag)
                              ? filterTags.filter((t) => t !== tag)
                              : [...filterTags, tag]
                          )
                        }}
                      >
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                  <X className="h-3.5 w-3.5" />
                  Сбросить фильтры
                </Button>
              )}
            </CardContent>
          </Card>
        )}
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
      ) : searchQuery || hasActiveFilters ? (
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
