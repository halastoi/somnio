import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { useRandomMixStore } from '../../stores/useRandomMixStore'
import { Slider } from '../ui/Slider'
import { sounds } from '../../audio/sounds'
import { quickRandomMix } from '../random/RandomMixModal'

export function PlayerBar() {
  const {
    isPlaying,
    activeSounds,
    masterVolume,
    setMasterVolume,
    setSoundVolume,
    stopAll,
    toggleSound,
    saveMix,
  } = usePlayerStore()
  const t = useSettingsStore((s) => s.t)
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [mixName, setMixName] = useState('')
  const [showMixer, setShowMixer] = useState(false)
  const longPressTimer = useRef<number>(0)
  const longPressTriggered = useRef(false)

  // Close save input when sounds change
  useEffect(() => {
    setShowSaveInput(false)
  }, [activeSounds.length])

  if (activeSounds.length === 0) return null

  const activeNames = activeSounds
    .map((a) => sounds.find((s) => s.id === a.soundId)?.name)
    .filter(Boolean)
    .join(' + ')

  const handleSave = () => {
    if (mixName.trim()) {
      saveMix(mixName.trim())
      setMixName('')
      setShowSaveInput(false)
    }
  }

  const masterPct = Math.round(masterVolume * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      style={{
        padding: '0 12px 8px',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          background: 'rgba(255,255,255,0.06)',
          backdropFilter: 'blur(30px)',
          WebkitBackdropFilter: 'blur(30px)',
          borderRadius: '16px',
          padding: '12px 14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: 'var(--shadow-lg)',
          borderTop: '1px solid rgba(124, 92, 252, 0.2)',
        }}
      >
        {/* Status Row */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Tap to expand mixer */}
          <button
            onClick={() => setShowMixer(!showMixer)}
            style={{
              flex: 1,
              minWidth: 0,
              textAlign: 'left',
              display: 'flex',
              flexDirection: 'column',
              padding: '2px 0',
            }}
          >
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              {activeSounds.length} {activeSounds.length !== 1 ? t('player.sounds') : t('player.sound')}
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round"
                style={{ transform: showMixer ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
            <div
              style={{
                fontSize: '13px',
                fontWeight: 500,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
            >
              {activeNames}
            </div>
          </button>

          {/* Random mix button: tap = quick generate, long press = open settings */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onTouchStart={() => { longPressTimer.current = window.setTimeout(() => { longPressTriggered.current = true; useRandomMixStore.getState().setShowConfig(true) }, 500) }}
            onTouchEnd={() => { clearTimeout(longPressTimer.current); if (!longPressTriggered.current) quickRandomMix(); longPressTriggered.current = false }}
            onTouchCancel={() => { clearTimeout(longPressTimer.current); longPressTriggered.current = false }}
            onMouseDown={() => { longPressTimer.current = window.setTimeout(() => { longPressTriggered.current = true; useRandomMixStore.getState().setShowConfig(true) }, 500) }}
            onMouseUp={() => { clearTimeout(longPressTimer.current); if (!longPressTriggered.current) quickRandomMix(); longPressTriggered.current = false }}
            onMouseLeave={() => { clearTimeout(longPressTimer.current); longPressTriggered.current = false }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.15)',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none',
              transition: 'transform 0.15s, box-shadow 0.2s',
            } as React.CSSProperties}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--text-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H20" /><path d="M18 2l4 4-4 4" /><path d="M2 6h1.4c1.3 0 2.5.6 3.3 1.7l6.1 8.6c.7 1.1 2 1.7 3.3 1.7H20" /><path d="M18 14l4 4-4 4" />
            </svg>
          </motion.button>

          {/* Save button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={() => { setShowSaveInput(!showSaveInput); setShowMixer(false) }}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: showSaveInput ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.15)',
              boxShadow: showSaveInput ? 'var(--shadow-glow-accent)' : 'none',
              transition: 'transform 0.15s, box-shadow 0.2s',
            }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={showSaveInput ? '#fff' : 'var(--text-primary)'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
            </svg>
          </motion.button>

          {/* Stop button */}
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={stopAll}
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: isPlaying ? 'linear-gradient(135deg, var(--accent), #9d82ff)' : 'rgba(255,255,255,0.08)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: isPlaying ? '0 2px 12px var(--accent-glow)' : 'none',
              flexShrink: 0,
              border: '1px solid rgba(255,255,255,0.1)',
              transition: 'transform 0.15s, box-shadow 0.2s',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 20 20" fill="white">
              <rect x="3" y="3" width="14" height="14" rx="2" />
            </svg>
          </motion.button>
        </div>

        {/* Per-sound mixer */}
        <AnimatePresence>
          {showMixer && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                maxHeight: '120px',
                overflowY: 'auto',
                overflowX: 'hidden',
                scrollbarWidth: 'thin',
                background: 'rgba(255,255,255,0.02)',
                borderRadius: '10px',
                padding: '6px',
              }}
            >
              {activeSounds.map((as) => {
                const sound = sounds.find((s) => s.id === as.soundId)
                if (!sound) return null
                const pct = Math.round(as.volume * 100)
                return (
                  <div
                    key={as.soundId}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '4px 0',
                    }}
                  >
                    <span style={{ fontSize: '16px', width: '24px', textAlign: 'center', flexShrink: 0, filter: 'drop-shadow(0 0 4px var(--accent-glow))' }}>
                      {sound.icon}
                    </span>
                    <div style={{ flex: 1 }}>
                      <Slider
                        value={as.volume}
                        onChange={(v) => setSoundVolume(as.soundId, v)}
                        height={28}
                      />
                    </div>
                    <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '28px', textAlign: 'right', flexShrink: 0 }}>
                      {pct}%
                    </span>
                    {/* Remove sound */}
                    <button
                      onClick={() => toggleSound(as.soundId)}
                      style={{
                        width: '24px',
                        height: '24px',
                        minWidth: '24px',
                        minHeight: '24px',
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.06)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        padding: 0,
                        border: '1px solid rgba(255,255,255,0.1)',
                      }}
                    >
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                    </button>
                  </div>
                )
              })}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Save input */}
        <AnimatePresence>
          {showSaveInput && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                placeholder={t('mixes.placeholder')}
                value={mixName}
                onChange={(e) => setMixName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSave()}
                autoFocus
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.15)',
                  color: 'var(--text-primary)',
                  fontSize: '14px',
                  outline: 'none',
                  minHeight: '40px',
                }}
              />
              <button
                onClick={handleSave}
                style={{
                  padding: '10px 16px',
                  borderRadius: '10px',
                  background: 'var(--accent)',
                  color: '#fff',
                  fontWeight: 600,
                  fontSize: '13px',
                  minWidth: '60px',
                }}
              >
                {t('mixes.saveBtn')}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Master Volume */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="var(--text-muted)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ flexShrink: 0 }}
          >
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
          </svg>
          <div style={{ flex: 1 }}>
            <Slider
              value={masterVolume}
              onChange={setMasterVolume}
              height={32}
            />
          </div>
          <span style={{ fontSize: '10px', color: 'var(--text-muted)', width: '28px', textAlign: 'right', flexShrink: 0 }}>
            {masterPct}%
          </span>
        </div>
      </div>
    </motion.div>
  )
}
