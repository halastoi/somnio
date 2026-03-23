/**
 * Additional procedural sound generators
 * These replace sample-based sounds with pure Web Audio API generation
 * so the app works fully offline with zero audio file downloads.
 */

export class ProceduralSounds {
  private ctx: AudioContext

  constructor(ctx: AudioContext) {
    this.ctx = ctx
  }

  /**
   * Rain generator - layered filtered noise with random droplet impulses
   */
  createRain(intensity: 'light' | 'heavy' = 'light'): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const nodes: AudioNode[] = []
    const sources: AudioBufferSourceNode[] = []

    // Base rain texture (filtered noise)
    const bufferSize = 2 * this.ctx.sampleRate
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      const data = noiseBuffer.getChannelData(ch)
      let b0 = 0, b1 = 0, b2 = 0
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1
        b0 = 0.99765 * b0 + white * 0.0990460
        b1 = 0.96300 * b1 + white * 0.2965164
        b2 = 0.57000 * b2 + white * 1.0526913
        data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.06
      }
    }

    const noiseSource = this.ctx.createBufferSource()
    noiseSource.buffer = noiseBuffer
    noiseSource.loop = true
    sources.push(noiseSource)

    const bandpass = this.ctx.createBiquadFilter()
    bandpass.type = 'bandpass'
    bandpass.frequency.value = intensity === 'heavy' ? 2000 : 4000
    bandpass.Q.value = 0.3

    const highpass = this.ctx.createBiquadFilter()
    highpass.type = 'highpass'
    highpass.frequency.value = intensity === 'heavy' ? 200 : 800

    const rainGain = this.ctx.createGain()
    rainGain.gain.value = intensity === 'heavy' ? 0.8 : 0.4

    noiseSource.connect(bandpass)
    bandpass.connect(highpass)
    highpass.connect(rainGain)
    rainGain.connect(gain)
    noiseSource.start()

    nodes.push(bandpass, highpass, rainGain)

    // Low rumble for heavy rain
    if (intensity === 'heavy') {
      const rumbleBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)
      for (let ch = 0; ch < 2; ch++) {
        let last = 0
        const data = rumbleBuffer.getChannelData(ch)
        for (let i = 0; i < bufferSize; i++) {
          const w = Math.random() * 2 - 1
          data[i] = (last + 0.02 * w) / 1.02
          last = data[i]
          data[i] *= 2
        }
      }
      const rumbleSource = this.ctx.createBufferSource()
      rumbleSource.buffer = rumbleBuffer
      rumbleSource.loop = true
      sources.push(rumbleSource)

      const rumbleLp = this.ctx.createBiquadFilter()
      rumbleLp.type = 'lowpass'
      rumbleLp.frequency.value = 300

      const rumbleGain = this.ctx.createGain()
      rumbleGain.gain.value = 0.3

      rumbleSource.connect(rumbleLp)
      rumbleLp.connect(rumbleGain)
      rumbleGain.connect(gain)
      rumbleSource.start()

      nodes.push(rumbleLp, rumbleGain)
    }

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Thunder generator - filtered noise burst with envelope
   */
  createThunder(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: AudioBufferSourceNode[] = []
    const nodes: AudioNode[] = []

    // Continuous distant rumble
    const bufferSize = 4 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      let last = 0
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        data[i] = (last + 0.015 * w) / 1.015
        last = data[i]
        // Add periodic rumble peaks
        const t = i / this.ctx.sampleRate
        const rumble = Math.sin(t * 0.3) * Math.sin(t * 0.7) * Math.sin(t * 1.3)
        data[i] = data[i] * 3 * (0.3 + 0.7 * Math.abs(rumble))
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 400

    source.connect(lp)
    lp.connect(gain)
    gain.gain.value = 0.6
    source.start()
    nodes.push(lp)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Ocean waves - modulated noise with LFO
   */
  createOcean(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = []
    const nodes: AudioNode[] = []

    const bufferSize = 2 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      let b0 = 0, b1 = 0
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        b0 = 0.99 * b0 + w * 0.1
        b1 = 0.96 * b1 + w * 0.28
        data[i] = (b0 + b1) * 0.5
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    // Wave amplitude LFO (slow swell)
    const lfo = this.ctx.createOscillator()
    lfo.type = 'sine'
    lfo.frequency.value = 0.08 // ~7.5 sec wave cycle
    sources.push(lfo)

    const lfoGain = this.ctx.createGain()
    lfoGain.gain.value = 0.4

    const waveGain = this.ctx.createGain()
    waveGain.gain.value = 0.5

    lfo.connect(lfoGain)
    lfoGain.connect(waveGain.gain)
    lfo.start()

    // Bandpass for ocean character
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 600
    bp.Q.value = 0.3

    // LFO on filter frequency for wash effect
    const filterLfo = this.ctx.createOscillator()
    filterLfo.type = 'sine'
    filterLfo.frequency.value = 0.06
    sources.push(filterLfo)

    const filterLfoGain = this.ctx.createGain()
    filterLfoGain.gain.value = 300

    filterLfo.connect(filterLfoGain)
    filterLfoGain.connect(bp.frequency)
    filterLfo.start()

    source.connect(bp)
    bp.connect(waveGain)
    waveGain.connect(gain)
    source.start()

    nodes.push(lfoGain, waveGain, bp, filterLfoGain)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Stream / flowing water
   */
  createStream(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = []
    const nodes: AudioNode[] = []

    const bufferSize = 2 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 3000
    bp.Q.value = 0.5

    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 500

    // Subtle modulation
    const lfo = this.ctx.createOscillator()
    lfo.frequency.value = 0.25
    sources.push(lfo)

    const lfoG = this.ctx.createGain()
    lfoG.gain.value = 500
    lfo.connect(lfoG)
    lfoG.connect(bp.frequency)
    lfo.start()

    source.connect(bp)
    bp.connect(hp)
    hp.connect(gain)
    gain.gain.value = 0.3
    source.start()

    nodes.push(bp, hp, lfoG)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Forest ambience - layered filtered noise with bird-like chirps
   */
  createForest(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = []
    const nodes: AudioNode[] = []

    // Wind/leaves base
    const bufferSize = 2 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      let b0 = 0
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        b0 = 0.97 * b0 + w * 0.15
        data[i] = b0
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 1500
    bp.Q.value = 0.2

    const lfo = this.ctx.createOscillator()
    lfo.frequency.value = 0.1
    sources.push(lfo)

    const lfoG = this.ctx.createGain()
    lfoG.gain.value = 400
    lfo.connect(lfoG)
    lfoG.connect(bp.frequency)
    lfo.start()

    source.connect(bp)
    bp.connect(gain)
    gain.gain.value = 0.35
    source.start()

    nodes.push(bp, lfoG)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Crickets - high frequency oscillation with modulation
   */
  createCrickets(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    gain.gain.value = 0.15
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = []
    const nodes: AudioNode[] = []

    const bufferSize = 2 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      const sr = this.ctx.sampleRate
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sr
        // Cricket chirp pattern
        const chirpRate = 5 + Math.sin(t * 0.2) * 2
        const envelope = (Math.sin(t * chirpRate * Math.PI * 2) > 0.3) ? 1 : 0
        const tone = Math.sin(t * 4500 * Math.PI * 2) * 0.5 + Math.sin(t * 5200 * Math.PI * 2) * 0.3
        data[i] = tone * envelope * (0.3 + Math.random() * 0.1)
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 3000

    source.connect(hp)
    hp.connect(gain)
    source.start()
    nodes.push(hp)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Fireplace - crackling noise with pops
   */
  createFireplace(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: AudioBufferSourceNode[] = []
    const nodes: AudioNode[] = []

    const bufferSize = 4 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      const sr = this.ctx.sampleRate
      let b0 = 0
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sr
        // Base crackle
        const white = Math.random() * 2 - 1
        b0 = 0.85 * b0 + white * 0.15

        // Random pops
        const pop = Math.random() < 0.0003 ? (Math.random() * 2 - 1) * 3 : 0

        // Low rumble
        const rumble = Math.sin(t * 30 + Math.sin(t * 7) * 2) * 0.1

        data[i] = (b0 * 0.3 + pop + rumble) * (0.8 + Math.sin(t * 0.5) * 0.2)
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 4000

    source.connect(lp)
    lp.connect(gain)
    gain.gain.value = 0.5
    source.start()
    nodes.push(lp)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Coffee shop ambience
   */
  createCoffeeShop(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = []
    const nodes: AudioNode[] = []

    const bufferSize = 4 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      let b0 = 0, b1 = 0
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        b0 = 0.995 * b0 + w * 0.0555
        b1 = 0.965 * b1 + w * 0.1538
        // Murmur of conversations
        const murmur = (b0 + b1) * 0.7

        // Occasional clink
        const clink = Math.random() < 0.00005 ? Math.sin(i * 0.8) * Math.exp(-((i % 1000) / 100)) * 0.5 : 0

        data[i] = murmur + clink
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    // Bandpass for voice-like frequency
    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 800
    bp.Q.value = 0.3

    source.connect(bp)
    bp.connect(gain)
    gain.gain.value = 0.4
    source.start()
    nodes.push(bp)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Train journey - rhythmic clickety-clack with movement noise
   */
  createTrain(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: AudioBufferSourceNode[] = []
    const nodes: AudioNode[] = []

    const bufferSize = 4 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      let brown = 0
      const data = buffer.getChannelData(ch)
      const sr = this.ctx.sampleRate
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sr
        const w = Math.random() * 2 - 1

        // Movement base noise
        brown = (brown + 0.02 * w) / 1.02
        const movement = brown * 2

        // Rhythmic track joints
        const clickRate = 2.5
        const clickPhase = (t * clickRate) % 1
        const click = clickPhase < 0.05 ? Math.sin(clickPhase * 200) * Math.exp(-clickPhase * 80) : 0
        const click2Phase = ((t * clickRate + 0.5) % 1)
        const click2 = click2Phase < 0.04 ? Math.sin(click2Phase * 180) * Math.exp(-click2Phase * 100) * 0.6 : 0

        data[i] = movement * 0.4 + (click + click2) * 0.3
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 2000

    source.connect(lp)
    lp.connect(gain)
    gain.gain.value = 0.5
    source.start()
    nodes.push(lp)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Cosmic drone - deep space ambient
   */
  createCosmicDrone(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: OscillatorNode[] = []
    const nodes: AudioNode[] = []

    // Layer of detuned sine waves
    const freqs = [55, 82.5, 110, 165, 220]
    const detunes = [0, -5, 3, -7, 2]

    freqs.forEach((freq, i) => {
      const osc = this.ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq
      osc.detune.value = detunes[i]
      sources.push(osc)

      const oscGain = this.ctx.createGain()
      oscGain.gain.value = 0.08 / (i + 1)

      // Slow amplitude modulation
      const lfo = this.ctx.createOscillator()
      lfo.frequency.value = 0.03 + i * 0.01
      sources.push(lfo)

      const lfoG = this.ctx.createGain()
      lfoG.gain.value = 0.03 / (i + 1)

      lfo.connect(lfoG)
      lfoG.connect(oscGain.gain)
      lfo.start()

      osc.connect(oscGain)
      oscGain.connect(gain)
      osc.start()

      nodes.push(oscGain, lfoG)
    })

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Solar wind - ethereal filtered noise
   */
  createSolarWind(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = []
    const nodes: AudioNode[] = []

    const bufferSize = 2 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      let b0 = 0, b1 = 0
      const data = buffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        b0 = 0.998 * b0 + w * 0.04
        b1 = 0.985 * b1 + w * 0.12
        data[i] = (b0 + b1 * 0.5) * 2
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 200
    bp.Q.value = 0.15

    // Very slow sweep
    const lfo = this.ctx.createOscillator()
    lfo.frequency.value = 0.02
    sources.push(lfo)
    const lfoG = this.ctx.createGain()
    lfoG.gain.value = 150
    lfo.connect(lfoG)
    lfoG.connect(bp.frequency)
    lfo.start()

    source.connect(bp)
    bp.connect(gain)
    gain.gain.value = 0.5
    source.start()
    nodes.push(bp, lfoG)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Pulsar - rhythmic deep space pulse
   */
  createPulsar(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: AudioBufferSourceNode[] = []
    const nodes: AudioNode[] = []

    const bps = 1.33 // beats per second
    const bufferLen = Math.floor(this.ctx.sampleRate / bps)
    const fullBuffer = this.ctx.createBuffer(2, bufferLen, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      const data = fullBuffer.getChannelData(ch)
      const sr = this.ctx.sampleRate
      for (let i = 0; i < bufferLen; i++) {
        const t = i / sr
        const pulse = Math.sin(2 * Math.PI * 80 * t) * Math.exp(-t * 15)
        const harmonics = Math.sin(2 * Math.PI * 160 * t) * Math.exp(-t * 20) * 0.3
        data[i] = (pulse + harmonics) * 0.7
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = fullBuffer
    source.loop = true
    sources.push(source)

    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 300

    source.connect(lp)
    lp.connect(gain)
    gain.gain.value = 0.4
    source.start()
    nodes.push(lp)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Baby shush - continuous shushing sound
   */
  createShush(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = []
    const nodes: AudioNode[] = []

    const bufferSize = 4 * this.ctx.sampleRate
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      const sr = this.ctx.sampleRate
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sr
        const white = Math.random() * 2 - 1
        // Rhythmic shush envelope (~every 2 seconds)
        const cycle = t % 2
        const env = cycle < 1.2 ? Math.sin(cycle / 1.2 * Math.PI) : 0
        data[i] = white * env * 0.5
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    const bp = this.ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 4000
    bp.Q.value = 0.5

    source.connect(bp)
    bp.connect(gain)
    gain.gain.value = 0.4
    source.start()
    nodes.push(bp)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Womb sound - low rumble with muffled heartbeat
   */
  createWomb(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: AudioBufferSourceNode[] = []
    const nodes: AudioNode[] = []

    const bpm = 72
    const beatInterval = 60 / bpm
    const bufferSize = Math.floor(this.ctx.sampleRate * beatInterval * 4)
    const buffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)

    for (let ch = 0; ch < 2; ch++) {
      let brown = 0
      const data = buffer.getChannelData(ch)
      const sr = this.ctx.sampleRate
      for (let i = 0; i < bufferSize; i++) {
        const t = i / sr
        const w = Math.random() * 2 - 1

        // Constant low rumble
        brown = (brown + 0.01 * w) / 1.01
        const rumble = brown * 3

        // Muffled heartbeat
        const beatPhase = t % beatInterval
        const lub = Math.sin(2 * Math.PI * 40 * beatPhase) * Math.exp(-beatPhase * 25) * 0.4
        const dub = beatPhase > 0.15
          ? Math.sin(2 * Math.PI * 50 * (beatPhase - 0.15)) * Math.exp(-(beatPhase - 0.15) * 35) * 0.25
          : 0

        data[i] = rumble + lub + dub
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 200

    source.connect(lp)
    lp.connect(gain)
    gain.gain.value = 0.6
    source.start()
    nodes.push(lp)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Helper: create a simple feedback delay for reverb-like effect
   */
  private createDelay(delayTime: number, feedback: number, wetGain: number): {
    input: GainNode
    output: GainNode
    nodes: AudioNode[]
  } {
    const input = this.ctx.createGain()
    const output = this.ctx.createGain()
    const delay = this.ctx.createDelay(2)
    delay.delayTime.value = delayTime
    const fb = this.ctx.createGain()
    fb.gain.value = feedback
    const wet = this.ctx.createGain()
    wet.gain.value = wetGain
    const dry = this.ctx.createGain()
    dry.gain.value = 1

    // Darken the echoes
    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 1800

    // dry path
    input.connect(dry)
    dry.connect(output)

    // wet path with feedback
    input.connect(delay)
    delay.connect(lp)
    lp.connect(wet)
    wet.connect(output)
    lp.connect(fb)
    fb.connect(delay)

    return { input, output, nodes: [delay, fb, wet, dry, lp] }
  }

  // ─── New Procedural Generators ────────────────────────

  /**
   * Singing Bowl - sustained harmonic tone with slow decay and re-trigger
   */
  createSingingBowl(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const allNodes: AudioNode[] = []
    const allOscs: OscillatorNode[] = []
    const timers: ReturnType<typeof setTimeout>[] = []
    let stopped = false

    const reverb = this.createDelay(0.3, 0.35, 0.4)
    allNodes.push(...reverb.nodes, reverb.input, reverb.output)
    reverb.output.connect(gain)

    const triggerBowl = () => {
      if (stopped) return

      const fundamental = 220 + (Math.random() - 0.5) * 8
      const harmonics = [1, 2, 3, 4.5, 5.2]
      const amplitudes = [0.25, 0.15, 0.1, 0.06, 0.04]

      harmonics.forEach((mult, i) => {
        // Main oscillator
        const osc = this.ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = fundamental * mult
        allOscs.push(osc)

        // Detuned copy for chorus
        const osc2 = this.ctx.createOscillator()
        osc2.type = 'sine'
        osc2.frequency.value = fundamental * mult * 1.003
        allOscs.push(osc2)

        const oscGain = this.ctx.createGain()
        oscGain.gain.value = 0
        allNodes.push(oscGain)

        osc.connect(oscGain)
        osc2.connect(oscGain)
        oscGain.connect(reverb.input)

        const now = this.ctx.currentTime
        // Envelope: attack 2s, sustain 4s, decay 6s
        oscGain.gain.setTargetAtTime(amplitudes[i], now, 0.7)
        oscGain.gain.setTargetAtTime(amplitudes[i] * 0.8, now + 2, 1.5)
        oscGain.gain.setTargetAtTime(0, now + 6, 2)

        osc.start(now)
        osc2.start(now)
        osc.stop(now + 14)
        osc2.stop(now + 14)
      })

      // Re-trigger every 12-15 seconds
      const nextTrigger = 12000 + Math.random() * 3000
      const timer = setTimeout(() => triggerBowl(), nextTrigger)
      timers.push(timer)
    }

    triggerBowl()

    return {
      node: gain,
      stop: () => {
        stopped = true
        timers.forEach((t) => clearTimeout(t))
        allOscs.forEach((o) => { try { o.stop(); o.disconnect() } catch {} })
        allNodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Temple Bell - single bell strike that rings and decays, repeating randomly
   */
  createTempleBell(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const allNodes: AudioNode[] = []
    const allOscs: OscillatorNode[] = []
    const timers: ReturnType<typeof setTimeout>[] = []
    let stopped = false

    const reverb = this.createDelay(0.2, 0.3, 0.35)
    allNodes.push(...reverb.nodes, reverb.input, reverb.output)
    reverb.output.connect(gain)

    const triggerBell = () => {
      if (stopped) return

      const fundamental = 1200 + (Math.random() - 0.5) * 60
      // Inharmonic partials typical of bells
      const partials = [1, 2.76, 4.53, 6.85, 9.2]
      const amps = [0.12, 0.08, 0.05, 0.03, 0.02]

      const now = this.ctx.currentTime

      partials.forEach((mult, i) => {
        const osc = this.ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = fundamental * mult
        allOscs.push(osc)

        const oscGain = this.ctx.createGain()
        oscGain.gain.value = amps[i]
        allNodes.push(oscGain)

        // Exponential decay over 8-12 seconds
        const decayTime = 8 + Math.random() * 4
        oscGain.gain.setTargetAtTime(0, now, decayTime / 5)

        osc.connect(oscGain)
        oscGain.connect(reverb.input)

        osc.start(now)
        osc.stop(now + decayTime + 2)
      })

      // Random interval between 25-40 seconds
      const nextTrigger = 25000 + Math.random() * 15000
      const timer = setTimeout(() => triggerBell(), nextTrigger)
      timers.push(timer)
    }

    triggerBell()

    return {
      node: gain,
      stop: () => {
        stopped = true
        timers.forEach((t) => clearTimeout(t))
        allOscs.forEach((o) => { try { o.stop(); o.disconnect() } catch {} })
        allNodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Wind Chimes - random gentle chime sounds at irregular intervals
   */
  createWindChimes(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const allNodes: AudioNode[] = []
    const allOscs: OscillatorNode[] = []
    const timers: ReturnType<typeof setTimeout>[] = []
    let stopped = false

    const reverb = this.createDelay(0.18, 0.25, 0.3)
    allNodes.push(...reverb.nodes, reverb.input, reverb.output)
    reverb.output.connect(gain)

    // Pentatonic scale: C5, D5, E5, G5, A5
    const notes = [523, 587, 659, 784, 880]

    const triggerChime = () => {
      if (stopped) return

      const freq = notes[Math.floor(Math.random() * notes.length)]
      const detune = (Math.random() - 0.5) * 10 // slight detuning

      const osc = this.ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = freq + detune
      allOscs.push(osc)

      // Second partial for shimmer
      const osc2 = this.ctx.createOscillator()
      osc2.type = 'sine'
      osc2.frequency.value = freq * 2.01
      allOscs.push(osc2)

      const oscGain = this.ctx.createGain()
      oscGain.gain.value = 0
      allNodes.push(oscGain)

      osc.connect(oscGain)
      osc2.connect(oscGain)
      oscGain.connect(reverb.input)

      const now = this.ctx.currentTime
      const decayTime = 2 + Math.random() * 2

      // Short attack, medium decay
      oscGain.gain.setTargetAtTime(0.08, now, 0.01)
      oscGain.gain.setTargetAtTime(0, now + 0.1, decayTime / 4)

      osc.start(now)
      osc2.start(now)
      osc.stop(now + decayTime + 1)
      osc2.stop(now + decayTime + 1)

      // Next chime in 5-15 seconds
      const nextTrigger = 5000 + Math.random() * 10000
      const timer = setTimeout(() => triggerChime(), nextTrigger)
      timers.push(timer)
    }

    triggerChime()

    return {
      node: gain,
      stop: () => {
        stopped = true
        timers.forEach((t) => clearTimeout(t))
        allOscs.forEach((o) => { try { o.stop(); o.disconnect() } catch {} })
        allNodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Ambient Pad - slow evolving ambient pad with chord crossfading
   */
  createAmbientPad(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const allNodes: AudioNode[] = []
    const allOscs: OscillatorNode[] = []
    const timers: ReturnType<typeof setTimeout>[] = []
    let stopped = false
    let chordIndex = 0

    // Chord progression: Am -> F -> C -> G
    const chords = [
      [220, 261.63, 329.63],   // Am: A3, C4, E4
      [174.61, 220, 261.63],   // F: F3, A3, C4
      [261.63, 329.63, 392],   // C: C4, E4, G4
      [196, 246.94, 293.66],   // G: G3, B3, D4
    ]

    // Lowpass filter for warmth
    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 800
    lp.Q.value = 0.5
    allNodes.push(lp)
    lp.connect(gain)

    const playChord = () => {
      if (stopped) return

      const chord = chords[chordIndex % chords.length]
      chordIndex++

      const now = this.ctx.currentTime
      const chordDuration = 30 + Math.random() * 15

      chord.forEach((freq) => {
        const osc = this.ctx.createOscillator()
        osc.type = 'sine'
        osc.frequency.value = freq
        allOscs.push(osc)

        // Slow LFO modulating frequency slightly
        const lfo = this.ctx.createOscillator()
        lfo.type = 'sine'
        lfo.frequency.value = 0.05
        allOscs.push(lfo)

        const lfoGain = this.ctx.createGain()
        lfoGain.gain.value = 1.5
        allNodes.push(lfoGain)

        lfo.connect(lfoGain)
        lfoGain.connect(osc.frequency)

        const oscGain = this.ctx.createGain()
        oscGain.gain.value = 0
        allNodes.push(oscGain)

        osc.connect(oscGain)
        oscGain.connect(lp)

        // Crossfade: fade in over 4s, sustain, fade out over 4s
        oscGain.gain.setTargetAtTime(0.12, now, 1.3)
        oscGain.gain.setTargetAtTime(0, now + chordDuration - 5, 1.5)

        osc.start(now)
        lfo.start(now)
        osc.stop(now + chordDuration + 2)
        lfo.stop(now + chordDuration + 2)
      })

      const timer = setTimeout(() => playChord(), (chordDuration - 4) * 1000)
      timers.push(timer)
    }

    playChord()

    return {
      node: gain,
      stop: () => {
        stopped = true
        timers.forEach((t) => clearTimeout(t))
        allOscs.forEach((o) => { try { o.stop(); o.disconnect() } catch {} })
        allNodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Om Drone - deep om/drone sound with amplitude modulation and breath texture
   */
  createOmDrone(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: (AudioBufferSourceNode | OscillatorNode)[] = []
    const nodes: AudioNode[] = []

    const fundamental = 55 // A1
    const harmonics = [1, 2, 3, 4, 5]
    const amps = [0.2, 0.12, 0.07, 0.04, 0.025]

    harmonics.forEach((mult, i) => {
      const osc = this.ctx.createOscillator()
      osc.type = 'sine'
      osc.frequency.value = fundamental * mult
      sources.push(osc)

      const oscGain = this.ctx.createGain()
      oscGain.gain.value = amps[i]
      nodes.push(oscGain)

      // Subtle amplitude modulation via LFO
      const lfo = this.ctx.createOscillator()
      lfo.type = 'sine'
      lfo.frequency.value = 0.1 + i * 0.02
      sources.push(lfo)

      const lfoGain = this.ctx.createGain()
      lfoGain.gain.value = amps[i] * 0.3
      nodes.push(lfoGain)

      lfo.connect(lfoGain)
      lfoGain.connect(oscGain.gain)

      osc.connect(oscGain)
      oscGain.connect(gain)

      osc.start()
      lfo.start()
    })

    // Filtered noise layer for "breath" texture
    const bufferSize = 2 * this.ctx.sampleRate
    const noiseBuffer = this.ctx.createBuffer(2, bufferSize, this.ctx.sampleRate)
    for (let ch = 0; ch < 2; ch++) {
      let b0 = 0
      const data = noiseBuffer.getChannelData(ch)
      for (let i = 0; i < bufferSize; i++) {
        const w = Math.random() * 2 - 1
        b0 = 0.99 * b0 + w * 0.1
        data[i] = b0
      }
    }

    const noiseSrc = this.ctx.createBufferSource()
    noiseSrc.buffer = noiseBuffer
    noiseSrc.loop = true
    sources.push(noiseSrc)

    const noiseBp = this.ctx.createBiquadFilter()
    noiseBp.type = 'bandpass'
    noiseBp.frequency.value = 150
    noiseBp.Q.value = 0.3
    nodes.push(noiseBp)

    const noiseGain = this.ctx.createGain()
    noiseGain.gain.value = 0.06
    nodes.push(noiseGain)

    // Breath LFO modulating noise level
    const breathLfo = this.ctx.createOscillator()
    breathLfo.type = 'sine'
    breathLfo.frequency.value = 0.08
    sources.push(breathLfo)

    const breathLfoGain = this.ctx.createGain()
    breathLfoGain.gain.value = 0.04
    nodes.push(breathLfoGain)

    breathLfo.connect(breathLfoGain)
    breathLfoGain.connect(noiseGain.gain)

    noiseSrc.connect(noiseBp)
    noiseBp.connect(noiseGain)
    noiseGain.connect(gain)

    noiseSrc.start()
    breathLfo.start()

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        nodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * FM synthesis piano note - much more realistic than additive sine waves
   * FM synthesis creates the complex harmonic spectrum of a real piano
   */
  private synthPianoNote(
    data: Float32Array,
    startSample: number,
    freq: number,
    duration: number,
    velocity: number,
    sr: number,
    stereoOffset: number,
  ): void {
    const samples = Math.floor(duration * sr)

    // FM synthesis parameters - modulator creates harmonic richness
    const modRatio = 1.0 // modulator frequency ratio
    const modIndex = 2.5 * velocity // higher velocity = brighter tone
    const modDecay = 4.0 // modulator decays faster = bright attack, mellow sustain

    // Slight inharmonicity (real pianos have slightly stretched partials)
    const inharmonicity = 1 + freq * 0.00002

    // Two-stage decay: initial fast drop + long tail (like real piano damper)
    const decayFast = 1.8 + (1 - velocity) * 1.5 // velocity affects sustain
    const decaySlow = 0.4
    const crossover = 0.3 // seconds where fast transitions to slow

    for (let i = 0; i < samples; i++) {
      const t = i / sr
      const idx = startSample + i
      if (idx >= data.length) break

      // Envelope: soft attack + two-stage decay
      const attack = 1 - Math.exp(-t * 200) // ~5ms attack
      const envFast = Math.exp(-t * decayFast)
      const envSlow = Math.exp(-t * decaySlow)
      const mix = Math.min(t / crossover, 1)
      const envelope = attack * (envFast * (1 - mix) + envSlow * mix * 0.15)

      // FM modulator (decays over time = bright attack becoming mellow)
      const modEnv = Math.exp(-t * modDecay)
      const modulator = Math.sin(2 * Math.PI * freq * modRatio * t) * modIndex * modEnv

      // Carrier with FM modulation
      const carrier = Math.sin(2 * Math.PI * freq * t + modulator)

      // Second partial with slight inharmonicity
      const partial2Env = Math.exp(-t * (decayFast + 2))
      const partial2 = Math.sin(2 * Math.PI * freq * 2 * inharmonicity * t) * 0.15 * partial2Env

      // Subtle chorus (slight detuning for warmth)
      const chorus = Math.sin(2 * Math.PI * (freq * 1.002 + stereoOffset) * t) * 0.05 * Math.exp(-t * 3)

      data[idx] += (carrier + partial2 + chorus) * envelope * velocity * 0.22
    }
  }

  /**
   * Lullaby Piano - Brahms Lullaby style with FM synthesis + reverb
   */
  createLullabyPiano(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: AudioBufferSourceNode[] = []
    const allNodes: AudioNode[] = []

    const sr = this.ctx.sampleRate

    // Brahms Lullaby melody in Eb major (transposed to a warm register)
    // [frequency, duration in beats, velocity 0-1]
    type Note = [number, number, number]
    const bpm = 60 // very slow, dreamy
    const beatDur = 60 / bpm

    // Eb4=311.13 F4=349.23 G4=392.00 Ab4=415.30 Bb4=466.16
    // C5=523.25 D5=587.33 Eb5=622.25
    const Eb4 = 311.13, F4 = 349.23, G4 = 392.00, Ab4 = 415.30, Bb4 = 466.16
    const C5 = 523.25, Eb5 = 622.25

    const melody: Note[] = [
      // Phrase 1: gentle rise
      [G4, 1.5, 0.6],  [G4, 0.5, 0.4],  [Bb4, 2, 0.7],
      [G4, 1.5, 0.55], [G4, 0.5, 0.4],  [Bb4, 2, 0.65],
      // Phrase 2: climax and fall
      [G4, 1, 0.5],    [Bb4, 1, 0.6],   [Eb5, 2, 0.75],
      [C5, 1, 0.6],    [Bb4, 1, 0.5],   [Ab4, 2, 0.55],
      // Phrase 3: tender descent
      [F4, 1, 0.5],    [Ab4, 1, 0.55],  [G4, 2, 0.6],
      [F4, 1, 0.45],   [Ab4, 1, 0.5],   [G4, 2, 0.55],
      // Phrase 4: resolution
      [Eb4, 1, 0.5],   [F4, 1, 0.5],    [G4, 1.5, 0.6],
      [F4, 0.5, 0.4],  [Eb4, 3, 0.65],
      // Rest
      [0, 2, 0],
    ]

    // Calculate total duration
    let totalBeats = 0
    for (const [, dur] of melody) totalBeats += dur
    const totalDuration = totalBeats * beatDur + 2 // + 2s for reverb tail
    const bufferSize = Math.floor(sr * totalDuration)
    const buffer = this.ctx.createBuffer(2, bufferSize, sr)

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      let currentTime = 0

      for (const [freq, durBeats, velocity] of melody) {
        if (freq > 0) {
          const startSample = Math.floor(currentTime * sr)
          const noteDur = durBeats * beatDur * 1.5 // notes ring longer than their slot
          const stereoOffset = ch === 0 ? 0 : 0.3

          this.synthPianoNote(data, startSample, freq, noteDur, velocity, sr, stereoOffset)
        }
        currentTime += durBeats * beatDur
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    // Warm lowpass
    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 3000
    lp.Q.value = 0.5

    // Reverb via feedback delay
    const reverb = this.createDelay(0.25, 0.3, 0.35)
    const reverb2 = this.createDelay(0.4, 0.2, 0.2)

    source.connect(lp)
    lp.connect(reverb.input)
    reverb.output.connect(reverb2.input)
    reverb2.output.connect(gain)
    gain.gain.value = 0.8
    source.start()

    allNodes.push(lp, ...reverb.nodes, reverb.input, reverb.output, ...reverb2.nodes, reverb2.input, reverb2.output)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        allNodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }

  /**
   * Music Box - Für Elise style with metallic FM tones + shimmer delay
   */
  createMusicBox(): { node: AudioNode; stop: () => void } {
    const gain = this.ctx.createGain()
    const sources: AudioBufferSourceNode[] = []
    const allNodes: AudioNode[] = []

    const sr = this.ctx.sampleRate
    const bpm = 90
    const beatDur = 60 / bpm

    // Music box in higher register
    // E5=659.25 D#5=622.25 B4=493.88 D5=587.33 C5=523.25 A4=440
    // E4=329.63 G#4=415.30 B4=493.88
    const E5 = 659.25, Ds5 = 622.25, B4 = 493.88, D5 = 587.33
    const C5 = 523.25, A4 = 440, E4 = 329.63, Gs4 = 415.30

    type Note = [number, number, number]
    const melody: Note[] = [
      // Für Elise opening motif (simplified, music box style)
      [E5, 0.5, 0.7],  [Ds5, 0.5, 0.6],  [E5, 0.5, 0.65],
      [Ds5, 0.5, 0.55], [E5, 0.5, 0.6],   [B4, 0.5, 0.55],
      [D5, 0.5, 0.6],  [C5, 0.5, 0.55],  [A4, 1.5, 0.7],
      [0, 0.5, 0],
      // Second part
      [E4, 0.5, 0.45], [Gs4, 0.5, 0.5],  [A4, 0.5, 0.5],
      [B4, 1.5, 0.65],
      [0, 0.5, 0],
      [E4, 0.5, 0.45], [E5, 0.5, 0.6],   [Ds5, 0.5, 0.55],
      [E5, 0.5, 0.6],
      // Repeat motif
      [Ds5, 0.5, 0.55], [E5, 0.5, 0.6],   [B4, 0.5, 0.55],
      [D5, 0.5, 0.6],  [C5, 0.5, 0.55],  [A4, 1.5, 0.7],
      // Gentle ending
      [0, 1, 0],
    ]

    let totalBeats = 0
    for (const [, dur] of melody) totalBeats += dur
    const totalDuration = totalBeats * beatDur + 2
    const bufferSize = Math.floor(sr * totalDuration)
    const buffer = this.ctx.createBuffer(2, bufferSize, sr)

    for (let ch = 0; ch < 2; ch++) {
      const data = buffer.getChannelData(ch)
      let currentTime = 0

      for (const [freq, durBeats, velocity] of melody) {
        if (freq > 0) {
          const startSample = Math.floor(currentTime * sr)
          const noteDur = durBeats * beatDur * 1.2
          const samples = Math.floor(noteDur * sr)

          // Music box uses metallic FM with higher mod ratio
          const modRatio = 7.0 // high ratio = metallic/bell-like
          const modIndex = 3.0 * velocity
          const modDecay = 12.0 // fast mod decay = sharp bell attack

          for (let i = 0; i < samples; i++) {
            const t = i / sr
            const idx = startSample + i
            if (idx >= data.length) break

            // Sharp attack, clean ring
            const attack = 1 - Math.exp(-t * 500)
            const decay = Math.exp(-t * 3.5)
            const envelope = attack * decay

            // FM with metallic modulator
            const modEnv = Math.exp(-t * modDecay)
            const mod = Math.sin(2 * Math.PI * freq * modRatio * t) * modIndex * modEnv
            const carrier = Math.sin(2 * Math.PI * freq * t + mod)

            // High harmonic shimmer
            const shimmer = Math.sin(2 * Math.PI * freq * 3.01 * t) * 0.08 * Math.exp(-t * 6)

            // Stereo: slightly different in each ear
            const pan = ch === 0 ? 1.0 : 0.92
            data[idx] += (carrier + shimmer) * envelope * velocity * 0.18 * pan
          }
        }
        currentTime += durBeats * beatDur
      }
    }

    const source = this.ctx.createBufferSource()
    source.buffer = buffer
    source.loop = true
    sources.push(source)

    // Shimmer delay (music box has a natural resonance)
    const reverb = this.createDelay(0.15, 0.25, 0.3)

    // Gentle highpass to keep it bright + lowpass to avoid harshness
    const hp = this.ctx.createBiquadFilter()
    hp.type = 'highpass'
    hp.frequency.value = 300

    const lp = this.ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 6000

    source.connect(hp)
    hp.connect(lp)
    lp.connect(reverb.input)
    reverb.output.connect(gain)
    gain.gain.value = 0.6
    source.start()

    allNodes.push(hp, lp, ...reverb.nodes, reverb.input, reverb.output)

    return {
      node: gain,
      stop: () => {
        sources.forEach((s) => { try { s.stop(); s.disconnect() } catch {} })
        allNodes.forEach((n) => { try { n.disconnect() } catch {} })
        gain.disconnect()
      },
    }
  }
}
