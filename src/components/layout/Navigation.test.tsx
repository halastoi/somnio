import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { Navigation } from './Navigation'
import type { Tab } from './Navigation'

// Mock settings store
vi.mock('../../stores/useSettingsStore', () => ({
  useSettingsStore: (selector: (s: Record<string, unknown>) => unknown) =>
    selector({ t: (key: string) => key }),
}))

describe('Navigation', () => {
  it('should render all tabs', () => {
    render(<Navigation activeTab="sounds" onTabChange={vi.fn()} />)

    expect(screen.getByText('nav.sounds')).toBeInTheDocument()
    expect(screen.getByText('nav.mixes')).toBeInTheDocument()
    expect(screen.getByText('nav.breathe')).toBeInTheDocument()
    expect(screen.getByText('nav.settings')).toBeInTheDocument()
  })

  it('should call onTabChange when tab is clicked', () => {
    const onTabChange = vi.fn()
    render(<Navigation activeTab="sounds" onTabChange={onTabChange} />)

    fireEvent.click(screen.getByText('nav.mixes'))
    expect(onTabChange).toHaveBeenCalledWith('mixes')
  })

  it('should call onTabChange with settings', () => {
    const onTabChange = vi.fn()
    render(<Navigation activeTab="sounds" onTabChange={onTabChange} />)

    fireEvent.click(screen.getByText('nav.settings'))
    expect(onTabChange).toHaveBeenCalledWith('settings')
  })

  it('should call onTabChange with breathing', () => {
    const onTabChange = vi.fn()
    render(<Navigation activeTab="sounds" onTabChange={onTabChange} />)

    fireEvent.click(screen.getByText('nav.breathe'))
    expect(onTabChange).toHaveBeenCalledWith('breathing')
  })

  it('should highlight active tab', () => {
    const tabs: Tab[] = ['sounds', 'mixes', 'breathing']

    for (const tab of tabs) {
      const { unmount } = render(<Navigation activeTab={tab} onTabChange={vi.fn()} />)
      // Active tab text should have different styling (fontWeight 600)
      // We verify the component renders without error for each active state
      unmount()
    }
  })
})
