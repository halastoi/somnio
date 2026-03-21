import { describe, it, expect, beforeEach, vi } from 'vitest'

// Mock canvas-based AnimatedBackground
vi.mock('./components/ui/AnimatedBackground', () => ({
  AnimatedBackground: () => null,
}))

// Mock settings store
vi.mock('./stores/useSettingsStore', () => ({
  useSettingsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({
      t: (key: string) => key,
      language: 'en',
      theme: 'dark',
    }),
}))
import { render, screen, fireEvent } from '@testing-library/react'
import App from './App'
import { usePlayerStore } from './stores/usePlayerStore'

function resetStore() {
  usePlayerStore.setState({
    isPlaying: false,
    activeSounds: [],
    masterVolume: 0.8,
    timer: { enabled: false, duration: 30, fadeOutDuration: 10, startedAt: null },
    savedMixes: [],
    initialized: false,
  })
}

describe('App', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should render the app with header', () => {
    render(<App />)
    expect(screen.getByText('somnio')).toBeInTheDocument()
  })

  it('should render sound grid by default', () => {
    render(<App />)
    // Default category is Baby Sleep
    expect(screen.getByText('Baby Sleep')).toBeInTheDocument()
  })

  it('should render navigation tabs', () => {
    render(<App />)
    // Navigation uses translation keys, check the tabs exist
    const nav = document.querySelector('nav')
    expect(nav).toBeTruthy()
    expect(nav!.querySelectorAll('button').length).toBe(4)
  })

  it('should have a timer button in header', () => {
    render(<App />)
    // Timer button is a circle with SVG clock icon in header
    const header = document.querySelector('header')
    expect(header).toBeTruthy()
    const timerBtn = header!.querySelector('svg circle')
    expect(timerBtn).toBeTruthy()
  })

  it('should initialize audio on first click', () => {
    render(<App />)
    expect(usePlayerStore.getState().initialized).toBe(false)
    fireEvent.click(document)
  })
})
