import { vi } from 'vitest'
import '@testing-library/jest-dom/vitest'

// Mock localStorage
const store: Record<string, string> = {}
const mockStorage: Storage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value }),
  removeItem: vi.fn((key: string) => { delete store[key] }),
  clear: vi.fn(() => { Object.keys(store).forEach((k) => delete store[k]) }),
  get length() { return Object.keys(store).length },
  key: vi.fn((i: number) => Object.keys(store)[i] ?? null),
}

Object.defineProperty(globalThis, 'localStorage', { value: mockStorage, writable: true })

// Mock Web Audio API
class MockAudioContext {
  state: AudioContextState = 'running'
  sampleRate = 44100
  currentTime = 0
  destination = {} as AudioDestinationNode

  createGain(): GainNode {
    return {
      gain: { value: 1, setTargetAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
    } as unknown as GainNode
  }

  createBuffer(_channels: number, length: number, sampleRate: number): AudioBuffer {
    const channelData = new Float32Array(length)
    return {
      numberOfChannels: _channels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: vi.fn().mockReturnValue(channelData),
      copyFromChannel: vi.fn(),
      copyToChannel: vi.fn(),
    } as unknown as AudioBuffer
  }

  createBufferSource(): AudioBufferSourceNode {
    return {
      buffer: null,
      loop: false,
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as AudioBufferSourceNode
  }

  createOscillator(): OscillatorNode {
    return {
      type: 'sine' as OscillatorType,
      frequency: { value: 440, setTargetAtTime: vi.fn() },
      detune: { value: 0, setTargetAtTime: vi.fn() },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      start: vi.fn(),
      stop: vi.fn(),
    } as unknown as OscillatorNode
  }

  createBiquadFilter(): BiquadFilterNode {
    return {
      type: 'lowpass' as BiquadFilterType,
      frequency: { value: 350, setTargetAtTime: vi.fn() },
      Q: { value: 1 },
      gain: { value: 0 },
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
    } as unknown as BiquadFilterNode
  }

  createChannelMerger(inputs?: number): ChannelMergerNode {
    return {
      connect: vi.fn().mockReturnThis(),
      disconnect: vi.fn(),
      numberOfInputs: inputs ?? 6,
    } as unknown as ChannelMergerNode
  }

  async resume(): Promise<void> {
    this.state = 'running'
  }

  async suspend(): Promise<void> {
    this.state = 'suspended'
  }

  async close(): Promise<void> {
    this.state = 'closed'
  }

  decodeAudioData = vi.fn().mockResolvedValue({
    numberOfChannels: 2,
    length: 44100,
    sampleRate: 44100,
    duration: 1,
    getChannelData: vi.fn().mockReturnValue(new Float32Array(44100)),
  })
}

// @ts-expect-error - mock
globalThis.AudioContext = MockAudioContext
// @ts-expect-error - mock
globalThis.MediaMetadata = class {
  constructor(public init: Record<string, string>) {}
}

Object.defineProperty(navigator, 'mediaSession', {
  writable: true,
  value: {
    metadata: null,
    setActionHandler: vi.fn(),
  },
})

// Mock crypto.randomUUID
Object.defineProperty(globalThis.crypto, 'randomUUID', {
  value: vi.fn().mockReturnValue('test-uuid-1234'),
})

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Mock IntersectionObserver
globalThis.IntersectionObserver = class {
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  root = null
  rootMargin = ''
  thresholds = []
  takeRecords = vi.fn().mockReturnValue([])
} as unknown as typeof IntersectionObserver

// Mock requestAnimationFrame
globalThis.requestAnimationFrame = vi.fn().mockImplementation((cb: FrameRequestCallback) => {
  return setTimeout(() => cb(Date.now()), 0)
})
globalThis.cancelAnimationFrame = vi.fn().mockImplementation((id: number) => {
  clearTimeout(id)
})
