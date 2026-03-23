import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface DayStats {
  date: string  // 'YYYY-MM-DD'
  minutes: number
}

interface SleepState {
  history: DayStats[]
  currentSessionStart: number | null
  streak: number

  startSession: () => void
  endSession: () => void
  getToday: () => DayStats | undefined
  getWeekTotal: () => number
}

function getTodayStr(): string {
  const d = new Date()
  return d.toISOString().slice(0, 10)
}

function calcStreak(history: DayStats[]): number {
  if (history.length === 0) return 0
  const sorted = [...history].filter(h => h.minutes > 0).sort((a, b) => b.date.localeCompare(a.date))
  if (sorted.length === 0) return 0

  const today = getTodayStr()
  // Start from today or yesterday
  let checkDate = new Date(today + 'T00:00:00')
  // If today has no entry, start from yesterday
  if (!sorted.find(h => h.date === today)) {
    checkDate.setDate(checkDate.getDate() - 1)
  }

  let streak = 0
  for (let i = 0; i < 30; i++) {
    const dateStr = checkDate.toISOString().slice(0, 10)
    if (sorted.find(h => h.date === dateStr)) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

export const useSleepStore = create<SleepState>()(
  persist(
    (set, get) => ({
      history: [],
      currentSessionStart: null,
      streak: 0,

      startSession: () => {
        if (get().currentSessionStart !== null) return
        set({ currentSessionStart: Date.now() })
      },

      endSession: () => {
        const { currentSessionStart, history } = get()
        if (currentSessionStart === null) return

        const elapsed = Math.round((Date.now() - currentSessionStart) / 60000)
        if (elapsed < 1) {
          set({ currentSessionStart: null })
          return
        }

        const today = getTodayStr()
        let updated = false
        const newHistory = history.map(h => {
          if (h.date === today) {
            updated = true
            return { ...h, minutes: h.minutes + elapsed }
          }
          return h
        })

        if (!updated) {
          newHistory.push({ date: today, minutes: elapsed })
        }

        // Keep only last 30 days
        const cutoff = new Date()
        cutoff.setDate(cutoff.getDate() - 30)
        const cutoffStr = cutoff.toISOString().slice(0, 10)
        const trimmed = newHistory.filter(h => h.date >= cutoffStr)

        const streak = calcStreak(trimmed)
        set({ history: trimmed, currentSessionStart: null, streak })
      },

      getToday: () => {
        const today = getTodayStr()
        return get().history.find(h => h.date === today)
      },

      getWeekTotal: () => {
        const now = new Date()
        const weekAgo = new Date()
        weekAgo.setDate(now.getDate() - 7)
        const weekStr = weekAgo.toISOString().slice(0, 10)
        return get().history
          .filter(h => h.date >= weekStr)
          .reduce((sum, h) => sum + h.minutes, 0)
      },
    }),
    {
      name: 'somnio-sleep',
      partialize: (state) => ({
        history: state.history,
        streak: state.streak,
      }),
    }
  )
)
