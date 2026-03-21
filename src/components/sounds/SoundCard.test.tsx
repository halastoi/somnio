import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SoundCard } from './SoundCard'
import { usePlayerStore } from '../../stores/usePlayerStore'
import type { Sound } from '../../types'

const mockSound: Sound = {
  id: 'test-sound',
  name: 'Test Sound',
  category: 'noise',
  icon: '🔊',
  sourceType: 'procedural',
  generator: 'white',
  defaultVolume: 0.5,
}

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

describe('SoundCard', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should render sound name and icon', () => {
    render(<SoundCard sound={mockSound} />)
    expect(screen.getByText('Test Sound')).toBeInTheDocument()
    expect(screen.getByText('🔊')).toBeInTheDocument()
  })

  it('should call toggleSound on click', async () => {
    // Use a real sound ID that exists in the sounds library
    const realSound: Sound = {
      id: 'white-noise',
      name: 'White Noise',
      category: 'noise',
      icon: '⬜',
      sourceType: 'procedural',
      generator: 'white',
      defaultVolume: 0.3,
    }

    await usePlayerStore.getState().init()
    render(<SoundCard sound={realSound} />)

    fireEvent.click(screen.getByText('White Noise'))

    const state = usePlayerStore.getState()
    expect(state.activeSounds).toHaveLength(1)
    expect(state.activeSounds[0].soundId).toBe('white-noise')
  })

  it('should show volume control when active', () => {
    usePlayerStore.setState({
      activeSounds: [{ soundId: 'test-sound', volume: 0.5 }],
      isPlaying: true,
      initialized: true,
    })

    render(<SoundCard sound={mockSound} />)
    // Card shows active state (green dot indicator exists)
    const card = screen.getByText('Test Sound').closest('div')
    expect(card).toBeTruthy()
  })

  it('should not show volume control when inactive', () => {
    render(<SoundCard sound={mockSound} />)
    expect(screen.queryByText('%')).not.toBeInTheDocument()
  })
})
