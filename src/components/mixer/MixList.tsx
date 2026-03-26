import { useState } from 'react'
import { motion } from 'framer-motion'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { sounds as allSounds } from '../../audio/sounds'
import { scenes } from '../../data/scenes'

type SubTab = 'scenes' | 'myMixes'

const sceneStyles: Record<string, { bg: string; glow: string }> = {
  'zen-temple':        { bg: 'linear-gradient(135deg, rgba(120,60,200,0.25) 0%, rgba(60,20,100,0.08) 100%)', glow: 'rgba(120,60,200,0.15)' },
  'rainy-night':       { bg: 'linear-gradient(135deg, rgba(40,90,200,0.25) 0%, rgba(20,45,100,0.08) 100%)', glow: 'rgba(40,90,200,0.15)' },
  'forest-clearing':   { bg: 'linear-gradient(135deg, rgba(30,140,60,0.25) 0%, rgba(15,70,30,0.08) 100%)', glow: 'rgba(30,140,60,0.15)' },
  'cozy-cabin':        { bg: 'linear-gradient(135deg, rgba(200,100,30,0.25) 0%, rgba(100,50,15,0.08) 100%)', glow: 'rgba(200,100,30,0.15)' },
  'deep-ocean-scene':  { bg: 'linear-gradient(135deg, rgba(20,120,160,0.25) 0%, rgba(10,60,80,0.08) 100%)', glow: 'rgba(20,120,160,0.15)' },
  'warm-drift':        { bg: 'linear-gradient(135deg, rgba(140,70,200,0.25) 0%, rgba(70,35,100,0.08) 100%)', glow: 'rgba(140,70,200,0.15)' },
  'tibetan-evening':   { bg: 'linear-gradient(135deg, rgba(200,150,50,0.25) 0%, rgba(100,75,25,0.08) 100%)', glow: 'rgba(200,150,50,0.15)' },
  'starfield':         { bg: 'linear-gradient(135deg, rgba(80,40,200,0.25) 0%, rgba(40,20,100,0.08) 100%)', glow: 'rgba(80,40,200,0.15)' },
  'meditation':        { bg: 'linear-gradient(135deg, rgba(60,60,180,0.25) 0%, rgba(30,30,90,0.08) 100%)', glow: 'rgba(60,60,180,0.15)' },
  'cafe-focus':        { bg: 'linear-gradient(135deg, rgba(180,110,50,0.25) 0%, rgba(90,55,25,0.08) 100%)', glow: 'rgba(180,110,50,0.15)' },
  'night-train-scene': { bg: 'linear-gradient(135deg, rgba(100,100,150,0.25) 0%, rgba(50,50,75,0.08) 100%)', glow: 'rgba(100,100,150,0.15)' },
  'beach-sunset':      { bg: 'linear-gradient(135deg, rgba(220,140,50,0.25) 0%, rgba(110,70,25,0.08) 100%)', glow: 'rgba(220,140,50,0.15)' },
  'candlelight':       { bg: 'linear-gradient(135deg, rgba(220,120,30,0.25) 0%, rgba(110,60,15,0.08) 100%)', glow: 'rgba(220,120,30,0.15)' },
  'baby-sleep-scene':  { bg: 'linear-gradient(135deg, rgba(80,80,180,0.25) 0%, rgba(40,40,90,0.08) 100%)', glow: 'rgba(80,80,180,0.15)' },
}

export function MixList() {
  const { savedMixes, activeSounds, saveMix, loadMix, deleteMix, loadScene, favoriteScenes, toggleFavoriteScene } = usePlayerStore()
  const t = useSettingsStore((s) => s.t)
  const [subTab, setSubTab] = useState<SubTab>('scenes')
  const [showSaveInput, setShowSaveInput] = useState(false)
  const [mixName, setMixName] = useState('')

  const handleSave = () => {
    if (mixName.trim() && activeSounds.length > 0) {
      saveMix(mixName.trim())
      setMixName('')
      setShowSaveInput(false)
    }
  }

  const alreadySaved = savedMixes.some((m) =>
    m.sounds.length === activeSounds.length &&
    m.sounds.every((ms) => activeSounds.some((as) => as.soundId === ms.soundId))
  )

  return (
    <div style={{ padding: '20px 8px', paddingBottom: '16px', height: '100%', display: 'flex', flexDirection: 'column' }}>
      {/* Subtab toggle */}
      <div style={{
        display: 'flex', gap: '4px', marginBottom: '20px',
        background: 'rgba(255,255,255,0.04)', borderRadius: '12px', padding: '4px',
      }}>
        <button
          onClick={() => setSubTab('scenes')}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            background: subTab === 'scenes' ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'transparent',
            color: subTab === 'scenes' ? '#fff' : 'var(--text-muted)',
            boxShadow: subTab === 'scenes' ? '0 2px 12px var(--accent-glow)' : 'none',
            textShadow: subTab === 'scenes' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s',
          }}
        >
          {t('scenes.title')}
        </button>
        <button
          onClick={() => setSubTab('myMixes')}
          style={{
            flex: 1, padding: '10px', borderRadius: '10px', fontSize: '14px', fontWeight: 600,
            background: subTab === 'myMixes' ? 'linear-gradient(135deg, var(--accent), var(--accent-light))' : 'transparent',
            color: subTab === 'myMixes' ? '#fff' : 'var(--text-muted)',
            boxShadow: subTab === 'myMixes' ? '0 2px 12px var(--accent-glow)' : 'none',
            textShadow: subTab === 'myMixes' ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
            transition: 'all 0.2s',
            position: 'relative',
          }}
        >
          {t('mixes.title')}
          {savedMixes.length > 0 && (
            <span style={{
              position: 'absolute', top: '4px', right: '8px',
              background: subTab === 'myMixes' ? 'rgba(255,255,255,0.3)' : 'var(--accent)',
              color: '#fff', fontSize: '9px', fontWeight: 700,
              borderRadius: '8px', padding: '1px 5px', minWidth: '14px',
            }}>
              {savedMixes.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {subTab === 'scenes' && <ScenesView scenes={scenes} loadScene={loadScene} t={t} favoriteScenes={favoriteScenes} toggleFavoriteScene={toggleFavoriteScene} />}
        {subTab === 'myMixes' && (
          <MyMixesView
            savedMixes={savedMixes}
            activeSounds={activeSounds}
            alreadySaved={alreadySaved}
            showSaveInput={showSaveInput}
            setShowSaveInput={setShowSaveInput}
            mixName={mixName}
            setMixName={setMixName}
            handleSave={handleSave}
            loadMix={loadMix}
            deleteMix={deleteMix}
            t={t}
          />
        )}
      </div>
    </div>
  )
}

function ScenesView({ scenes: sceneList, loadScene, t, favoriteScenes, toggleFavoriteScene }: {
  scenes: typeof scenes
  loadScene: (sounds: { soundId: string; volume: number }[], sceneId?: string) => void
  t: (key: string) => string
  favoriteScenes: string[]
  toggleFavoriteScene: (id: string) => void
}) {
  // Sort: favorites first, then rest
  const sorted = [...sceneList].sort((a, b) => {
    const aFav = favoriteScenes.includes(a.id) ? 0 : 1
    const bFav = favoriteScenes.includes(b.id) ? 0 : 1
    return aFav - bFav
  })

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px' }}>
      {sorted.map((scene) => {
        const style = sceneStyles[scene.id]
        const isFav = favoriteScenes.includes(scene.id)
        return (
          <motion.button
            key={scene.id}
            whileTap={{ scale: 0.95 }}
            onClick={() => loadScene(scene.sounds, scene.id)}
            style={{
              background: style?.bg || 'var(--gradient-card)',
              borderRadius: '16px',
              padding: '18px 14px',
              textAlign: 'left',
              border: '1px solid rgba(255,255,255,0.1)',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              position: 'relative',
              overflow: 'hidden',
              boxShadow: `0 4px 20px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.06)`,
            }}
          >
            {/* Top accent line */}
            <div style={{
              position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
              background: `linear-gradient(90deg, ${style?.glow || 'var(--accent)'}, transparent)`,
            }} />
            {/* Bottom inner glow */}
            <div style={{
              position: 'absolute', bottom: 0, left: '10%', right: '10%', height: '40%',
              background: `radial-gradient(ellipse at bottom, ${style?.glow || 'var(--accent-glow)'}, transparent)`,
              opacity: 0.3, pointerEvents: 'none',
            }} />
            <span style={{ fontSize: '32px', filter: 'drop-shadow(0 2px 8px rgba(0,0,0,0.4))' }}>{scene.icon}</span>
            <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              {t(scene.nameKey)}
            </span>
            <span style={{ fontSize: '11px', color: 'rgba(255,255,255,0.5)', lineHeight: '1.4' }}>
              {t(scene.descKey)}
            </span>
            {/* Favorite heart */}
            <button
              onClick={(e) => { e.stopPropagation(); toggleFavoriteScene(scene.id) }}
              style={{
                position: 'absolute', top: '8px', right: '8px',
                width: '28px', height: '28px', minWidth: '28px', minHeight: '28px',
                borderRadius: '50%', background: 'rgba(0,0,0,0.3)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: 'none', padding: 0,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill={isFav ? '#f87171' : 'none'} stroke={isFav ? '#f87171' : 'rgba(255,255,255,0.6)'} strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>
          </motion.button>
        )
      })}
    </div>
  )
}

function MyMixesView({ savedMixes, activeSounds, alreadySaved, showSaveInput, setShowSaveInput, mixName, setMixName, handleSave, loadMix, deleteMix, t }: {
  savedMixes: { id: string; name: string; sounds: { soundId: string; volume: number }[] }[]
  activeSounds: { soundId: string; volume: number }[]
  alreadySaved: boolean
  showSaveInput: boolean
  setShowSaveInput: (v: boolean) => void
  mixName: string
  setMixName: (v: string) => void
  handleSave: () => void
  loadMix: (id: string) => void
  deleteMix: (id: string) => void
  t: (key: string) => string
}) {
  return (
    <>
      {/* Save button */}
      {activeSounds.length > 0 && !alreadySaved && (
        <div style={{ marginBottom: '16px' }}>
          {!showSaveInput ? (
            <button
              onClick={() => setShowSaveInput(true)}
              style={{
                width: '100%', padding: '12px', borderRadius: 'var(--radius-md)',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                color: '#fff', fontSize: '14px', fontWeight: 600,
                boxShadow: '0 4px 16px var(--accent-glow)',
              }}
            >
              + {t('mixes.saveCurrent') ?? 'Save Current Mix'}
            </button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
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
                  flex: 1, padding: '12px 16px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-card)', border: '1px solid var(--accent)',
                  color: 'var(--text-primary)', fontSize: '15px', outline: 'none',
                }}
              />
              <button
                onClick={handleSave}
                style={{
                  padding: '12px 20px', borderRadius: 'var(--radius-md)',
                  background: 'var(--success)', color: '#000', fontWeight: 600, fontSize: '14px',
                }}
              >
                Save
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Mixes list */}
      {savedMixes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px' }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block' }}>
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" />
              <circle cx="18" cy="16" r="3" />
            </svg>
          </div>
          <p style={{ fontSize: '15px' }}>{t('mixes.empty')}</p>
          <p style={{ fontSize: '13px', marginTop: '8px' }}>{t('mixes.emptyHint')}</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {savedMixes.map((mix) => {
            const isActive = activeSounds.length === mix.sounds.length &&
              mix.sounds.every((ms) => activeSounds.some((as) => as.soundId === ms.soundId))

            return (
              <motion.div
                key={mix.id}
                whileTap={{ scale: 0.98 }}
                style={{
                  background: isActive
                    ? 'linear-gradient(145deg, rgba(124,92,252,0.15) 0%, rgba(124,92,252,0.04) 100%)'
                    : 'linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)',
                  borderRadius: '14px',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  border: isActive ? '1px solid rgba(124,92,252,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  borderLeft: isActive ? '3px solid var(--accent-light)' : '3px solid rgba(124,92,252,0.3)',
                  boxShadow: isActive
                    ? '0 0 16px rgba(124,92,252,0.2), 0 4px 12px rgba(0,0,0,0.3)'
                    : '0 2px 12px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.05)',
                }}
              >
                <button
                  onClick={() => loadMix(mix.id)}
                  style={{
                    flex: 1, textAlign: 'left',
                    display: 'flex', flexDirection: 'column', gap: '6px',
                  }}
                >
                  <span style={{ fontSize: '15px', fontWeight: 500 }}>{mix.name}</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                    {mix.sounds.map((s) => {
                      const sound = allSounds.find((a) => a.id === s.soundId)
                      if (!sound) return null
                      const pct = Math.round(s.volume * 100)
                      return (
                        <div key={s.soundId} style={{
                          display: 'flex', alignItems: 'center', gap: '6px',
                          fontSize: '11px', color: 'var(--text-muted)',
                        }}>
                          <span>{sound.icon}</span>
                          <span style={{ flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {sound.name}
                          </span>
                          <div style={{ width: '40px', height: '3px', borderRadius: '2px', background: 'rgba(255,255,255,0.1)', flexShrink: 0 }}>
                            <div style={{ width: `${pct}%`, height: '100%', borderRadius: '2px', background: 'var(--accent)' }} />
                          </div>
                          <span style={{ fontSize: '10px', width: '28px', textAlign: 'right', flexShrink: 0 }}>{pct}%</span>
                        </div>
                      )
                    })}
                  </div>
                </button>

                <button
                  onClick={() => deleteMix(mix.id)}
                  style={{
                    width: '36px', height: '36px', borderRadius: '50%',
                    background: 'var(--bg-card-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'var(--text-muted)',
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </motion.div>
            )
          })}
        </div>
      )}
    </>
  )
}
