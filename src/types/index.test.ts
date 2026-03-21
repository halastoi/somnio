import { describe, it, expect } from 'vitest'
import type {
  Sound,
  ActiveSound,
  Mix,
  TimerConfig,
  BreathingPattern,
  SoundCategory,
  NoiseColor,
  SoundSourceType,
} from './index'

describe('types', () => {
  it('should allow valid Sound objects', () => {
    const sound: Sound = {
      id: 'test',
      name: 'Test',
      category: 'noise',
      icon: '🔊',
      sourceType: 'procedural',
      generator: 'white',
      defaultVolume: 0.5,
    }
    expect(sound.id).toBe('test')
  })

  it('should allow valid ActiveSound objects', () => {
    const active: ActiveSound = {
      soundId: 'test',
      volume: 0.5,
    }
    expect(active.soundId).toBe('test')
  })

  it('should allow valid Mix objects', () => {
    const mix: Mix = {
      id: 'mix-1',
      name: 'My Mix',
      sounds: [{ soundId: 'test', volume: 0.5 }],
      createdAt: Date.now(),
    }
    expect(mix.sounds).toHaveLength(1)
  })

  it('should allow valid TimerConfig objects', () => {
    const timer: TimerConfig = {
      enabled: true,
      duration: 30,
      fadeOutDuration: 10,
      startedAt: Date.now(),
    }
    expect(timer.enabled).toBe(true)
  })

  it('should allow valid BreathingPattern objects', () => {
    const pattern: BreathingPattern = {
      id: '4-7-8',
      name: '4-7-8',
      description: 'Relaxing breath',
      pattern: [4, 7, 8, 0],
    }
    expect(pattern.pattern).toEqual([4, 7, 8, 0])
  })

  it('should type check SoundCategory', () => {
    const categories: SoundCategory[] = [
      'noise', 'rain', 'water', 'nature', 'urban',
      'cosmos', 'baby', 'fire', 'wind', 'binaural',
    ]
    expect(categories).toHaveLength(10)
  })

  it('should type check NoiseColor', () => {
    const colors: NoiseColor[] = ['white', 'pink', 'brown', 'green', 'gray']
    expect(colors).toHaveLength(5)
  })

  it('should type check SoundSourceType', () => {
    const types: SoundSourceType[] = ['procedural', 'sample']
    expect(types).toHaveLength(2)
  })
})
