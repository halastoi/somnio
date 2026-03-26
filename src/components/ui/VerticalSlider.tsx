import { useRef, useCallback } from 'react'

interface VerticalSliderProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  height?: number
}

export function VerticalSlider({ value, min = 0, max = 1, onChange, height = 60 }: VerticalSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const percent = ((value - min) / (max - min)) * 100

  const updateValue = useCallback(
    (clientY: number) => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      // Invert: top = max, bottom = min
      const y = Math.max(0, Math.min(clientY - rect.top, rect.height))
      const newVal = max - (y / rect.height) * (max - min)
      onChange(Math.round(newVal * 100) / 100)
    },
    [min, max, onChange],
  )

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    updateValue(e.clientY)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    updateValue(e.clientY)
  }

  const onPointerUp = () => {
    dragging.current = false
  }

  return (
    <div
      ref={trackRef}
      role="slider"
      aria-valuenow={value}
      aria-valuemin={min}
      aria-valuemax={max}
      aria-orientation="vertical"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        width: '32px',
        height: `${height}px`,
        display: 'flex',
        justifyContent: 'center',
        cursor: 'pointer',
        touchAction: 'none',
        padding: '2px 0',
      }}
    >
      {/* Track */}
      <div
        style={{
          width: '6px',
          height: '100%',
          borderRadius: '3px',
          background: 'var(--glass)',
          border: '1px solid var(--glass-border)',
          position: 'relative',
        }}
      >
        {/* Filled part (from bottom) */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: `${percent}%`,
            borderRadius: '3px',
            background: 'linear-gradient(to top, var(--accent), var(--accent-light))',
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            left: '50%',
            bottom: `${percent}%`,
            transform: 'translate(-50%, 50%)',
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-light), var(--accent))',
            border: '2px solid var(--glass-border)',
            boxShadow: '0 0 10px var(--accent-glow), 0 1px 3px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    </div>
  )
}
