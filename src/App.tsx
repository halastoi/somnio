import { useState, useEffect, useRef } from 'react'
import { usePlayerStore } from './stores/usePlayerStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { AnimatedBackground } from './components/ui/AnimatedBackground'
import { SoundGrid } from './components/sounds/SoundGrid'
import { PlayerBar } from './components/player/PlayerBar'
import { TimerModal, TimerBadge } from './components/player/TimerModal'
import { RandomMixModal, quickRandomMix } from './components/random/RandomMixModal'
import { useRandomMixStore } from './stores/useRandomMixStore'
import { scenes } from './data/scenes'
import { BreathingExercise } from './components/breathing/BreathingExercise'
import { MixList } from './components/mixer/MixList'
import { SettingsPage } from './components/settings/SettingsPage'
import { Navigation, type Tab } from './components/layout/Navigation'

export default function App() {
  const [activeTab, setActiveTabState] = useState<Tab>(() =>
    (sessionStorage.getItem('somnio-tab') as Tab) || 'sounds'
  )
  const setActiveTab = (tab: Tab) => {
    setActiveTabState(tab)
    sessionStorage.setItem('somnio-tab', tab)
  }
  const [timerOpen, setTimerOpen] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)
  const init = usePlayerStore((s) => s.init)
  const initialized = usePlayerStore((s) => s.initialized)
  const timer = usePlayerStore((s) => s.timer)
  const t = useSettingsStore((s) => s.t)
  const isPlaying = usePlayerStore((s) => s.isPlaying)
  const activeSounds = usePlayerStore((s) => s.activeSounds)
  const loadScene = usePlayerStore((s) => s.loadScene)
  const leavingRef = useRef(false)

  useEffect(() => {
    const handleGesture = () => {
      if (!initialized) {
        init()
      }
    }
    document.addEventListener('click', handleGesture, { once: true })
    document.addEventListener('touchstart', handleGesture, { once: true })
    return () => {
      document.removeEventListener('click', handleGesture)
      document.removeEventListener('touchstart', handleGesture)
    }
  }, [init, initialized])

  // Prevent back button from leaving the app
  useEffect(() => {
    window.history.pushState(null, '', window.location.href)

    const handlePopState = () => {
      if (leavingRef.current) return
      if (timerOpen) {
        setTimerOpen(false)
      } else if (showExitConfirm) {
        setShowExitConfirm(false)
      } else if (activeTab !== 'sounds') {
        setActiveTab('sounds')
      } else {
        setShowExitConfirm(true)
      }
      window.history.pushState(null, '', window.location.href)
    }

    window.addEventListener('popstate', handlePopState)
    return () => window.removeEventListener('popstate', handlePopState)
  }, [timerOpen, activeTab, showExitConfirm])

  return (
    <>
      <AnimatedBackground />

      <div
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header - glassmorphism */}
        <header
          style={{
            padding: '10px 16px',
            paddingTop: `calc(10px + var(--safe-top))`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
            background: 'rgba(0,0,0,0.2)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            borderBottom: '1px solid rgba(255,255,255,0.04)',
          }}
        >
          <div>
            <h1
              style={{
                fontSize: '22px',
                fontWeight: 700,
                background: 'linear-gradient(135deg, var(--accent-light), #c084fc, #e879f9)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                letterSpacing: '-0.5px',
              }}
            >
              somnio
            </h1>
            <p style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '1px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
              {t('app.tagline')}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Random mix button */}
          <button
            onClick={() => {
              if (!initialized) init()
              quickRandomMix()
            }}
            onContextMenu={(e) => {
              e.preventDefault()
              useRandomMixStore.getState().setShowConfig(true)
            }}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="8" height="8" rx="2" />
              <rect x="14" y="2" width="8" height="8" rx="2" />
              <rect x="2" y="14" width="8" height="8" rx="2" />
              <rect x="14" y="14" width="8" height="8" rx="2" />
              <circle cx="6" cy="6" r="1" fill="var(--text-secondary)" />
              <circle cx="18" cy="4" r="1" fill="var(--text-secondary)" />
              <circle cx="16" cy="6" r="1" fill="var(--text-secondary)" />
              <circle cx="4" cy="16" r="1" fill="var(--text-secondary)" />
              <circle cx="8" cy="16" r="1" fill="var(--text-secondary)" />
              <circle cx="4" cy="18" r="1" fill="var(--text-secondary)" />
              <circle cx="18" cy="18" r="1" fill="var(--text-secondary)" />
            </svg>
          </button>

          {/* Timer countdown + button */}
          <TimerBadge />
          <button
            onClick={() => setTimerOpen(true)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: timer.enabled
                ? 'linear-gradient(135deg, var(--accent), #9d82ff)'
                : 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: timer.enabled ? 'none' : '1px solid rgba(255,255,255,0.08)',
              boxShadow: timer.enabled ? '0 4px 20px var(--accent-glow)' : 'none',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              transition: 'all 0.3s',
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke={timer.enabled ? '#fff' : 'var(--text-secondary)'}
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="12" cy="13" r="8" />
              <path d="M12 9v4l2 2" />
              <line x1="12" y1="1" x2="12" y2="3" />
            </svg>
          </button>
          </div>
        </header>

        {/* Content */}
        <main
          style={{
            flex: 1,
            overflow: activeTab === 'sounds' ? 'hidden' : 'auto',
            padding: activeTab === 'breathing' ? '0' : activeTab === 'sounds' ? '0 0 0 12px' : '0 12px',
            position: 'relative',
          }}
        >
          {activeTab === 'sounds' && <SoundGrid />}
          {activeTab === 'mixes' && <MixList />}
          {activeTab === 'breathing' && <BreathingExercise />}
          {activeTab === 'settings' && <SettingsPage />}
        </main>

        {/* Quick Play floating button - visible only when nothing is playing */}
        {!isPlaying && activeSounds.length === 0 && activeTab === 'sounds' && (
          <div style={{
            display: 'flex', justifyContent: 'center',
            padding: '0 0 12px', flexShrink: 0,
          }}>
            <button
              onClick={async () => {
                if (!initialized) await init()
                const scene = scenes[Math.floor(Math.random() * scenes.length)]
                loadScene(scene.sounds, scene.id)
              }}
              style={{
                padding: '14px 28px',
                borderRadius: '50px',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                color: '#fff',
                fontSize: '15px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 24px var(--accent-glow), 0 2px 8px rgba(0,0,0,0.3)',
                border: 'none',
                letterSpacing: '0.3px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="white" stroke="none">
                <polygon points="5 3 19 12 5 21 5 3" />
              </svg>
              {t('quickPlay') ?? 'Quick Play'}
            </button>
          </div>
        )}

        {/* Player Bar */}
        <PlayerBar />

        {/* Modals */}
        <TimerModal isOpen={timerOpen} onClose={() => setTimerOpen(false)} />
        <RandomMixModal />

        {/* Bottom Navigation - glassmorphism */}
        <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {/* Exit confirmation modal */}
      {showExitConfirm && (
        <div
          onClick={() => setShowExitConfirm(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 300,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(20,20,40,0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '20px',
              padding: '28px 24px',
              maxWidth: '320px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.08)',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '16px', display: 'flex', justifyContent: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            </div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '8px' }}>
              {t('app.tagline')}
            </h3>
            <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '24px', lineHeight: 1.5 }}>
              {t('exit.message')}
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowExitConfirm(false)}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '15px',
                  boxShadow: '0 4px 16px var(--accent-glow)',
                }}
              >
                {t('exit.stay')}
              </button>
              <button
                onClick={() => {
                  leavingRef.current = true
                  setShowExitConfirm(false)
                  window.history.go(-2)
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-muted)',
                  fontWeight: 500,
                  fontSize: '15px',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              >
                {t('exit.leave')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
