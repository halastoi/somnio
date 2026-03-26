import { useRef, useCallback } from 'react'

interface SliderProps {
  value: number
  min?: number
  max?: number
  onChange: (value: number) => void
  height?: number
}

export function Slider({ value, min = 0, max = 1, onChange, height = 36 }: SliderProps) {
  const trackRef = useRef<HTMLDivElement>(null)
  const dragging = useRef(false)

  const percent = ((value - min) / (max - min)) * 100

  const updateValue = useCallback(
    (clientX: number) => {
      const track = trackRef.current
      if (!track) return
      const rect = track.getBoundingClientRect()
      const x = Math.max(0, Math.min(clientX - rect.left, rect.width))
      const newVal = min + (x / rect.width) * (max - min)
      onChange(Math.round(newVal * 100) / 100)
    },
    [min, max, onChange],
  )

  const onPointerDown = (e: React.PointerEvent) => {
    dragging.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)
    updateValue(e.clientX)
  }

  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragging.current) return
    updateValue(e.clientX)
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
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        height: `${height}px`,
        display: 'flex',
        alignItems: 'center',
        cursor: 'pointer',
        touchAction: 'none',
        padding: '0 2px',
      }}
    >
      {/* Track background */}
      <div
        style={{
          width: '100%',
          height: '6px',
          borderRadius: '3px',
          background: 'var(--bg-card)',
          border: '1px solid var(--glass-border)',
          position: 'relative',
        }}
      >
        {/* Filled part */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            width: `${percent}%`,
            borderRadius: '3px',
            background: 'linear-gradient(90deg, var(--accent), var(--accent-light))',
          }}
        />

        {/* Thumb */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: `${percent}%`,
            transform: 'translate(-50%, -50%)',
            width: '20px',
            height: '20px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent-light), var(--accent))',
            border: '2px solid var(--glass-border)',
            boxShadow: '0 0 12px var(--accent-glow), 0 2px 4px rgba(0,0,0,0.3)',
          }}
        />
      </div>
    </div>
  )
}
