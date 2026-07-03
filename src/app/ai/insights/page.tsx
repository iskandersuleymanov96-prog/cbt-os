"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import {
  Sparkles, Eye, EyeOff, Archive, Trash2,
  TrendingUp, Lightbulb, Heart, ChevronRight, X,
  AlertCircle, Clock
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { EmptyState } from "@/components/ui/empty-state"
import { GradientButton } from "@/components/ui/gradient-button"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DEMO_INSIGHTS } from "@/lib/demo-data"
import { Plus } from "lucide-react"
import type { AIInsight } from "@/types"

const typeConfig: Record<string, { label: string; icon: typeof Sparkles; color: string; bgColor: string }> = {
  pattern: { label: "Паттерн", icon: TrendingUp, color: "text-blue-600", bgColor: "bg-blue-50" },
  suggestion: { label: "Рекомендация", icon: Lightbulb, color: "text-amber-600", bgColor: "bg-amber-50" },
  reflection: { label: "Рефлексия", icon: Heart, color: "text-purple-600", bgColor: "bg-purple-50" },
  growth: { label: "Рост", icon: Sparkles, color: "text-green-600", bgColor: "bg-green-50" },
}

export default function AIInsightsPage() {
  const [insights, setInsights] = useState<AIInsight[]>(DEMO_INSIGHTS)
  const [activeTab, setActiveTab] = useState("all")
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedInsight, setSelectedInsight] = useState<AIInsight | null>(null)
  const [showArchiveDialog, setShowArchiveDialog] = useState<string | null>(null)
  const [showDeleteDialog, setShowDeleteDialog] = useState<string | null>(null)

  const filteredInsights = useMemo(() => {
    return insights
      .filter((i) => {
        if (activeTab === "unread") return !i.is_read
        if (activeTab !== "all" && activeTab !== "unread") return i.type === activeTab
        return true
      })
      .filter((i) => {
        if (!searchQuery.trim()) return true
        const q = searchQuery.toLowerCase()
        return (
          (i.title?.toLowerCase().includes(q) ?? false) ||
          i.content.toLowerCase().includes(q)
        )
      })
  }, [insights, activeTab, searchQuery])

  const unreadCount = useMemo(() => insights.filter((i) => !i.is_read).length, [insights])

  const markAsRead = (id: string) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: true } : i)))
  }

  const markAsUnread = (id: string) => {
    setInsights((prev) => prev.map((i) => (i.id === id ? { ...i, is_read: false } : i)))
  }

  const archiveInsight = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id))
    setShowArchiveDialog(null)
    if (selectedInsight?.id === id) setSelectedInsight(null)
  }

  const deleteInsight = (id: string) => {
    setInsights((prev) => prev.filter((i) => i.id !== id))
    setShowDeleteDialog(null)
    if (selectedInsight?.id === id) setSelectedInsight(null)
  }

  const markAllRead = () => {
    setInsights((prev) => prev.map((i) => ({ ...i, is_read: true })))
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-deep-charcoal">AI-инсайты</h1>
          <p className="text-muted-foreground">
            {insights.length} инсайтов
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2 text-[10px]">{unreadCount} новых</Badge>
            )}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllRead} className="gap-1">
            <Eye className="h-3.5 w-3.5" />
            Прочитать все
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <Input
          placeholder="Поиск по инсайтам..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-4"
          aria-label="Поиск по инсайтам"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start">
          <TabsTrigger value="all" className="gap-1">
            Все
            <Badge variant="secondary" className="ml-1 text-[10px]">{insights.length}</Badge>
          </TabsTrigger>
          <TabsTrigger value="unread" className="gap-1">
            Непрочитанные
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-1 text-[10px]">{unreadCount}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="pattern" className="gap-1">
            <TrendingUp className="h-3 w-3" />
            Паттерны
          </TabsTrigger>
          <TabsTrigger value="suggestion" className="gap-1">
            <Lightbulb className="h-3 w-3" />
            Рекомендации
          </TabsTrigger>
          <TabsTrigger value="reflection" className="gap-1">
            <Heart className="h-3 w-3" />
            Рефлексии
          </TabsTrigger>
          <TabsTrigger value="growth" className="gap-1">
            <Sparkles className="h-3 w-3" />
            Рост
          </TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-3 mt-4">
          {filteredInsights.length === 0 ? (
            <EmptyState
              icon="✨"
              title="Пока нет инсайтов"
              description="AI-инсайты появятся после нескольких записей в дневнике. Чем больше записей — тем точнее рекомендации."
              action={
                <Link href="/journal/new">
                  <GradientButton size="md" className="gap-2">
                    <Plus className="h-4 w-4" />
                    Создать запись
                  </GradientButton>
                </Link>
              }
            />
          ) : (
            filteredInsights.map((insight) => {
              const config = typeConfig[insight.type]
              const Icon = config.icon
              return (
                <Card
                  key={insight.id}
                  className={`glass-card transition-all hover:-translate-y-0.5 hover:card-shadow-hover cursor-pointer ${
                    !insight.is_read ? "ring-2 ring-primary/30" : ""
                  }`}
                  onClick={() => {
                    setSelectedInsight(insight)
                    markAsRead(insight.id)
                  }}
                >
                  <CardContent className="p-5">
                    <div className="flex items-start gap-4">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${config.bgColor}`}>
                        <Icon className={`h-5 w-5 ${config.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="text-[10px]">
                            {config.label}
                          </Badge>
                          {!insight.is_read && (
                            <span className="h-2 w-2 rounded-full bg-primary" />
                          )}
                          <span className="text-xs text-muted-foreground ml-auto flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(insight.created_at).toLocaleDateString("ru-RU", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                        <h3 className="font-semibold text-deep-charcoal mb-1">{insight.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">{insight.content}</p>
                        <div className="flex items-center gap-3 mt-2">
                          <span className="text-[10px] text-muted-foreground">
                            Уверенность: {insight.confidence}%
                          </span>
                          {insight.entry_id && (
                            <Link
                              href={`/journal/${insight.entry_id}`}
                              onClick={(e) => e.stopPropagation()}
                              className="text-[10px] text-primary hover:underline"
                            >
                              К записи →
                            </Link>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0 mt-2" />
                    </div>
                  </CardContent>
                </Card>
              )
            })
          )}
        </TabsContent>
      </Tabs>

      {/* Detail Dialog */}
      <Dialog open={!!selectedInsight} onOpenChange={() => setSelectedInsight(null)}>
        <DialogContent className="max-w-lg">
          {selectedInsight && (
            <>
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${typeConfig[selectedInsight.type].bgColor}`}>
                    {(() => {
                      const Icon = typeConfig[selectedInsight.type].icon
                      return <Icon className={`h-4 w-4 ${typeConfig[selectedInsight.type].color}`} />
                    })()}
                  </div>
                  <DialogTitle>{selectedInsight.title}</DialogTitle>
                </div>
                <DialogDescription>
                  {typeConfig[selectedInsight.type].label} • Уверенность: {selectedInsight.confidence}%
                </DialogDescription>
              </DialogHeader>

              <div className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {selectedInsight.content}
              </div>

              <div className="text-xs text-muted-foreground">
                {new Date(selectedInsight.created_at).toLocaleDateString("ru-RU", {
                  weekday: "long",
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      if (selectedInsight.is_read) {
                        markAsUnread(selectedInsight.id)
                      } else {
                        markAsRead(selectedInsight.id)
                      }
                      setSelectedInsight({
                        ...selectedInsight,
                        is_read: !selectedInsight.is_read,
                      })
                    }}
                    className="gap-1"
                  >
                    {selectedInsight.is_read ? (
                      <><EyeOff className="h-3 w-3" /> Не прочитано</>
                    ) : (
                      <><Eye className="h-3 w-3" /> Прочитано</>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowArchiveDialog(selectedInsight.id)
                    }}
                    className="gap-1"
                  >
                    <Archive className="h-3 w-3" /> Архив
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setShowDeleteDialog(selectedInsight.id)
                    }}
                    className="gap-1 text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" /> Удалить
                  </Button>
                </div>
                {selectedInsight.entry_id && (
                  <Link href={`/journal/${selectedInsight.entry_id}`}>
                    <Button variant="outline" size="sm" className="gap-1">
                      К записи <ChevronRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Archive Confirmation */}
      <Dialog open={!!showArchiveDialog} onOpenChange={() => setShowArchiveDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Архивировать инсайт?</DialogTitle>
            <DialogDescription>
              Инсайт будет скрыт из основного списка, но не удалён.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowArchiveDialog(null)}>Отмена</Button>
            <Button onClick={() => showArchiveDialog && archiveInsight(showArchiveDialog)}>Архивировать</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <Dialog open={!!showDeleteDialog} onOpenChange={() => setShowDeleteDialog(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              Удалить инсайт?
            </DialogTitle>
            <DialogDescription>
              Это действие необратимо. Инсайт будет удалён навсегда.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(null)}>Отмена</Button>
            <Button variant="destructive" onClick={() => showDeleteDialog && deleteInsight(showDeleteDialog)}>Удалить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
