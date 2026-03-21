import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { SoundGrid } from './SoundGrid'
import { sounds, categories } from '../../audio/sounds'
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

describe('SoundGrid', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should render baby sleep sounds by default', () => {
    render(<SoundGrid />)
    expect(screen.getByText('Baby Sleep')).toBeInTheDocument()
    expect(screen.getByText('Lullaby')).toBeInTheDocument()
    expect(screen.getByText('Harp Lullaby')).toBeInTheDocument()
  })

  it('should render sidebar with all categories', () => {
    render(<SoundGrid />)
    // All button + category buttons in sidebar
    expect(screen.getByText('All')).toBeInTheDocument()
    for (const cat of categories) {
      // Sidebar shows first word of category name
      const firstWord = cat.name.split(' ')[0]
      const elements = screen.getAllByText(firstWord)
      expect(elements.length).toBeGreaterThanOrEqual(1)
    }
  })

  it('should filter sounds when a category is clicked', () => {
    render(<SoundGrid />)
    // Click on Noise in sidebar
    fireEvent.click(screen.getByText('Noise'))
    expect(screen.getByText('White Noise')).toBeInTheDocument()
    expect(screen.getByText('Pink Noise')).toBeInTheDocument()
  })

  it('should show all sounds when All is clicked', () => {
    render(<SoundGrid />)
    fireEvent.click(screen.getByText('All'))
    // Should show sounds from multiple categories
    expect(screen.getByText('Lullaby')).toBeInTheDocument()
    expect(screen.getByText('White Noise')).toBeInTheDocument()
    expect(screen.getByText('Light Rain')).toBeInTheDocument()
  })

  it('should show category title and count', () => {
    render(<SoundGrid />)
    const babySounds = sounds.filter((s) => s.category === 'baby')
    expect(screen.getByText(String(babySounds.length))).toBeInTheDocument()
  })

  it('should filter cosmos sounds correctly', () => {
    render(<SoundGrid />)
    fireEvent.click(screen.getByText('Cosmos'))
    expect(screen.getByText('Cosmic Drone')).toBeInTheDocument()
    expect(screen.getByText('Solar Wind')).toBeInTheDocument()
  })
})
