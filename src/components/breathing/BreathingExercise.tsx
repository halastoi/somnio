import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '../../stores/useSettingsStore'
import type { BreathingPattern } from '../../types'

const PHASE_KEYS = ['breathing.inhale', 'breathing.hold', 'breathing.exhale', 'breathing.hold'] as const

export function BreathingExercise() {
  const t = useSettingsStore((s) => s.t)
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const animRef = useRef<number>(0)
  const startTimeRef = useRef(0)

  const patterns: BreathingPattern[] = [
    { id: '4-7-8', name: t('breathing.478'), description: t('breathing.478.desc'), pattern: [4, 7, 8, 0] },
    { id: 'box', name: t('breathing.box'), description: t('breathing.box.desc'), pattern: [4, 4, 4, 4] },
    { id: '4-4', name: t('breathing.simple'), description: t('breathing.simple.desc'), pattern: [4, 0, 4, 0] },
    { id: '5-5', name: t('breathing.coherent'), description: t('breathing.coherent.desc'), pattern: [5, 0, 5, 0] },
  ]

  useEffect(() => {
    if (!isRunning || !selectedPattern) return

    const phaseDuration = selectedPattern.pattern[phase]

    if (phaseDuration === 0) {
      const nextPhase = (phase + 1) % 4
      if (nextPhase === 0) setCycleCount((c) => c + 1)
      setPhase(nextPhase)
      return
    }

    startTimeRef.current = Date.now()

    const tick = () => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const p = Math.min(elapsed / phaseDuration, 1)
      setProgress(p)

      if (p >= 1) {
        const nextPhase = (phase + 1) % 4
        if (nextPhase === 0) setCycleCount((c) => c + 1)
        setPhase(nextPhase)
        return
      }

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning, phase, selectedPattern])

  const stop = () => {
    setIsRunning(false)
    setPhase(0)
    setProgress(0)
    setCycleCount(0)
    cancelAnimationFrame(animRef.current)
  }

  const circleScale =
    phase === 0
      ? 0.6 + progress * 0.4
      : phase === 2
        ? 1.0 - progress * 0.4
        : phase === 1
          ? 1.0
          : 0.6

  if (!selectedPattern) {
    return (
      <div style={{ padding: '20px', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
          {t('breathing.title')}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
          {t('breathing.desc')}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedPattern(p)}
              style={{
                padding: '20px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.06)',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '4px',
              }}
            >
              <span style={{ fontSize: '16px', fontWeight: 500 }}>{p.name}</span>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                {p.description}
              </span>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
                {p.pattern.filter((v) => v > 0).join('-')}
              </span>
            </button>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        padding: '20px',
        paddingBottom: '16px',
      }}
    >
      <button
        onClick={() => { stop(); setSelectedPattern(null) }}
        style={{
          position: 'absolute',
          top: 'calc(16px + var(--safe-top))',
          left: '16px',
          fontSize: '14px',
          color: 'var(--text-secondary)',
          padding: '8px 12px',
        }}
      >
        {t('breathing.back')}
      </button>

      <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '40px' }}>
        {selectedPattern.name}
      </h3>

      <div
        style={{
          position: 'relative',
          width: '240px',
          height: '240px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '40px',
        }}
      >
        <motion.div
          animate={{ scale: circleScale }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-glow), transparent)',
            border: '2px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '4px',
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              style={{ fontSize: '20px', fontWeight: 300 }}
            >
              {isRunning ? t(PHASE_KEYS[phase]) : t('breathing.ready')}
            </motion.span>
          </AnimatePresence>
          {isRunning && (
            <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
              {Math.ceil(selectedPattern.pattern[phase] * (1 - progress))}
            </span>
          )}
        </motion.div>
      </div>

      {cycleCount > 0 && (
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '24px' }}>
          {cycleCount} {cycleCount !== 1 ? t('breathing.cycles') : t('breathing.cycle')}
        </div>
      )}

      <button
        onClick={() => (isRunning ? stop() : setIsRunning(true))}
        style={{
          padding: '14px 40px',
          borderRadius: 'var(--radius-full)',
          background: isRunning ? 'var(--danger)' : 'var(--accent)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-glow)',
        }}
      >
        {isRunning ? t('breathing.stop') : t('breathing.start')}
      </button>
    </div>
  )
}
