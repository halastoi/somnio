import { describe, it, expect, beforeEach } from 'vitest'
import { ProceduralSounds } from './ProceduralSounds'

describe('ProceduralSounds', () => {
  let ctx: AudioContext
  let procedural: ProceduralSounds

  beforeEach(() => {
    ctx = new AudioContext()
    procedural = new ProceduralSounds(ctx)
  })

  describe('createRain', () => {
    it('should create light rain', () => {
      const result = procedural.createRain('light')
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should create heavy rain', () => {
      const result = procedural.createRain('heavy')
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createRain('light')
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createThunder', () => {
    it('should create thunder', () => {
      const result = procedural.createThunder()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createThunder()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createOcean', () => {
    it('should create ocean', () => {
      const result = procedural.createOcean()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createOcean()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createStream', () => {
    it('should create stream', () => {
      const result = procedural.createStream()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createStream()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createForest', () => {
    it('should create forest', () => {
      const result = procedural.createForest()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createForest()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createCrickets', () => {
    it('should create crickets', () => {
      const result = procedural.createCrickets()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createCrickets()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createFireplace', () => {
    it('should create fireplace', () => {
      const result = procedural.createFireplace()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createFireplace()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createCoffeeShop', () => {
    it('should create coffee shop', () => {
      const result = procedural.createCoffeeShop()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createCoffeeShop()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createTrain', () => {
    it('should create train', () => {
      const result = procedural.createTrain()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createTrain()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createCosmicDrone', () => {
    it('should create cosmic drone', () => {
      const result = procedural.createCosmicDrone()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createCosmicDrone()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createSolarWind', () => {
    it('should create solar wind', () => {
      const result = procedural.createSolarWind()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createSolarWind()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createPulsar', () => {
    it('should create pulsar', () => {
      const result = procedural.createPulsar()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createPulsar()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createShush', () => {
    it('should create shush', () => {
      const result = procedural.createShush()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createShush()
      expect(() => result.stop()).not.toThrow()
    })
  })

  describe('createWomb', () => {
    it('should create womb sounds', () => {
      const result = procedural.createWomb()
      expect(result.node).toBeDefined()
      expect(result.stop).toBeInstanceOf(Function)
    })

    it('should stop without error', () => {
      const result = procedural.createWomb()
      expect(() => result.stop()).not.toThrow()
    })
  })
})
