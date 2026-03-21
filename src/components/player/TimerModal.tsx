import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { audioEngine } from '../../audio/AudioEngine'
import { useSettingsStore } from '../../stores/useSettingsStore'

interface TimerModalProps {
  isOpen: boolean
  onClose: () => void
}

export function TimerModal({ isOpen, onClose }: TimerModalProps) {
  const { timer, setTimer, stopAll } = usePlayerStore()
  const t = useSettingsStore((s) => s.t)
  const [selectedMinutes, setSelectedMinutes] = useState(timer.duration)

  const handleTimerEnd = useCallback(() => {
    audioEngine.fadeOutAll(timer.fadeOutDuration)
    setTimeout(() => {
      stopAll()
      setTimer({ enabled: false, startedAt: null })
    }, timer.fadeOutDuration * 1000)
  }, [timer.fadeOutDuration, stopAll, setTimer])

  // Sync selected minutes when modal opens
  useEffect(() => {
    if (isOpen && !timer.enabled) {
      setSelectedMinutes(timer.duration)
    }
  }, [isOpen, timer.enabled, timer.duration])

  const startTimer = () => {
    setTimer({ enabled: true, duration: selectedMinutes, startedAt: Date.now() })
    onClose()
  }

  const cancelTimer = () => {
    setTimer({ enabled: false, startedAt: null })
  }

  // Format minutes for display
  const formatDuration = (min: number) => {
    if (min < 60) return `${min} min`
    const h = Math.floor(min / 60)
    const m = min % 60
    return m > 0 ? `${h}h ${m}m` : `${h}h`
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.7)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            zIndex: 200,
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
          }}
        >
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(20, 20, 40, 0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '24px 24px 0 0',
              padding: '24px 20px',
              paddingBottom: `calc(28px + var(--safe-bottom))`,
              width: '100%',
              maxWidth: '480px',
              border: '1px solid rgba(255,255,255,0.06)',
              borderBottom: 'none',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '24px', textAlign: 'center' }}>
              {t('timer.title')}
            </h2>

            {timer.enabled ? (
              /* Timer Active View */
              <TimerCountdown
                timer={timer}
                onCancel={cancelTimer}
                onEnd={handleTimerEnd}
                t={t}
              />
            ) : (
              /* Timer Setup View */
              <div>
                {/* Duration display */}
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <div style={{
                    fontSize: '56px',
                    fontWeight: 200,
                    color: 'var(--accent-light)',
                    fontVariantNumeric: 'tabular-nums',
                    lineHeight: 1,
                  }}>
                    {formatDuration(selectedMinutes)}
                  </div>
                </div>

                {/* Duration slider */}
                <div style={{ padding: '0 8px', marginBottom: '20px' }}>
                  <input
                    type="range"
                    min={1}
                    max={180}
                    step={1}
                    value={selectedMinutes}
                    onChange={(e) => setSelectedMinutes(parseInt(e.target.value))}
                    style={{ height: '44px' }}
                  />
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    color: 'var(--text-muted)',
                    marginTop: '4px',
                    padding: '0 2px',
                  }}>
                    <span>1 min</span>
                    <span>30</span>
                    <span>1h</span>
                    <span>1.5h</span>
                    <span>3h</span>
                  </div>
                </div>

                {/* Quick presets */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '20px',
                  justifyContent: 'center',
                  flexWrap: 'wrap',
                }}>
                  {[5, 10, 15, 30, 45, 60, 90, 120].map((min) => (
                    <button
                      key={min}
                      onClick={() => setSelectedMinutes(min)}
                      style={{
                        padding: '8px 14px',
                        borderRadius: 'var(--radius-full)',
                        background: selectedMinutes === min
                          ? 'var(--accent)'
                          : 'rgba(255,255,255,0.06)',
                        color: selectedMinutes === min ? '#fff' : 'var(--text-secondary)',
                        fontSize: '13px',
                        fontWeight: selectedMinutes === min ? 600 : 400,
                        border: '1px solid',
                        borderColor: selectedMinutes === min
                          ? 'transparent'
                          : 'rgba(255,255,255,0.06)',
                        transition: 'all 0.2s',
                      }}
                    >
                      {formatDuration(min)}
                    </button>
                  ))}
                </div>

                {/* Fade out setting */}
                <div style={{
                  padding: '14px',
                  background: 'rgba(255,255,255,0.03)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '20px',
                }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '10px',
                  }}>
                    <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                      {t('timer.fadeout')}
                    </span>
                    <span style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 500 }}>
                      {timer.fadeOutDuration}s
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={60}
                    step={5}
                    value={timer.fadeOutDuration}
                    onChange={(e) => setTimer({ fadeOutDuration: parseInt(e.target.value) })}
                    style={{ height: '36px' }}
                  />
                </div>

                {/* Start button */}
                <button
                  onClick={startTimer}
                  style={{
                    width: '100%',
                    padding: '16px',
                    borderRadius: 'var(--radius-lg)',
                    background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                    color: '#fff',
                    fontWeight: 600,
                    fontSize: '16px',
                    boxShadow: '0 4px 20px var(--accent-glow)',
                  }}
                >
                  {t('start.timer')}
                </button>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function TimerCountdown({
  timer,
  onCancel,
  onEnd,
  t,
}: {
  timer: { enabled: boolean; duration: number; fadeOutDuration: number; startedAt: number | null }
  onCancel: () => void
  onEnd: () => void
  t: (key: string) => string
}) {
  const [remaining, setRemaining] = useState<number>(0)

  useEffect(() => {
    if (!timer.startedAt) return

    const tick = () => {
      const elapsed = (Date.now() - timer.startedAt!) / 1000
      const total = timer.duration * 60
      const left = Math.max(0, total - elapsed)

      if (left <= 0) {
        onEnd()
        return
      }

      setRemaining(left)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [timer.startedAt, timer.duration, onEnd])

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = Math.floor(seconds % 60)
    if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`
    return `${m}:${String(s).padStart(2, '0')}`
  }

  const total = timer.duration * 60
  const progress = total > 0 ? remaining / total : 0

  return (
    <div style={{ textAlign: 'center' }}>
      {/* Circular progress */}
      <div style={{ position: 'relative', width: '180px', height: '180px', margin: '0 auto 24px' }}>
        <svg width="180" height="180" viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)' }}>
          {/* Track */}
          <circle
            cx="90" cy="90" r="80"
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="4"
          />
          {/* Progress */}
          <circle
            cx="90" cy="90" r="80"
            fill="none"
            stroke="var(--accent)"
            strokeWidth="4"
            strokeLinecap="round"
            strokeDasharray={2 * Math.PI * 80}
            strokeDashoffset={2 * Math.PI * 80 * (1 - progress)}
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>
        <div style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <div style={{
            fontSize: '36px',
            fontWeight: 200,
            fontVariantNumeric: 'tabular-nums',
            color: 'var(--accent-light)',
          }}>
            {formatTime(remaining)}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {t('timer.fadingout')} {timer.fadeOutDuration}s
          </div>
        </div>
      </div>

      <button
        onClick={onCancel}
        style={{
          padding: '14px 40px',
          borderRadius: 'var(--radius-full)',
          background: 'rgba(248, 113, 113, 0.15)',
          color: 'var(--danger)',
          fontWeight: 600,
          fontSize: '15px',
          border: '1px solid rgba(248, 113, 113, 0.2)',
        }}
      >
        {t('timer.cancel')}
      </button>
    </div>
  )
}

/**
 * Small timer countdown badge for the header
 */
export function TimerBadge() {
  const timer = usePlayerStore((s) => s.timer)
  const [remaining, setRemaining] = useState<number | null>(null)

  useEffect(() => {
    if (!timer.enabled || !timer.startedAt) {
      setRemaining(null)
      return
    }

    const tick = () => {
      const elapsed = (Date.now() - timer.startedAt!) / 1000
      const total = timer.duration * 60
      const left = Math.max(0, total - elapsed)
      setRemaining(left)
    }

    tick()
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [timer.enabled, timer.startedAt, timer.duration])

  if (!timer.enabled || remaining === null) return null

  const m = Math.floor(remaining / 60)
  const s = Math.floor(remaining % 60)
  const display = m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `${s}s`

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      style={{
        fontSize: '12px',
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--accent-light)',
        background: 'rgba(124, 92, 252, 0.15)',
        padding: '5px 10px',
        borderRadius: 'var(--radius-full)',
        border: '1px solid rgba(124, 92, 252, 0.25)',
        lineHeight: 1,
        whiteSpace: 'nowrap',
      }}
    >
      {display}
    </motion.div>
  )
}
