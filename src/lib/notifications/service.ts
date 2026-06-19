"use client"

export function isSupported(): boolean {
  if (typeof window === "undefined") return false
  return "Notification" in window
}

export async function requestPermission(): Promise<NotificationPermission> {
  if (!isSupported()) return "denied"
  if (Notification.permission === "granted") return "granted"
  if (Notification.permission === "denied") return "denied"
  return await Notification.requestPermission()
}

export function sendNotification(
  title: string,
  body: string,
  icon?: string
): void {
  if (!isSupported() || Notification.permission !== "granted") return
  new Notification(title, { body, icon: icon ?? "/favicon.ico" })
}

export function scheduleNotification(
  title: string,
  body: string,
  delay: number
): ReturnType<typeof setTimeout> | null {
  if (!isSupported() || Notification.permission !== "granted") return null
  return setTimeout(() => sendNotification(title, body), delay)
}
