import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { PlayerBar } from './PlayerBar'
import { usePlayerStore } from '../../stores/usePlayerStore'

function resetStore() {
  usePlayerStore.setState({
    isPlaying: false,
    activeSounds: [],
    masterVolume: 0.8,
    timer: { enabled: false, duration: 30, fadeOutDuration: 10, startedAt: null },
    savedMixes: [],
    initialized: true,
  })
}

describe('PlayerBar', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should not render when no sounds are active', () => {
    const { container } = render(<PlayerBar />)
    expect(container.firstChild).toBeNull()
  })

  it('should render when sounds are active', () => {
    usePlayerStore.setState({
      activeSounds: [{ soundId: 'white-noise', volume: 0.3 }],
      isPlaying: true,
      initialized: true,
    })

    render(<PlayerBar />)
    expect(screen.getByText('1 sound')).toBeInTheDocument()
    expect(screen.getByText('White Noise')).toBeInTheDocument()
  })

  it('should show correct count for multiple sounds', () => {
    usePlayerStore.setState({
      activeSounds: [
        { soundId: 'white-noise', volume: 0.3 },
        { soundId: 'rain-light', volume: 0.5 },
      ],
      isPlaying: true,
      initialized: true,
    })

    render(<PlayerBar />)
    expect(screen.getByText('2 sounds')).toBeInTheDocument()
    expect(screen.getByText('White Noise + Light Rain')).toBeInTheDocument()
  })

  it('should have a stop button', () => {
    usePlayerStore.setState({
      activeSounds: [{ soundId: 'white-noise', volume: 0.3 }],
      isPlaying: true,
      initialized: true,
    })

    render(<PlayerBar />)
    // The stop button contains an SVG rect
    const buttons = screen.getAllByRole('button')
    expect(buttons.length).toBeGreaterThanOrEqual(1)
  })

  it('should have a master volume slider', () => {
    usePlayerStore.setState({
      activeSounds: [{ soundId: 'white-noise', volume: 0.3 }],
      isPlaying: true,
      masterVolume: 0.8,
      initialized: true,
    })

    render(<PlayerBar />)
    const slider = screen.getByRole('slider')
    expect(slider).toBeInTheDocument()
  })
})
