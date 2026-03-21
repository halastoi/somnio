import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { sounds as allSounds } from '../../audio/sounds'

export function MixList() {
  const { savedMixes, activeSounds, saveMix, loadMix, deleteMix } = usePlayerStore()
  const t = useSettingsStore((s) => s.t)
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [mixName, setMixName] = useState('')

  const handleSave = () => {
    if (mixName.trim() && activeSounds.length > 0) {
      saveMix(mixName.trim())
      setMixName('')
      setShowSaveInput(false)
    }
  }

  return (
    <div style={{ padding: '20px', paddingBottom: '16px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '20px',
        }}
      >
        <h2 style={{ fontSize: '20px', fontWeight: 600 }}>{t('mixes.title')}</h2>
        {activeSounds.length > 0 && (
          <button
            onClick={() => setShowSaveInput(!showSaveInput)}
            style={{
              padding: '8px 16px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--accent)',
              color: '#fff',
              fontSize: '13px',
              fontWeight: 500,
            }}
          >
            Save Current
          </button>
        )}
      </div>

      {showSaveInput && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '20px',
          }}
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
              padding: '12px 16px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--bg-card)',
              border: '1px solid var(--accent)',
              color: 'var(--text-primary)',
              fontSize: '15px',
              outline: 'none',
            }}
          />
          <button
            onClick={handleSave}
            style={{
              padding: '12px 20px',
              borderRadius: 'var(--radius-md)',
              background: 'var(--success)',
              color: '#000',
              fontWeight: 600,
              fontSize: '14px',
            }}
          >
            Save
          </button>
        </motion.div>
      )}

      {savedMixes.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--text-muted)',
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>
            {'{}'}
          </div>
          <p style={{ fontSize: '15px' }}>{t('mixes.empty')}</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>
            {t('mixes.emptyHint')}
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {savedMixes.map((mix) => (
            <motion.div
              key={mix.id}
              whileTap={{ scale: 0.98 }}
              style={{
                background: 'var(--bg-card)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <button
                onClick={() => loadMix(mix.id)}
                style={{
                  flex: 1,
                  textAlign: 'left',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                }}
              >
                <span style={{ fontSize: '15px', fontWeight: 500 }}>{mix.name}</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                  {mix.sounds.map((s) => {
                    const sound = allSounds.find((a) => a.id === s.soundId)
                    if (!sound) return null
                    const pct = Math.round(s.volume * 100)
                    return (
                      <div
                        key={s.soundId}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          fontSize: '11px',
                          color: 'var(--text-muted)',
                        }}
                      >
                        <span>{sound.icon}</span>
                        <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {sound.name}
                        </span>
                        <div style={{
                          width: '40px',
                          height: '3px',
                          borderRadius: '2px',
                          background: 'rgba(255,255,255,0.1)',
                          flexShrink: 0,
                        }}>
                          <div style={{
                            width: `${pct}%`,
                            height: '100%',
                            borderRadius: '2px',
                            background: 'var(--accent)',
                          }} />
                        </div>
                        <span style={{ fontSize: '10px', width: '28px', textAlign: 'right', flexShrink: 0 }}>
                          {pct}%
                        </span>
                      </div>
                    )
                  })}
                </div>
              </button>

              <button
                onClick={() => deleteMix(mix.id)}
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'var(--bg-card-hover)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '16px',
                  color: 'var(--text-muted)',
                }}
              >
                ×
              </button>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
