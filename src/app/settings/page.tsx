"use client"

import { useState, useEffect } from "react"
import {
  User, Palette, Bell, Sparkles, Shield, CreditCard,
  ChevronRight, Clock, Download,
  Upload, Database, Lock, Smartphone, Key, AlertTriangle,
  Camera, FileText, CheckCircle2, Loader2, HardDrive,
  RefreshCw, Eye, EyeOff, Volume2, VolumeX
} from "lucide-react"
import { isSupported, requestPermission } from "@/lib/notifications/service"
import { scheduleReminder, scheduleWeeklySummary, cancelAll } from "@/lib/notifications/scheduler"
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
import { useTheme } from "@/components/theme-provider"

const aiTopicOptions = [
  "Тревога", "Депрессия", "Стресс", "Отношения", "Работа",
  "Самооценка", "Перфекционизм", "Прокрастинация", "Сон", "Здоровье",
]

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile")

  // Profile
  const [profileName, setProfileName] = useState("Пользователь")
  const [profileEmail, setProfileEmail] = useState("user@example.com")
  const [profileBio, setProfileBio] = useState("")
  const [profileTimezone, setProfileTimezone] = useState("Europe/Moscow")

  // Preferences
  const { theme } = useTheme()
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium")
  const [compactMode, setCompactMode] = useState(false)

  // Notifications
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [reminderTime, setReminderTime] = useState("09:00")
  const [emailNotifications, setEmailNotifications] = useState(false)
  const [weeklySummary, setWeeklySummary] = useState(true)

  // AI
  const [aiIntensity, setAiIntensity] = useState<"gentle" | "moderate" | "intensive">("moderate")
  const [aiStyle, setAiStyle] = useState<"concise" | "detailed" | "socratic">("detailed")
  const [aiTopics, setAiTopics] = useState<string[]>(["Тревога", "Стресс"])

  // Privacy
  const [dataRetention, setDataRetention] = useState(365)
  const [encryption, setEncryption] = useState(true)

  // Password
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [show2FA, setShow2FA] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  // Data export
  const [exportFormat, setExportFormat] = useState<"json" | "csv" | "pdf">("json")
  const [isExporting, setIsExporting] = useState(false)

  const toggleAiTopic = (topic: string) => {
    setAiTopics((prev) =>
      prev.includes(topic) ? prev.filter((t) => t !== topic) : [...prev, topic]
    )
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const date = new Date().toISOString().slice(0, 10)
      const filename = `cbt-os-export-${date}`

      if (exportFormat === "json") {
        const res = await fetch("/api/export/all?format=json")
        const data = await res.json()
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${filename}.json`
        a.click()
        URL.revokeObjectURL(url)
      } else if (exportFormat === "csv") {
        const res = await fetch("/api/export/all?format=csv")
        const blob = await res.blob()
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${filename}.csv`
        a.click()
        URL.revokeObjectURL(url)
      } else if (exportFormat === "pdf") {
        const { generateAllEntriesPDF, downloadBlob } = await import("@/lib/pdf/generator")
        const entriesRes = await fetch("/api/export/all?format=json")
        const { entries } = await entriesRes.json()
        const blob = await generateAllEntriesPDF(entries)
        downloadBlob(blob, `${filename}.pdf`)
      }
    } catch (err) {
      console.error("Export failed:", err)
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
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
          <TabsTrigger value="privacy" className="gap-1">
            <Shield className="h-3.5 w-3.5" /> Приватность
          </TabsTrigger>
          <TabsTrigger value="subscription" className="gap-1">
            <CreditCard className="h-3.5 w-3.5" /> Подписка
          </TabsTrigger>
          <TabsTrigger value="account" className="gap-1">
            <Key className="h-3.5 w-3.5" /> Аккаунт
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
              <Button>Сохранить профиль</Button>
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
                      <Clock className="h-4 w-4 text-muted-foreground" />
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
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data */}
        <TabsContent value="data" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Экспорт данных</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-3">
                {([
                  { value: "json" as const, label: "JSON", icon: FileText, desc: "Полные данные" },
                  { value: "csv" as const, label: "CSV", icon: FileText, desc: "Таблица для Excel" },
                  { value: "pdf" as const, label: "PDF", icon: FileText, desc: "Документ" },
                ]).map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setExportFormat(f.value)}
                    className={`flex flex-col items-center gap-2 rounded-xl p-4 transition-all ${
                      exportFormat === f.value
                        ? "bg-primary/10 ring-2 ring-primary"
                        : "bg-secondary hover:bg-secondary/80"
                    }`}
                  >
                    <f.icon className="h-5 w-5" />
                    <span className="text-sm font-medium">{f.label}</span>
                    <span className="text-[10px] text-muted-foreground">{f.desc}</span>
                  </button>
                ))}
              </div>
              <Button onClick={handleExport} disabled={isExporting} className="w-full gap-2">
                {isExporting ? (
                  <><Loader2 className="h-4 w-4 animate-spin" /> Экспорт...</>
                ) : (
                  <><Download className="h-4 w-4" /> Экспорт ({exportFormat.toUpperCase()})</>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Импорт данных</CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full gap-2">
                <Upload className="h-4 w-4" /> Импорт из файла
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Поддерживаются форматы JSON и CSV из CBT OS
              </p>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Резервное копирование</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                <div className="flex items-center gap-3">
                  <HardDrive className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Последний бэкап</p>
                    <p className="text-xs text-muted-foreground">18 июня 2026, 23:45</p>
                  </div>
                </div>
                <Badge variant="outline" className="bg-green-50 text-green-700">Активен</Badge>
              </div>
              <Button variant="outline" className="w-full gap-2">
                <RefreshCw className="h-4 w-4" /> Создать бэкап сейчас
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Статус синхронизации</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-green-800">Все синхронизировано</p>
                  <p className="text-xs text-green-600">Последняя синхронизация: 5 мин назад</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Privacy */}
        <TabsContent value="privacy" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Хранение данных</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Срок хранения данных</Label>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  {([
                    { value: 90, label: "3 месяца" },
                    { value: 180, label: "6 месяцев" },
                    { value: 365, label: "1 год" },
                  ]).map((r) => (
                    <button
                      key={r.value}
                      onClick={() => setDataRetention(r.value)}
                      className={`rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                        dataRetention === r.value
                          ? "bg-primary/10 ring-2 ring-primary"
                          : "bg-secondary hover:bg-secondary/80"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Шифрование данных</p>
                  <p className="text-sm text-muted-foreground">AES-256 шифрование всех записей</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={encryption ? "default" : "secondary"} className="gap-1">
                    <Lock className="h-3 w-3" />
                    {encryption ? "Включено" : "Выключено"}
                  </Badge>
                  <button
                    onClick={() => setEncryption(!encryption)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      encryption ? "bg-primary" : "bg-secondary"
                    }`}
                    role="switch"
                    aria-checked={encryption}
                    aria-label="Шифрование данных"
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        encryption ? "translate-x-6" : "translate-x-1"
                      }`}
                    />
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Подключённые устройства</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {[
                { name: "MacBook Pro", system: "macOS 15.0", lastActive: "Сейчас", current: true },
                { name: "iPhone 15", system: "iOS 19.0", lastActive: "2 часа назад", current: false },
              ].map((device) => (
                <div key={device.name} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{device.name}</p>
                        {device.current && <Badge variant="outline" className="text-[10px]">Текущее</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">{device.system} • {device.lastActive}</p>
                    </div>
                  </div>
                  {!device.current && (
                    <Button variant="ghost" size="sm" className="text-destructive text-xs">
                      Отвязать
                    </Button>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Subscription */}
        <TabsContent value="subscription" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Текущий план</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 rounded-xl bg-primary/5">
                <div>
                  <p className="font-semibold text-deep-charcoal">Free</p>
                  <p className="text-sm text-muted-foreground">5 записей в месяц</p>
                </div>
                <Badge variant="outline">Текущий</Badge>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-deep-charcoal">3</p>
                  <p className="text-xs text-muted-foreground">Записи этом месяце</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-deep-charcoal">12</p>
                  <p className="text-xs text-muted-foreground">Всего записей</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-deep-charcoal">5</p>
                  <p className="text-xs text-muted-foreground">Инсайтов</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-primary">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Pro</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-3xl font-bold text-deep-charcoal">499₽<span className="text-sm font-normal text-muted-foreground">/мес</span></p>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Без ограничений на записи</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Полная карта паттернов</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> AI-рефлексия и инсайты</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Расширенная аналитика</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Все упражнения</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Голосовой дневник</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-green-500" /> Экспорт данных</li>
              </ul>
              <Button className="w-full gap-2">
                <Sparkles className="h-4 w-4" />
                Обновиться до Pro
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Account */}
        <TabsContent value="account" className="space-y-4 mt-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="text-lg">Безопасность</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-between" onClick={() => setShowPasswordDialog(true)}>
                <span className="flex items-center gap-2"><Key className="h-4 w-4" /> Изменить пароль</span>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button variant="outline" className="w-full justify-between" onClick={() => setShow2FA(true)}>
                <span className="flex items-center gap-2"><Lock className="h-4 w-4" /> Двухфакторная аутентификация</span>
                <Badge variant="outline" className="text-[10px]">Выкл</Badge>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass-card border-destructive/50">
            <CardHeader>
              <CardTitle className="text-lg text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Опасная зона
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full" onClick={() => setShowDeleteDialog(true)}>
                Удалить аккаунт
              </Button>
              <p className="text-xs text-muted-foreground mt-2 text-center">
                Это действие необратимо. Все данные будут удалены.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Изменить пароль</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="current-password">Текущий пароль</Label>
              <div className="relative mt-1">
                <Input id="current-password" type={showPassword ? "text" : "password"} placeholder="Введите текущий пароль" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div>
              <Label htmlFor="new-password">Новый пароль</Label>
              <Input id="new-password" type="password" placeholder="Минимум 8 символов" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="confirm-password">Подтвердите пароль</Label>
              <Input id="confirm-password" type="password" placeholder="Повторите новый пароль" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Отмена</Button>
            <Button onClick={() => setShowPasswordDialog(false)}>Изменить пароль</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 2FA Dialog */}
      <Dialog open={show2FA} onOpenChange={setShow2FA}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Двухфакторная аутентификация</DialogTitle>
            <DialogDescription>
              Добавьте дополнительный уровень безопасности к вашему аккаунту.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-secondary/50 text-center">
              <Lock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">
                2FA ещё не настроена. Используйте приложение-аутентификатор (Google Authenticator, Authy) для сканирования QR-кода.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShow2FA(false)}>Отмена</Button>
            <Button onClick={() => setShow2FA(false)}>Настроить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Account Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Удалить аккаунт?
            </DialogTitle>
            <DialogDescription>
              Это действие необратимо. Все ваши данные, записи, паттерны и настройки будут удалены навсегда.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="p-3 rounded-xl bg-destructive/5 border border-destructive/20">
              <p className="text-sm text-destructive font-medium">Будет удалено:</p>
              <ul className="text-sm text-muted-foreground mt-1 space-y-1">
                <li>• Все записи дневника (12 записей)</li>
                <li>• AI-инсайты и рекомендации</li>
                <li>• Паттерны и аналитика</li>
                <li>• Профиль и настройки</li>
              </ul>
            </div>
            <div>
              <Label htmlFor="confirm-delete">Введите «УДАЛИТЬ» для подтверждения</Label>
              <Input id="confirm-delete" placeholder="УДАЛИТЬ" className="mt-1" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Отмена</Button>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(false)}>Удалить аккаунт</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
