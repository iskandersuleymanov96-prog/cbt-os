# CBT OS — Next Iteration Prompt

## Overview

This document details the next development iteration for CBT OS: transitioning from mock data to a fully functional production application with real Supabase backend, AI integration, and essential features.

## Current State (v0.1.0)

- 14 pages built with mock data
- 4 Zustand stores (client-side only)
- 16 shadcn/ui components
- Supabase auth middleware (configured but not active)
- No real database, no real API calls

## Target State (v0.2.0)

- Real Supabase PostgreSQL database with RLS
- Full CRUD for all entities
- AI-powered journal analysis and chat
- Pattern detection engine
- Voice journaling
- PDF export
- Push notifications
- Dark mode
- Testing suite
- CI/CD pipeline

---

## Phase 1: Supabase Foundation

### 1.1 Project Setup

```bash
# Initialize Supabase locally
npx supabase init
npx supabase start

# Link to remote project
npx supabase link --project-ref your-project-ref
```

### 1.2 Environment Configuration

Create `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-local-service-role-key

# For production
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-production-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-production-service-role-key
```

### 1.3 Database Migration

Run the initial migration:

```bash
npx supabase db push
# or for versioned migrations:
npx supabase migration up
```

**Key tables to create:**

1. `user_settings` — User preferences (theme, notifications, AI coaching)
2. `journal_entries` — CBT journal entries (10+ fields)
3. `emotions` — Emotion catalog (name, category, color, icon)
4. `entry_emotions` — Many-to-many: entries ↔ emotions
5. `distortions` — Cognitive distortions catalog
6. `entry_distortions` — Many-to-many: entries ↔ distortions (with confidence)
7. `triggers` — User triggers (name, category, frequency)
8. `patterns` — Detected patterns (type, strength, frequency)
9. `exercises` — Exercise catalog
10. `weekly_reports` — Generated weekly summaries
11. `monthly_reports` — Generated monthly summaries
12. `ai_insights` — AI-generated insights
13. `ai_messages` — AI chat history
14. `subscriptions` — User subscription plans

### 1.4 Row Level Security

Enable RLS on ALL tables. Key policies:

```sql
-- Example: journal_entries
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own entries"
  ON journal_entries FOR DELETE
  USING (auth.uid() = user_id);
```

### 1.5 Seed Data

Populate catalog tables:

- **emotions**: 15 emotions (5 positive, 5 negative, 5 neutral)
- **distortions**: 10 cognitive distortions with descriptions
- **exercises**: 9 exercises across 6 categories

---

## Phase 2: Real Data Integration

### 2.1 Supabase Client Setup

Update `src/lib/supabase/client.ts` and `src/lib/supabase/server.ts` with proper environment variable handling.

### 2.2 Zustand Store Refactoring

Transform each store to use Supabase as the data source:

```typescript
// Example: Journal Store
export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  currentEntry: null,
  isLoading: false,
  error: null,

  // Fetch entries from Supabase
  fetchEntries: async (page = 1, limit = 20) => {
    set({ isLoading: true, error: null })
    try {
      const { data, error } = await supabase
        .from('journal_entries')
        .select(`
          *,
          entry_emotions(emotions(*)),
          entry_distortions(distortions(*))
        `)
        .order('created_at', { ascending: false })
        .range((page - 1) * limit, page * limit - 1)

      if (error) throw error
      set({ entries: data ?? [], isLoading: false })
    } catch (error) {
      set({ error: error.message, isLoading: false })
    }
  },

  // Optimistic create
  addEntry: async (entry) => {
    const optimisticEntry = { ...entry, id: crypto.randomUUID() }
    set((state) => ({ entries: [optimisticEntry, ...state.entries] }))

    const { data, error } = await supabase
      .from('journal_entries')
      .insert(entry)
      .select()
      .single()

    if (error) {
      // Rollback
      set((state) => ({
        entries: state.entries.filter(e => e.id !== optimisticEntry.id)
      }))
      throw error
    }

    // Replace optimistic with real data
    set((state) => ({
      entries: state.entries.map(e =>
        e.id === optimisticEntry.id ? data : e
      )
    }))
  },

  // ... similar for update, delete, etc.
}))
```

### 2.3 Page Updates

Update each page to use store methods instead of mock data:

| Page | Changes Required |
|------|-----------------|
| `/dashboard` | Fetch real entries, streaks, stats |
| `/journal` | Fetch entries with search/filter |
| `/journal/new` | Submit to Supabase, trigger AI analysis |
| `/patterns` | Fetch detected patterns |
| `/ai` | Connect to Edge Function for chat |
| `/analytics` | Fetch real analytics data |
| `/distortions` | Fetch from database (still catalog) |
| `/exercises` | Fetch from database (still catalog) |
| `/settings` | Fetch/update user settings |

### 2.4 Auth Integration

Complete the auth flow:

1. **Login/Signup page**: Connect to `supabase.auth.signInWithPassword()`
2. **OAuth providers**: Add Google sign-in
3. **Session persistence**: Handle token refresh
4. **Protected routes**: Middleware already configured

```typescript
// src/app/auth/page.tsx updates
const handleLogin = async () => {
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })
  if (!error) router.push('/dashboard')
}

const handleGoogleLogin = async () => {
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  })
}
```

---

## Phase 3: AI Layer

### 3.1 OpenAI/OpenRouter Integration

Create Supabase Edge Function for AI chat:

```typescript
// supabase/functions/ai-chat/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  const { message, conversationHistory } = await req.json()

  // Get user context
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Fetch user's recent entries, patterns, distortions
  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(10)

  const { data: patterns } = await supabase
    .from('patterns')
    .select('*')
    .eq('user_id', userId)

  // Build system prompt
  const systemPrompt = buildCBTSystemPrompt(entries, patterns)

  // Call OpenAI with streaming
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        ...conversationHistory,
        { role: 'user', content: message },
      ],
      stream: true,
    }),
  })

  // Stream response back
  return new Response(response.body, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
})
```

### 3.2 Journal Entry AI Analysis

When a user saves a journal entry, automatically analyze it:

```typescript
// Edge Function: ai-analyze-entry
const analyzeEntry = async (entry) => {
  const response = await openai.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      {
        role: 'system',
        content: `Проанализируй запись КПТ-дневника и определи:
1. Какие когнитивные искажения присутствуют (из списка: катастрофизация, чтение мыслей, чёрно-белое мышление, обобщение, эмоциональное рассуждение, персонализация, обесценивание позитива, долженствование, маркировка, предсказание будущего)
2. Предложи альтернативную мысль
3. Оцени уровень инсights (high/medium/low)

Ответь в JSON формате:
{
  "distortions": [{"name": "...", "confidence": 0.8}],
  "alternative_thought": "...",
  "insight_level": "medium"
}`
      },
      {
        role: 'user',
        content: `Ситуация: ${entry.situation}
Эмоция: ${entry.emotion}
Автоматическая мысль: ${entry.automatic_thought}
Доказательства за: ${entry.evidence_supporting}
Доказательства против: ${entry.evidence_against}`
      }
    ],
    response_format: { type: 'json_object' },
  })

  return JSON.parse(response.choices[0].message.content)
}
```

### 3.3 Pattern Detection Engine

```typescript
// Edge Function: detect-patterns
const detectPatterns = async (userId) => {
  // Fetch last 30 entries
  const entries = await fetchEntries(userId, 30)

  // Extract features
  const features = entries.map(e => ({
    emotions: e.emotions,
    distortions: e.distortions,
    triggers: extractTriggers(e.situation),
    behaviors: extractBehaviors(e.behavior),
  }))

  // Find clusters (simplified - use proper NLP in production)
  const patterns = []

  // Emotion patterns
  const emotionFreq = countFrequency(features.flatMap(f => f.emotions))
  for (const [emotion, count] of Object.entries(emotionFreq)) {
    if (count >= 3) {
      patterns.push({
        type: 'emotion',
        name: emotion,
        frequency: count,
        strength: calculateStrength(entries, emotion),
      })
    }
  }

  // Similar for distortions, triggers, behaviors...

  // Upsert patterns
  await supabase.from('patterns').upsert(patterns, {
    onConflict: 'user_id,type,name',
  })
}
```

### 3.4 AI Store Integration

Update `src/stores/ai.ts` to use real API:

```typescript
export const useAIStore = create<AIState>((set, get) => ({
  insights: [],
  messages: [],
  isTyping: false,

  sendMessage: async (content: string) => {
    const userMessage = {
      id: crypto.randomUUID(),
      role: 'user' as const,
      content,
      timestamp: new Date().toISOString(),
    }

    set((state) => ({
      messages: [...state.messages, userMessage],
      isTyping: true,
    }))

    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: get().messages.slice(-10),
        }),
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()
      let assistantContent = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        assistantContent += decoder.decode(value)
        // Update UI in real-time
      }

      const assistantMessage = {
        id: crypto.randomUUID(),
        role: 'assistant' as const,
        content: assistantContent,
        timestamp: new Date().toISOString(),
      }

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isTyping: false,
      }))
    } catch (error) {
      set({ isTyping: false })
    }
  },
}))
```

---

## Phase 4: Voice Journaling

### 4.1 Web Speech API Integration

```typescript
// src/lib/speech.ts
export class SpeechRecognizer {
  private recognition: SpeechRecognition | null = null
  private isRecording = false

  constructor() {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      this.recognition = new SpeechRecognition()
      this.recognition.lang = 'ru-RU'
      this.recognition.continuous = true
      this.recognition.interimResults = true
    }
  }

  start(onResult: (transcript: string, isFinal: boolean) => void) {
    if (!this.recognition) return

    this.recognition.onresult = (event) => {
      const last = event.results[event.results.length - 1]
      const transcript = last[0].transcript
      onResult(transcript, last.isFinal)
    }

    this.recognition.start()
    this.isRecording = true
  }

  stop(): string {
    this.recognition?.stop()
    this.isRecording = false
    return this.recognition?.result || ''
  }
}
```

### 4.2 Voice Button Component

```typescript
// src/components/voice-button.tsx
export function VoiceButton({ onTranscript }: { onTranscript: (text: string) => void }) {
  const [isRecording, setIsRecording] = useState(false)
  const recognizer = useRef(new SpeechRecognizer())

  const toggleRecording = () => {
    if (isRecording) {
      recognizer.current.stop()
      setIsRecording(false)
    } else {
      recognizer.current.start((text, isFinal) => {
        if (isFinal) onTranscript(text)
      })
      setIsRecording(true)
    }
  }

  return (
    <Button
      variant={isRecording ? 'destructive' : 'outline'}
      size="icon"
      onClick={toggleRecording}
      className={isRecording ? 'animate-pulse' : ''}
    >
      {isRecording ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
    </Button>
  )
}
```

### 4.3 Integration into Journal Entry

Add voice input to the situation text area:

```typescript
// In journal/new/page.tsx, step 0
<div className="relative">
  <Textarea
    id="situation"
    placeholder="Опишите ситуацию..."
    value={form.situation}
    onChange={(e) => updateForm('situation', e.target.value)}
  />
  <div className="absolute right-2 bottom-2">
    <VoiceButton
      onTranscript={(text) => updateForm('situation', form.situation + ' ' + text)}
    />
  </div>
</div>
```

---

## Phase 5: PDF Export

### 5.1 PDF Generation with jsPDF

```typescript
// src/lib/pdf.ts
import jsPDF from 'jspdf'
import { format } from 'date-fns'
import { ru } from 'date-fns/locale'

export async function generateJournalPDF(entries: JournalEntry[]) {
  const doc = new jsPDF()

  // Title
  doc.setFontSize(24)
  doc.text('CBT OS — Дневник', 20, 20)

  doc.setFontSize(10)
  doc.text(`Экспорт: ${format(new Date(), 'd MMMM yyyy', { locale: ru })}`, 20, 30)

  let y = 50

  for (const entry of entries) {
    if (y > 260) {
      doc.addPage()
      y = 20
    }

    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(format(new Date(entry.created_at), 'd MMMM yyyy, HH:mm', { locale: ru }), 20, y)
    y += 8

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(10)

    doc.text(`Эмоция: ${entry.emotion} (${entry.emotion_intensity}/10)`, 20, y)
    y += 6

    doc.text(`Настроение: ${entry.mood}/5 | Стресс: ${entry.stress}/10 | Тревога: ${entry.anxiety}/10`, 20, y)
    y += 8

    doc.setFont('helvetica', 'bold')
    doc.text('Ситуация:', 20, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const situationLines = doc.splitTextToSize(entry.situation, 170)
    doc.text(situationLines, 20, y)
    y += situationLines.length * 5 + 4

    doc.setFont('helvetica', 'bold')
    doc.text('Автоматическая мысль:', 20, y)
    y += 6
    doc.setFont('helvetica', 'normal')
    const thoughtLines = doc.splitTextToSize(entry.automatic_thought, 170)
    doc.text(thoughtLines, 20, y)
    y += thoughtLines.length * 5 + 4

    if (entry.alternative_thought) {
      doc.setFont('helvetica', 'bold')
      doc.text('Альтернативная мысль:', 20, y)
      y += 6
      doc.setFont('helvetica', 'normal')
      const altLines = doc.splitTextToSize(entry.alternative_thought, 170)
      doc.text(altLines, 20, y)
      y += altLines.length * 5 + 4
    }

    y += 6
  }

  return doc.output('blob')
}
```

### 5.2 Export Button in Settings

```typescript
// In settings/page.tsx
const handleExportPDF = async () => {
  const { data: entries } = await supabase
    .from('journal_entries')
    .select('*')
    .order('created_at', { ascending: false })

  const pdf = await generateJournalPDF(entries)
  const url = URL.createObjectURL(pdf)
  const a = document.createElement('a')
  a.href = url
  a.download = `cbt-os-export-${format(new Date(), 'yyyy-MM-dd')}.pdf`
  a.click()
}
```

---

## Phase 6: Push Notifications

### 6.1 Web Push Setup

```typescript
// src/lib/notifications.ts
export async function requestNotificationPermission() {
  if (!('Notification' in window)) return false

  const permission = await Notification.requestPermission()
  return permission === 'granted'
}

export async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    const registration = await navigator.serviceWorker.register('/sw.js')
    return registration
  }
}

export async function subscribeToPush(userId: string) {
  const registration = await navigator.serviceWorker.ready
  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: process.env.NEXT_PUBLIC_VAPID_KEY,
  })

  // Store subscription in Supabase
  await supabase.from('push_subscriptions').upsert({
    user_id: userId,
    endpoint: subscription.endpoint,
    keys: JSON.parse(JSON.stringify(subscription)),
  })
}
```

### 6.2 Notification Scheduler

```typescript
// Edge Function: send-notifications (cron job)
const sendReminders = async () => {
  const now = new Date()
  const hour = now.getHours()

  // Get users with reminders set for this hour
  const { data: users } = await supabase
    .from('user_settings')
    .select('user_id, notification_time')
    .eq('notifications', true)
    .filter('notification_time', 'like', `${hour}:%`)

  for (const user of users) {
    const { data: subscription } = await supabase
      .from('push_subscriptions')
      .select('*')
      .eq('user_id', user.user_id)
      .single()

    if (subscription) {
      await sendPushNotification(subscription, {
        title: 'CBT OS',
        body: 'Не забудьте записать свои мысли сегодня!',
        icon: '/icon-192.png',
      })
    }
  }
}
```

---

## Phase 7: Dark Mode

### 7.1 Theme System

```typescript
// src/lib/theme.ts
type Theme = 'light' | 'dark' | 'system'

export function setTheme(theme: Theme) {
  const root = document.documentElement

  if (theme === 'system') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    root.classList.toggle('dark', prefersDark)
  } else {
    root.classList.toggle('dark', theme === 'dark')
  }

  localStorage.setItem('theme', theme)
}

export function getTheme(): Theme {
  return (localStorage.getItem('theme') as Theme) || 'system'
}
```

### 7.2 Tailwind Dark Mode

Update `globals.css`:

```css
@import "tailwindcss";

@theme {
  /* Light theme (default) */
  --color-background: #fafafa;
  --color-foreground: #1a1a1a;
  /* ... */
}

@variant dark (&:is(.dark *)) {
  @theme {
    --color-background: #0a0a0a;
    --color-foreground: #fafafa;
    --color-card: #1a1a1a;
    --color-card-foreground: #fafafa;
    --color-primary: #6b8fc7;
    --color-secondary: #1f1f1f;
    --color-muted: #1f1f1f;
    --color-muted-foreground: #a3a3a3;
    --color-border: #2a2a2a;
    --color-warm-white: #0a0a0a;
    --color-deep-charcoal: #fafafa;
  }
}
```

### 7.3 Theme Toggle Component

```typescript
// src/components/theme-toggle.tsx
export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => {
    setThemeState(getTheme())
  }, [])

  return (
    <div className="flex gap-2">
      <Button
        variant={theme === 'light' ? 'default' : 'outline'}
        size="sm"
        onClick={() => { setTheme('light'); setThemeState('light') }}
      >
        <Sun className="h-4 w-4" />
      </Button>
      <Button
        variant={theme === 'dark' ? 'default' : 'outline'}
        size="sm"
        onClick={() => { setTheme('dark'); setThemeState('dark') }}
      >
        <Moon className="h-4 w-4" />
      </Button>
    </div>
  )
}
```

---

## Phase 8: Testing

### 8.1 Testing Stack

```json
{
  "devDependencies": {
    "@testing-library/react": "^16.0.0",
    "@testing-library/jest-dom": "^6.0.0",
    "vitest": "^2.0.0",
    "@vitejs/plugin-react": "^4.0.0",
    "msw": "^2.0.0",
    "playwright": "^1.40.0"
  }
}
```

### 8.2 Unit Tests (Vitest)

```typescript
// src/stores/__tests__/journal.test.ts
import { describe, it, expect, beforeEach } from 'vitest'
import { useJournalStore } from '../journal'

describe('Journal Store', () => {
  beforeEach(() => {
    useJournalStore.setState({ entries: [], currentEntry: null })
  })

  it('adds entry optimistically', async () => {
    const entry = { id: '1', situation: 'Test', created_at: new Date().toISOString() }
    useJournalStore.getState().addEntry(entry)
    expect(useJournalStore.getState().entries).toHaveLength(1)
  })

  it('removes entry', () => {
    useJournalStore.setState({ entries: [{ id: '1' }] as any })
    useJournalStore.getState().removeEntry('1')
    expect(useJournalStore.getState().entries).toHaveLength(0)
  })
})
```

### 8.3 Integration Tests (MSW)

```typescript
// src/__tests__/journal-page.test.tsx
import { render, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { server } from '../mocks/server'
import JournalPage from '@/app/journal/page'

const mockEntries = [
  { id: '1', situation: 'Test entry', emotion: 'Тревога' },
]

server.use(
  http.get('/api/journal', () => {
    return HttpResponse.json(mockEntries)
  })
)

it('renders journal entries', async () => {
  render(<JournalPage />)
  await waitFor(() => {
    expect(screen.getByText('Test entry')).toBeInTheDocument()
  })
})
```

### 8.4 E2E Tests (Playwright)

```typescript
// e2e/journal.spec.ts
import { test, expect } from '@playwright/test'

test('user can create journal entry', async ({ page }) => {
  await page.goto('/auth')
  await page.fill('input[type="email"]', 'test@example.com')
  await page.fill('input[type="password"]', 'password123')
  await page.click('button[type="submit"]')

  await page.goto('/journal/new')
  await page.fill('textarea', 'Тестовая ситуация')
  await page.click('text=Далее')

  // ... complete wizard

  await expect(page.locator('text=Сохранить')).toBeVisible()
})
```

---

## Phase 9: CI/CD Pipeline

### 9.1 GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint

  typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run typecheck

  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm test

  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e

  build:
    runs-on: ubuntu-latest
    needs: [lint, typecheck, test]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run build
```

### 9.2 Vercel Deployment

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Phase 10: Performance Monitoring

### 10.1 Vercel Analytics

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react'
import { SpeedInsights } from '@vercel/speed-insights/next'

export default function RootLayout({ children }) {
  return (
    <html lang="ru">
      <body>
        <TooltipProvider>{children}</TooltipProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
```

### 10.2 Custom Metrics

```typescript
// src/lib/metrics.ts
export function trackEvent(name: string, properties?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', name, properties)
  }
}

// Usage in components
trackEvent('journal_entry_created', {
  has_alternative_thought: !!entry.alternative_thought,
  distortion_count: entry.distortions.length,
})
```

### 10.3 Error Tracking (Sentry)

```typescript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  tracesSampleRate: 0.1,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
})
```

---

## Implementation Order

| Priority | Phase | Effort | Dependencies |
|----------|-------|--------|--------------|
| P0 | Supabase Foundation | 2 days | None |
| P0 | Real Data Integration | 3 days | Phase 1 |
| P0 | Auth Integration | 1 day | Phase 1 |
| P1 | AI Layer | 3 days | Phase 2 |
| P1 | Dark Mode | 0.5 days | None |
| P2 | Voice Journaling | 1 day | Phase 2 |
| P2 | PDF Export | 1 day | Phase 2 |
| P2 | Pattern Detection | 2 days | Phase 2, 3 |
| P3 | Push Notifications | 1 day | Phase 1 |
| P3 | Testing | 2 days | Phase 2 |
| P3 | CI/CD | 0.5 days | None |
| P3 | Performance Monitoring | 0.5 days | None |

**Total estimated effort: ~17 days**

---

## Success Criteria

- [ ] All pages use real Supabase data (no mock data)
- [ ] Auth flow works (login, signup, logout, session persistence)
- [ ] RLS policies prevent cross-user data access
- [ ] AI chat responds with streaming
- [ ] Journal entries are analyzed for distortions automatically
- [ ] Patterns are detected and displayed
- [ ] Dark mode works across all pages
- [ ] Voice input works in journal entry
- [ ] PDF export generates correct documents
- [ ] All tests pass (unit + integration + e2e)
- [ ] CI/CD pipeline runs on every PR
- [ ] No console errors in production
- [ ] Lighthouse score > 90 on all metrics
