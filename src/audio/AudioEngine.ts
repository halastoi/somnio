import { ProceduralSounds } from './ProceduralSounds'

/**
 * Core audio engine using Web Audio API
 * Handles both procedural generation and sample playback
 */
class AudioEngine {
  private context: AudioContext | null = null
  private masterGain: GainNode | null = null
  private activeNodes: Map<string, { source: AudioNode; gain: GainNode; stop?: () => void }> = new Map()
  private audioBuffers: Map<string, AudioBuffer> = new Map()
  private procedural: ProceduralSounds | null = null

  get isInitialized(): boolean {
    return this.context !== null
  }

  get currentTime(): number {
    return this.context?.currentTime ?? 0
  }

  /**
   * Must be called from a user gesture (click/tap)
   */
  async init(): Promise<void> {
    if (this.context) return

    this.context = new AudioContext()
    this.masterGain = this.context.createGain()
    this.masterGain.connect(this.context.destination)
    this.procedural = new ProceduralSounds(this.context)

    if (this.context.state === 'suspended') {
      await this.context.resume()
    }

    this.setupMediaSession()
  }

  private setupMediaSession(): void {
    if (!('mediaSession' in navigator)) return

    navigator.mediaSession.metadata = new MediaMetadata({
      title: 'Somnio',
      artist: 'Sleep Soundscape',
      album: 'Somnio',
    })

    navigator.mediaSession.setActionHandler('play', () => this.resume())
    navigator.mediaSession.setActionHandler('pause', () => this.suspend())
  }

  async resume(): Promise<void> {
    if (this.context?.state === 'suspended') {
      await this.context.resume()
    }
  }

  async suspend(): Promise<void> {
    if (this.context?.state === 'running') {
      await this.context.suspend()
    }
  }

  // ─── Procedural Noise Generators ────────────────────────

  startWhiteNoise(id: string, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)

    const bufferSize = 2 * this.context.sampleRate
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = this.context.createGain()
    gain.gain.value = volume

    source.connect(gain)
    gain.connect(this.masterGain)
    source.start()

    this.activeNodes.set(id, { source, gain })
  }

  startPinkNoise(id: string, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)

    const bufferSize = 2 * this.context.sampleRate
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99886 * b0 + white * 0.0555179
        b1 = 0.99332 * b1 + white * 0.0750759
        b2 = 0.96900 * b2 + white * 0.1538520
        b3 = 0.86650 * b3 + white * 0.3104856
        b4 = 0.55000 * b4 + white * 0.5329522
        b5 = -0.7616 * b5 - white * 0.0168980
        data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.11
        b6 = white * 0.115926
      }
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = this.context.createGain()
    gain.gain.value = volume

    source.connect(gain)
    gain.connect(this.masterGain)
    source.start()

    this.activeNodes.set(id, { source, gain })
  }

  startBrownNoise(id: string, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)

    const bufferSize = 2 * this.context.sampleRate
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      let lastOut = 0
      const data = buffer.getChannelData(channel)

      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = data[i]
        data[i] *= 3.5
      }
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = this.context.createGain()
    gain.gain.value = volume

    source.connect(gain)
    gain.connect(this.masterGain)
    source.start()

    this.activeNodes.set(id, { source, gain })
  }

  startGreenNoise(id: string, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)

    // Green noise = brown noise band-passed around 500Hz
    const bufferSize = 2 * this.context.sampleRate
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      let lastOut = 0
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (lastOut + 0.02 * white) / 1.02
        lastOut = data[i]
        data[i] *= 3.5
      }
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const bandpass = this.context.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = 500
    bandpass.Q.value = 0.5

    const gain = this.context.createGain()
    gain.gain.value = volume

    source.connect(bandpass)
    bandpass.connect(gain)
    gain.connect(this.masterGain)
    source.start()

    this.activeNodes.set(id, { source, gain })
  }

  startGrayNoise(id: string, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)

    // Gray noise = psychoacoustically flat (equal loudness curve)
    // Approximate with inverted A-weighting on white noise
    const bufferSize = 2 * this.context.sampleRate
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    // Low shelf boost + high shelf boost to compensate for ear sensitivity curve
    const lowShelf = this.context.createBiquadFilter()
    lowShelf.type = 'lowshelf'
    lowShelf.frequency.value = 200
    lowShelf.gain.value = 6

    const highShelf = this.context.createBiquadFilter()
    highShelf.type = 'highshelf'
    highShelf.frequency.value = 8000
    highShelf.gain.value = 4

    const gain = this.context.createGain()
    gain.gain.value = volume

    source.connect(lowShelf)
    lowShelf.connect(highShelf)
    highShelf.connect(gain)
    gain.connect(this.masterGain)
    source.start()

    this.activeNodes.set(id, { source, gain })
  }

  startVioletNoise(id: string, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)
    const bufferSize = 2 * this.context.sampleRate
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      let lastOut = 0
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = white - lastOut
        lastOut = white
      }
    }
    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const gain = this.context.createGain()
    gain.gain.value = volume
    source.connect(gain)
    gain.connect(this.masterGain)
    source.start()
    this.activeNodes.set(id, { source, gain })
  }

  startBlueNoise(id: string, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)
    const bufferSize = 2 * this.context.sampleRate
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      let lastOut = 0
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        data[i] = (white - lastOut) * 0.7
        lastOut = white
      }
    }
    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const hp = this.context.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 1000
    const gain = this.context.createGain()
    gain.gain.value = volume
    source.connect(hp)
    hp.connect(gain)
    gain.connect(this.masterGain)
    source.start()
    this.activeNodes.set(id, { source, gain })
  }

  startDeepBass(id: string, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)
    const bufferSize = 2 * this.context.sampleRate
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      let last = 0
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        data[i] = (last + 0.01 * w) / 1.01
        last = data[i]
        data[i] *= 4
      }
    }
    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true
    const lp = this.context.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 100
    const gain = this.context.createGain()
    gain.gain.value = volume
    source.connect(lp)
    lp.connect(gain)
    gain.connect(this.masterGain)
    source.start()
    this.activeNodes.set(id, { source, gain })
  }

  // ─── Binaural Beat Generator ────────────────────────

  startBinauralBeat(id: string, baseFreq: number, beatFreq: number, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)

    const merger = this.context.createChannelMerger(2)

    const oscLeft = this.context.createOscillator()
    oscLeft.frequency.value = baseFreq
    oscLeft.type = 'sine'

    const oscRight = this.context.createOscillator()
    oscRight.frequency.value = baseFreq + beatFreq
    oscRight.type = 'sine'

    const gainLeft = this.context.createGain()
    gainLeft.gain.value = 0.5
    const gainRight = this.context.createGain()
    gainRight.gain.value = 0.5

    oscLeft.connect(gainLeft)
    gainLeft.connect(merger, 0, 0)

    oscRight.connect(gainRight)
    gainRight.connect(merger, 0, 1)

    const gain = this.context.createGain()
    gain.gain.value = volume

    merger.connect(gain)
    gain.connect(this.masterGain)

    oscLeft.start()
    oscRight.start()

    this.activeNodes.set(id, { source: merger, gain })
  }

  // ─── Wind Generator ────────────────────────

  startWind(id: string, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)

    const bufferSize = 2 * this.context.sampleRate
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const bandpass = this.context.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = 300
    bandpass.Q.value = 0.2

    // LFO to modulate the filter frequency for wind gusts
    const lfo = this.context.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.15

    const lfoGain = this.context.createGain()
    lfoGain.gain.value = 200

    lfo.connect(lfoGain)
    lfoGain.connect(bandpass.frequency)
    lfo.start()

    const gain = this.context.createGain()
    gain.gain.value = volume

    source.connect(bandpass)
    bandpass.connect(gain)
    gain.connect(this.masterGain)
    source.start()

    this.activeNodes.set(id, { source, gain })
  }

  // ─── Heartbeat Generator ────────────────────────

  startHeartbeat(id: string, bpm: number, volume: number): void {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)

    const beatInterval = 60 / bpm
    const bufferSize = Math.floor(this.context.sampleRate * beatInterval)
    const buffer = this.context.createBuffer(2, bufferSize, this.context.sampleRate)

    for (let channel = 0; channel < 2; channel++) {
      const data = buffer.getChannelData(channel)
      const sr = this.context.sampleRate

      // First thump (lub)
      for (let i = 0; i < sr * 0.08; i++) {
        const t = i / sr
        data[i] = Math.sin(2 * Math.PI * 60 * t) * Math.exp(-t * 30) * 0.8
      }

      // Second thump (dub) - slightly delayed
      const offset = Math.floor(sr * 0.15)
      for (let i = 0; i < sr * 0.06; i++) {
        const t = i / sr
        if (offset + i < bufferSize) {
          data[offset + i] += Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 40) * 0.5
        }
      }
    }

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const lowpass = this.context.createBiquadFilter()
    lowpass.type = 'lowpass'
    lowpass.frequency.value = 150

    const gain = this.context.createGain()
    gain.gain.value = volume

    source.connect(lowpass)
    lowpass.connect(gain)
    gain.connect(this.masterGain)
    source.start()

    this.activeNodes.set(id, { source, gain })
  }

  // ─── Procedural Environment Sounds ────────────────────────

  startProcedural(id: string, generatorName: string, volume: number): void {
    if (!this.context || !this.masterGain || !this.procedural) return
    this.stopSound(id)

    type GeneratorMethod = () => { node: AudioNode; stop: () => void }
    const generators: Record<string, GeneratorMethod> = {
      'rain-light': () => this.procedural!.createRain('light'),
      'rain-heavy': () => this.procedural!.createRain('heavy'),
      thunder: () => this.procedural!.createThunder(),
      ocean: () => this.procedural!.createOcean(),
      stream: () => this.procedural!.createStream(),
      forest: () => this.procedural!.createForest(),
      crickets: () => this.procedural!.createCrickets(),
      fireplace: () => this.procedural!.createFireplace(),
      'coffee-shop': () => this.procedural!.createCoffeeShop(),
      train: () => this.procedural!.createTrain(),
      'cosmic-drone': () => this.procedural!.createCosmicDrone(),
      'solar-wind': () => this.procedural!.createSolarWind(),
      pulsar: () => this.procedural!.createPulsar(),
      shush: () => this.procedural!.createShush(),
      womb: () => this.procedural!.createWomb(),
      'lullaby-piano': () => this.procedural!.createLullabyPiano(),
      'music-box': () => this.procedural!.createMusicBox(),
    }

    const factory = generators[generatorName]
    if (!factory) {
      console.warn(`[Somnio] Unknown procedural generator: ${generatorName}`)
      return
    }

    try {
      const result = factory()
      const gain = this.context.createGain()
      gain.gain.value = volume

      result.node.connect(gain)
      gain.connect(this.masterGain)

      this.activeNodes.set(id, { source: result.node, gain, stop: result.stop })
    } catch (e) {
      console.error(`[Somnio] Failed to start procedural sound "${generatorName}":`, e)
    }
  }

  // ─── Sample Playback ────────────────────────

  async loadSample(url: string): Promise<AudioBuffer | null> {
    if (this.audioBuffers.has(url)) {
      return this.audioBuffers.get(url)!
    }

    if (!this.context) return null

    try {
      const response = await fetch(url)
      const arrayBuffer = await response.arrayBuffer()
      const audioBuffer = await this.context.decodeAudioData(arrayBuffer)
      this.audioBuffers.set(url, audioBuffer)
      return audioBuffer
    } catch (e) {
      console.error(`Failed to load sample: ${url}`, e)
      return null
    }
  }

  async startSample(id: string, url: string, volume: number): Promise<void> {
    if (!this.context || !this.masterGain) return
    this.stopSound(id)

    const buffer = await this.loadSample(url)
    if (!buffer) return

    const source = this.context.createBufferSource()
    source.buffer = buffer
    source.loop = true

    const gain = this.context.createGain()
    gain.gain.value = volume

    source.connect(gain)
    gain.connect(this.masterGain)
    source.start()

    this.activeNodes.set(id, { source, gain })
  }

  // ─── Controls ────────────────────────

  setVolume(id: string, volume: number): void {
    const node = this.activeNodes.get(id)
    if (node) {
      node.gain.gain.setTargetAtTime(volume, this.context?.currentTime ?? 0, 0.05)
    }
  }

  setMasterVolume(volume: number): void {
    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(volume, this.context.currentTime, 0.05)
    }
  }

  stopSound(id: string): void {
    const node = this.activeNodes.get(id)
    if (node) {
      try {
        if (node.stop) {
          node.stop()
        } else {
          if ('stop' in node.source && typeof node.source.stop === 'function') {
            (node.source as AudioBufferSourceNode).stop()
          }
          node.source.disconnect()
        }
        node.gain.disconnect()
      } catch {
        // Node may already be stopped
      }
      this.activeNodes.delete(id)
    }
  }

  fadeOutAndStop(id: string, duration: number): void {
    const node = this.activeNodes.get(id)
    if (node && this.context) {
      node.gain.gain.setTargetAtTime(0, this.context.currentTime, duration / 3)
      setTimeout(() => this.stopSound(id), duration * 1000)
    }
  }

  fadeOutAll(duration: number): void {
    if (this.masterGain && this.context) {
      this.masterGain.gain.setTargetAtTime(0, this.context.currentTime, duration / 3)
      setTimeout(() => {
        this.stopAll()
        if (this.masterGain && this.context) {
          this.masterGain.gain.value = 1
        }
      }, duration * 1000)
    }
  }

  stopAll(): void {
    for (const id of this.activeNodes.keys()) {
      this.stopSound(id)
    }
  }

  isPlaying(id: string): boolean {
    return this.activeNodes.has(id)
  }

  get activeSoundCount(): number {
    return this.activeNodes.size
  }

  dispose(): void {
    this.stopAll()
    this.context?.close()
    this.context = null
    this.masterGain = null
  }
}

export const audioEngine = new AudioEngine()
