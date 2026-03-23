import { useRef, useCallback } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '../../stores/usePlayerStore'
import type { Sound } from '../../types'

interface SoundCardProps {
  sound: Sound
  onInfo?: (sound: Sound) => void
}

export function SoundCard({ sound, onInfo }: SoundCardProps) {
  const { activeSounds, toggleSound, setSoundVolume, favorites, toggleFavorite } = usePlayerStore()
  const activeSound = activeSounds.find((s) => s.soundId === sound.id)
  const isActive = !!activeSound
  const isFav = favorites.includes(sound.id)
  const cardRef = useRef<HTMLDivElement>(null)


  return (
    <motion.div
      ref={cardRef}
      whileTap={{ scale: 0.93 }}
      style={{
        background: isActive
          ? 'linear-gradient(145deg, rgba(124,92,252,0.2) 0%, rgba(124,92,252,0.05) 100%)'
          : 'linear-gradient(145deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderRadius: '14px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
        border: isActive
          ? '1px solid rgba(124, 92, 252, 0.5)'
          : '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: isActive
          ? '0 0 20px rgba(124,92,252,0.3), 0 4px 16px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)'
          : '0 2px 12px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.06)',
        transition: 'all 0.25s ease',
        height: '88px',
        overflow: 'hidden',
      }}
    >
      {/* Left: tap area with icon + name */}
      <button
        onClick={() => {
          const wasActive = isActive
          toggleSound(sound.id)
          // Scroll into view only when activating (not deactivating)
          if (!wasActive && cardRef.current) {
            setTimeout(() => {
              const card = cardRef.current
              if (!card) return
              // Find scrollable parent
              let container = card.parentElement
              while (container && container.scrollHeight <= container.clientHeight) {
                container = container.parentElement
              }
              if (!container) {
                card.scrollIntoView({ behavior: 'smooth', block: 'center' })
                return
              }
              const cardRect = card.getBoundingClientRect()
              const containerRect = container.getBoundingClientRect()
              if (cardRect.bottom > containerRect.bottom - 20) {
                const scrollBy = cardRect.bottom - containerRect.bottom + 100
                container.scrollBy({ top: scrollBy, behavior: 'smooth' })
              }
            }, 200)
          }
        }}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '6px',
          flex: 1,
          height: '100%',
          padding: '8px 4px',
        }}
      >
        <span
          style={{
            fontSize: '28px',
            lineHeight: 1,
            display: 'block',
            filter: isActive ? 'drop-shadow(0 0 6px var(--accent-glow))' : 'none',
            transition: 'filter 0.3s',
          }}
        >
          {sound.icon}
        </span>
        <span
          style={{
            fontSize: '11px',
            fontWeight: isActive ? 600 : 400,
            color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            padding: '0 2px',
          }}
        >
          {sound.name}
        </span>
      </button>

      {/* Right: vertical slider - same height, no card resize */}
      {isActive && (
        <div
          style={{
            width: '28px',
            height: '100%',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '10px 4px 10px 0',
          }}
        >
          <VolumeBar
            value={activeSound.volume}
            onChange={(v) => setSoundVolume(sound.id, v)}
          />
        </div>
      )}

      {/* Info button - top left (SVG info circle icon) */}
      {onInfo && (
        <button
          onClick={(e) => { e.stopPropagation(); onInfo(sound) }}
          style={{
            position: 'absolute',
            top: '4px',
            left: '4px',
            width: '20px',
            height: '20px',
            minWidth: '20px',
            minHeight: '20px',
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 0,
            lineHeight: 1,
            border: '1px solid rgba(255,255,255,0.25)',
            zIndex: 2,
          }}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        </button>
      )}

      {/* Favorite heart button - top right (SVG heart icon) */}
      <button
        onClick={(e) => { e.stopPropagation(); toggleFavorite(sound.id) }}
        style={{
          position: 'absolute',
          top: '4px',
          right: '4px',
          width: '20px',
          height: '20px',
          minWidth: '20px',
          minHeight: '20px',
          borderRadius: '50%',
          background: 'transparent',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 0,
          lineHeight: 1,
          border: 'none',
          zIndex: 2,
          opacity: isFav ? 1 : 0.4,
          transition: 'opacity 0.2s',
        }}
      >
        {isFav ? (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="#ef4444" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        ) : (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
        )}
      </button>

      {/* Active pulse dot */}
      {isActive && (
        <motion.div
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          style={{
            position: 'absolute',
            top: '5px',
            right: isActive ? '24px' : '5px',
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 8px var(--success), 0 0 16px rgba(74, 222, 128, 0.3)',
          }}
        />
      )}
    </motion.div>
  )
}

/** Compact vertical volume bar built into the card */
function VolumeBar({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const trackRef = useRef<HTMLDivElement>(null)
  const pct = Math.round(value * 100)

  const update = useCallback((clientY: number) => {
    const track = trackRef.current
    if (!track) return
    const rect = track.getBoundingClientRect()
    const y = Math.max(0, Math.min(clientY - rect.top, rect.height))
    onChange(Math.round((1 - y / rect.height) * 100) / 100)
  }, [onChange])

  return (
    <div
      ref={trackRef}
      onPointerDown={(e) => {
        (e.target as HTMLElement).setPointerCapture(e.pointerId)
        update(e.clientY)
      }}
      onPointerMove={(e) => {
        if (e.buttons > 0) update(e.clientY)
      }}
      style={{
        width: '14px',
        height: '100%',
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'center',
        cursor: 'pointer',
        touchAction: 'none',
        position: 'relative',
      }}
    >
      {/* Track bg */}
      <div
        style={{
          width: '8px',
          height: '100%',
          borderRadius: '4px',
          background: 'rgba(255,255,255,0.08)',
          border: '1px solid rgba(255,255,255,0.18)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Fill from bottom */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            bottom: 0,
            height: `${pct}%`,
            background: 'linear-gradient(to top, var(--accent), var(--accent-light))',
            borderRadius: '4px',
            transition: 'height 0.05s',
            boxShadow: '0 0 6px var(--accent-glow)',
          }}
        />
      </div>
    </div>
  )
}
