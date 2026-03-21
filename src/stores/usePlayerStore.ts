import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { audioEngine } from '../audio/AudioEngine'
import { startBackgroundKeepAlive, stopBackgroundKeepAlive } from '../audio/BackgroundKeepAlive'
import { sounds } from '../audio/sounds'
import type { ActiveSound, Mix, TimerConfig } from '../types'

interface PlayerState {
  isPlaying: boolean
  activeSounds: ActiveSound[]
  masterVolume: number
  timer: TimerConfig
  savedMixes: Mix[]
  initialized: boolean

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

      init: async () => {
        if (get().initialized) return
        await audioEngine.init()
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
          if (remaining.length === 0) stopBackgroundKeepAlive()
        } else {
          const sound = sounds.find((s) => s.id === soundId)
          if (!sound) return

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
        audioEngine.stopAll()
        stopBackgroundKeepAlive()
        set({ activeSounds: [], isPlaying: false })
      },

      setTimer: (config: Partial<TimerConfig>) => {
        set({ timer: { ...get().timer, ...config } })
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
    }),
    {
      name: 'somnio-player',
      partialize: (state) => ({
        savedMixes: state.savedMixes,
        masterVolume: state.masterVolume,
        timer: state.timer,
      }),
    }
  )
)

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
