"use client"

import { sendNotification, isSupported } from "./service"

const STORAGE_KEY = "cbt-os-scheduled-timers"
let timers: ReturnType<typeof setTimeout>[] = []

function storeTimer(id: ReturnType<typeof setTimeout>) {
  timers.push(id)
}

function getTimers(): ReturnType<typeof setTimeout>[] {
  return timers
}

function msUntil(hour: number, minute: number): number {
  const now = new Date()
  const target = new Date()
  target.setHours(hour, minute, 0, 0)
  if (target <= now) target.setDate(target.getDate() + 1)
  return target.getTime() - now.getTime()
}

export function scheduleReminder(time: string): void {
  if (!isSupported()) return
  const [h, m] = time.split(":").map(Number)
  const delay = msUntil(h, m)
  const id = scheduleNotification(
    "CBT OS",
    "Не забудьте записать свои мысли в дневник 📝",
    delay
  )
  if (id) storeTimer(id)
}

export function scheduleWeeklySummary(): void {
  if (!isSupported()) return
  const now = new Date()
  const sunday = new Date()
  sunday.setDate(now.getDate() + (7 - now.getDay()) % 7 || 7)
  sunday.setHours(19, 0, 0, 0)
  const delay = sunday.getTime() - now.getTime()
  const id = setTimeout(() => {
    sendNotification(
      "CBT OS — Итоги недели",
      "Посмотрите свой прогресс за неделю 📊"
    )
  }, delay)
  storeTimer(id)
}

function scheduleNotification(
  title: string,
  body: string,
  delay: number
): ReturnType<typeof setTimeout> | null {
  if (!isSupported() || Notification.permission !== "granted") return null
  return setTimeout(() => sendNotification(title, body), delay)
}

export function cancelAll(): void {
  for (const id of getTimers()) {
    clearTimeout(id)
  }
  timers = []
  if (typeof localStorage !== "undefined") {
    localStorage.removeItem(STORAGE_KEY)
  }
}
