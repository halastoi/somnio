import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MixList } from './MixList'
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

describe('MixList', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should render heading', () => {
    render(<MixList />)
    expect(screen.getByText('My Mixes')).toBeInTheDocument()
  })

  it('should show empty state when no mixes', () => {
    render(<MixList />)
    expect(screen.getByText('No saved mixes yet')).toBeInTheDocument()
  })

  it('should not show Save Current button when no sounds are playing', () => {
    render(<MixList />)
    expect(screen.queryByText('Save Current')).not.toBeInTheDocument()
  })

  it('should show Save Current button when sounds are playing', () => {
    usePlayerStore.setState({
      activeSounds: [{ soundId: 'white-noise', volume: 0.3 }],
      isPlaying: true,
      initialized: true,
    })

    render(<MixList />)
    expect(screen.getByText('Save Current')).toBeInTheDocument()
  })

  it('should show save input when Save Current is clicked', () => {
    usePlayerStore.setState({
      activeSounds: [{ soundId: 'white-noise', volume: 0.3 }],
      isPlaying: true,
      initialized: true,
    })

    render(<MixList />)
    fireEvent.click(screen.getByText('Save Current'))

    expect(screen.getByPlaceholderText('Mix name...')).toBeInTheDocument()
    expect(screen.getByText('Save')).toBeInTheDocument()
  })

  it('should save mix when name is entered and Save clicked', () => {
    usePlayerStore.setState({
      activeSounds: [{ soundId: 'white-noise', volume: 0.3 }],
      isPlaying: true,
      initialized: true,
    })

    render(<MixList />)
    fireEvent.click(screen.getByText('Save Current'))

    const input = screen.getByPlaceholderText('Mix name...')
    fireEvent.change(input, { target: { value: 'Night Mix' } })
    fireEvent.click(screen.getByText('Save'))

    expect(usePlayerStore.getState().savedMixes).toHaveLength(1)
    expect(usePlayerStore.getState().savedMixes[0].name).toBe('Night Mix')
  })

  it('should save mix on Enter key', () => {
    usePlayerStore.setState({
      activeSounds: [{ soundId: 'white-noise', volume: 0.3 }],
      isPlaying: true,
      initialized: true,
    })

    render(<MixList />)
    fireEvent.click(screen.getByText('Save Current'))

    const input = screen.getByPlaceholderText('Mix name...')
    fireEvent.change(input, { target: { value: 'Enter Mix' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    expect(usePlayerStore.getState().savedMixes).toHaveLength(1)
  })

  it('should render saved mixes', () => {
    usePlayerStore.setState({
      savedMixes: [
        {
          id: 'mix-1',
          name: 'Sleep Mix',
          sounds: [{ soundId: 'white-noise', volume: 0.3 }],
          createdAt: Date.now(),
        },
      ],
      initialized: true,
    })

    render(<MixList />)
    expect(screen.getByText('Sleep Mix')).toBeInTheDocument()
    // Mix now shows individual sound names with volume bars
    expect(screen.getByText('White Noise')).toBeInTheDocument()
  })

  it('should show delete button for each mix', () => {
    usePlayerStore.setState({
      savedMixes: [
        {
          id: 'mix-1',
          name: 'Sleep Mix',
          sounds: [{ soundId: 'white-noise', volume: 0.3 }],
          createdAt: Date.now(),
        },
      ],
      initialized: true,
    })

    render(<MixList />)
    expect(screen.getByText('×')).toBeInTheDocument()
  })

  it('should delete mix when delete button is clicked', () => {
    usePlayerStore.setState({
      savedMixes: [
        {
          id: 'mix-1',
          name: 'To Delete',
          sounds: [{ soundId: 'white-noise', volume: 0.3 }],
          createdAt: Date.now(),
        },
      ],
      initialized: true,
    })

    render(<MixList />)
    fireEvent.click(screen.getByText('×'))

    expect(usePlayerStore.getState().savedMixes).toHaveLength(0)
  })

  it('should not save empty name', () => {
    usePlayerStore.setState({
      activeSounds: [{ soundId: 'white-noise', volume: 0.3 }],
      isPlaying: true,
      initialized: true,
    })

    render(<MixList />)
    fireEvent.click(screen.getByText('Save Current'))
    fireEvent.click(screen.getByText('Save'))

    expect(usePlayerStore.getState().savedMixes).toHaveLength(0)
  })
})
