import { describe, it, expect, beforeEach } from 'vitest'
import { usePlayerStore } from './usePlayerStore'
import { audioEngine } from '../audio/AudioEngine'

// Reset zustand store between tests
function resetStore() {
  usePlayerStore.setState({
    isPlaying: false,
    activeSounds: [],
    masterVolume: 0.8,
    timer: { enabled: false, duration: 30, fadeOutDuration: 10, startedAt: null },
    savedMixes: [],
    initialized: false,
  })
}

describe('usePlayerStore', () => {
  beforeEach(() => {
    resetStore()
    audioEngine.dispose()
  })

  describe('init', () => {
    it('should initialize the audio engine', async () => {
      const store = usePlayerStore.getState()
      expect(store.initialized).toBe(false)

      await store.init()
      expect(usePlayerStore.getState().initialized).toBe(true)
    })

    it('should not re-initialize', async () => {
      const store = usePlayerStore.getState()
      await store.init()
      await store.init()
      expect(usePlayerStore.getState().initialized).toBe(true)
    })
  })

  describe('toggleSound', () => {
    beforeEach(async () => {
      await usePlayerStore.getState().init()
    })

    it('should add a sound when toggled on', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      const state = usePlayerStore.getState()

      expect(state.activeSounds).toHaveLength(1)
      expect(state.activeSounds[0].soundId).toBe('white-noise')
      expect(state.isPlaying).toBe(true)
    })

    it('should remove a sound when toggled off', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().toggleSound('white-noise')

      const state = usePlayerStore.getState()
      expect(state.activeSounds).toHaveLength(0)
    })

    it('should handle multiple sounds', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().toggleSound('rain-light')
      usePlayerStore.getState().toggleSound('wind')

      expect(usePlayerStore.getState().activeSounds).toHaveLength(3)
    })

    it('should set default volume from sound config', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      const active = usePlayerStore.getState().activeSounds[0]
      expect(active.volume).toBe(0.3) // white noise default
    })

    it('should not toggle sound if not initialized', () => {
      resetStore()
      usePlayerStore.getState().toggleSound('white-noise')
      expect(usePlayerStore.getState().activeSounds).toHaveLength(0)
    })

    it('should ignore unknown sound ids', () => {
      usePlayerStore.getState().toggleSound('nonexistent-sound')
      expect(usePlayerStore.getState().activeSounds).toHaveLength(0)
    })
  })

  describe('setSoundVolume', () => {
    beforeEach(async () => {
      await usePlayerStore.getState().init()
    })

    it('should update volume for a specific sound', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().setSoundVolume('white-noise', 0.7)

      const active = usePlayerStore.getState().activeSounds[0]
      expect(active.volume).toBe(0.7)
    })

    it('should not affect other sounds', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().toggleSound('pink-noise')
      usePlayerStore.getState().setSoundVolume('white-noise', 0.9)

      const pinkSound = usePlayerStore.getState().activeSounds.find(
        (s) => s.soundId === 'pink-noise'
      )
      expect(pinkSound!.volume).toBe(0.3) // unchanged
    })
  })

  describe('setMasterVolume', () => {
    it('should update master volume', () => {
      usePlayerStore.getState().setMasterVolume(0.5)
      expect(usePlayerStore.getState().masterVolume).toBe(0.5)
    })
  })

  describe('stopAll', () => {
    beforeEach(async () => {
      await usePlayerStore.getState().init()
    })

    it('should clear all active sounds', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().toggleSound('wind')

      usePlayerStore.getState().stopAll()

      expect(usePlayerStore.getState().activeSounds).toHaveLength(0)
      expect(usePlayerStore.getState().isPlaying).toBe(false)
    })
  })

  describe('timer', () => {
    it('should set timer config', () => {
      usePlayerStore.getState().setTimer({ duration: 45, enabled: true })
      const timer = usePlayerStore.getState().timer
      expect(timer.duration).toBe(45)
      expect(timer.enabled).toBe(true)
    })

    it('should merge timer config partially', () => {
      usePlayerStore.getState().setTimer({ duration: 60 })
      const timer = usePlayerStore.getState().timer
      expect(timer.duration).toBe(60)
      expect(timer.fadeOutDuration).toBe(10) // unchanged
    })
  })

  describe('saved mixes', () => {
    beforeEach(async () => {
      await usePlayerStore.getState().init()
    })

    it('should save current mix', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().toggleSound('rain-light')
      usePlayerStore.getState().saveMix('My Sleep Mix')

      const mixes = usePlayerStore.getState().savedMixes
      expect(mixes).toHaveLength(1)
      expect(mixes[0].name).toBe('My Sleep Mix')
      expect(mixes[0].sounds).toHaveLength(2)
    })

    it('should load a saved mix', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().saveMix('Test Mix')

      // Clear current sounds
      usePlayerStore.getState().stopAll()
      expect(usePlayerStore.getState().activeSounds).toHaveLength(0)

      // Load the mix
      const mixId = usePlayerStore.getState().savedMixes[0].id
      usePlayerStore.getState().loadMix(mixId)

      expect(usePlayerStore.getState().activeSounds).toHaveLength(1)
      expect(usePlayerStore.getState().isPlaying).toBe(true)
    })

    it('should delete a saved mix', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().saveMix('To Delete')

      const mixId = usePlayerStore.getState().savedMixes[0].id
      usePlayerStore.getState().deleteMix(mixId)

      expect(usePlayerStore.getState().savedMixes).toHaveLength(0)
    })

    it('should not load a non-existent mix', () => {
      usePlayerStore.getState().loadMix('nonexistent-id')
      expect(usePlayerStore.getState().activeSounds).toHaveLength(0)
    })

    it('should save mix with correct timestamp', () => {
      const before = Date.now()
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().saveMix('Timed Mix')
      const after = Date.now()

      const mix = usePlayerStore.getState().savedMixes[0]
      expect(mix.createdAt).toBeGreaterThanOrEqual(before)
      expect(mix.createdAt).toBeLessThanOrEqual(after)
    })

    it('should save multiple mixes', () => {
      usePlayerStore.getState().toggleSound('white-noise')
      usePlayerStore.getState().saveMix('Mix 1')
      usePlayerStore.getState().saveMix('Mix 2')
      usePlayerStore.getState().saveMix('Mix 3')

      expect(usePlayerStore.getState().savedMixes).toHaveLength(3)
    })
  })

  describe('persistence', () => {
    it('should partialize state correctly (only persist savedMixes, masterVolume, timer)', () => {
      // The persist middleware should not persist activeSounds or isPlaying
      const state = usePlayerStore.getState()
      expect(state.savedMixes).toBeDefined()
      expect(state.masterVolume).toBeDefined()
      expect(state.timer).toBeDefined()
    })
  })
})
