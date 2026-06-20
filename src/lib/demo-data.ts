import type { JournalEntry, Pattern, AIInsight } from "@/types"

export const DEMO_ENTRIES: (JournalEntry & { distortions: string[] })[] = [
  {
    id: "1",
    user_id: "demo",
    created_at: "2026-06-21T09:15:00Z",
    situation: "Утренняя планёрка — руководитель перенёс мой доклад на следующую неделю без предупреждения",
    emotion: "Раздражение",
    emotion_intensity: 6,
    automatic_thought: "Меня не уважают. Мои задачи считаются неважными.",
    body_sensations: "Напряжение в челюсти, сжатые кулаки",
    behavior: "Молча кивнул, после планёрки написал коллеге жалобу в мессенджер",
    evidence_supporting: "Доклад действительно перенесли без обсуждения",
    evidence_against: "Руководитель мог забыть или не знать о моих планах. В прошлый раз хвалил мой доклад.",
    alternative_thought: "Это может быть недоразумение, а не неуважение. Стоит спросить напрямую.",
    new_emotion_intensity: 3,
    lessons_learned: "Не стоит делать поспешных выводов о намерениях других людей.",
    mood: 3,
    energy: 4,
    stress: 6,
    anxiety: 4,
    tags: ["работа", "руководство"],
    distortions: ["Персонализация", "Чтение мыслей"],
  },
  {
    id: "2",
    user_id: "demo",
    created_at: "2026-06-19T14:30:00Z",
    situation: "Совещание по проекту — начальник критиковал мою работу перед командой",
    emotion: "Тревога",
    emotion_intensity: 7,
    automatic_thought: "Я не справляюсь. Меня уволят. Все видят, что я некомпетентен.",
    body_sensations: "Напряжение в плечах, учащённое сердцебиение, потеют ладони",
    behavior: "Молчал на совещании, избегал зрительного контакта, после ушёл в туалет и 10 минут сидел один",
    evidence_supporting: "Начальник действительно был недоволен. Сроки действительно сорваны.",
    evidence_against: "Часть задач зависла не по моей вине. До этого проекты я сдавал вовремя. Коллеги тоже опаздывают.",
    alternative_thought: "Я допустил ошибки в планировании, но это не делает меня некомпетентным. Это учебный опыт.",
    new_emotion_intensity: 4,
    lessons_learned: "Нужно лучше коммуницировать о задержках заранее. Не брать ответственность за чужие задачи.",
    mood: 3,
    energy: 5,
    stress: 7,
    anxiety: 8,
    tags: ["работа", "стресс"],
    distortions: ["Катастрофизация", "Чтение мыслей"],
  },
  {
    id: "3",
    user_id: "demo",
    created_at: "2026-06-18T21:15:00Z",
    situation: "Вечерняя прогулка в парке. Почувствовал себя расслабленным и спокойным",
    emotion: "Спокойствие",
    emotion_intensity: 3,
    automatic_thought: "Наконец-то могу выдохнуть. Хорошо, что нашёл время для себя.",
    body_sensations: "Расслабленные плечи, глубокое дыхание, лёгкость в теле",
    behavior: "Шёл медленно, слушал музыку, останавливался у пруда",
    evidence_supporting: "Действительно чувствую облегчение после прогулки",
    evidence_against: "",
    alternative_thought: "Прогулки на природе — это важная часть самопомощи, и я правильно делаю, что выделяю на них время.",
    new_emotion_intensity: 2,
    lessons_learned: "Природа помогает восстановить энергию. Важно планировать такие моменты.",
    mood: 4,
    energy: 4,
    stress: 2,
    anxiety: 1,
    tags: ["природа", "отдых", "самопомощь"],
    distortions: [],
  },
  {
    id: "4",
    user_id: "demo",
    created_at: "2026-06-17T10:00:00Z",
    situation: "Получил положительный отзыв от клиента по завершённому проекту",
    emotion: "Радость",
    emotion_intensity: 8,
    automatic_thought: "Ну, это просто вежливость. Клиент так говорит всем.",
    body_sensations: "Лёгкость в груди, хочется улыбаться",
    behavior: "Поблагодарил клиента, рассказал жене",
    evidence_supporting: "Клиент мог бы просто молча принять работу",
    evidence_against: "Клиент написал подробный отзыв с конкретными пунктами. До этого негативно реагировал на ошибки, значит теперь действительно доволен.",
    alternative_thought: "Клиент искренне доволен результатом. Мои усилия были замечены и оценены.",
    new_emotion_intensity: 2,
    lessons_learned: "Нужно учиться принимать комплименты и не обесценивать свой труд.",
    mood: 5,
    energy: 5,
    stress: 1,
    anxiety: 1,
    tags: ["работа", "успех", "позитив"],
    distortions: ["Обесценивание позитива"],
  },
  {
    id: "5",
    user_id: "demo",
    created_at: "2026-06-16T16:45:00Z",
    situation: "Спор с другом из-за мелочи. Почувствовал вину и раздражение",
    emotion: "Вина",
    emotion_intensity: 6,
    automatic_thought: "Я всегда порчу отношения. Должен был молчать.",
    body_sensations: "Тяжесть в животе, хочу спрятаться",
    behavior: "Написал извинения, хотя чувствовал, что я был прав",
    evidence_supporting: "Разговор перерёл в ссору",
    evidence_against: "Друг тоже повёл себя агрессивно. Разногласия — нормальная часть общения.",
    alternative_thought: "Мы оба сказали лишнее. Это не конец дружбы. Можно обсудить спокойно завтра.",
    new_emotion_intensity: 3,
    lessons_learned: "Не стоит извиняться за свои чувства. Стоит обсуждать конфликты, когда оба успокоятся.",
    mood: 2,
    energy: 3,
    stress: 5,
    anxiety: 4,
    tags: ["отношения", "конфликт"],
    distortions: ["Долженствование", "Обобщение"],
  },
  {
    id: "6",
    user_id: "demo",
    created_at: "2026-06-15T09:30:00Z",
    situation: "Утренняя медитация. Смог сосредоточиться на дыхании на 15 минут",
    emotion: "Удовлетворение",
    emotion_intensity: 5,
    automatic_thought: "Хорошее начало дня. Я могу контролировать своё внимание.",
    body_sensations: "Спокойствие, ровное дыхание",
    behavior: "Сидел спокойно, не отвлекался, после записал впечатления",
    evidence_supporting: "",
    evidence_against: "",
    alternative_thought: "Каждая медитация — тренировка для мозга. Я прогрессирую.",
    new_emotion_intensity: 2,
    lessons_learned: "Регулярная практика даёт результат. 15 минут — мой текущий максимум.",
    mood: 4,
    energy: 4,
    stress: 2,
    anxiety: 2,
    tags: ["медитация", "здоровье", "самопомощь"],
    distortions: [],
  },
  {
    id: "7",
    user_id: "demo",
    created_at: "2026-06-14T11:00:00Z",
    situation: "Коллега сделал замечание по моему коду на ревью. Замечание было справедливым",
    emotion: "Стыд",
    emotion_intensity: 5,
    automatic_thought: "Я написал плохой код. Коллега думает, что я слабый программист.",
    body_sensations: "Покраснение лица, хочется провалиться сквозь землю",
    behavior: "Быстро исправил замечание, не стал обсуждать",
    evidence_supporting: "Код действительно содержал ошибку",
    evidence_against: "Ревью — нормальная практика. Все допускают ошибки. Коллега помог, а не атаковал.",
    alternative_thought: "Ревью кода — это не личная атака, а процесс улучшения качества. Ошибки — часть обучения.",
    new_emotion_intensity: 2,
    lessons_learned: "Относиться к ревью как к обучению, а не к оценке личности.",
    mood: 3,
    energy: 4,
    stress: 4,
    anxiety: 3,
    tags: ["работа", "коллеги"],
    distortions: ["Чтение мыслей", "Персонализация"],
  },
  {
    id: "8",
    user_id: "demo",
    created_at: "2026-06-13T19:00:00Z",
    situation: "Семейный ужин. Обсуждали планы на отпуск. Все были в хорошем настроении",
    emotion: "Радость",
    emotion_intensity: 7,
    automatic_thought: "Хорошо, что мы проводим время вместе. Это важно.",
    body_sensations: "Тепло в груди, расслабленность",
    behavior: "Шутил, планировал маршрут, фотографировал еду",
    evidence_supporting: "",
    evidence_against: "",
    alternative_thought: "Семейные моменты — это то, что делает жизнь полноценной.",
    new_emotion_intensity: 2,
    lessons_learned: "Важно находить время для близких, даже когда работа забирает много сил.",
    mood: 5,
    energy: 4,
    stress: 1,
    anxiety: 1,
    tags: ["семья", "отдых"],
    distortions: [],
  },
  {
    id: "9",
    user_id: "demo",
    created_at: "2026-06-12T08:00:00Z",
    situation: "Проснулся с тревогой перед важной презентацией. Не мог заснуть с ночи",
    emotion: "Тревога",
    emotion_intensity: 8,
    automatic_thought: "Если я провалю презентацию, меня снимут с проекта. Карьера будет разрушена.",
    body_sensations: "Бессонница, учащённый пульс, сухость во рту",
    behavior: "Сидел до 3 ночи, готовя слайды. Утром выпил 3 кофе",
    evidence_supporting: "Презентация действительно важная. Директор будет присутствовать.",
    evidence_against: "Я хорошо подготовлен. Уже успешно делал презентации раньше. Провал одной презентации не определяет карьеру.",
    alternative_thought: "Тревога — это нормальная реакция на важное событие. Я подготовлен и справлюсь, даже если будут вопросы.",
    new_emotion_intensity: 5,
    lessons_learned: "Бессонница перед событием только ухудшает состояние. Лучше выспаться и подготовиться заранее.",
    mood: 2,
    energy: 3,
    stress: 8,
    anxiety: 9,
    tags: ["работа", "стресс", "презентация"],
    distortions: ["Катастрофизация"],
  },
  {
    id: "10",
    user_id: "demo",
    created_at: "2026-06-11T17:30:00Z",
    situation: "Пробежка в парке. Пробежал 5 км без остановки — личный рекорд на этой неделе",
    emotion: "Гордость",
    emotion_intensity: 7,
    automatic_thought: "Я могу добиться чего угодно, если стараюсь. Тело感謝но за заботу.",
    body_sensations: "Прилив энергии, лёгкая усталость в мышцах, эйфория",
    behavior: "Побежал дальше, чем планировал, записал результат в приложение",
    evidence_supporting: "Действительно пробежал 5 км без остановки",
    evidence_against: "",
    alternative_thought: "Физическая активность — это инвестиция в здоровье и настроение.",
    new_emotion_intensity: 2,
    lessons_learned: "Спорт — мощный инструмент для регулировки эмоций. Продолжать регулярно.",
    mood: 5,
    energy: 5,
    stress: 1,
    anxiety: 1,
    tags: ["спорт", "здоровье", "достижение"],
    distortions: [],
  },
  {
    id: "11",
    user_id: "demo",
    created_at: "2026-06-10T12:00:00Z",
    situation: "Начальник поручил срочную задачу с дедлайном «на вчера». Чувствовал панику",
    emotion: "Паника",
    emotion_intensity: 9,
    automatic_thought: "Я не успею. Начальник нарочно нагружает. Это нечестно.",
    body_sensations: "Сжатое горло, дрожь в руках, головокружение",
    behavior: "Начал хаотично переключаться между задачами, не мог сосредоточиться",
    evidence_supporting: "Сроки действительно нереалистичные",
    evidence_against: "Можно попросить помощи у коллег. Можно договориться о приоритизации. Это не первый раз — раньше справлялся.",
    alternative_thought: "Ситуация стрессовая, но не безвыходная. Составлю план и попрошу о поддержке.",
    new_emotion_intensity: 4,
    lessons_learned: "Паника мешает думать. Первый шаг — остановиться и расставить приоритеты.",
    mood: 2,
    energy: 3,
    stress: 9,
    anxiety: 9,
    tags: ["работа", "стресс", "дедлайн"],
    distortions: ["Катастрофизация", "Чтение мыслей"],
  },
  {
    id: "12",
    user_id: "demo",
    created_at: "2026-06-09T20:00:00Z",
    situation: "Вечерний дневник. Проанализировал день — было много стресса, но я справился",
    emotion: "Облегчение",
    emotion_intensity: 4,
    automatic_thought: "День был тяжёлым, но я выжил. Завтра будет легче.",
    body_sensations: "Усталость, но спокойствие. Глаза закрываются",
    behavior: "Записал три вещи, за которые благодарен, и пошёл спать",
    evidence_supporting: "Действительно был тяжёлый день",
    evidence_against: "Я справился. Записал thoughts и нашёл альтернативы. Это уже прогресс.",
    alternative_thought: "Каждый тяжёлый день, который я переживаю с осознанностью, делает меня сильнее.",
    new_emotion_intensity: 2,
    lessons_learned: "Вечерняя рефлексия помогает закрыть день и подготовиться к следующему.",
    mood: 3,
    energy: 2,
    stress: 4,
    anxiety: 3,
    tags: ["дневник", "рефлексия"],
    distortions: [],
  },
]

export const EMOTION_ICONS: Record<string, string> = {
  "Тревога": "😟",
  "Спокойствие": "😌",
  "Радость": "😊",
  "Вина": "😔",
  "Удовлетворение": "🙂",
  "Раздражение": "😤",
  "Стыд": "😣",
  "Гордость": "💪",
  "Паника": "😱",
  "Облегчение": "😮‍💨",
  "Грусть": "😢",
  "Злость": "😠",
}

export const DEMO_PATTERNS: Record<string, { id: string; name: string; frequency: number; strength: number; firstSeen: string; lastSeen: string }[]> = {
  thought: [
    { id: "t1", name: "«Я не справлюсь»", frequency: 15, strength: 8, firstSeen: "2026-05-01", lastSeen: "2026-06-19" },
    { id: "t2", name: "«Меня будут критиковать»", frequency: 12, strength: 7, firstSeen: "2026-05-10", lastSeen: "2026-06-18" },
    { id: "t3", name: "«Я должен быть идеальным»", frequency: 8, strength: 6, firstSeen: "2026-05-15", lastSeen: "2026-06-17" },
  ],
  emotion: [
    { id: "e1", name: "Тревога перед встречами", frequency: 18, strength: 9, firstSeen: "2026-04-20", lastSeen: "2026-06-19" },
    { id: "e2", name: "Вина после конфликтов", frequency: 10, strength: 6, firstSeen: "2026-05-05", lastSeen: "2026-06-16" },
  ],
  trigger: [
    { id: "tr1", name: "Рабочие совещания", frequency: 20, strength: 10, firstSeen: "2026-04-15", lastSeen: "2026-06-19" },
    { id: "tr2", name: "Критика от руководства", frequency: 14, strength: 8, firstSeen: "2026-05-01", lastSeen: "2026-06-18" },
    { id: "tr3", name: "Конфликты с близкими", frequency: 7, strength: 5, firstSeen: "2026-05-20", lastSeen: "2026-06-16" },
  ],
  distortion: [
    { id: "d1", name: "Катастрофизация", frequency: 12, strength: 7, firstSeen: "2026-05-01", lastSeen: "2026-06-19" },
    { id: "d2", name: "Чтение мыслей", frequency: 9, strength: 6, firstSeen: "2026-05-10", lastSeen: "2026-06-18" },
    { id: "d3", name: "Долженствование", frequency: 8, strength: 5, firstSeen: "2026-05-15", lastSeen: "2026-06-17" },
  ],
  behavior: [
    { id: "b1", name: "Избегание совещаний", frequency: 11, strength: 7, firstSeen: "2026-05-01", lastSeen: "2026-06-19" },
    { id: "b2", name: "Перфекционизм в работе", frequency: 14, strength: 8, firstSeen: "2026-04-25", lastSeen: "2026-06-18" },
  ],
}

export const DEMO_INSIGHTS: AIInsight[] = [
  {
    id: "i1",
    user_id: "demo",
    type: "pattern",
    title: "Тревога по средам",
    content: "В последние 3 недели вы испытываете повышенную тревожность каждую среду, что совпадает с дневными совещаниями. Пик интенсивности — 8/10. Рекомендую подготовить план действий перед каждой средой.",
    confidence: 92,
    created_at: "2026-06-19T10:00:00",
    is_read: false,
    entry_id: "2",
  },
  {
    id: "i2",
    user_id: "demo",
    type: "suggestion",
    title: "Техника «Останови и замени»",
    content: "Когда замечаете катастрофическую мысль, остановитесь на 5 секунд, глубоко вдохните и задайте вопрос: «Что бы я сказал другу в этой ситуации?» Это помогает дистанцироваться от эмоций.",
    confidence: 88,
    created_at: "2026-06-18T14:30:00",
    is_read: false,
  },
  {
    id: "i3",
    user_id: "demo",
    type: "reflection",
    title: "Обесценивание позитива",
    content: "В записи от 17 июня вы получили положительный отзыв от клиента, но описали его как «просто вежливость». Обратите внимание на эту тенденцию — хорошие вещи заслуживают признания.",
    confidence: 85,
    created_at: "2026-06-17T20:00:00",
    is_read: true,
    entry_id: "4",
  },
  {
    id: "i4",
    user_id: "demo",
    type: "growth",
    title: "Прогресс в осознанности",
    content: "За последние 2 недели вы в 3 раза чаще записывали альтернативные мысли. Это серьёзный прогресс в когнитивном реструктурировании. Ваша способность видеть несколько сторон ситуации растёт!",
    confidence: 95,
    created_at: "2026-06-16T18:00:00",
    is_read: true,
  },
  {
    id: "i5",
    user_id: "demo",
    type: "pattern",
    title: "Чтение мыслей в рабочих ситуациях",
    content: "Вы часто предполагаете негативное отношение коллег: «Он точно думает, что я некомпетентен». В 80% случаев последующие записи показывают, что реальность была мягче.",
    confidence: 78,
    created_at: "2026-06-15T11:00:00",
    is_read: true,
  },
  {
    id: "i6",
    user_id: "demo",
    type: "suggestion",
    title: "Вечерняя рефлексия",
    content: "Попробуйте добавить короткую вечернюю запись (2-3 минуты): «Что прошло хорошо сегодня? За что я благодарен?» Это смещает фокус с негатива и улучшает сон.",
    confidence: 90,
    created_at: "2026-06-14T21:00:00",
    is_read: false,
  },
  {
    id: "i7",
    user_id: "demo",
    type: "reflection",
    title: "Эмоциональное восстановление",
    content: "В среднем ваша интенсивность негативных эмоций снижается на 40% после рефлексии. Это хороший показатель — ваш мозг учится регулировать реакции через осознанность.",
    confidence: 87,
    created_at: "2026-06-13T16:00:00",
    is_read: true,
  },
]

export const PATTERN_TYPE_LABELS: Record<string, string> = {
  thought: "Мысли",
  emotion: "Эмоции",
  trigger: "Триггеры",
  distortion: "Искажения",
  behavior: "Поведение",
}

export const PATTERN_TYPE_COLORS: Record<string, string> = {
  thought: "bg-blue-100 text-blue-700",
  emotion: "bg-purple-100 text-purple-700",
  trigger: "bg-orange-100 text-orange-700",
  distortion: "bg-red-100 text-red-700",
  behavior: "bg-green-100 text-green-700",
}

export function calculateStreak(entries: JournalEntry[]): number {
  if (entries.length === 0) return 0
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  let streak = 0
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  for (let i = 0; i < 30; i++) {
    const checkDate = new Date(today)
    checkDate.setDate(checkDate.getDate() - i)
    const dayStart = checkDate.getTime()
    const dayEnd = dayStart + 86400000
    const hasEntry = sorted.some(
      (e) => {
        const t = new Date(e.created_at).getTime()
        return t >= dayStart && t < dayEnd
      }
    )
    if (hasEntry) {
      streak++
    } else if (i > 0) {
      break
    }
  }
  return streak
}

export function getWeeklyData(entries: JournalEntry[]) {
  const dayNames = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"]
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)
  const weekEntries = entries.filter(
    (e) => new Date(e.created_at).getTime() >= weekAgo.getTime()
  )

  const result = dayNames.map((day, i) => {
    const dayEntries = weekEntries.filter((e) => {
      const d = new Date(e.created_at)
      return d.getDay() === i
    })
    const avgMood = dayEntries.length > 0
      ? dayEntries.reduce((s, e) => s + e.mood, 0) / dayEntries.length
      : 0
    const avgStress = dayEntries.length > 0
      ? dayEntries.reduce((s, e) => s + e.stress, 0) / dayEntries.length
      : 0
    const avgAnxiety = dayEntries.length > 0
      ? dayEntries.reduce((s, e) => s + e.anxiety, 0) / dayEntries.length
      : 0
    return {
      day,
      mood: Math.round(avgMood * 10) / 10,
      stress: Math.round(avgStress * 10) / 10,
      anxiety: Math.round(avgAnxiety * 10) / 10,
    }
  })

  return result
}

export function getTodayStats(entries: JournalEntry[]) {
  const now = new Date()
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
  const todayEntries = entries.filter(
    (e) => new Date(e.created_at).getTime() >= todayStart
  )

  const avgMood = todayEntries.length > 0
    ? Math.round((todayEntries.reduce((s, e) => s + e.mood, 0) / todayEntries.length) * 10) / 10
    : 0
  const distortionsCount = todayEntries.reduce(
    (s, e) => s + (e as JournalEntry & { distortions: string[] }).distortions.length,
    0
  )

  const lastEntry = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )[0]

  let lastActive = "Давно"
  if (lastEntry) {
    const diff = Date.now() - new Date(lastEntry.created_at).getTime()
    const hours = Math.floor(diff / 3600000)
    if (hours < 1) lastActive = "Только что"
    else if (hours < 24) lastActive = `${hours}ч назад`
    else {
      const days = Math.floor(hours / 24)
      lastActive = `${days} дн. назад`
    }
  }

  return { entriesCount: todayEntries.length, avgMood, distortionsCount, lastActive }
}

export function getWeekStats(entries: JournalEntry[]) {
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 86400000)
  const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000)

  const thisWeek = entries.filter((e) => new Date(e.created_at).getTime() >= weekAgo.getTime())
  const lastWeek = entries.filter((e) => {
    const t = new Date(e.created_at).getTime()
    return t >= twoWeeksAgo.getTime() && t < weekAgo.getTime()
  })

  const avgMoodThisWeek = thisWeek.length > 0
    ? Math.round((thisWeek.reduce((s, e) => s + e.mood, 0) / thisWeek.length) * 10) / 10
    : 0
  const avgMoodLastWeek = lastWeek.length > 0
    ? Math.round((lastWeek.reduce((s, e) => s + e.mood, 0) / lastWeek.length) * 10) / 10
    : 0

  const allDistortions = thisWeek.flatMap(
    (e) => (e as JournalEntry & { distortions: string[] }).distortions
  )
  const distortionCounts = allDistortions.reduce<Record<string, number>>((acc, d) => {
    acc[d] = (acc[d] || 0) + 1
    return acc
  }, {})
  const topDistortion = Object.entries(distortionCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || ""

  return {
    entriesThisWeek: thisWeek.length,
    entriesLastWeek: lastWeek.length,
    avgMoodThisWeek,
    avgMoodLastWeek,
    topDistortion,
  }
}

export function getMoodDistribution(entries: JournalEntry[]) {
  const counts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  entries.forEach((e) => { counts[e.mood] = (counts[e.mood] || 0) + 1 })
  const total = entries.length || 1
  return [
    { name: "Плохо", value: Math.round((counts[1] / total) * 100), color: "#ef4444" },
    { name: "Нормально", value: Math.round((counts[2] / total) * 100), color: "#f97316" },
    { name: "Нейтрально", value: Math.round((counts[3] / total) * 100), color: "#eab308" },
    { name: "Хорошо", value: Math.round((counts[4] / total) * 100), color: "#4a6fa5" },
    { name: "Отлично", value: Math.round((counts[5] / total) * 100), color: "#22c55e" },
  ].filter((d) => d.value > 0)
}

export function getEmotionDistribution(entries: JournalEntry[]) {
  const counts: Record<string, number> = {}
  entries.forEach((e) => { counts[e.emotion] = (counts[e.emotion] || 0) + 1 })
  const total = entries.length || 1
  const colors: Record<string, string> = {
    "Тревога": "#ef4444",
    "Спокойствие": "#4a6fa5",
    "Радость": "#22c55e",
    "Вина": "#a855f7",
    "Раздражение": "#f97316",
    "Удовлетворение": "#06b6d4",
    "Стыд": "#ec4899",
    "Гордость": "#10b981",
    "Паника": "#dc2626",
    "Облегчение": "#60a5fa",
  }
  return Object.entries(counts)
    .map(([name, count]) => ({
      name,
      value: Math.round((count / total) * 100),
      color: colors[name] || "#888",
    }))
    .sort((a, b) => b.value - a.value)
}

export function getDistortionFrequency(entries: JournalEntry[]) {
  const counts: Record<string, number> = {}
  entries.forEach((e) => {
    const distortions = (e as JournalEntry & { distortions: string[] }).distortions
    distortions.forEach((d) => { counts[d] = (counts[d] || 0) + 1 })
  })
  return Object.entries(counts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
}

export function getGrowthPercentage(entries: JournalEntry[]): number {
  if (entries.length < 4) return 0
  const sorted = [...entries].sort(
    (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  )
  const mid = Math.floor(sorted.length / 2)
  const firstHalf = sorted.slice(0, mid)
  const secondHalf = sorted.slice(mid)
  const avgFirst = firstHalf.reduce((s, e) => s + e.mood, 0) / firstHalf.length
  const avgSecond = secondHalf.reduce((s, e) => s + e.mood, 0) / secondHalf.length
  if (avgFirst === 0) return 0
  return Math.round(((avgSecond - avgFirst) / avgFirst) * 100)
}

export function getYearInPixels(entries: JournalEntry[]) {
  const colors = ["#ef4444", "#f97316", "#eab308", "#4a6fa5", "#22c55e"]
  const entriesByDay = new Map<number, number>()
  entries.forEach((e) => {
    const startOfYear = new Date(new Date(e.created_at).getFullYear(), 0, 0).getTime()
    const dayOfYear = Math.floor((new Date(e.created_at).getTime() - startOfYear) / 86400000)
    entriesByDay.set(dayOfYear, e.mood)
  })
  return Array.from({ length: 365 }, (_, i) => {
    const mood = entriesByDay.get(i + 1)
    return { day: i + 1, color: mood ? colors[mood - 1] : "#e5e7eb" }
  })
}
