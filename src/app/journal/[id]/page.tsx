"use client"

import { useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Edit3, Trash2, Copy, Download, Calendar, Tag, Brain, TrendingDown, Loader2 } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import type { JournalEntry } from "@/types"

const mockEntry: JournalEntry & { distortions: string[] } = {
  id: "1",
  user_id: "demo",
  created_at: "2026-06-19T14:30:00Z",
  situation: "Совещание по проекту — начальник критиковал мою работу перед командой. Он сказал, что сроки сорваны и это моя вина, хотя часть задач зависла из-за других отделов.",
  emotion: "Тревога",
  emotion_intensity: 7,
  automatic_thought: "Я не справляюсь. Меня уволят. Все видят, что я некомпетентен.",
  body_sensations: "Напряжение в плечах, учащённое сердцебиение, потеют ладони",
  behavior: "Молчал на совещании, избегал зрительного контакта, после ушёл в туалет и 10 минут сидел один",
  evidence_supporting: "Начальник действительно был недоволен. Сроки действительно сорваны.",
  evidence_against: "Часть задач зависла не по моей вине. До этого проекты я сдавал вовремя. Коллеги тоже опаздывают.",
  alternative_thought: "Я допустил ошибки в планировании, но это не делает меня некомпетентным. Это учебный опыт.",
  new_emotion_intensity: 4,
  lessons_learned: "Нужно лучше коммуницировать о задержках заранее. Не брать ответственность за чужие задачи.",
  mood: 3,
  energy: 5,
  stress: 7,
  anxiety: 8,
  tags: ["работа", "стресс"],
  distortions: ["Катастрофизация", "Чтение мыслей"],
}

export default function JournalDetailPage() {
  const router = useRouter()
  const [isEditing, setIsEditing] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [entry, setEntry] = useState(mockEntry)
  const [editData, setEditData] = useState(mockEntry)

  const handleSave = () => {
    setEntry(editData)
    setIsEditing(false)
  }

  const handleDelete = () => {
    setShowDeleteDialog(false)
    router.push("/journal")
  }

  const handleExport = useCallback(async () => {
    setIsExporting(true)
    try {
      const { generateEntryPDF, downloadBlob } = await import("@/lib/pdf/generator")
      const blob = await generateEntryPDF(entry)
      downloadBlob(blob, `cbt-os-entry-${entry.id}.pdf`)
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setIsExporting(false)
    }
  }, [entry])

  const intensityChange = entry.emotion_intensity - entry.new_emotion_intensity

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.back()} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Назад
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsEditing(!isEditing)}>
            <Edit3 className="h-4 w-4 mr-1" />
            {isEditing ? "Отмена" : "Редактировать"}
          </Button>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-1" />
            Дублировать
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-1" />
            )}
            {isExporting ? "Экспорт..." : "Экспорт"}
          </Button>
          <Button variant="outline" size="sm" onClick={() => setShowDeleteDialog(true)} className="text-destructive hover:bg-destructive/10">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Date & Meta */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="flex items-center gap-1">
          <Calendar className="h-4 w-4" />
          {new Date(entry.created_at).toLocaleDateString("ru-RU", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}
        </span>
        <span className="flex items-center gap-1">
          {entry.emotion}
        </span>
      </div>

      {/* Tags */}
      <div className="flex gap-2">
        {entry.tags.map((tag) => (
          <Badge key={tag} variant="secondary" className="gap-1">
            <Tag className="h-3 w-3" />
            {tag}
          </Badge>
        ))}
      </div>

      {/* Intensity Change */}
      <Card className="glass-card">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Было</p>
                <p className="text-2xl font-bold text-deep-charcoal">{entry.emotion_intensity}</p>
              </div>
              <TrendingDown className={`h-5 w-5 ${intensityChange > 0 ? "text-green-500" : intensityChange < 0 ? "text-red-500" : "text-muted-foreground"}`} />
              <div className="text-center">
                <p className="text-xs text-muted-foreground">Стало</p>
                <p className="text-2xl font-bold text-deep-charcoal">{entry.new_emotion_intensity}</p>
              </div>
            </div>
            {intensityChange > 0 && (
              <Badge className="bg-green-100 text-green-700">
                Снижение на {intensityChange}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Situation */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Ситуация</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea
                value={editData.situation}
                onChange={(e) => setEditData({ ...editData, situation: e.target.value })}
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-foreground leading-relaxed">{entry.situation}</p>
            )}
          </CardContent>
        </Card>

        {/* Automatic Thought */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Автоматическая мысль</CardTitle>
          </CardHeader>
          <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.automatic_thought}
                  onChange={(e) => setEditData({ ...editData, automatic_thought: e.target.value })}
                  className="min-h-[80px]"
                />
              ) : (
                <p className="text-foreground italic">&ldquo;{entry.automatic_thought}&rdquo;</p>
              )}
          </CardContent>
        </Card>

        {/* Body & Behavior row */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Физические ощущения</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.body_sensations}
                  onChange={(e) => setEditData({ ...editData, body_sensations: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground">{entry.body_sensations}</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Поведение</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.behavior}
                  onChange={(e) => setEditData({ ...editData, behavior: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground">{entry.behavior}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Distortions */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Brain className="h-4 w-4" />
              Когнитивные искажения
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {entry.distortions.map((d) => (
                <Badge key={d} variant="outline" className="gap-1">
                  {d}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Evidence */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-red-600">Доказательства ЗА мысль</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.evidence_supporting}
                  onChange={(e) => setEditData({ ...editData, evidence_supporting: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground">{entry.evidence_supporting}</p>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-green-600">Доказательства ПРОТИВ мысль</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.evidence_against}
                  onChange={(e) => setEditData({ ...editData, evidence_against: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground">{entry.evidence_against}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Alternative Thought */}
        <Card className="glass-card border-primary/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-primary">Альтернативная мысль</CardTitle>
          </CardHeader>
          <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.alternative_thought}
                  onChange={(e) => setEditData({ ...editData, alternative_thought: e.target.value })}
                  className="min-h-[80px]"
                />
              ) : (
                <p className="text-foreground font-medium">{entry.alternative_thought}</p>
              )}
          </CardContent>
        </Card>

        {/* Lessons */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Уроки и выводы</CardTitle>
          </CardHeader>
          <CardContent>
              {isEditing ? (
                <Textarea
                  value={editData.lessons_learned}
                  onChange={(e) => setEditData({ ...editData, lessons_learned: e.target.value })}
                />
              ) : (
                <p className="text-sm text-foreground">{entry.lessons_learned}</p>
              )}
          </CardContent>
        </Card>
      </div>

      {/* Edit Actions */}
      {isEditing && (
        <div className="flex gap-3 sticky bottom-6">
          <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
            Отмена
          </Button>
          <Button onClick={handleSave} className="flex-1 gradient-primary text-white">
            Сохранить изменения
          </Button>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Удалить запись?</DialogTitle>
            <DialogDescription>
              Это действие нельзя отменить. Запись будет удалена навсегда.
            </DialogDescription>
          </DialogHeader>
          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)} className="flex-1">
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} className="flex-1">
              Удалить
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
