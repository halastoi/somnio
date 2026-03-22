import { useState, useEffect } from 'react'
import { usePlayerStore } from './stores/usePlayerStore'
import { useSettingsStore } from './stores/useSettingsStore'
import { AnimatedBackground } from './components/ui/AnimatedBackground'
import { SoundGrid } from './components/sounds/SoundGrid'
import { PlayerBar } from './components/player/PlayerBar'
import { TimerModal, TimerBadge } from './components/player/TimerModal'
import { RandomMixModal, quickRandomMix } from './components/random/RandomMixModal'
import { useRandomMixStore } from './stores/useRandomMixStore'
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
            <p style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '1px', letterSpacing: '1.5px', textTransform: 'uppercase' }}>
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
              width: '42px',
              height: '42px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '1px solid rgba(255,255,255,0.08)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              fontSize: '18px',
            }}
          >
            🎲
          </button>

          {/* Timer countdown + button */}
          <TimerBadge />
          <button
            onClick={() => setTimerOpen(true)}
            style={{
              width: '42px',
              height: '42px',
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
            <div style={{ fontSize: '40px', marginBottom: '16px' }}>🌙</div>
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
                  setShowExitConfirm(false)
                  window.history.back()
                  window.history.back()
                }}
                style={{
                  flex: 1,
                  padding: '14px',
                  borderRadius: '12px',
                  background: 'rgba(255,255,255,0.06)',
                  color: 'var(--text-secondary)',
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
