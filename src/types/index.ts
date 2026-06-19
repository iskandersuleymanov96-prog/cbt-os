export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  created_at: string
  settings: UserSettings
}

export interface UserSettings {
  id: string
  user_id: string
  language: "ru" | "en"
  theme: "light" | "dark" | "system"
  notifications: boolean
  ai_coaching: boolean
  voice_journaling: boolean
  font_size: "small" | "medium" | "large"
  compact_mode: boolean
  created_at: string
}

export interface JournalEntry {
  id: string
  user_id: string
  created_at: string
  situation: string
  emotion: string
  emotion_intensity: number
  automatic_thought: string
  body_sensations: string
  behavior: string
  evidence_supporting: string
  evidence_against: string
  alternative_thought: string
  new_emotion_intensity: number
  lessons_learned: string
  mood: number
  energy: number
  stress: number
  anxiety: number
  tags: string[]
  is_draft?: boolean
}

export interface JournalDraft {
  entry_id: string
  form_data: Record<string, unknown>
  step: number
  updated_at: string
}

export interface Emotion {
  id: string
  name: string
  category: "positive" | "negative" | "neutral"
  color: string
  icon: string
}

export interface Distortion {
  id: string
  name: string
  slug: string
  description: string
  examples: string[]
  how_to_challenge: string
  icon: string
}

export interface EntryDistortion {
  id: string
  entry_id: string
  distortion_id: string
  confidence: number
}

export interface Trigger {
  id: string
  user_id: string
  name: string
  category: string
  frequency: number
}

export interface Pattern {
  id: string
  user_id: string
  type: "thought" | "emotion" | "behavior" | "trigger" | "distortion"
  name: string
  frequency: number
  strength: number
  first_seen: string
  last_seen: string
  related_entries: string[]
  is_worked_on?: boolean
  progress_notes?: string
}

export interface Exercise {
  id: string
  name: string
  category: string
  description: string
  steps: string[]
  duration: number
  difficulty: "easy" | "medium" | "hard"
  icon: string
}

export interface WeeklyReport {
  id: string
  user_id: string
  week_start: string
  week_end: string
  total_entries: number
  average_mood: number
  average_stress: number
  average_anxiety: number
  common_distortions: string[]
  common_triggers: string[]
  growth_score: number
  insights: string[]
}

export interface MonthlyReport {
  id: string
  user_id: string
  month: number
  year: number
  total_entries: number
  average_mood: number
  average_stress: number
  average_anxiety: number
  common_distortions: string[]
  common_triggers: string[]
  growth_score: number
  insights: string[]
  patterns_discovered: string[]
}

export interface AIInsight {
  id: string
  user_id: string
  entry_id?: string
  type: "pattern" | "suggestion" | "reflection" | "growth"
  content: string
  confidence: number
  created_at: string
  is_read: boolean
  is_archived?: boolean
  title?: string
}

export interface Subscription {
  id: string
  user_id: string
  plan: "free" | "pro" | "team"
  status: "active" | "cancelled" | "past_due"
  current_period_end: string
  created_at: string
}

export interface AppSettings {
  theme: "light" | "dark" | "system"
  language: "ru" | "en"
  font_size: "small" | "medium" | "large"
  compact_mode: boolean
  notifications_enabled: boolean
  reminder_time: string
  email_notifications: boolean
  weekly_summary: boolean
  ai_coaching_intensity: "gentle" | "moderate" | "intensive"
  ai_response_style: "concise" | "detailed" | "socratic"
  ai_focus_topics: string[]
  data_retention_days: number
  encryption_enabled: boolean
}
