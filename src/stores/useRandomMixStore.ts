import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface RandomMixConfig {
  soundCount: number
  volumeMin: number
  volumeMax: number
  allowedCategories: string[]
  avoidSameCategory: boolean
}

interface RandomMixState extends RandomMixConfig {
  showConfig: boolean
  setShowConfig: (v: boolean) => void
  setSoundCount: (v: number) => void
  setVolumeMin: (v: number) => void
  setVolumeMax: (v: number) => void
  toggleCategory: (cat: string) => void
  setAvoidSameCategory: (v: boolean) => void
}

const ALL_CATEGORIES = ['baby', 'noise', 'rain', 'water', 'nature', 'wind', 'fire', 'urban', 'cosmos', 'binaural']

export const useRandomMixStore = create<RandomMixState>()(
  persist(
    (set, get) => ({
      soundCount: 3,
      volumeMin: 0.2,
      volumeMax: 0.7,
      allowedCategories: [...ALL_CATEGORIES],
      avoidSameCategory: true,
      showConfig: false,

      setShowConfig: (showConfig) => set({ showConfig }),
      setSoundCount: (soundCount) => set({ soundCount: Math.max(1, Math.min(10, soundCount)) }),
      setVolumeMin: (volumeMin) => {
        const state = get()
        set({ volumeMin: Math.min(volumeMin, state.volumeMax - 0.05) })
      },
      setVolumeMax: (volumeMax) => {
        const state = get()
        set({ volumeMax: Math.max(volumeMax, state.volumeMin + 0.05) })
      },
      toggleCategory: (cat) => {
        const current = get().allowedCategories
        if (current.includes(cat)) {
          if (current.length <= 1) return // keep at least 1
          set({ allowedCategories: current.filter((c) => c !== cat) })
        } else {
          set({ allowedCategories: [...current, cat] })
        }
      },
      setAvoidSameCategory: (avoidSameCategory) => set({ avoidSameCategory }),
    }),
    {
      name: 'somnio-random-mix',
      partialize: (s) => ({
        soundCount: s.soundCount,
        volumeMin: s.volumeMin,
        volumeMax: s.volumeMax,
        allowedCategories: s.allowedCategories,
        avoidSameCategory: s.avoidSameCategory,
      }),
    }
  )
)
