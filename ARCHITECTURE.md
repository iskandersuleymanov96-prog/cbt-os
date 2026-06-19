# CBT OS — System Architecture

## System Overview

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENT (Browser)                          │
│  ┌───────────────────────────────────────────────────────────────┐  │
│  │                    Next.js 16 (React 19)                     │  │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────┐  │  │
│  │  │   Pages      │ │  Components  │ │     Zustand Stores   │  │  │
│  │  │  (App Dir)   │ │  (shadcn/ui) │ │ journal│user│ui│ai   │  │  │
│  │  └──────┬───────┘ └──────┬───────┘ └──────────┬───────────┘  │  │
│  │         │                │                    │               │  │
│  │  ┌──────┴────────────────┴────────────────────┴───────────┐  │  │
│  │  │              Supabase Client (@supabase/ssr)           │  │  │
│  │  └────────────────────────┬───────────────────────────────┘  │  │
│  └───────────────────────────┼───────────────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────┼──────────────────────────────────────┐
│                          SERVER LAYER                               │
│  ┌───────────────────────────┼───────────────────────────────┐      │
│  │          Next.js Middleware (Auth Guard)                   │      │
│  └───────────────────────────┼───────────────────────────────┘      │
│  ┌───────────────────────────┼───────────────────────────────┐      │
│  │       Supabase Server Client (cookie-based auth)          │      │
│  └───────────────────────────┼───────────────────────────────┘      │
└──────────────────────────────┼──────────────────────────────────────┘
                               │ HTTPS
┌──────────────────────────────┼──────────────────────────────────────┐
│                     SUPABASE PLATFORM                               │
│  ┌─────────────┐  ┌──────────┴──────────┐  ┌──────────────────┐   │
│  │  Auth        │  │   PostgreSQL DB     │  │  Edge Functions  │   │
│  │  (GoTrue)    │  │   + RLS Policies    │  │  (AI / Webhooks) │   │
│  └─────────────┘  └─────────────────────┘  └──────────────────┘   │
│  ┌─────────────┐  ┌─────────────────────┐  ┌──────────────────┐   │
│  │  Storage     │  │   Realtime          │  │  Cron Jobs       │   │
│  │  (avatars)   │  │   (subscriptions)   │  │  (reports)       │   │
│  └─────────────┘  └─────────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
                               │
┌──────────────────────────────┼──────────────────────────────────────┐
│                     EXTERNAL SERVICES                               │
│  ┌─────────────┐  ┌──────────┴──────────┐  ┌──────────────────┐   │
│  │  OpenAI /    │  │   Stripe            │  │  FCM / APNs      │   │
│  │  OpenRouter  │  │   (subscriptions)   │  │  (push notify)   │   │
│  └─────────────┘  └─────────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

## Data Flow Diagrams

### 1. Journal Entry Creation Flow

```
User fills form → Client validation → Zustand optimistic update
       │
       ▼
POST /api/journal
       │
       ▼
Supabase Server Client → INSERT INTO journal_entries
       │
       ├──▶ RLS Policy Check (auth.uid() = user_id)
       │
       ▼
PostgreSQL → RETURNING * → Response to Client
       │
       ├──▶ Trigger: update_patterns() → Async pattern detection
       ├──▶ Trigger: update_streaks() → Streak calculation
       └──▶ Webhook: AI analysis → Edge Function → OpenAI
                              │
                              ▼
                     AI Insights generated
                     → Stored in ai_insights table
                     → Realtime broadcast to client
```

### 2. AI Chat Flow

```
User message → Client → POST /api/ai/chat
       │
       ▼
Edge Function (Supabase)
       │
       ├──▶ Fetch user context (last 10 entries, patterns, distortions)
       │
       ▼
Build system prompt with CBT context
       │
       ▼
OpenAI API (streaming) → SSE Response → Client
       │
       ▼
Store message in ai_messages table
       │
       └──▶ Optionally generate insights → ai_insights table
```

### 3. Pattern Detection Flow

```
New journal entry saved
       │
       ▼
Supabase Trigger → pg_cron job (or Edge Function)
       │
       ├──▶ Analyze last 30 entries for the user
       │
       ▼
Pattern Engine:
  1. Extract emotions, distortions, triggers, behaviors
  2. NLP clustering (TF-IDF + cosine similarity)
  3. Frequency analysis (daily/weekly/monthly)
  4. Strength calculation (recency-weighted)
       │
       ▼
UPSERT INTO patterns → Client notified via Realtime
```

### 4. Authentication Flow

```
┌──────────┐     ┌──────────┐     ┌──────────┐     ┌──────────┐
│  Login   │────▶│ Middleware│────▶│ Supabase │────▶│  JWT     │
│  Page    │     │ Guard    │     │ Auth     │     │  Token   │
└──────────┘     └──────────┘     └──────────┘     └──────────┘
                      │                                   │
                      ▼                                   ▼
              Cookie-based session              Stored in httpOnly
              (sb-<project-ref>-auth-token)     cookie
```

## Component Hierarchy

```
RootLayout (layout.tsx)
├── TooltipProvider
│
├── Public Routes
│   ├── / (Landing Page)
│   ├── /auth (Login/Signup)
│   └── /onboarding (5-step wizard)
│
└── Protected Routes → /dashboard/layout.tsx
    ├── Sidebar Navigation
    │   ├── Logo
    │   ├── Nav Links (7 items)
    │   └── User Section
    │
    └── Main Content Area
        ├── /dashboard (DashboardPage)
        │   ├── QuickMoodSelector
        │   ├── StreakCard
        │   ├── WeeklyStatsCard
        │   ├── AIInsightCard
        │   ├── RecentEntriesList
        │   └── QuickActionsGrid
        │
        ├── /journal (JournalPage)
        │   ├── SearchBar
        │   └── EntryList → EntryCard[]
        │
        ├── /journal/new (NewJournalEntryPage)
        │   └── 10-Step Wizard
        │       ├── SituationForm
        │       ├── EmotionSelector
        │       ├── ThoughtInput
        │       ├── BodySensationsInput
        │       ├── BehaviorInput
        │       ├── DistortionSelector (AI-assisted)
        │       ├── EvidenceForm (for/against)
        │       ├── AlternativeThoughtForm
        │       ├── ReassessmentForm
        │       └── SummaryView
        │
        ├── /patterns (PatternsPage)
        │   └── TabsView → PatternCard[]
        │       ├── Thought patterns
        │       ├── Emotion patterns
        │       ├── Trigger patterns
        │       ├── Distortion patterns
        │       └── Behavior patterns
        │
        ├── /ai (AIPage)
        │   ├── QuickPrompts
        │   ├── ChatMessages
        │   └── ChatInput
        │
        ├── /analytics (AnalyticsPage)
        │   ├── StatsCards (4)
        │   ├── MoodLineChart
        │   ├── EmotionPieChart
        │   ├── DistortionBarChart
        │   └── YearInPixels
        │
        ├── /exercises (ExercisesPage)
        │   ├── CategoryTabs
        │   ├── ExerciseGrid → ExerciseCard[]
        │   └── ExerciseDetail (inline)
        │
        ├── /distortions (DistortionsPage)
        │   ├── SearchBar
        │   └── DistortionGrid → DistortionCard[]
        │
        ├── /distortions/[slug] (DistortionDetailPage)
        │   ├── DistortionInfo
        │   ├── ExamplesList
        │   └── ChallengeCard
        │
        └── /settings (SettingsPage)
            ├── ProfileTab
            ├── PreferencesTab (theme, notifications)
            ├── SubscriptionTab
            └── PrivacyTab
```

## State Management Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Zustand Store Layer                       │
├─────────────┬───────────────┬──────────────┬───────────────┤
│  Journal    │    User       │     UI       │     AI        │
│  Store      │    Store      │     Store    │     Store     │
├─────────────┼───────────────┼──────────────┼───────────────┤
│ entries[]   │ user          │ sidebarOpen  │ insights[]    │
│ currentEntry│ settings      │ currentStep  │ messages[]    │
│ isLoading   │ isOnboarded   │              │ isTyping      │
├─────────────┼───────────────┼──────────────┼───────────────┤
│ setEntries  │ setUser       │ setSidebar   │ setInsights   │
│ addEntry    │ setSettings   │ setStep      │ addInsight    │
│ updateEntry │ setOnboarded  │ nextStep     │ addMessage    │
│ removeEntry │               │ prevStep     │ setMessages   │
│ setCurrent  │               │              │ setTyping     │
│ setLoading  │               │              │               │
└─────────────┴───────────────┴──────────────┴───────────────┘

State Flow:
  UI Events → Component → Zustand Action → State Update → Re-render
                                │
                                └──▶ Supabase mutation (future)
                                     → Optimistic update
                                     → Rollback on error
```

### Future: Zustand + Supabase Integration

```typescript
// stores/journal.ts (future pattern)
export const useJournalStore = create<JournalState>((set, get) => ({
  entries: [],
  
  fetchEntries: async () => {
    set({ isLoading: true })
    const { data } = await supabase
      .from('journal_entries')
      .select('*')
      .order('created_at', { ascending: false })
    set({ entries: data ?? [], isLoading: false })
  },

  addEntry: async (entry) => {
    // Optimistic update
    set((state) => ({ entries: [entry, ...state.entries] }))
    
    const { error } = await supabase
      .from('journal_entries')
      .insert(entry)
    
    if (error) {
      // Rollback
      set((state) => ({
        entries: state.entries.filter(e => e.id !== entry.id)
      }))
    }
  }
}))
```

## API Design (Supabase Edge Functions)

### Authentication

| Function | Method | Description |
|----------|--------|-------------|
| `/auth/callback` | GET | OAuth callback handler |
| `/auth/signup` | POST | Email/password registration |
| `/auth/login` | POST | Email/password login |
| `/auth/logout` | POST | Session termination |

### Journal

| Function | Method | Description |
|----------|--------|-------------|
| `GET /api/journal` | GET | List entries (paginated) |
| `POST /api/journal` | POST | Create entry |
| `GET /api/journal/[id]` | GET | Get single entry |
| `PUT /api/journal/[id]` | PUT | Update entry |
| `DELETE /api/journal/[id]` | DELETE | Soft delete entry |

### AI

| Function | Method | Description |
|----------|--------|-------------|
| `POST /api/ai/chat` | POST | Chat with AI (streaming) |
| `GET /api/ai/insights` | GET | Get AI insights |
| `POST /api/ai/analyze` | POST | Analyze entry for distortions |
| `GET /api/ai/patterns` | GET | Get detected patterns |

### Analytics

| Function | Method | Description |
|----------|--------|-------------|
| `GET /api/analytics/summary` | GET | Dashboard summary stats |
| `GET /api/analytics/trends` | GET | Mood/stress/anxiety trends |
| `GET /api/analytics/distortions` | GET | Distortion frequency data |
| `GET /api/analytics/reports` | GET | Weekly/monthly reports |

### Exercises

| Function | Method | Description |
|----------|--------|-------------|
| `GET /api/exercises` | GET | List exercises |
| `GET /api/exercises/[id]` | GET | Get exercise detail |
| `POST /api/exercises/[id]/complete` | POST | Log exercise completion |

### User

| Function | Method | Description |
|----------|--------|-------------|
| `GET /api/user/profile` | GET | Get user profile |
| `PUT /api/user/profile` | PUT | Update profile |
| `GET /api/user/settings` | GET | Get settings |
| `PUT /api/user/settings` | PUT | Update settings |
| `POST /api/user/export` | POST | Export all data (JSON/CSV) |
| `DELETE /api/user` | DELETE | Delete account |

## Database Schema (PostgreSQL)

See `supabase/migrations/001_initial.sql` for the complete schema.

### Entity Relationship Diagram

```
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│    users     │────<│  user_settings   │     │  emotions    │
│  (auth)      │     │                  │     │              │
└──────┬───────┘     └──────────────────┘     └──────┬───────┘
       │                                              │
       │ 1:N                                          │ N:M
       ▼                                              ▼
┌──────────────┐     ┌──────────────────┐     ┌──────────────┐
│   journal    │────<│ entry_emotions   │>────│  distortions │
│   _entries   │     │                  │     │              │
└──────┬───────┘     └──────────────────┘     └──────────────┘
       │
       ├──1:N──▶ ┌──────────────────┐
       │         │ entry_distortions│
       │         └──────────────────┘
       │
       ├──1:N──▶ ┌──────────────────┐
       │         │   ai_insights    │
       │         └──────────────────┘
       │
       └──N:M──▶ ┌──────────────────┐
                 │     patterns     │
                 └──────────────────┘

┌──────────────┐     ┌──────────────────┐
│  triggers    │     │   exercises      │
│  (user)      │     │                  │
└──────────────┘     └──────────────────┘

┌──────────────┐     ┌──────────────────┐
│weekly_reports│     │monthly_reports   │
└──────────────┘     └──────────────────┘

┌──────────────┐     ┌──────────────────┐
│subscriptions │     │  ai_messages     │
└──────────────┘     └──────────────────┘
```

## Authentication Flow

### Supabase Auth Integration

```
1. User visits /auth
       │
       ▼
2. Email/Password OR OAuth (Google)
       │
       ▼
3. Supabase Auth → JWT token
       │
       ├──▶ Stored in httpOnly cookie (sb-*-auth-token)
       │
       ▼
4. Middleware intercepts all requests
       │
       ├──▶ No cookie + protected route → Redirect to /
       ├──▶ Valid cookie → Continue to route
       └──▶ Expired token → Refresh via Supabase SSR
```

### Route Protection

| Route | Auth Required | Notes |
|-------|--------------|-------|
| `/` | No | Landing page |
| `/auth` | No | Login/Signup |
| `/onboarding` | No | First-time setup |
| `/dashboard/*` | Yes | All dashboard routes |
| `/api/*` | Yes | All API routes |

### Session Management

- **Token Storage**: httpOnly, Secure, SameSite=Lax cookies
- **Token Refresh**: Automatic via Supabase SSR middleware
- **Session Duration**: 7 days (configurable in Supabase dashboard)
- **Logout**: Clear cookies + Supabase signOut()

## AI Integration Architecture

### OpenAI / OpenRouter Integration

```
┌─────────────────────────────────────────────────┐
│              Edge Function: ai-chat              │
├─────────────────────────────────────────────────┤
│                                                  │
│  1. Validate request + auth token                │
│  2. Fetch user context:                          │
│     ├── Last 10 journal entries                  │
│     ├── Active patterns                          │
│     ├── Common distortions                       │
│     └── User goals (from onboarding)             │
│  3. Build system prompt:                         │
│     ├── CBT therapist persona                    │
│     ├── Russian language instructions            │
│     ├── User-specific context                    │
│     └── Response format rules                    │
│  4. Call OpenAI API (streaming)                  │
│  5. Stream response to client via SSE            │
│  6. Store conversation in ai_messages            │
│  7. Optionally trigger insight generation        │
│                                                  │
└─────────────────────────────────────────────────┘
```

### System Prompt Template

```typescript
const systemPrompt = `
Ты — AI-ассистент для когнитивно-поведенческой терапии (КПТ).
Твоя роль — помогать пользователю понимать свои мысли, выявлять
когнитивные искажения и находить альтернативные перспективы.

ПРАВИЛА:
1. Говори на русском языке
2. Будь эмпатичным, но объективным
3. Не ставь диагнозов
4. Задавай открытые вопросы
5. Помогай находить доказательства за и против
6. Отмечай когнитивные искажения мягко
7. Поощряй саморефлексию

КОНТЕКСТ ПОЛЬЗОВАТЕЛЯ:
- Частые искажения: {user_distortions}
- Активные паттерны: {user_patterns}
- Последние записи: {recent_entries}
- Цели: {user_goals}
`
```

### Pattern Detection Engine

```
Input: Journal Entry
       │
       ▼
┌─────────────────────────────────────────┐
│         NLP Processing Pipeline          │
├─────────────────────────────────────────┤
│                                          │
│  1. Emotion Extraction                   │
│     └── Match against emotion lexicon    │
│                                          │
│  2. Distortion Detection                 │
│     └── Keyword + context analysis       │
│                                          │
│  3. Trigger Identification               │
│     └── Extract situational triggers     │
│                                          │
│  4. Behavioral Pattern Matching          │
│     └── Compare with historical data     │
│                                          │
│  5. Pattern Strength Calculation         │
│     └── frequency × recency × consistency│
│                                          │
└─────────────────────────────────────────┘
       │
       ▼
Output: Pattern entries with strength scores
```

## Deployment Architecture

```
┌─────────────────────────────────────────────────────┐
│                   VERCEL (or similar)                │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌────────────────┐  ┌────────────────────────────┐ │
│  │  Next.js App   │  │  Edge Runtime              │ │
│  │  (SSR/SSG)     │  │  (Middleware + API Routes)  │ │
│  └────────────────┘  └────────────────────────────┘ │
│                                                      │
│  ┌────────────────────────────────────────────────┐ │
│  │  Static Assets (CDN)                           │ │
│  └────────────────────────────────────────────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
                        │
                        │ HTTPS
                        ▼
┌─────────────────────────────────────────────────────┐
│                   SUPABASE                          │
├─────────────────────────────────────────────────────┤
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Auth        │  │  Database    │  │  Storage   │ │
│  │  (GoTrue)    │  │  (Postgres)  │  │  (S3)      │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │  Edge Funcs  │  │  Realtime    │  │  Cron      │ │
│  │  (Deno)      │  │  (WebSocket) │  │  (Jobs)    │ │
│  └──────────────┘  └──────────────┘  └───────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
OPENROUTER_API_KEY=sk-or-...

# Stripe
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...

# App
NEXT_PUBLIC_APP_URL=https://cbt-os.vercel.app
```

## Security Considerations

### Data Protection

1. **Row Level Security (RLS)**: All tables have RLS enabled
   - Users can only read/write their own data
   - No cross-user data leakage possible
   - Admin bypass via service role key (server-side only)

2. **Authentication**
   - JWT tokens stored in httpOnly cookies (not localStorage)
   - CSRF protection via SameSite cookie attribute
   - Automatic token refresh via Supabase SSR

3. **API Security**
   - All API routes require authentication
   - Rate limiting on Edge Functions (100 req/min per user)
   - Input validation on all endpoints
   - SQL injection prevention via Supabase query builder

4. **Data Encryption**
   - At rest: Supabase AES-256 encryption
   - In transit: TLS 1.3
   - Journal entries: Optional client-side encryption (future)

5. **AI Security**
   - No PII sent to OpenAI without explicit consent
   - User context anonymized before AI processing
   - Conversation history encrypted at rest
   - Opt-in for AI features

### Privacy Compliance (152-ФЗ / GDPR)

- Data minimization: Collect only necessary data
- User consent: Explicit opt-in for AI features
- Data portability: JSON/CSV export available
- Right to deletion: Account deletion removes all data
- Data retention: Configurable (default: indefinite)
- No third-party analytics without consent

## Performance Optimization Plan

### Current State

| Metric | Target | Current |
|--------|--------|---------|
| LCP | < 2.5s | ~2.0s (mock data) |
| FID | < 100ms | < 50ms |
| CLS | < 0.1 | < 0.05 |
| Bundle Size | < 200KB | ~180KB |

### Optimization Strategies

#### 1. Bundle Optimization

```typescript
// next.config.ts
module.exports = {
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      '@radix-ui/react-icons',
      'recharts',
      'framer-motion'
    ],
  },
}
```

#### 2. Code Splitting

- Dynamic imports for heavy components (Recharts, Framer Motion)
- Route-based splitting (already via Next.js App Router)
- Lazy load modals and dialogs

#### 3. Data Fetching

```
Strategy: Static Generation + Incremental Static Regeneration

Landing Page:    SSG (static)
Dashboard:       SSR (auth required)
Journal List:    SWR with infinite scroll
Journal Detail:  SSR with cache
Analytics:       SSR with 60s revalidation
AI Chat:         Client-side only (streaming)
```

#### 4. Database Performance

- Composite indexes on frequently queried columns
- Materialized views for analytics aggregations
- Connection pooling via Supabase built-in pooler
- Query result caching via Next.js unstable_cache

#### 5. Image Optimization

- Next.js Image component for avatars
- WebP/AVIF format support
- Lazy loading for exercise icons
- SVG for UI icons (Lucide)

#### 6. Caching Strategy

```
Browser Cache:
  - Static assets: 1 year (immutable)
  - API responses: No cache (auth-dependent)

CDN Cache:
  - Landing page: 60s
  - Static pages: 300s

Server Cache:
  - Analytics queries: 60s (unstable_cache)
  - Distortion list: 3600s (rarely changes)
  - Exercise list: 3600s

Client Cache:
  - Zustand state: Session only
  - SWR: 30s revalidation
```

#### 6. Monitoring

- Vercel Analytics (Web Vitals)
- Supabase Dashboard (DB performance)
- Custom error tracking (Sentry)
- AI response latency monitoring

## Technology Stack Summary

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 16.2.9 |
| UI Library | React | 19.2.4 |
| Styling | Tailwind CSS | 4.x |
| Components | shadcn/ui (Radix) | 1.6.0 |
| State | Zustand | 5.0.14 |
| Animation | Framer Motion | 12.40.0 |
| Charts | Recharts | 3.8.1 |
| Auth/DB | Supabase | 2.108.2 |
| Language | TypeScript | 5.x |
| Runtime | Node.js | 20.x |
