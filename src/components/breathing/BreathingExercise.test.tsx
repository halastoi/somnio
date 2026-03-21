import { describe, it, expect, vi } from 'vitest'

vi.mock('../../stores/useSettingsStore', () => ({
  useSettingsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ t: (key: string) => key }),
}))
import { render, screen, fireEvent } from '@testing-library/react'
import { BreathingExercise } from './BreathingExercise'

describe('BreathingExercise', () => {
  it('should render breathing pattern options', () => {
    render(<BreathingExercise />)

    expect(screen.getByText('breathing.title')).toBeInTheDocument()
    expect(screen.getByText('breathing.478')).toBeInTheDocument()
    expect(screen.getByText('breathing.box')).toBeInTheDocument()
    expect(screen.getByText('breathing.simple')).toBeInTheDocument()
    expect(screen.getByText('breathing.coherent')).toBeInTheDocument()
  })

  it('should show descriptions for each pattern', () => {
    render(<BreathingExercise />)

    expect(screen.getByText('breathing.478.desc')).toBeInTheDocument()
    expect(screen.getByText('breathing.box.desc')).toBeInTheDocument()
    expect(screen.getByText('breathing.simple.desc')).toBeInTheDocument()
    expect(screen.getByText('breathing.coherent.desc')).toBeInTheDocument()
  })

  it('should show pattern numbers', () => {
    render(<BreathingExercise />)
    // Pattern numbers like 4-7-8 shown
    expect(screen.getByText('4-7-8')).toBeInTheDocument()
    expect(screen.getByText('4-4-4-4')).toBeInTheDocument()
  })

  it('should navigate to exercise view when pattern is selected', () => {
    render(<BreathingExercise />)

    fireEvent.click(screen.getByText('breathing.478'))

    expect(screen.getByText('breathing.478')).toBeInTheDocument()
    expect(screen.getByText('breathing.start')).toBeInTheDocument()
    expect(screen.getByText('breathing.ready')).toBeInTheDocument()
  })

  it('should show Back button in exercise view', () => {
    render(<BreathingExercise />)

    fireEvent.click(screen.getByText('breathing.box'))
    expect(screen.getByText('breathing.back')).toBeInTheDocument()
  })

  it('should navigate back to selection', () => {
    render(<BreathingExercise />)

    fireEvent.click(screen.getByText('breathing.box'))
    fireEvent.click(screen.getByText('breathing.back'))

    // Should show all patterns again
    expect(screen.getByText('breathing.478')).toBeInTheDocument()
    expect(screen.getByText('breathing.box')).toBeInTheDocument()
  })

  it('should start exercise on Start click', () => {
    render(<BreathingExercise />)

    fireEvent.click(screen.getByText('breathing.478'))
    fireEvent.click(screen.getByText('breathing.start'))

    expect(screen.getByText('breathing.stop')).toBeInTheDocument()
    // Should show a phase name (Inhale)
    expect(screen.getByText('breathing.inhale')).toBeInTheDocument()
  })

  it('should stop exercise on Stop click', () => {
    render(<BreathingExercise />)

    fireEvent.click(screen.getByText('breathing.simple'))
    fireEvent.click(screen.getByText('breathing.start'))
    fireEvent.click(screen.getByText('breathing.stop'))

    expect(screen.getByText('breathing.start')).toBeInTheDocument()
    expect(screen.getByText('breathing.ready')).toBeInTheDocument()
  })
})
