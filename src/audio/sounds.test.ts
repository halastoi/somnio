import { describe, it, expect } from 'vitest'
import { sounds, categories, getSoundById, getSoundsByCategory } from './sounds'

describe('sounds library', () => {
  it('should have at least 20 sounds', () => {
    expect(sounds.length).toBeGreaterThanOrEqual(20)
  })

  it('should have unique ids for all sounds', () => {
    const ids = sounds.map((s) => s.id)
    const uniqueIds = new Set(ids)
    expect(uniqueIds.size).toBe(ids.length)
  })

  it('should have all required fields for every sound', () => {
    for (const sound of sounds) {
      expect(sound.id).toBeTruthy()
      expect(sound.name).toBeTruthy()
      expect(sound.category).toBeTruthy()
      expect(sound.icon).toBeTruthy()
      expect(sound.sourceType).toBeTruthy()
      expect(sound.defaultVolume).toBeGreaterThan(0)
      expect(sound.defaultVolume).toBeLessThanOrEqual(1)
    }
  })

  it('should have a generator defined for all procedural sounds', () => {
    const procedural = sounds.filter((s) => s.sourceType === 'procedural')
    for (const sound of procedural) {
      expect(sound.generator).toBeTruthy()
    }
  })

  it('should have all sounds assigned to valid categories', () => {
    const categoryIds = categories.map((c) => c.id)
    for (const sound of sounds) {
      expect(categoryIds).toContain(sound.category)
    }
  })

  it('should have at least one sound per category', () => {
    for (const category of categories) {
      const categorySounds = sounds.filter((s) => s.category === category.id)
      expect(categorySounds.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should have 10 categories', () => {
    expect(categories.length).toBe(10)
  })

  it('should have unique category ids', () => {
    const ids = categories.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  describe('noise colors', () => {
    const noiseColors = ['white-noise', 'pink-noise', 'brown-noise', 'green-noise', 'gray-noise']

    noiseColors.forEach((id) => {
      it(`should have ${id}`, () => {
        const sound = sounds.find((s) => s.id === id)
        expect(sound).toBeDefined()
        expect(sound!.category).toBe('noise')
        expect(sound!.sourceType).toBe('procedural')
      })
    })
  })

  describe('baby sleep sounds', () => {
    it('should have heartbeat, shush, and womb sounds', () => {
      const babyIds = ['heartbeat', 'shush', 'womb']
      for (const id of babyIds) {
        const sound = sounds.find((s) => s.id === id)
        expect(sound).toBeDefined()
        expect(sound!.category).toBe('baby')
      }
    })
  })

  describe('cosmos sounds', () => {
    it('should have cosmic drone, solar wind, and pulsar', () => {
      const cosmosIds = ['cosmic-drone', 'solar-wind', 'pulsar']
      for (const id of cosmosIds) {
        const sound = sounds.find((s) => s.id === id)
        expect(sound).toBeDefined()
        expect(sound!.category).toBe('cosmos')
      }
    })
  })

  describe('binaural beats', () => {
    it('should have delta, theta, and alpha waves', () => {
      const binauralIds = ['binaural-delta', 'binaural-theta', 'binaural-alpha']
      for (const id of binauralIds) {
        const sound = sounds.find((s) => s.id === id)
        expect(sound).toBeDefined()
        expect(sound!.category).toBe('binaural')
      }
    })
  })

  describe('getSoundById', () => {
    it('should return sound by id', () => {
      const sound = getSoundById('white-noise')
      expect(sound).toBeDefined()
      expect(sound!.name).toBe('White Noise')
    })

    it('should return undefined for unknown id', () => {
      expect(getSoundById('nonexistent')).toBeUndefined()
    })
  })

  describe('getSoundsByCategory', () => {
    it('should return all sounds in a category', () => {
      const noiseSounds = getSoundsByCategory('noise')
      expect(noiseSounds.length).toBeGreaterThanOrEqual(10)
      expect(noiseSounds.every((s) => s.category === 'noise')).toBe(true)
    })

    it('should return empty array for unknown category', () => {
      expect(getSoundsByCategory('nonexistent')).toHaveLength(0)
    })
  })

  describe('sound source types', () => {
    it('should have both procedural and sample-based sounds', () => {
      const procedural = sounds.filter((s) => s.sourceType === 'procedural')
      const sampleBased = sounds.filter((s) => s.sourceType === 'sample')
      expect(procedural.length).toBeGreaterThan(0)
      expect(sampleBased.length).toBeGreaterThan(0)
    })

    it('should have sampleUrl for all sample-based sounds', () => {
      const sampleBased = sounds.filter((s) => s.sourceType === 'sample')
      for (const sound of sampleBased) {
        expect(sound.sampleUrl).toBeTruthy()
        expect(sound.sampleUrl).toMatch(/\.mp3$/)
      }
    })
  })
})
