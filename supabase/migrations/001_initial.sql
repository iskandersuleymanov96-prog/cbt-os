-- CBT OS — Initial Database Schema
-- Migration: 001_initial
-- Description: Create all tables, RLS policies, indexes, triggers, and seed data

-- ============================================================
-- EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- For text search

-- ============================================================
-- TYPES
-- ============================================================

CREATE TYPE emotion_category AS ENUM ('positive', 'negative', 'neutral');
CREATE TYPE pattern_type AS ENUM ('thought', 'emotion', 'behavior', 'trigger', 'distortion');
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard');
CREATE TYPE subscription_plan AS ENUM ('free', 'pro', 'team');
CREATE TYPE subscription_status AS ENUM ('active', 'cancelled', 'past_due');
CREATE TYPE insight_type AS ENUM ('pattern', 'suggestion', 'reflection', 'growth');
CREATE TYPE language_code AS ENUM ('ru', 'en');
CREATE TYPE theme_mode AS ENUM ('light', 'dark');

-- ============================================================
-- TABLES
-- ============================================================

-- User Settings (extends Supabase auth.users)
CREATE TABLE user_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  language language_code DEFAULT 'ru',
  theme theme_mode DEFAULT 'light',
  notifications BOOLEAN DEFAULT true,
  ai_coaching BOOLEAN DEFAULT true,
  voice_journaling BOOLEAN DEFAULT false,
  notification_time TIME,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Emotions (catalog)
CREATE TABLE emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  category emotion_category NOT NULL,
  color TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Journal Entries
CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  situation TEXT NOT NULL,
  emotion TEXT NOT NULL,
  emotion_intensity INTEGER CHECK (emotion_intensity >= 1 AND emotion_intensity <= 10),
  automatic_thought TEXT NOT NULL,
  body_sensations TEXT,
  behavior TEXT,
  evidence_supporting TEXT,
  evidence_against TEXT,
  alternative_thought TEXT,
  new_emotion_intensity INTEGER CHECK (new_emotion_intensity >= 1 AND new_emotion_intensity <= 10),
  lessons_learned TEXT,
  mood INTEGER CHECK (mood >= 1 AND mood <= 5),
  energy INTEGER CHECK (energy >= 1 AND energy <= 10),
  stress INTEGER CHECK (stress >= 1 AND stress <= 10),
  anxiety INTEGER CHECK (anxiety >= 1 AND anxiety <= 10),
  tags TEXT[] DEFAULT '{}',
  is_deleted BOOLEAN DEFAULT false
);

-- Entry-Emotions (many-to-many)
CREATE TABLE entry_emotions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  emotion_id UUID NOT NULL REFERENCES emotions(id) ON DELETE CASCADE,
  UNIQUE(entry_id, emotion_id)
);

-- Distortions (catalog)
CREATE TABLE distortions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL,
  examples TEXT[] DEFAULT '{}',
  how_to_challenge TEXT NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Entry-Distortions (many-to-many)
CREATE TABLE entry_distortions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entry_id UUID NOT NULL REFERENCES journal_entries(id) ON DELETE CASCADE,
  distortion_id UUID NOT NULL REFERENCES distortions(id) ON DELETE CASCADE,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  UNIQUE(entry_id, distortion_id)
);

-- Triggers (user-specific)
CREATE TABLE triggers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT,
  frequency INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Patterns (detected by AI)
CREATE TABLE patterns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type pattern_type NOT NULL,
  name TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  strength INTEGER CHECK (strength >= 1 AND strength <= 10),
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  related_entries UUID[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, type, name)
);

-- Exercises (catalog)
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  steps TEXT[] NOT NULL,
  duration INTEGER NOT NULL, -- minutes
  difficulty difficulty_level NOT NULL,
  icon TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Exercise Completions (user progress)
CREATE TABLE exercise_completions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exercise_id UUID NOT NULL REFERENCES exercises(id) ON DELETE CASCADE,
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  duration_actual INTEGER, -- actual minutes spent
  notes TEXT
);

-- Weekly Reports
CREATE TABLE weekly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  total_entries INTEGER DEFAULT 0,
  average_mood DECIMAL(3,2),
  average_stress DECIMAL(3,2),
  average_anxiety DECIMAL(3,2),
  common_distortions TEXT[] DEFAULT '{}',
  common_triggers TEXT[] DEFAULT '{}',
  growth_score INTEGER CHECK (growth_score >= 0 AND growth_score <= 100),
  insights TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, week_start)
);

-- Monthly Reports
CREATE TABLE monthly_reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
  year INTEGER NOT NULL,
  total_entries INTEGER DEFAULT 0,
  average_mood DECIMAL(3,2),
  average_stress DECIMAL(3,2),
  average_anxiety DECIMAL(3,2),
  common_distortions TEXT[] DEFAULT '{}',
  common_triggers TEXT[] DEFAULT '{}',
  growth_score INTEGER CHECK (growth_score >= 0 AND growth_score <= 100),
  insights TEXT[] DEFAULT '{}',
  patterns_discovered TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, month, year)
);

-- AI Insights
CREATE TABLE ai_insights (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  entry_id UUID REFERENCES journal_entries(id) ON DELETE SET NULL,
  type insight_type NOT NULL,
  content TEXT NOT NULL,
  confidence DECIMAL(3,2) CHECK (confidence >= 0 AND confidence <= 1),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  is_read BOOLEAN DEFAULT false
);

-- AI Messages (chat history)
CREATE TABLE ai_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Subscriptions
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan subscription_plan DEFAULT 'free',
  status subscription_status DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Push Subscriptions (for web push notifications)
CREATE TABLE push_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  keys JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, endpoint)
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Journal Entries
CREATE INDEX idx_journal_entries_user_id ON journal_entries(user_id);
CREATE INDEX idx_journal_entries_created_at ON journal_entries(user_id, created_at DESC);
CREATE INDEX idx_journal_entries_tags ON journal_entries USING GIN(tags);
CREATE INDEX idx_journal_entries_situation_search ON journal_entries USING GIN(to_tsvector('russian', situation));

-- Entry Emotions
CREATE INDEX idx_entry_emotions_entry_id ON entry_emotions(entry_id);
CREATE INDEX idx_entry_emotions_emotion_id ON entry_emotions(emotion_id);

-- Entry Distortions
CREATE INDEX idx_entry_distortions_entry_id ON entry_distortions(entry_id);
CREATE INDEX idx_entry_distortions_distortion_id ON entry_distortions(distortion_id);

-- Triggers
CREATE INDEX idx_triggers_user_id ON triggers(user_id);
CREATE INDEX idx_triggers_category ON triggers(user_id, category);

-- Patterns
CREATE INDEX idx_patterns_user_id ON patterns(user_id);
CREATE INDEX idx_patterns_type ON patterns(user_id, type);
CREATE INDEX idx_patterns_strength ON patterns(user_id, strength DESC);

-- AI Insights
CREATE INDEX idx_ai_insights_user_id ON ai_insights(user_id);
CREATE INDEX idx_ai_insights_unread ON ai_insights(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_ai_insights_created_at ON ai_insights(user_id, created_at DESC);

-- AI Messages
CREATE INDEX idx_ai_messages_user_id ON ai_messages(user_id);
CREATE INDEX idx_ai_messages_created_at ON ai_messages(user_id, created_at DESC);

-- Subscriptions
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);

-- Weekly Reports
CREATE INDEX idx_weekly_reports_user_week ON weekly_reports(user_id, week_start DESC);

-- Monthly Reports
CREATE INDEX idx_monthly_reports_user_month ON monthly_reports(user_id, year DESC, month DESC);

-- Exercise Completions
CREATE INDEX idx_exercise_completions_user ON exercise_completions(user_id);
CREATE INDEX idx_exercise_completions_exercise ON exercise_completions(exercise_id);

-- ============================================================
-- ROW LEVEL SECURITY POLICIES
-- ============================================================

-- Enable RLS on all tables
ALTER TABLE user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE journal_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_emotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE distortions ENABLE ROW LEVEL SECURITY;
ALTER TABLE entry_distortions ENABLE ROW LEVEL SECURITY;
ALTER TABLE triggers ENABLE ROW LEVEL SECURITY;
ALTER TABLE patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercise_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE monthly_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- User Settings Policies
CREATE POLICY "Users can view own settings"
  ON user_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own settings"
  ON user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own settings"
  ON user_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Emotions Policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view emotions"
  ON emotions FOR SELECT
  TO authenticated
  USING (true);

-- Journal Entries Policies
CREATE POLICY "Users can view own entries"
  ON journal_entries FOR SELECT
  USING (auth.uid() = user_id AND is_deleted = false);

CREATE POLICY "Users can insert own entries"
  ON journal_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can soft delete own entries"
  ON journal_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (is_deleted = true);

-- Entry Emotions Policies
CREATE POLICY "Users can view own entry emotions"
  ON entry_emotions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries
      WHERE journal_entries.id = entry_emotions.entry_id
      AND journal_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own entry emotions"
  ON entry_emotions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries
      WHERE journal_entries.id = entry_emotions.entry_id
      AND journal_entries.user_id = auth.uid()
    )
  );

-- Distortions Policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view distortions"
  ON distortions FOR SELECT
  TO authenticated
  USING (true);

-- Entry Distortions Policies
CREATE POLICY "Users can view own entry distortions"
  ON entry_distortions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries
      WHERE journal_entries.id = entry_distortions.entry_id
      AND journal_entries.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own entry distortions"
  ON entry_distortions FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM journal_entries
      WHERE journal_entries.id = entry_distortions.entry_id
      AND journal_entries.user_id = auth.uid()
    )
  );

-- Triggers Policies
CREATE POLICY "Users can view own triggers"
  ON triggers FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own triggers"
  ON triggers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own triggers"
  ON triggers FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own triggers"
  ON triggers FOR DELETE
  USING (auth.uid() = user_id);

-- Patterns Policies
CREATE POLICY "Users can view own patterns"
  ON patterns FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own patterns"
  ON patterns FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own patterns"
  ON patterns FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own patterns"
  ON patterns FOR DELETE
  USING (auth.uid() = user_id);

-- Exercises Policies (read-only for all authenticated users)
CREATE POLICY "Authenticated users can view exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

-- Exercise Completions Policies
CREATE POLICY "Users can view own completions"
  ON exercise_completions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own completions"
  ON exercise_completions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Weekly Reports Policies
CREATE POLICY "Users can view own weekly reports"
  ON weekly_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert weekly reports"
  ON weekly_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Monthly Reports Policies
CREATE POLICY "Users can view own monthly reports"
  ON monthly_reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert monthly reports"
  ON monthly_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- AI Insights Policies
CREATE POLICY "Users can view own insights"
  ON ai_insights FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert insights"
  ON ai_insights FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own insights"
  ON ai_insights FOR UPDATE
  USING (auth.uid() = user_id);

-- AI Messages Policies
CREATE POLICY "Users can view own messages"
  ON ai_messages FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own messages"
  ON ai_messages FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Subscriptions Policies
CREATE POLICY "Users can view own subscription"
  ON subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can manage subscriptions"
  ON subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- Push Subscriptions Policies
CREATE POLICY "Users can view own push subscriptions"
  ON push_subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own push subscriptions"
  ON push_subscriptions FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_settings_updated_at
  BEFORE UPDATE ON user_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_journal_entries_updated_at
  BEFORE UPDATE ON journal_entries
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_patterns_updated_at
  BEFORE UPDATE ON patterns
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_subscriptions_updated_at
  BEFORE UPDATE ON subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Auto-create user settings on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_settings (user_id)
  VALUES (NEW.id);

  INSERT INTO subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- SEED DATA: Emotions
-- ============================================================

INSERT INTO emotions (name, category, color, icon) VALUES
  -- Positive
  ('Радость', 'positive', '#22c55e', '😊'),
  ('Спокойствие', 'positive', '#4a6fa5', '😌'),
  ('Удовлетворение', 'positive', '#10b981', '🙂'),
  ('Гордость', 'positive', '#8b5cf6', '🥳'),
  ('Благодарность', 'positive', '#f59e0b', '🙏'),
  -- Negative
  ('Тревога', 'negative', '#ef4444', '😟'),
  ('Страх', 'negative', '#dc2626', '😨'),
  ('Грусть', 'negative', '#6366f1', '😢'),
  ('Злость', 'negative', '#ea580c', '😠'),
  ('Вина', 'negative', '#a855f7', '😔'),
  ('Стыд', 'negative', '#ec4899', '😳'),
  ('Разочарование', 'negative', '#64748b', '😞'),
  -- Neutral
  ('Нейтрально', 'neutral', '#9ca3af', '😐'),
  ('Усталость', 'neutral', '#78716c', '😩'),
  ('Скука', 'neutral', '#a1a1aa', '🥱');

-- ============================================================
-- SEED DATA: Distortions
-- ============================================================

INSERT INTO distortions (name, slug, description, examples, how_to_challenge, icon) VALUES
  (
    'Катастрофизация',
    'catastrophizing',
    'Преувеличение негативных последствий событий. Вы видите только худший возможный сценарий и считаете его наиболее вероятным.',
    ARRAY[
      'Если я опоздаю на совещание, меня уволят',
      'Эта ошибка разрушит весь проект',
      'Если она не ответит на сообщение — всё кончено'
    ],
    'Спросите себя: «Что самое худшее может произойти? Какова реальная вероятность этого? Что я сделаю, если это случится?»',
    '🌪️'
  ),
  (
    'Чтение мыслей',
    'mind-reading',
    'Убеждённость в том, что другие думают о вас негативно, без реальных доказательств.',
    ARRAY[
      'Он точно думает, что я некомпетентен',
      'Они все замечают, как я волнуюсь',
      'Начальник недоволен моей работой'
    ],
    'Проверьте факты: есть ли реальные доказательства? Вы знаете, что на самом деле думает другой человек? Спросите его напрямую.',
    '🔮'
  ),
  (
    'Чёрно-белое мышление',
    'black-and-white',
    'Видение ситуации только в двух极端 — отлично или ужасно. Нет промежуточных вариантов.',
    ARRAY[
      'Если не идеально — значит провал',
      'Либо я лучший, либо я никто',
      'Это полный успех или полный провал'
    ],
    'Найдите третий вариант. Большинство ситуаций находятся где-то посередине. Используйте шкалу от 0 до 100%.',
    '⬛'
  ),
  (
    'Обобщение',
    'overgeneralization',
    'Один негативный случай автоматически означает «всегда будет так».',
    ARRAY[
      'Я всегда всё порчу',
      'Никто меня не понимает',
      'У меня никогда ничего не получается'
    ],
    'Замените «всегда/никогда» на «иногда/в этом случае». Один случай не определяет всю жизнь.',
    '🔄'
  ),
  (
    'Эмоциональное рассуждение',
    'emotional-reasoning',
    'Чувства = факты: «Я чувствую, значит это правда».',
    ARRAY[
      'Я чувствую себя некомпетентным — значит я некомпетентен',
      'Мне страшно — значит опасность реальна',
      'Я чувствую вину — значит я сделал что-то плохое'
    ],
    'Чувства — это не факты. Проверьте: есть ли объективные доказательства того, что вы чувствуете?',
    '💭'
  ),
  (
    'Персонализация',
    'personalization',
    'Брать на себя вину за то, что не зависит от вас.',
    ARRAY[
      'Коллега в плохом настроении — наверное, я сделал что-то не так',
      'Проект провалился — это моя вина',
      'Она расстроена — я точно её обидел'
    ],
    'Спросите: «Какие ещё факторы могли повлиять на ситуацию? Действительно ли это моя ответственность?»',
    '🎯'
  ),
  (
    'Обесценивание позитива',
    'discounting-positives',
    'Игнорирование хорошего, фиксация на плохом.',
    ARRAY[
      'Похвала — просто вежливость',
      'Успех — просто повезло',
      'Комплимент — они так говорят всем'
    ],
    'Запишите 3 вещи, которые прошли хорошо сегодня. Примите их как факт.',
    '🚫'
  ),
  (
    'Долженствование',
    'should-statements',
    'Жёсткие правила «я должен» / «ты должен».',
    ARRAY[
      'Я должен всегда быть продуктивным',
      'Они должны меня понимать',
      'Я не должен ошибаться'
    ],
    'Замените «должен» на «хочу» или «могу». Гибкость снижает давление.',
    '⚖️'
  ),
  (
    'Маркировка',
    'labeling',
    'Навешивание ярлыков на себя или других.',
    ARRAY[
      'Я — неудачник',
      'Он — идиот',
      'Это катастрофа'
    ],
    'Опишите ситуацию без ярлыков. Что именно произошло? Какие конкретные действия?',
    '🏷️'
  ),
  (
    'Предсказание будущего',
    'fortune-telling',
    'Предвидение негативного без оснований.',
    ARRAY[
      'У меня точно не получится',
      'Это точно закончится плохо',
      'Он обязательно меня отвергнет'
    ],
    'Какова реальная вероятность этого? Были ли случаи, когда прогноз не сбылся?',
    '🔮'
  );

-- ============================================================
-- SEED DATA: Exercises
-- ============================================================

INSERT INTO exercises (name, category, description, steps, duration, difficulty, icon) VALUES
  (
    'Вызов мыслей',
    'КПТ',
    'Практика оспаривания автоматических негативных мыслей',
    ARRAY[
      'Запишите автоматическую мысль',
      'Найдите доказательства против',
      'Сформулируйте альтернативу',
      'Оцените новую интенсивность'
    ],
    15,
    'medium',
    '🧠'
  ),
  (
    'Тестирование доказательств',
    'КПТ',
    'Проверка фактов для оценки реальности мыслей',
    ARRAY[
      'Запишите убеждение',
      'Найдите факты за',
      'Найдите факты против',
      'Сделайте вывод'
    ],
    10,
    'easy',
    '⚖️'
  ),
  (
    'Смена перспективы',
    'КПТ',
    'Посмотрите на ситуацию глазами другого человека',
    ARRAY[
      'Опишите ситуацию',
      'Посмотрите глазами друга',
      'Посмотрите глазами нейтрального наблюдателя',
      'Найдите новый взгляд'
    ],
    12,
    'medium',
    '🔄'
  ),
  (
    'Эксперимент с поведением',
    'КПТ',
    'Запланируйте и проведите поведенческий эксперимент',
    ARRAY[
      'Определите предсказание',
      'Спланируйте эксперимент',
      'Проведите эксперимент',
      'Проанализируйте результат'
    ],
    20,
    'hard',
    '🧪'
  ),
  (
    'Заземление 5-4-3-2-1',
    'Осознанность',
    'Техника для снижения тревожности через органы чувств',
    ARRAY[
      '5 вещей, которые вы видите',
      '4 вещи, которые можете потрогать',
      '3 звука, которые слышите',
      '2 запаха, которые чувствуете',
      '1 вкус во рту'
    ],
    5,
    'easy',
    '🌿'
  ),
  (
    'Дыхание 4-7-8',
    'Дыхание',
    'Техника расслабляющего дыхания для снижения стресса',
    ARRAY[
      'Вдохните через нос на 4 счёта',
      'Задержите дыхание на 7 счётов',
      'Выдохните через рот на 8 счётов',
      'Повторите 4 раза'
    ],
    5,
    'easy',
    '🌬️'
  ),
  (
    'Самосострадание',
    'Самосострадание',
    'Практика доброты к себе в трудные моменты',
    ARRAY[
      'Признайте свою боль',
      'Помните: страдание — общечеловеческий опыт',
      'Будьте добры к себе',
      'Предложите себе поддержку'
    ],
    10,
    'medium',
    '💝'
  ),
  (
    'Промпты для дневника',
    'Дневник',
    'Вопросы для глубокой саморефлексии',
    ARRAY[
      'За что я благодарен сегодня?',
      'Что было сложным и как я справился?',
      'Что я хочу отпустить?',
      'Что я хочу развивать?'
    ],
    15,
    'easy',
    '📝'
  ),
  (
    'Упражнение на рефлексию',
    'Рефлексия',
    'Анализ прошедшего дня и извлечение уроков',
    ARRAY[
      'Что произошло сегодня?',
      'Что я почувствовал?',
      'Что я узнал о себе?',
      'Что я буду делать иначе?'
    ],
    10,
    'easy',
    '🔍'
  );

-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Function to calculate streak
CREATE OR REPLACE FUNCTION calculate_streak(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  streak INTEGER := 0;
  current_date DATE := CURRENT_DATE;
  entry_date DATE;
BEGIN
  LOOP
    SELECT DATE(created_at) INTO entry_date
    FROM journal_entries
    WHERE user_id = p_user_id
      AND DATE(created_at) = current_date
      AND is_deleted = false
    LIMIT 1;

    EXIT WHEN entry_date IS NULL;

    streak := streak + 1;
    current_date := current_date - INTERVAL '1 day';
  END LOOP;

  RETURN streak;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get user statistics
CREATE OR REPLACE FUNCTION get_user_stats(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  total_entries BIGINT,
  avg_mood NUMERIC,
  avg_stress NUMERIC,
  avg_anxiety NUMERIC,
  avg_energy NUMERIC,
  streak INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COUNT(*)::BIGINT as total_entries,
    ROUND(AVG(mood), 2) as avg_mood,
    ROUND(AVG(stress), 2) as avg_stress,
    ROUND(AVG(anxiety), 2) as avg_anxiety,
    ROUND(AVG(energy), 2) as avg_energy,
    calculate_streak(p_user_id) as streak
  FROM journal_entries
  WHERE user_id = p_user_id
    AND created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND is_deleted = false;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get distortion frequency
CREATE OR REPLACE FUNCTION get_distortion_frequency(p_user_id UUID, p_days INTEGER DEFAULT 30)
RETURNS TABLE(
  distortion_name TEXT,
  distortion_slug TEXT,
  distortion_icon TEXT,
  count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.name as distortion_name,
    d.slug as distortion_slug,
    d.icon as distortion_icon,
    COUNT(ed.id)::BIGINT as count
  FROM entry_distortions ed
  JOIN journal_entries je ON je.id = ed.entry_id
  JOIN distortions d ON d.id = ed.distortion_id
  WHERE je.user_id = p_user_id
    AND je.created_at >= NOW() - (p_days || ' days')::INTERVAL
    AND je.is_deleted = false
  GROUP BY d.id, d.name, d.slug, d.icon
  ORDER BY count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- REALTIME SUBSCRIPTIONS
-- ============================================================

-- Enable realtime for key tables
ALTER PUBLICATION supabase_realtime ADD TABLE journal_entries;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_insights;
ALTER PUBLICATION supabase_realtime ADD TABLE ai_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE patterns;

-- ============================================================
-- GRANTS
-- ============================================================

-- Grant usage to authenticated users
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;

-- Grant table permissions
GRANT SELECT ON emotions TO authenticated;
GRANT SELECT ON distortions TO authenticated;
GRANT SELECT ON exercises TO authenticated;

GRANT ALL ON user_settings TO authenticated;
GRANT ALL ON journal_entries TO authenticated;
GRANT ALL ON entry_emotions TO authenticated;
GRANT ALL ON entry_distortions TO authenticated;
GRANT ALL ON triggers TO authenticated;
GRANT ALL ON patterns TO authenticated;
GRANT ALL ON exercise_completions TO authenticated;
GRANT ALL ON weekly_reports TO authenticated;
GRANT ALL ON monthly_reports TO authenticated;
GRANT ALL ON ai_insights TO authenticated;
GRANT ALL ON ai_messages TO authenticated;
GRANT ALL ON subscriptions TO authenticated;
GRANT ALL ON push_subscriptions TO authenticated;

-- Grant sequence usage
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
