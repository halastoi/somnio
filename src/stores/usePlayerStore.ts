import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioEngine } from '../audio/AudioEngine'
import { startBackgroundKeepAlive, stopBackgroundKeepAlive } from '../audio/BackgroundKeepAlive'
import { sounds } from '../audio/sounds'
import { scenes } from '../data/scenes'
import { useSleepStore } from './useSleepStore'
import { useSettingsStore } from './useSettingsStore'
import type { ActiveSound, Mix, TimerConfig } from '../types'

interface PlayerState {
  isPlaying: boolean
  activeSounds: ActiveSound[]
  masterVolume: number
  timer: TimerConfig
  savedMixes: Mix[]
  initialized: boolean
  favorites: string[]
  activeSceneId: string | null
  previewingSoundId: string | null

  // Actions
  init: () => Promise<void>
  toggleSound: (soundId: string) => void
  setSoundVolume: (soundId: string, volume: number) => void
  setMasterVolume: (volume: number) => void
  playAll: () => void
  stopAll: () => void
  setTimer: (config: Partial<TimerConfig>) => void
  saveMix: (name: string) => void
  loadMix: (mixId: string) => void
  deleteMix: (mixId: string) => void
  toggleFavorite: (id: string) => void
  playNextFavorite: () => void
  playPrevFavorite: () => void
  updateMediaInfo: () => void
  loadScene: (sceneSounds: { soundId: string; volume: number }[], sceneId?: string) => void
  previewSound: (soundId: string) => void
  stopPreview: () => void
}

export const usePlayerStore = create<PlayerState>()(
  persist(
    (set, get) => ({
      isPlaying: false,
      activeSounds: [],
      masterVolume: 0.8,
      timer: {
        enabled: false,
        duration: 30,
        fadeOutDuration: 10,
        startedAt: null,
      },
      savedMixes: [],
      initialized: false,
      favorites: [],
      activeSceneId: null,
      previewingSoundId: null,

      init: async () => {
        if (get().initialized) return
        await audioEngine.init()
        audioEngine.setMediaSessionHandlers({
          onNext: () => get().playNextFavorite(),
          onPrev: () => get().playPrevFavorite(),
        })

        // Apply saved EQ settings
        const settings = useSettingsStore.getState()
        audioEngine.setEqualizer(settings.eqBass, settings.eqMid, settings.eqTreble)

        set({ initialized: true })
      },

      toggleSound: (soundId: string) => {
        const state = get()
        if (!state.initialized) return

        const existing = state.activeSounds.find((s) => s.soundId === soundId)

        if (existing) {
          audioEngine.stopSound(soundId)
          const remaining = state.activeSounds.filter((s) => s.soundId !== soundId)
          set({
            activeSounds: remaining,
            isPlaying: remaining.length > 0,
          })
          if (remaining.length === 0) {
            stopBackgroundKeepAlive()
            useSleepStore.getState().endSession()
          }
          get().updateMediaInfo()
        } else {
          const sound = sounds.find((s) => s.id === soundId)
          if (!sound) return

          const wasEmpty = state.activeSounds.length === 0
          const volume = sound.defaultVolume * state.masterVolume
          startSoundInEngine(soundId, sound.generator, sound.sampleUrl, volume)
          startBackgroundKeepAlive()

          set({
            activeSounds: [
              ...state.activeSounds,
              { soundId, volume: sound.defaultVolume },
            ],
            isPlaying: true,
          })
          if (wasEmpty) useSleepStore.getState().startSession()
          get().updateMediaInfo()
        }
      },

      setSoundVolume: (soundId: string, volume: number) => {
        const state = get()
        audioEngine.setVolume(soundId, volume * state.masterVolume)
        set({
          activeSounds: state.activeSounds.map((s) =>
            s.soundId === soundId ? { ...s, volume } : s
          ),
        })
      },

      setMasterVolume: (volume: number) => {
        audioEngine.setMasterVolume(volume)
        set({ masterVolume: volume })
      },

      playAll: () => {
        const state = get()
        if (!state.initialized) return

        audioEngine.resume()
        set({ isPlaying: true })
      },

      stopAll: () => {
        get().stopPreview()
        audioEngine.stopAll()
        stopBackgroundKeepAlive()
        useSleepStore.getState().endSession()
        set({ activeSounds: [], isPlaying: false, activeSceneId: null })
      },

      setTimer: (config: Partial<TimerConfig>) => {
        const newTimer = { ...get().timer, ...config }
        set({ timer: newTimer })

        // Manage the background timer interval
        if (newTimer.enabled && newTimer.startedAt) {
          startTimerInterval(get, set)
        } else {
          stopTimerInterval()
        }
      },

      saveMix: (name: string) => {
        const state = get()
        const mix: Mix = {
          id: crypto.randomUUID(),
          name,
          sounds: [...state.activeSounds],
          createdAt: Date.now(),
        }
        set({ savedMixes: [...state.savedMixes, mix] })
      },

      loadMix: (mixId: string) => {
        const state = get()
        const mix = state.savedMixes.find((m) => m.id === mixId)
        if (!mix || !state.initialized) return

        audioEngine.stopAll()

        for (const activeSound of mix.sounds) {
          const sound = sounds.find((s) => s.id === activeSound.soundId)
          if (!sound) continue
          const vol = activeSound.volume * state.masterVolume
          startSoundInEngine(activeSound.soundId, sound.generator, sound.sampleUrl, vol)
        }

        set({
          activeSounds: [...mix.sounds],
          isPlaying: mix.sounds.length > 0,
        })
      },

      deleteMix: (mixId: string) => {
        set({
          savedMixes: get().savedMixes.filter((m) => m.id !== mixId),
        })
      },

      toggleFavorite: (id: string) => {
        const { favorites } = get()
        set({
          favorites: favorites.includes(id)
            ? favorites.filter((f) => f !== id)
            : [...favorites, id],
        })
      },

      playNextFavorite: () => {
        const state = get()
        if (!state.initialized) return

        // If a scene is active, go to next scene
        if (state.activeSceneId) {
          const idx = scenes.findIndex((s) => s.id === state.activeSceneId)
          const nextScene = scenes[(idx + 1) % scenes.length]
          get().loadScene(nextScene.sounds, nextScene.id)
          return
        }

        // Otherwise navigate favorites
        if (state.favorites.length === 0) return

        const currentMelodic = state.activeSounds.find((as) => {
          const snd = sounds.find((s) => s.id === as.soundId)
          return snd?.melodic
        })

        const favSounds = state.favorites
        let nextIdx = 0
        if (currentMelodic) {
          const currentIdx = favSounds.indexOf(currentMelodic.soundId)
          nextIdx = currentIdx >= 0 ? (currentIdx + 1) % favSounds.length : 0
          audioEngine.stopSound(currentMelodic.soundId)
          const remaining = state.activeSounds.filter((s) => s.soundId !== currentMelodic.soundId)
          set({ activeSounds: remaining })
        }

        const nextId = favSounds[nextIdx]
        const nextSound = sounds.find((s) => s.id === nextId)
        if (!nextSound) return

        const vol = nextSound.defaultVolume * state.masterVolume
        startSoundInEngine(nextId, nextSound.generator, nextSound.sampleUrl, vol)
        startBackgroundKeepAlive()

        set({
          activeSounds: [...get().activeSounds, { soundId: nextId, volume: nextSound.defaultVolume }],
          isPlaying: true,
        })

        get().updateMediaInfo()
      },

      playPrevFavorite: () => {
        const state = get()
        if (!state.initialized) return

        // If a scene is active, go to previous scene
        if (state.activeSceneId) {
          const idx = scenes.findIndex((s) => s.id === state.activeSceneId)
          const prevScene = scenes[(idx - 1 + scenes.length) % scenes.length]
          get().loadScene(prevScene.sounds, prevScene.id)
          return
        }

        // Otherwise navigate favorites
        if (state.favorites.length === 0) return

        const currentMelodic = state.activeSounds.find((as) => {
          const snd = sounds.find((s) => s.id === as.soundId)
          return snd?.melodic
        })

        const favSounds = state.favorites
        let prevIdx = favSounds.length - 1
        if (currentMelodic) {
          const currentIdx = favSounds.indexOf(currentMelodic.soundId)
          prevIdx = currentIdx > 0 ? currentIdx - 1 : favSounds.length - 1
          audioEngine.stopSound(currentMelodic.soundId)
          const remaining = state.activeSounds.filter((s) => s.soundId !== currentMelodic.soundId)
          set({ activeSounds: remaining })
        }

        const prevId = favSounds[prevIdx]
        const prevSound = sounds.find((s) => s.id === prevId)
        if (!prevSound) return

        const vol = prevSound.defaultVolume * state.masterVolume
        startSoundInEngine(prevId, prevSound.generator, prevSound.sampleUrl, vol)
        startBackgroundKeepAlive()

        set({
          activeSounds: [...get().activeSounds, { soundId: prevId, volume: prevSound.defaultVolume }],
          isPlaying: true,
        })

        get().updateMediaInfo()
      },

      loadScene: (sceneSounds: { soundId: string; volume: number }[], sceneId?: string) => {
        const state = get()
        if (!state.initialized) return

        // Stop preview if any
        get().stopPreview()
        audioEngine.stopAll()

        for (const activeSound of sceneSounds) {
          const sound = sounds.find((s) => s.id === activeSound.soundId)
          if (!sound) continue
          const vol = activeSound.volume * state.masterVolume
          startSoundInEngine(activeSound.soundId, sound.generator, sound.sampleUrl, vol)
        }

        startBackgroundKeepAlive()

        set({
          activeSounds: sceneSounds.map(({ soundId, volume }) => ({ soundId, volume })),
          isPlaying: sceneSounds.length > 0,
          activeSceneId: sceneId ?? null,
        })

        get().updateMediaInfo()
      },

      updateMediaInfo: () => {
        const state = get()
        const activeScene = state.activeSceneId ? scenes.find((s) => s.id === state.activeSceneId) : null
        const names = activeScene
          ? activeScene.icon + ' ' + activeScene.nameKey.replace('scene.', '')
          : state.activeSounds
              .map((a) => sounds.find((s) => s.id === a.soundId)?.name)
              .filter(Boolean)
              .join(' + ')

        audioEngine.updateMediaSessionMetadata(
          names || 'Somnio',
          state.activeSounds.length > 0 ? `${state.activeSounds.length} sounds` : 'Sleep Soundscape'
        )
      },

      previewSound: (soundId: string) => {
        const state = get()
        if (!state.initialized) return

        // Stop any existing preview
        get().stopPreview()

        const sound = sounds.find((s) => s.id === soundId)
        if (!sound) return

        const previewId = `__preview_${soundId}`
        const vol = (sound.defaultVolume ?? 0.5) * state.masterVolume
        startSoundInEngine(previewId, sound.generator, sound.sampleUrl, vol)

        set({ previewingSoundId: soundId })

        // Auto-stop after 5 seconds
        previewTimer = setTimeout(() => {
          audioEngine.stopSound(previewId)
          set({ previewingSoundId: null })
          previewTimer = null
        }, 5000)
      },

      stopPreview: () => {
        const { previewingSoundId } = get()
        if (previewingSoundId) {
          audioEngine.stopSound(`__preview_${previewingSoundId}`)
          set({ previewingSoundId: null })
        }
        if (previewTimer) {
          clearTimeout(previewTimer)
          previewTimer = null
        }
      },
    }),
    {
      name: 'somnio-player',
      partialize: (state) => ({
        savedMixes: state.savedMixes,
        masterVolume: state.masterVolume,
        timer: state.timer,
        favorites: state.favorites,
      }),
    }
  )
)

let previewTimer: ReturnType<typeof setTimeout> | null = null

// Procedural generators handled directly by the AudioEngine
const NOISE_GENERATORS: Record<string, (id: string, vol: number) => void> = {
  // Noise colors
  white: (id, vol) => audioEngine.startWhiteNoise(id, vol),
  pink: (id, vol) => audioEngine.startPinkNoise(id, vol),
  brown: (id, vol) => audioEngine.startBrownNoise(id, vol),
  green: (id, vol) => audioEngine.startGreenNoise(id, vol),
  gray: (id, vol) => audioEngine.startGrayNoise(id, vol),
  violet: (id, vol) => audioEngine.startVioletNoise(id, vol),
  blue: (id, vol) => audioEngine.startBlueNoise(id, vol),
  velvet: (id, vol) => audioEngine.startBrownNoise(id, vol), // velvet ≈ warm brown
  static: (id, vol) => audioEngine.startWhiteNoise(id, vol), // static ≈ white
  'deep-bass': (id, vol) => audioEngine.startDeepBass(id, vol),
  // Wind
  wind: (id, vol) => audioEngine.startWind(id, vol),
  // Binaural beats (base 200Hz, varied beat frequencies)
  'binaural-delta': (id, vol) => audioEngine.startBinauralBeat(id, 200, 2, vol),
  'binaural-delta3': (id, vol) => audioEngine.startBinauralBeat(id, 200, 3, vol),
  'binaural-theta4': (id, vol) => audioEngine.startBinauralBeat(id, 200, 4, vol),
  'binaural-theta': (id, vol) => audioEngine.startBinauralBeat(id, 200, 6, vol),
  'binaural-theta8': (id, vol) => audioEngine.startBinauralBeat(id, 200, 8, vol),
  'binaural-alpha': (id, vol) => audioEngine.startBinauralBeat(id, 200, 10, vol),
  'binaural-alpha12': (id, vol) => audioEngine.startBinauralBeat(id, 200, 12, vol),
  'binaural-beta': (id, vol) => audioEngine.startBinauralBeat(id, 200, 15, vol),
  'binaural-beta20': (id, vol) => audioEngine.startBinauralBeat(id, 200, 20, vol),
  'binaural-beta25': (id, vol) => audioEngine.startBinauralBeat(id, 200, 25, vol),
  'binaural-gamma30': (id, vol) => audioEngine.startBinauralBeat(id, 200, 30, vol),
  'binaural-gamma35': (id, vol) => audioEngine.startBinauralBeat(id, 200, 35, vol),
  'binaural-gamma40': (id, vol) => audioEngine.startBinauralBeat(id, 200, 40, vol),
  'binaural-theta5': (id, vol) => audioEngine.startBinauralBeat(id, 200, 5, vol),
  'binaural-theta7': (id, vol) => audioEngine.startBinauralBeat(id, 200, 7, vol),
  'binaural-alpha9': (id, vol) => audioEngine.startBinauralBeat(id, 200, 9, vol),
  'binaural-alpha11': (id, vol) => audioEngine.startBinauralBeat(id, 200, 11, vol),
  'binaural-alpha13': (id, vol) => audioEngine.startBinauralBeat(id, 200, 13, vol),
  'binaural-beta18': (id, vol) => audioEngine.startBinauralBeat(id, 200, 18, vol),
  'binaural-schumann': (id, vol) => audioEngine.startBinauralBeat(id, 200, 7.83, vol),
  'binaural-deep1': (id, vol) => audioEngine.startBinauralBeat(id, 200, 1, vol),
  // Household noise generators
  'warm-white': (id, vol) => audioEngine.startWhiteNoise(id, vol * 0.8),
  'bright-pink': (id, vol) => audioEngine.startPinkNoise(id, vol * 1.1),
  'dark-brown': (id, vol) => audioEngine.startBrownNoise(id, vol * 1.2),
  'ocean-noise': (id, vol) => audioEngine.startBrownNoise(id, vol * 0.7),
  'rain-noise': (id, vol) => audioEngine.startPinkNoise(id, vol * 0.9),
  fan: (id, vol) => audioEngine.startBrownNoise(id, vol * 0.6),
  ac: (id, vol) => audioEngine.startPinkNoise(id, vol * 0.7),
  jet: (id, vol) => audioEngine.startBrownNoise(id, vol * 0.8),
  dryer: (id, vol) => audioEngine.startBrownNoise(id, vol * 0.7),
  vacuum: (id, vol) => audioEngine.startWhiteNoise(id, vol * 0.9),
}

// Environment sounds still using procedural generation
const PROCEDURAL_ENV = [
  'solar-wind', 'pulsar', 'shush', 'womb',
  'singing-bowl', 'temple-bell', 'wind-chimes', 'ambient-pad', 'om-drone',
]

function startSoundInEngine(
  id: string,
  generator: string | undefined,
  sampleUrl: string | undefined,
  volume: number
) {
  try {
    if (!generator) {
      if (sampleUrl) audioEngine.startSample(id, sampleUrl, volume)
      return
    }

    const noiseGen = NOISE_GENERATORS[generator]
    if (noiseGen) {
      noiseGen(id, volume)
      return
    }

    if (PROCEDURAL_ENV.includes(generator)) {
      audioEngine.startProcedural(id, generator, volume)
      return
    }

    if (sampleUrl) {
      audioEngine.startSample(id, sampleUrl, volume)
    }
  } catch (e) {
    console.error(`[Somnio] Failed to start sound "${id}" (generator: ${generator}):`, e)
  }
}

export { startSoundInEngine }

// ─── Background Timer (runs outside React lifecycle) ────────────────

let timerIntervalId: ReturnType<typeof setInterval> | null = null

function startTimerInterval(
  get: () => PlayerState,
  set: (partial: Partial<PlayerState>) => void,
) {
  stopTimerInterval()

  timerIntervalId = setInterval(() => {
    const { timer } = get()
    if (!timer.enabled || !timer.startedAt) {
      stopTimerInterval()
      return
    }

    const elapsed = (Date.now() - timer.startedAt) / 1000
    const total = timer.duration * 60
    const remaining = total - elapsed

    if (remaining <= 0) {
      // Time's up - stop everything
      audioEngine.stopAll()
      stopBackgroundKeepAlive()
      set({
        activeSounds: [],
        isPlaying: false,
        timer: { ...timer, enabled: false, startedAt: null },
      })
      stopTimerInterval()
    } else if (remaining <= timer.fadeOutDuration && remaining > 0) {
      // In fade-out zone - reduce master volume progressively
      const fadeProgress = remaining / timer.fadeOutDuration
      audioEngine.setMasterVolume(fadeProgress * get().masterVolume)
    }
  }, 1000)
}

function stopTimerInterval() {
  if (timerIntervalId) {
    clearInterval(timerIntervalId)
    timerIntervalId = null
  }
}
