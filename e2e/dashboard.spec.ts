import { test, expect } from "@playwright/test"

test.describe("CBT OS — Dashboard", () => {
  test("loads dashboard page", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("text=Панель")).toBeVisible({ timeout: 15000 })
  })

  test("shows mood picker", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("text=Как ваше настроение сейчас?")).toBeVisible({ timeout: 15000 })
  })

  test("shows streak section", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("text=дней подряд")).toBeVisible({ timeout: 15000 })
  })

  test("shows weekly stats", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("text=Записей за неделю")).toBeVisible({ timeout: 15000 })
  })

  test("shows AI insight section", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("text=AI-инсайт")).toBeVisible({ timeout: 15000 })
  })

  test("shows recent entries", async ({ page }) => {
    await page.goto("/dashboard")
    await expect(page.locator("text=Последние записи")).toBeVisible({ timeout: 15000 })
  })

  test("navigation links work", async ({ page }) => {
    await page.goto("/dashboard")
    const journalLink = page.locator('a[href="/journal"], nav >> text=Дневник')
    await expect(journalLink.first()).toBeVisible({ timeout: 15000 })
  })
})

test.describe("CBT OS — Journal", () => {
  test("loads journal page", async ({ page }) => {
    await page.goto("/journal")
    await expect(page.getByRole("heading", { name: "Дневник" })).toBeVisible({ timeout: 15000 })
  })

  test("shows entries list", async ({ page }) => {
    await page.goto("/journal")
    await expect(page.locator("text=Новая запись").first()).toBeVisible({ timeout: 15000 })
  })
})

test.describe("CBT OS — Patterns", () => {
  test("loads patterns page", async ({ page }) => {
    await page.goto("/patterns")
    await expect(page.locator("text=Паттерны")).toBeVisible({ timeout: 15000 })
  })
})

test.describe("CBT OS — Analytics", () => {
  test("loads analytics page", async ({ page }) => {
    await page.goto("/analytics")
    await expect(page.locator("text=Аналитика")).toBeVisible({ timeout: 15000 })
  })
})

test.describe("CBT OS — Settings", () => {
  test("loads settings page", async ({ page }) => {
    await page.goto("/settings")
    await expect(page.locator("text=Настройки")).toBeVisible({ timeout: 15000 })
  })
})

test.describe("CBT OS — Responsive", () => {
  test("mobile viewport renders dashboard", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 })
    await page.goto("/dashboard")
    await expect(page.locator("text=Панель")).toBeVisible({ timeout: 15000 })
  })
})

test.describe("CBT OS — Performance", () => {
  test("page loads under 5 seconds", async ({ page }) => {
    const start = Date.now()
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    const duration = Date.now() - start
    expect(duration).toBeLessThan(5000)
  })

  test("no console errors on dashboard", async ({ page }) => {
    const errors: string[] = []
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text())
    })
    await page.goto("/dashboard")
    await page.waitForLoadState("networkidle")
    expect(errors.filter((e) => !e.includes("favicon"))).toHaveLength(0)
  })
})
