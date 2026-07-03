"use client"

import { useState, useEffect } from "react"

export function useClientDate() {
  const [mounted, setMounted] = useState(false)
  const [now, setNow] = useState<Date | null>(null)

  useEffect(() => {
    setMounted(true)
    setNow(new Date())
    const interval = setInterval(() => setNow(new Date()), 60000)
    return () => clearInterval(interval)
  }, [])

  return { mounted, now }
}

export function useFormattedDate(format: Intl.DateTimeFormatOptions) {
  const { mounted, now } = useClientDate()

  if (!mounted || !now) return ""

  return now.toLocaleDateString("ru-RU", format)
}

export function useRelativeTime(dateStr: string) {
  const { mounted, now } = useClientDate()

  if (!mounted || !now) return ""

  const diff = now.getTime() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)

  if (hours < 1) return "Только что"
  if (hours < 24) return `Сегодня, ${new Date(dateStr).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
  if (hours < 48) return `Вчера, ${new Date(dateStr).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" })}`
  return `${Math.floor(hours / 24)} дн. назад`
}
