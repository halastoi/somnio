import { describe, it, expect, beforeEach, vi } from 'vitest'
import { audioEngine } from './AudioEngine'

describe('AudioEngine', () => {
  beforeEach(() => {
    // Reset engine state between tests
    audioEngine.dispose()
  })

  describe('initialization', () => {
    it('should not be initialized by default after dispose', () => {
      expect(audioEngine.isInitialized).toBe(false)
    })

    it('should initialize on init()', async () => {
      await audioEngine.init()
      expect(audioEngine.isInitialized).toBe(true)
    })

    it('should not re-initialize if already initialized', async () => {
      await audioEngine.init()
      const firstInit = audioEngine.isInitialized
      await audioEngine.init()
      expect(audioEngine.isInitialized).toBe(firstInit)
    })

    it('should setup media session on init', async () => {
      await audioEngine.init()
      expect(navigator.mediaSession.metadata).toBeTruthy()
      expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('play', expect.any(Function))
      expect(navigator.mediaSession.setActionHandler).toHaveBeenCalledWith('pause', expect.any(Function))
    })
  })

  describe('noise generators', () => {
    beforeEach(async () => {
      await audioEngine.init()
    })

    it('should start and track white noise', () => {
      audioEngine.startWhiteNoise('test-white', 0.5)
      expect(audioEngine.isPlaying('test-white')).toBe(true)
      expect(audioEngine.activeSoundCount).toBe(1)
    })

    it('should start and track pink noise', () => {
      audioEngine.startPinkNoise('test-pink', 0.5)
      expect(audioEngine.isPlaying('test-pink')).toBe(true)
    })

    it('should start and track brown noise', () => {
      audioEngine.startBrownNoise('test-brown', 0.5)
      expect(audioEngine.isPlaying('test-brown')).toBe(true)
    })

    it('should start and track green noise', () => {
      audioEngine.startGreenNoise('test-green', 0.5)
      expect(audioEngine.isPlaying('test-green')).toBe(true)
    })

    it('should start and track gray noise', () => {
      audioEngine.startGrayNoise('test-gray', 0.5)
      expect(audioEngine.isPlaying('test-gray')).toBe(true)
    })

    it('should start and track wind', () => {
      audioEngine.startWind('test-wind', 0.5)
      expect(audioEngine.isPlaying('test-wind')).toBe(true)
    })

    it('should start and track heartbeat', () => {
      audioEngine.startHeartbeat('test-hb', 60, 0.5)
      expect(audioEngine.isPlaying('test-hb')).toBe(true)
    })

    it('should start and track binaural beats', () => {
      audioEngine.startBinauralBeat('test-binaural', 200, 6, 0.3)
      expect(audioEngine.isPlaying('test-binaural')).toBe(true)
    })
  })

  describe('procedural environment sounds', () => {
    beforeEach(async () => {
      await audioEngine.init()
    })

    const proceduralSounds = [
      'rain-light', 'rain-heavy', 'thunder', 'ocean', 'stream',
      'forest', 'crickets', 'fireplace', 'coffee-shop', 'train',
      'cosmic-drone', 'solar-wind', 'pulsar', 'shush', 'womb',
    ]

    proceduralSounds.forEach((name) => {
      it(`should start and track procedural sound: ${name}`, () => {
        audioEngine.startProcedural(`test-${name}`, name, 0.5)
        expect(audioEngine.isPlaying(`test-${name}`)).toBe(true)
      })
    })

    it('should not start with unknown generator name', () => {
      audioEngine.startProcedural('test-unknown', 'nonexistent', 0.5)
      expect(audioEngine.isPlaying('test-unknown')).toBe(false)
    })
  })

  describe('multiple sounds', () => {
    beforeEach(async () => {
      await audioEngine.init()
    })

    it('should play multiple sounds simultaneously', () => {
      audioEngine.startWhiteNoise('noise1', 0.3)
      audioEngine.startPinkNoise('noise2', 0.3)
      audioEngine.startWind('wind1', 0.4)

      expect(audioEngine.activeSoundCount).toBe(3)
      expect(audioEngine.isPlaying('noise1')).toBe(true)
      expect(audioEngine.isPlaying('noise2')).toBe(true)
      expect(audioEngine.isPlaying('wind1')).toBe(true)
    })

    it('should replace sound if started with same id', () => {
      audioEngine.startWhiteNoise('same-id', 0.3)
      audioEngine.startPinkNoise('same-id', 0.5)

      expect(audioEngine.activeSoundCount).toBe(1)
      expect(audioEngine.isPlaying('same-id')).toBe(true)
    })
  })

  describe('controls', () => {
    beforeEach(async () => {
      await audioEngine.init()
    })

    it('should stop a specific sound', () => {
      audioEngine.startWhiteNoise('to-stop', 0.3)
      expect(audioEngine.isPlaying('to-stop')).toBe(true)

      audioEngine.stopSound('to-stop')
      expect(audioEngine.isPlaying('to-stop')).toBe(false)
      expect(audioEngine.activeSoundCount).toBe(0)
    })

    it('should stop all sounds', () => {
      audioEngine.startWhiteNoise('n1', 0.3)
      audioEngine.startPinkNoise('n2', 0.3)
      audioEngine.startBrownNoise('n3', 0.3)

      audioEngine.stopAll()
      expect(audioEngine.activeSoundCount).toBe(0)
    })

    it('should handle stopping non-existent sound gracefully', () => {
      expect(() => audioEngine.stopSound('nonexistent')).not.toThrow()
    })

    it('should set volume for a specific sound', () => {
      audioEngine.startWhiteNoise('vol-test', 0.3)
      expect(() => audioEngine.setVolume('vol-test', 0.8)).not.toThrow()
    })

    it('should set master volume', () => {
      expect(() => audioEngine.setMasterVolume(0.5)).not.toThrow()
    })

    it('should handle setVolume for non-existent sound gracefully', () => {
      expect(() => audioEngine.setVolume('nope', 0.5)).not.toThrow()
    })
  })

  describe('fade operations', () => {
    beforeEach(async () => {
      await audioEngine.init()
    })

    it('should fade out and stop a sound', () => {
      vi.useFakeTimers()
      audioEngine.startWhiteNoise('fade-test', 0.5)

      audioEngine.fadeOutAndStop('fade-test', 2)
      // Sound should still be tracked immediately
      expect(audioEngine.isPlaying('fade-test')).toBe(true)

      // After fade duration
      vi.advanceTimersByTime(2000)
      expect(audioEngine.isPlaying('fade-test')).toBe(false)
      vi.useRealTimers()
    })

    it('should fade out all sounds', () => {
      vi.useFakeTimers()
      audioEngine.startWhiteNoise('f1', 0.3)
      audioEngine.startPinkNoise('f2', 0.3)

      audioEngine.fadeOutAll(3)
      expect(audioEngine.activeSoundCount).toBe(2)

      vi.advanceTimersByTime(3000)
      expect(audioEngine.activeSoundCount).toBe(0)
      vi.useRealTimers()
    })
  })

  describe('suspend and resume', () => {
    beforeEach(async () => {
      await audioEngine.init()
    })

    it('should suspend audio context', async () => {
      await audioEngine.suspend()
      // Mock tracks state internally
    })

    it('should resume audio context', async () => {
      await audioEngine.suspend()
      await audioEngine.resume()
    })
  })

  describe('dispose', () => {
    it('should clean up all resources', async () => {
      await audioEngine.init()
      audioEngine.startWhiteNoise('dispose-test', 0.3)

      audioEngine.dispose()
      expect(audioEngine.isInitialized).toBe(false)
      expect(audioEngine.activeSoundCount).toBe(0)
    })
  })

  describe('guard clauses', () => {
    it('should not start sounds before init', () => {
      audioEngine.startWhiteNoise('pre-init', 0.5)
      expect(audioEngine.isPlaying('pre-init')).toBe(false)
    })

    it('should not start procedural before init', () => {
      audioEngine.startProcedural('pre-init', 'rain-light', 0.5)
      expect(audioEngine.isPlaying('pre-init')).toBe(false)
    })

    it('should not start binaural before init', () => {
      audioEngine.startBinauralBeat('pre-init', 200, 6, 0.3)
      expect(audioEngine.isPlaying('pre-init')).toBe(false)
    })
  })
})
