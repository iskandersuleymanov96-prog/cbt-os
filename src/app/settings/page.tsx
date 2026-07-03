"use client"

import { useState, useEffect, useCallback, useMemo } from "react"
import {
  User, Palette, Bell, Sparkles, Database, AlertTriangle,
  Camera, Loader2,
  RefreshCw, Download, Upload, Trash2, Wifi, WifiOff,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
  DialogFooter, DialogDescription
} from "@/components/ui/dialog"
import { ThemeToggle } from "@/components/theme-toggle"
import { useSettingsStore } from "@/stores/settings"
import { useJournalStore } from "@/stores/journal"
import { SuccessToast } from "@/components/ui/success-toast"
import {
  exportAsJSON, exportAsCSV, importFromJSON, importFromCSV, downloadFile
} from "@/lib/data-management"

const aiTopicOptions = [
  "Тревога", "Депрессия", "Стресс", "Отношения", "Работа",
  "Самооценка", "Перфекционизм", "Прокрастинация", "Сон", "Здоровье",
]

interface AIStatus {
  configured: boolean
  provider: string
  model: string | null
}

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore()
  const [activeTab, setActiveTab] = useState("profile")
  const [showSaved, setShowSaved] = useState(false)
  const [toastMsg, setToastMsg] = useState<{ title: string; message: string } | null>(null)

  // Profile
  const [profileName, setProfileName] = useState("Пользователь")
  const [profileEmail, setProfileEmail] = useState("user@example.com")
  const [profileBio, setProfileBio] = useState("")
  const [profileTimezone, setProfileTimezone] = useState("Europe/Moscow")

  // Preferences
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(settings.font_size)
  const [compactMode, setCompactMode] = useState(settings.compact_mode)

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(settings.notifications_enabled)
  const [reminderTime, setReminderTime] = useState(settings.reminder_time)
  const [emailNotifications, setEmailNotifications] = useState(settings.email_notifications)
  const [weeklySummary, setWeeklySummary] = useState(settings.weekly_summary)

  // AI
  const [aiIntensity, setAiIntensity] = useState<"gentle" | "moderate" | "intensive">(settings.ai_coaching_intensity)
  const [aiStyle, setAiStyle] = useState<"concise" | "detailed" | "socratic">(settings.ai_response_style)
  const [aiTopics, setAiTopics] = useState<string[]>(settings.ai_focus_topics)
  const [aiStatus, setAiStatus] = useState<AIStatus | null>(null)
  const [aiStatusLoading, setAiStatusLoading] = useState(false)

  // Data
  const [showClearDialog, setShowClearDialog] = useState(false)
  const [isImporting, setIsImporting] = useState(false)
  const [clearConfirm, setClearConfirm] = useState("")

  const storeEntries = useJournalStore((s) => s.entries)
  const addEntry = useJournalStore((s) => s.addEntry)
  const removeAllEntries = useJournalStore((s) => s.removeAllEntries)

  const toggleAiTopic = (topic: string) => {
    setAiTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const saveSettings = useCallback(() => {
    updateSettings({
      font_size: fontSize,
      compact_mode: compactMode,
      notifications_enabled: notificationsEnabled,
      reminder_time: reminderTime,
      email_notifications: emailNotifications,
      weekly_summary: weeklySummary,
      ai_coaching_intensity: aiIntensity,
      ai_response_style: aiStyle,
      ai_focus_topics: aiTopics,
    })
    setShowSaved(true)
  }, [fontSize, compactMode, notificationsEnabled, reminderTime, emailNotifications, weeklySummary, aiIntensity, aiStyle, aiTopics, updateSettings])

  const checkAIStatus = useCallback(async () => {
    setAiStatusLoading(true)
    try {
      const res = await fetch("/api/ai/status")
      const data = await res.json()
      setAiStatus(data)
    } catch {
      setAiStatus({ configured: false, provider: "none", model: null })
    } finally {
      setAiStatusLoading(false)
    }
  }, [])

  useEffect(() => {
    let cancelled = false
    fetch("/api/ai/status")
      .then((res) => res.json())
      .then((data) => { if (!cancelled) setAiStatus(data) })
      .catch(() => { if (!cancelled) setAiStatus({ configured: false, provider: "none", model: null }) })
    return () => { cancelled = true }
  }, [])

  const handleExportJSON = () => {
    if (storeEntries.length === 0) {
      setToastMsg({ title: "Нет данных", message: "Экспортируть нечего" })
      return
    }
    const json = exportAsJSON(storeEntries)
    const date = new Date().toISOString().slice(0, 10)
    downloadFile(json, `cbt-os-export-${date}.json`, "application/json")
    setToastMsg({ title: "Экспорт завершён", message: `${storeEntries.length} записей в JSON` })
  }

  const handleExportCSV = () => {
    if (storeEntries.length === 0) {
      setToastMsg({ title: "Нет данных", message: "Экспортируть нечего" })
      return
    }
    const csv = exportAsCSV(storeEntries)
    const date = new Date().toISOString().slice(0, 10)
    downloadFile(csv, `cbt-os-export-${date}.csv`, "text/csv;charset=utf-8")
    setToastMsg({ title: "Экспорт завершён", message: `${storeEntries.length} записей в CSV` })
  }

  const handleImport = () => {
    const input = document.createElement("input")
    input.type = "file"
    input.accept = ".json,.csv"
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      setIsImporting(true)
      try {
        const text = await file.text()
        const isJSON = file.name.endsWith(".json")
        const result = isJSON ? importFromJSON(text) : importFromCSV(text)

        if (result.entries.length > 0) {
          const existingIds = new Set(storeEntries.map((se) => se.id))
          const newEntries = result.entries.filter((ne) => !existingIds.has(ne.id))
          newEntries.forEach((entry) => addEntry(entry))
          setToastMsg({
            title: "Импорт завершён",
            message: `Добавлено ${newEntries.length} записей${result.errors.length > 0 ? `, ${result.errors.length} ошибок` : ""}`,
          })
        } else if (result.errors.length > 0) {
          setToastMsg({ title: "Ошибка импорта", message: result.errors[0] })
        } else {
          setToastMsg({ title: "Нет новых записей", message: "Все записи уже существуют" })
        }
      } catch {
        setToastMsg({ title: "Ошибка", message: "Не удалось прочитать файл" })
      } finally {
        setIsImporting(false)
      }
    }
    input.click()
  }

  const handleClearAll = () => {
    if (clearConfirm !== "УДАЛИТЬ") return
    removeAllEntries()
    setShowClearDialog(false)
    setClearConfirm("")
    setToastMsg({ title: "Данные удалены", message: "Все записи дневника удалены" })
  }

  const dataSizeKB = useMemo(() => {
    const json = JSON.stringify(storeEntries)
    return (new Blob([json]).size / 1024).toFixed(1)
  }, [storeEntries])

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <SuccessToast
        show={!!showSaved}
        type="saved"
        title="Настройки сохранены"
        message="Ваши изменения применены"
        onClose={() => setShowSaved(false)}
      />
      <SuccessToast
        show={!!toastMsg}
        type="saved"
        title={toastMsg?.title || ""}
        message={toastMsg?.message}
        onClose={() => setToastMsg(null)}
      />
      <div>
        <h1 className="text-2xl font-bold text-deep-charcoal">Настройки</h1>
        <p className="text-muted-foreground">Управление аккаунтом и приложением</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="w-full justify-start flex-wrap">
          <TabsTrigger value="profile" className="gap-1">
            <User className="h-3.5 w-3.5" /> Профиль
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-1">
            <Palette className="h-3.5 w-3.5" /> Интерфейс
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1">
            <Bell className="h-3.5 w-3.5" /> Уведомления
          </TabsTrigger>
          <TabsTrigger value="ai" className="gap-1">
            <Sparkles className="h-3.5 w-3.5" /> AI
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-1">
            <Database className="h-3.5 w-3.5" /> Данные
          </TabsTrigger>
        </TabsList>

        {/* Profile */}
        <TabsContent value="profile" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Профиль</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold text-primary">
                    {profileName.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase() || "П"}
                  </div>
                  <button className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                    <Camera className="h-3.5 w-3.5" />
                  </button>
                </div>
                <div>
                  <p className="font-medium">{profileName}</p>
                  <p className="text-sm text-muted-foreground">{profileEmail}</p>
                </div>
              </div>
              <Separator />
              <div className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Имя</Label>
                    <Input
                      id="name"
                      value={profileName}
                      onChange={(e) => setProfileName(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileEmail}
                      onChange={(e) => setProfileEmail(e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">О себе</Label>
                  <Textarea
                    id="bio"
                    placeholder="Расскажите о себе (необязательно)..."
                    value={profileBio}
                    onChange={(e) => setProfileBio(e.target.value)}
                    className="mt-1 min-h-[80px]"
                  />
                </div>
                <div>
                  <Label htmlFor="timezone">Часовой пояс</Label>
                  <select
                    id="timezone"
                    value={profileTimezone}
                    onChange={(e) => setProfileTimezone(e.target.value)}
                    className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="Europe/Moscow">Москва (UTC+3)</option>
                    <option value="Europe/Kiev">Киев (UTC+2)</option>
                    <option value="Asia/Almaty">Алматы (UTC+6)</option>
                    <option value="Asia/Tashkent">Ташкент (UTC+5)</option>
                    <option value="Asia/Tbilisi">Тбилиси (UTC+4)</option>
                  </select>
                </div>
              </div>
              <Button onClick={saveSettings}>Сохранить профиль</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preferences */}
        <TabsContent value="preferences" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Тема</CardTitle>
            </CardHeader>
            <CardContent>
              <ThemeToggle />
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Текст и интерфейс</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Размер шрифта</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {([
                    { value: "small" as const, label: "Мелкий", size: "text-xs" },
                    { value: "medium" as const, label: "Средний", size: "text-sm" },
                    { value: "large" as const, label: "Крупный", size: "text-base" },
                  ]).map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setFontSize(s.value)}
                      className={`rounded-xl px-4 py-3 transition-all ${
                        fontSize === s.value
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <span className={`${s.size} font-medium`}>{s.label}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Компактный режим</p>
                  <p className="text-sm text-muted-foreground">Уменьшить отступы и размер элементов</p>
                </div>
                <button
                  onClick={() => setCompactMode(!compactMode)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    compactMode ? "bg-primary" : "bg-secondary"
                  }`}
                  role="switch"
                  aria-checked={compactMode}
                  aria-label="Компактный режим"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      compactMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications */}
        <TabsContent value="notifications" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Напоминания</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Push-уведомления</p>
                  <p className="text-sm text-muted-foreground">Напоминания о записях</p>
                </div>
                <button
                  onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    notificationsEnabled ? "bg-primary" : "bg-secondary"
                  }`}
                  role="switch"
                  aria-checked={notificationsEnabled}
                  aria-label="Push-уведомления"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      notificationsEnabled ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              {notificationsEnabled && (
                <>
                  <Separator />
                  <div>
                    <Label htmlFor="reminder-time">Время напоминания</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        id="reminder-time"
                        type="time"
                        value={reminderTime}
                        onChange={(e) => setReminderTime(e.target.value)}
                        className="w-32"
                      />
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Email</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email-уведомления</p>
                  <p className="text-sm text-muted-foreground">Получать напоминания на почту</p>
                </div>
                <button
                  onClick={() => setEmailNotifications(!emailNotifications)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    emailNotifications ? "bg-primary" : "bg-secondary"
                  }`}
                  role="switch"
                  aria-checked={emailNotifications}
                  aria-label="Email-уведомления"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      emailNotifications ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Еженедельный отчёт</p>
                  <p className="text-sm text-muted-foreground">Сводка по записям и прогрессу</p>
                </div>
                <button
                  onClick={() => setWeeklySummary(!weeklySummary)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    weeklySummary ? "bg-primary" : "bg-secondary"
                  }`}
                  role="switch"
                  aria-checked={weeklySummary}
                  aria-label="Еженедельный отчёт"
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      weeklySummary ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Подключение AI</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  {aiStatus?.configured ? (
                    <Wifi className="h-5 w-5 text-green-600" />
                  ) : (
                    <WifiOff className="h-5 w-5 text-muted-foreground" />
                  )}
                  <div>
                    <p className="text-sm font-medium">
                      {aiStatus?.configured ? "AI подключён" : "AI не настроен"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {aiStatus?.configured
                        ? `${aiStatus.provider} • ${aiStatus.model}`
                        : "Добавьте OPENROUTER_API_KEY в .env.local"}
                    </p>
                  </div>
                </div>
                <Badge variant={aiStatus?.configured ? "default" : "secondary"}>
                  {aiStatus?.configured ? "Активен" : "Неактивен"}
                </Badge>
              </div>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={checkAIStatus}
                disabled={aiStatusLoading}
              >
                {aiStatusLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4" />
                )}
                Проверить подключение
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Настройки AI-коучинга</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div>
                <Label>Интенсивность коучинга</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {([
                    { value: "gentle" as const, label: "Мягкий", desc: "Поддержка без давления" },
                    { value: "moderate" as const, label: "Умеренный", desc: "Баланс поддержки и вызова" },
                    { value: "intensive" as const, label: "Интенсивный", desc: "Активное сопровождение" },
                  ]).map((i) => (
                    <button
                      key={i.value}
                      onClick={() => setAiIntensity(i.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                        aiIntensity === i.value
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <span className="text-sm font-medium">{i.label}</span>
                      <span className="text-[10px] text-muted-foreground text-center">{i.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <Label>Стиль ответов</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {([
                    { value: "concise" as const, label: "Краткий", desc: "Короткие ответы" },
                    { value: "detailed" as const, label: "Подробный", desc: "Развёрнутые ответы" },
                    { value: "socratic" as const, label: "Сократический", desc: "Вопросы для саморефлексии" },
                  ]).map((s) => (
                    <button
                      key={s.value}
                      onClick={() => setAiStyle(s.value)}
                      className={`flex flex-col items-center gap-1 rounded-xl p-3 transition-all ${
                        aiStyle === s.value
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      <span className="text-sm font-medium">{s.label}</span>
                      <span className="text-[10px] text-muted-foreground text-center">{s.desc}</span>
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div>
                <Label>Темы для фокусировки</Label>
                <p className="text-xs text-muted-foreground mb-2">Выберите темы, на которых AI будет делать акцент</p>
                <div className="flex flex-wrap gap-2">
                  {aiTopicOptions.map((topic) => (
                    <Badge
                      key={topic}
                      variant={aiTopics.includes(topic) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleAiTopic(topic)}
                      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); toggleAiTopic(topic) } }}
                      tabIndex={0}
                      role="checkbox"
                      aria-checked={aiTopics.includes(topic)}
                    >
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
              <Button onClick={saveSettings} className="w-full">Сохранить настройки AI</Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Статистика данных</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="p-3 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold text-deep-charcoal">{storeEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Записей в дневнике</p>
                </div>
                <div className="p-3 rounded-xl bg-secondary/50">
                  <p className="text-2xl font-bold text-deep-charcoal">{dataSizeKB} КБ</p>
                  <p className="text-xs text-muted-foreground">Объём данных</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Экспорт данных</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full gap-2" onClick={handleExportJSON} disabled={storeEntries.length === 0}>
                <Download className="h-4 w-4" /> Экспорт в JSON
              </Button>
              <Button variant="outline" className="w-full gap-2" onClick={handleExportCSV} disabled={storeEntries.length === 0}>
                <Download className="h-4 w-4" /> Экспорт в CSV
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Импорт данных</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2" onClick={handleImport} disabled={isImporting}>
                {isImporting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Импорт из файла
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Поддерживаются форматы JSON и CSV
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Удалить все данные
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => setShowClearDialog(true)}
                disabled={storeEntries.length === 0}
              >
                Очистить все записи
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Это действие необратимо. Рекомендуется сначала сделать экспорт.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Clear Data Dialog */}
      <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Удалить все данные?
            </DialogTitle>
            <DialogDescription>
              Все записи дневника будут удалены навсегда. Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">Будет удалено:</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• {storeEntries.length} записей дневника</li>
                <li>• Все данные и теги</li>
              </ul>
            </div>
            <div>
              <Label htmlFor="confirm-clear">Введите «УДАЛИТЬ» для подтверждения</Label>
              <Input
                id="confirm-clear"
                placeholder="УДАЛИТЬ"
                value={clearConfirm}
                onChange={(e) => setClearConfirm(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setShowClearDialog(false); setClearConfirm("") }}>Отмена</Button>
            <Button
              variant="destructive"
              onClick={handleClearAll}
              disabled={clearConfirm !== "УДАЛИТЬ"}
            >
              Удалить всё
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


