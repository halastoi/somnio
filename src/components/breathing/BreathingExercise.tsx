import { useState, useEffect, useRef, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { scenes } from '../../data/scenes'
import type { BreathingPattern } from '../../types'

// ─── Constants ──────────────────────────────────────────────────────
const PHASE_KEYS = ['breathing.breatheIn', 'breathing.hold', 'breathing.breatheOut', 'breathing.hold'] as const
const SESSION_OPTIONS = [3, 5, 10, 15, 0] // 0 = infinite
const PARTICLE_COUNT = 14
const CUSTOM_STORAGE_KEY = 'somnio-custom-breathing'

const PHASE_COLORS = [
  'rgba(70, 130, 220, 0.12)',   // inhale - blue
  'rgba(70, 180, 120, 0.12)',   // hold - green
  'rgba(140, 80, 200, 0.12)',   // exhale - purple
  'rgba(70, 180, 120, 0.12)',   // hold - green
]

const PATTERN_ICONS: Record<string, string> = {
  '4-7-8': '\u{1F634}',
  'box': '\u{1F4E6}',
  '4-4': '\u{1F33F}',
  '5-5': '\u{1F493}',
  'custom': '\u2699\uFE0F',
}

const PATTERN_GRADIENTS: Record<string, string> = {
  '4-7-8': 'linear-gradient(135deg, rgba(100,60,180,0.3), rgba(60,40,140,0.15))',
  'box': 'linear-gradient(135deg, rgba(60,140,200,0.3), rgba(40,90,160,0.15))',
  '4-4': 'linear-gradient(135deg, rgba(60,160,100,0.3), rgba(40,120,70,0.15))',
  '5-5': 'linear-gradient(135deg, rgba(200,70,100,0.3), rgba(140,40,70,0.15))',
  'custom': 'linear-gradient(135deg, rgba(160,130,60,0.3), rgba(120,90,30,0.15))',
}

// Scene quick-picks for the breathing tab
const BREATHING_SCENES = [
  { id: 'zen-temple', label: 'breathing.zenScene' },
  { id: 'warm-drift', label: 'breathing.warmScene' },
  { id: 'meditation', label: 'breathing.meditationScene' },
  { id: '__silent__', label: 'breathing.silent' },
]

function loadCustomPattern(): [number, number, number, number] {
  try {
    const stored = localStorage.getItem(CUSTOM_STORAGE_KEY)
    if (stored) {
      const parsed = JSON.parse(stored) as number[]
      if (Array.isArray(parsed) && parsed.length === 4 && parsed.every((n) => typeof n === 'number' && n >= 1 && n <= 15)) {
        return parsed as [number, number, number, number]
      }
    }
  } catch { /* ignore */ }
  return [4, 2, 6, 2]
}

function saveCustomPattern(p: [number, number, number, number]) {
  localStorage.setItem(CUSTOM_STORAGE_KEY, JSON.stringify(p))
}

function hapticPulse() {
  if (navigator.vibrate) {
    navigator.vibrate(50)
  }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

// ─── Component ──────────────────────────────────────────────────────
export function BreathingExercise() {
  const t = useSettingsStore((s) => s.t)
  const loadScene = usePlayerStore((s) => s.loadScene)
  const stopAll = usePlayerStore((s) => s.stopAll)

  // State
  const [selectedPattern, setSelectedPattern] = useState<BreathingPattern | null>(null)
  const [isRunning, setIsRunning] = useState(false)
  const [phase, setPhase] = useState(0)
  const [progress, setProgress] = useState(0)
  const [cycleCount, setCycleCount] = useState(0)
  const [sessionDuration, setSessionDuration] = useState(5) // minutes, 0=infinite
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0) // seconds
  const [showComplete, setShowComplete] = useState(false)
  const [customPattern, setCustomPattern] = useState<[number, number, number, number]>(loadCustomPattern)
  const [selectedSceneId, setSelectedSceneId] = useState<string | null>(null)

  const animRef = useRef(0)
  const startTimeRef = useRef(0)
  const sessionStartRef = useRef(0)
  const sessionIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const patterns: BreathingPattern[] = [
    { id: '4-7-8', name: t('breathing.478'), description: t('breathing.478.desc'), pattern: [4, 7, 8, 0] },
    { id: 'box', name: t('breathing.box'), description: t('breathing.box.desc'), pattern: [4, 4, 4, 4] },
    { id: '4-4', name: t('breathing.simple'), description: t('breathing.simple.desc'), pattern: [4, 0, 4, 0] },
    { id: '5-5', name: t('breathing.coherent'), description: t('breathing.coherent.desc'), pattern: [5, 0, 5, 0] },
    { id: 'custom', name: t('breathing.custom'), description: t('breathing.custom.desc'), pattern: customPattern },
  ]

  // ─── Stop everything ──────────────────────────────────────────────
  const stop = useCallback(() => {
    setIsRunning(false)
    setPhase(0)
    setProgress(0)
    cancelAnimationFrame(animRef.current)
    if (sessionIntervalRef.current) {
      clearInterval(sessionIntervalRef.current)
      sessionIntervalRef.current = null
    }
  }, [])

  // ─── Complete session ─────────────────────────────────────────────
  const completeSession = useCallback(() => {
    stop()
    setShowComplete(true)
    hapticPulse()
  }, [stop])

  // ─── Main animation loop ─────────────────────────────────────────
  useEffect(() => {
    if (!isRunning || !selectedPattern) return

    const phaseDuration = selectedPattern.pattern[phase]

    if (phaseDuration === 0) {
      const nextPhase = (phase + 1) % 4
      if (nextPhase === 0) setCycleCount((c) => c + 1)
      hapticPulse()
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
        hapticPulse()
        setPhase(nextPhase)
        return
      }

      animRef.current = requestAnimationFrame(tick)
    }

    animRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(animRef.current)
  }, [isRunning, phase, selectedPattern])

  // ─── Session timer ────────────────────────────────────────────────
  useEffect(() => {
    if (!isRunning || sessionDuration === 0) return

    sessionStartRef.current = Date.now()
    const totalSec = sessionDuration * 60
    setSessionTimeLeft(totalSec)

    sessionIntervalRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - sessionStartRef.current) / 1000)
      const remaining = totalSec - elapsed
      if (remaining <= 0) {
        completeSession()
      } else {
        setSessionTimeLeft(remaining)
      }
    }, 1000)

    return () => {
      if (sessionIntervalRef.current) {
        clearInterval(sessionIntervalRef.current)
        sessionIntervalRef.current = null
      }
    }
  }, [isRunning, sessionDuration, completeSession])

  // ─── Scene handler ────────────────────────────────────────────────
  const handleSceneSelect = (sceneId: string) => {
    if (sceneId === '__silent__') {
      stopAll()
      setSelectedSceneId(null)
      return
    }
    const scene = scenes.find((s) => s.id === sceneId)
    if (scene) {
      loadScene(scene.sounds, scene.id)
      setSelectedSceneId(sceneId)
    }
  }

  // ─── Custom pattern stepper ───────────────────────────────────────
  const adjustCustom = (index: number, delta: number) => {
    setCustomPattern((prev) => {
      const next = [...prev] as [number, number, number, number]
      next[index] = Math.max(1, Math.min(15, next[index] + delta))
      saveCustomPattern(next)
      return next
    })
  }

  // ─── Derived values ───────────────────────────────────────────────
  const circleScale =
    phase === 0
      ? 0.6 + progress * 0.4
      : phase === 2
        ? 1.0 - progress * 0.4
        : phase === 1
          ? 1.0
          : 0.6

  const glowIntensity = isRunning ? 20 + Math.sin(progress * Math.PI) * 15 : 15

  // SVG progress ring
  const ringRadius = 124
  const ringCircumference = 2 * Math.PI * ringRadius
  const ringOffset = ringCircumference * (1 - progress)

  // ─── Session Complete Screen ──────────────────────────────────────
  if (showComplete) {
    const totalMinutes = sessionDuration > 0 ? sessionDuration : Math.round((cycleCount * (selectedPattern?.pattern.reduce((a, b) => a + b, 0) ?? 0)) / 60)
    return (
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        justifyContent: 'center', height: '100%', padding: '20px', gap: '24px',
      }}>
        <motion.div
          initial={{ scale: 0.5, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          style={{ fontSize: '64px' }}
        >
          {'\u2728'}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          style={{ fontSize: '24px', fontWeight: 600 }}
        >
          {t('breathing.complete')}
        </motion.h2>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px',
            padding: '24px 40px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div style={{ fontSize: '36px', fontWeight: 700, color: 'var(--accent)' }}>
            {cycleCount}
          </div>
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {cycleCount !== 1 ? t('breathing.cycles') : t('breathing.cycle')}
          </div>
          <div style={{ width: '100%', height: '1px', background: 'rgba(255,255,255,0.08)', margin: '4px 0' }} />
          <div style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
            {t('breathing.totalTime')}: {totalMinutes} {t('breathing.minutes')}
          </div>
        </motion.div>
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          onClick={() => {
            setShowComplete(false)
            setCycleCount(0)
            setSelectedPattern(null)
          }}
          style={{
            padding: '14px 40px', borderRadius: 'var(--radius-full)',
            background: 'var(--accent)', color: '#fff', fontSize: '16px', fontWeight: 600,
            boxShadow: 'var(--shadow-glow)', marginTop: '8px',
          }}
        >
          {t('breathing.back')}
        </motion.button>
      </div>
    )
  }

  // ─── Pattern Selection Screen ─────────────────────────────────────
  if (!selectedPattern) {
    return (
      <div style={{ padding: '20px', paddingBottom: '16px' }}>
        <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '8px' }}>
          {t('breathing.title')}
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '20px' }}>
          {t('breathing.desc')}
        </p>

        {/* Pattern Cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
          {patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setSelectedPattern(p)
                setCycleCount(0)
                setShowComplete(false)
              }}
              style={{
                padding: '18px 20px',
                borderRadius: 'var(--radius-md)',
                background: PATTERN_GRADIENTS[p.id] ?? 'rgba(255,255,255,0.04)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'left',
                display: 'flex',
                alignItems: 'center',
                gap: '14px',
              }}
            >
              <span style={{ fontSize: '28px', flexShrink: 0 }}>
                {PATTERN_ICONS[p.id] ?? ''}
              </span>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', flex: 1 }}>
                <span style={{ fontSize: '16px', fontWeight: 500 }}>{p.name}</span>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {p.description}
                </span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {p.pattern.filter((v) => v > 0).join(' - ')}s
                </span>
              </div>
            </button>
          ))}
        </div>

        {/* Custom Pattern Editor (inline) */}
        {selectedPattern === null && (
          <div style={{
            padding: '16px', borderRadius: 'var(--radius-md)',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '14px', fontWeight: 500, marginBottom: '12px', color: 'var(--text-secondary)' }}>
              {'\u2699\uFE0F'} {t('breathing.custom')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
              {[t('breathing.inhale'), t('breathing.hold'), t('breathing.exhale'), t('breathing.hold')].map((label, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  padding: '8px 12px', borderRadius: '10px', gap: '10px',
                  background: 'rgba(255,255,255,0.04)',
                }}>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>{label}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <button
                      onClick={() => adjustCustom(i, -1)}
                      style={{
                        width: '26px', height: '26px', borderRadius: '50%', minWidth: '26px', minHeight: '26px',
                        background: 'rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >−</button>
                    <span style={{ fontSize: '16px', fontWeight: 600, width: '20px', textAlign: 'center' }}>
                      {customPattern[i]}
                    </span>
                    <button
                      onClick={() => adjustCustom(i, 1)}
                      style={{
                        width: '26px', height: '26px', borderRadius: '50%', minWidth: '26px', minHeight: '26px',
                        background: 'rgba(255,255,255,0.1)', fontSize: '14px', fontWeight: 700,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >+</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Ambient Sound Scene Buttons */}
        <div style={{ marginBottom: '8px' }}>
          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '10px', fontWeight: 500 }}>
            {t('breathing.sounds')}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {BREATHING_SCENES.map((bs) => {
              const scene = bs.id !== '__silent__' ? scenes.find((s) => s.id === bs.id) : null
              const icon = scene?.icon ?? '\u{1F507}'
              const isActive = bs.id === '__silent__' ? !selectedSceneId : selectedSceneId === bs.id
              return (
                <button
                  key={bs.id}
                  onClick={() => handleSceneSelect(bs.id)}
                  style={{
                    padding: '8px 14px', borderRadius: 'var(--radius-full)',
                    background: isActive ? 'rgba(var(--accent-rgb, 124,92,252), 0.2)' : 'rgba(255,255,255,0.05)',
                    border: isActive ? '1px solid var(--accent)' : '1px solid rgba(255,255,255,0.08)',
                    fontSize: '13px',
                    display: 'flex', alignItems: 'center', gap: '6px',
                    color: isActive ? 'var(--accent-light)' : 'var(--text-secondary)',
                  }}
                >
                  <span>{icon}</span>
                  <span>{bs.id === '__silent__' ? t('breathing.silent') : (scene ? t(scene.nameKey) : bs.id)}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    )
  }

  // ─── Active Breathing Screen ──────────────────────────────────────
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        height: '100%',
        padding: '12px 20px 16px',
        position: 'relative',
        overflow: 'auto',
      }}
    >
      {/* Phase-colored background overlay */}
      <motion.div
        animate={{ background: isRunning ? PHASE_COLORS[phase] : 'transparent' }}
        transition={{ duration: 1.2 }}
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 0,
        }}
      />

      {/* Back button - in flow, not absolute */}
      <div style={{ width: '100%', marginBottom: '12px', zIndex: 2 }}>
        <button
          onClick={() => { stop(); setSelectedPattern(null) }}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            fontSize: '13px',
            fontWeight: 500,
            color: 'var(--text-primary)',
            padding: '8px 14px 8px 10px',
            borderRadius: '12px',
            background: 'rgba(255,255,255,0.08)',
            border: '1px solid rgba(255,255,255,0.12)',
          }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          {t('breathing.back')}
        </button>
      </div>

      {/* Pattern name */}
      <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '8px', zIndex: 1 }}>
        {selectedPattern.name}
      </h3>

      {/* Session Duration Selector (before starting) */}
      {!isRunning && (
        <div style={{
          display: 'flex', gap: '8px', marginBottom: '24px', flexWrap: 'wrap',
          justifyContent: 'center', zIndex: 1,
        }}>
          {SESSION_OPTIONS.map((min) => (
            <button
              key={min}
              onClick={() => setSessionDuration(min)}
              style={{
                padding: '6px 14px', borderRadius: 'var(--radius-full)',
                background: sessionDuration === min ? 'var(--accent)' : 'rgba(255,255,255,0.06)',
                color: sessionDuration === min ? '#fff' : 'var(--text-secondary)',
                fontSize: '13px', fontWeight: sessionDuration === min ? 600 : 400,
                border: sessionDuration === min ? 'none' : '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {min === 0 ? '\u221E' : `${min} ${t('breathing.minutes')}`}
            </button>
          ))}
        </div>
      )}

      {/* Session timer display (while running) */}
      {isRunning && sessionDuration > 0 && (
        <div style={{ fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px', zIndex: 1 }}>
          {formatTime(sessionTimeLeft)}
        </div>
      )}

      {/* Breathing Circle Container */}
      <div
        style={{
          position: 'relative',
          width: '280px',
          height: '280px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '32px',
          zIndex: 1,
        }}
      >
        {/* SVG Progress Ring */}
        <svg
          width="280"
          height="280"
          style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}
        >
          {/* Background ring */}
          <circle
            cx="140"
            cy="140"
            r={ringRadius}
            fill="none"
            stroke="rgba(255,255,255,0.06)"
            strokeWidth="3"
          />
          {/* Progress ring */}
          {isRunning && (
            <circle
              cx="140"
              cy="140"
              r={ringRadius}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3"
              strokeLinecap="round"
              strokeDasharray={ringCircumference}
              strokeDashoffset={ringOffset}
              style={{ transition: 'stroke-dashoffset 0.1s linear' }}
            />
          )}
        </svg>

        {/* Particles */}
        {isRunning && Array.from({ length: PARTICLE_COUNT }).map((_, i) => {
          const angle = (i / PARTICLE_COUNT) * Math.PI * 2
          // Inhale: particles move inward; exhale: outward; hold: orbit
          const baseR = 120
          const particleR =
            phase === 0
              ? baseR - progress * 30
              : phase === 2
                ? baseR - 30 + progress * 30
                : baseR - 15 + Math.sin(progress * Math.PI * 2 + i) * 8

          const orbitOffset = phase === 1 || phase === 3 ? progress * 0.3 : 0
          const px = 140 + Math.cos(angle + orbitOffset) * particleR
          const py = 140 + Math.sin(angle + orbitOffset) * particleR
          const opacity = 0.3 + Math.sin(progress * Math.PI + i * 0.5) * 0.3

          return (
            <div
              key={i}
              style={{
                position: 'absolute',
                left: `${px}px`,
                top: `${py}px`,
                width: '4px',
                height: '4px',
                borderRadius: '50%',
                background: 'var(--accent-light)',
                opacity,
                transform: 'translate(-50%, -50%)',
                transition: 'left 0.15s linear, top 0.15s linear',
                pointerEvents: 'none',
              }}
            />
          )
        })}

        {/* Main breathing circle */}
        <motion.div
          animate={{ scale: circleScale }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          style={{
            width: '200px',
            height: '200px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, var(--accent-glow), transparent)',
            border: '3px solid var(--accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: '4px',
            boxShadow: `0 0 ${glowIntensity}px var(--accent-glow)`,
          }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={phase}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              style={{ fontSize: '28px', fontWeight: 300, textAlign: 'center', padding: '0 10px' }}
            >
              {isRunning ? t(PHASE_KEYS[phase]) : t('breathing.ready')}
            </motion.span>
          </AnimatePresence>
          {isRunning && (
            <span style={{ fontSize: '16px', color: 'var(--text-secondary)' }}>
              {Math.ceil(selectedPattern.pattern[phase] * (1 - progress))}
            </span>
          )}
        </motion.div>
      </div>

      {/* Cycle Counter */}
      {cycleCount > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            marginBottom: '20px', zIndex: 1,
          }}
        >
          <span style={{
            fontSize: '32px', fontWeight: 700, color: 'var(--accent)',
            lineHeight: 1,
          }}>
            {cycleCount}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            {cycleCount !== 1 ? t('breathing.cycles') : t('breathing.cycle')}
          </span>
        </motion.div>
      )}

      {/* Start / Stop Button */}
      <button
        onClick={() => {
          if (isRunning) {
            stop()
            setCycleCount(0)
          } else {
            setCycleCount(0)
            setIsRunning(true)
          }
        }}
        style={{
          padding: '14px 40px',
          borderRadius: 'var(--radius-full)',
          background: isRunning ? 'var(--danger)' : 'var(--accent)',
          color: '#fff',
          fontSize: '16px',
          fontWeight: 600,
          boxShadow: 'var(--shadow-glow)',
          zIndex: 1,
        }}
      >
        {isRunning ? t('breathing.stop') : t('breathing.start')}
      </button>
    </div>
  )
}
