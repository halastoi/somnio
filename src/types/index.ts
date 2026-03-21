export type SoundCategory =
  | 'noise'
  | 'rain'
  | 'water'
  | 'nature'
  | 'urban'
  | 'cosmos'
  | 'baby'
  | 'fire'
  | 'wind'
  | 'binaural'

export type NoiseColor = 'white' | 'pink' | 'brown' | 'green' | 'gray'

export type SoundSourceType = 'procedural' | 'sample'

export interface Sound {
  id: string
  name: string
  category: SoundCategory
  icon: string
  sourceType: SoundSourceType
  /** For procedural sounds, the generator function name */
  generator?: string
  /** For sample sounds, the audio file path */
  sampleUrl?: string
  /** Default volume 0-1 */
  defaultVolume: number
}

export interface ActiveSound {
  soundId: string
  volume: number
  /** Web Audio nodes for this sound */
  nodes?: AudioNodeChain
}

export interface AudioNodeChain {
  source: AudioBufferSourceNode | OscillatorNode | AudioNode
  gain: GainNode
}

export interface Mix {
  id: string
  name: string
  sounds: ActiveSound[]
  createdAt: number
}

export interface TimerConfig {
  enabled: boolean
  /** Duration in minutes */
  duration: number
  /** Fade out duration in seconds */
  fadeOutDuration: number
  startedAt: number | null
}

export interface BreathingPattern {
  id: string
  name: string
  description: string
  /** [inhale, hold, exhale, hold] in seconds */
  pattern: [number, number, number, number]
}
