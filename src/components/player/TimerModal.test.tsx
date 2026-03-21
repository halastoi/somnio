import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { TimerModal } from './TimerModal'
import { usePlayerStore } from '../../stores/usePlayerStore'

vi.mock('../../stores/useSettingsStore', () => ({
  useSettingsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ t: (key: string) => key }),
}))

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

describe('TimerModal', () => {
  beforeEach(() => {
    resetStore()
  })

  it('should not render when closed', () => {
    const { container } = render(<TimerModal isOpen={false} onClose={vi.fn()} />)
    expect(container.firstChild).toBeNull()
  })

  it('should render when open', () => {
    render(<TimerModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('timer.title')).toBeInTheDocument()
  })

  it('should show duration slider', () => {
    render(<TimerModal isOpen={true} onClose={vi.fn()} />)
    const sliders = screen.getAllByRole('slider')
    expect(sliders.length).toBeGreaterThanOrEqual(1)
  })

  it('should show quick preset buttons', () => {
    render(<TimerModal isOpen={true} onClose={vi.fn()} />)
    // Preset buttons exist as clickable elements
    const buttons = screen.getAllByRole('button')
    // At least 8 presets + start = 9 buttons minimum
    expect(buttons.length).toBeGreaterThanOrEqual(9)
  })

  it('should have duration slider with range 1-180', () => {
    render(<TimerModal isOpen={true} onClose={vi.fn()} />)
    const sliders = screen.getAllByRole('slider')
    const durationSlider = sliders[0]
    expect(durationSlider).toHaveAttribute('min', '1')
    expect(durationSlider).toHaveAttribute('max', '180')
  })

  it('should have start timer button', () => {
    render(<TimerModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('start.timer')).toBeInTheDocument()
  })

  it('should start timer and close modal on start', () => {
    const onClose = vi.fn()
    render(<TimerModal isOpen={true} onClose={onClose} />)
    fireEvent.click(screen.getByText('start.timer'))

    const timer = usePlayerStore.getState().timer
    expect(timer.enabled).toBe(true)
    expect(timer.startedAt).toBeTruthy()
    expect(onClose).toHaveBeenCalled()
  })

  it('should render timer active view with cancel', () => {
    usePlayerStore.setState({
      timer: { enabled: true, duration: 30, fadeOutDuration: 10, startedAt: Date.now() },
      initialized: true,
    })

    render(<TimerModal isOpen={true} onClose={vi.fn()} />)
    expect(screen.getByText('timer.cancel')).toBeInTheDocument()
  })

  it('should cancel timer via store', () => {
    usePlayerStore.getState().setTimer({ enabled: true, duration: 30, startedAt: Date.now() })
    usePlayerStore.getState().setTimer({ enabled: false, startedAt: null })

    const timer = usePlayerStore.getState().timer
    expect(timer.enabled).toBe(false)
    expect(timer.startedAt).toBeNull()
  })
})
