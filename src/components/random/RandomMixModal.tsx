import { motion, AnimatePresence } from 'framer-motion'
import { useRandomMixStore } from '../../stores/useRandomMixStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { Slider } from '../ui/Slider'
import { sounds, categories as allCategories } from '../../audio/sounds'

const categoriesBase = allCategories.filter(c => c.id !== 'favorites')

const presets = [
  { id: 'deepSleep', icon: '\uD83D\uDCA4', categories: ['binaural', 'cosmos', 'baby'], soundCount: 3, volumeMin: 0.15, volumeMax: 0.4 },
  { id: 'natureRelax', icon: '\uD83C\uDF3F', categories: ['rain', 'water', 'nature', 'wind'], soundCount: 3, volumeMin: 0.3, volumeMax: 0.6 },
  { id: 'focus', icon: '\uD83C\uDFAF', categories: ['noise', 'binaural'], soundCount: 2, volumeMin: 0.2, volumeMax: 0.5 },
  { id: 'cozy', icon: '\uD83D\uDECB', categories: ['fire', 'rain', 'urban'], soundCount: 3, volumeMin: 0.25, volumeMax: 0.55 },
] as const

export function RandomMixModal() {
  const config = useRandomMixStore()
  const { toggleSound, stopAll } = usePlayerStore()
  const t = useSettingsStore((s) => s.t)
  const binauralEnabled = useSettingsStore((s) => s.binauralEnabled)
  const categories = binauralEnabled ? categoriesBase : categoriesBase.filter(c => c.id !== 'binaural')

  const applyPreset = (preset: typeof presets[number]) => {
    config.setSoundCount(preset.soundCount)
    config.setVolumeMax(preset.volumeMax)
    config.setVolumeMin(preset.volumeMin)
    // Set only preset categories
    const store = useRandomMixStore.getState()
    const allCats = categories.map(c => c.id)
    for (const cat of allCats) {
      const isAllowed = store.allowedCategories.includes(cat)
      const shouldBeAllowed = (preset.categories as readonly string[]).includes(cat)
      if (isAllowed !== shouldBeAllowed) config.toggleCategory(cat)
    }
    config.setAvoidSameCategory(true)
  }

  const generate = () => {
    // Stop current sounds
    stopAll()

    // Filter sounds by allowed categories (exclude binaural if disabled)
    const pool = sounds.filter((s) => config.allowedCategories.includes(s.category) && (binauralEnabled || s.category !== 'binaural'))
    if (pool.length === 0) return

    // Pick random sounds
    const count = Math.min(config.soundCount, pool.length)
    const picked: typeof pool = []
    const usedCategories = new Set<string>()
    const shuffled = [...pool].sort(() => Math.random() - 0.5)

    for (const sound of shuffled) {
      if (picked.length >= count) break
      if (config.avoidSameCategory && usedCategories.has(sound.category)) continue
      picked.push(sound)
      usedCategories.add(sound.category)
    }

    // If avoidSameCategory limited us, fill remaining from any
    if (picked.length < count) {
      for (const sound of shuffled) {
        if (picked.length >= count) break
        if (picked.find((p) => p.id === sound.id)) continue
        picked.push(sound)
      }
    }

    // Enforce max 1 melodic sound per mix
    const melodicPicked = picked.filter(s => s.melodic)
    if (melodicPicked.length > 1) {
      const nonMelodicPool = shuffled.filter(s => !s.melodic && !picked.find(p => p.id === s.id))
      for (let i = 1; i < melodicPicked.length; i++) {
        const replacement = nonMelodicPool.shift()
        if (replacement) {
          const idx = picked.indexOf(melodicPicked[i])
          picked[idx] = replacement
        }
      }
    }

    // Activate each with random volume
    for (const sound of picked) {
      toggleSound(sound.id)
      // Set random volume between min and max
      const vol = config.volumeMin + Math.random() * (config.volumeMax - config.volumeMin)
      usePlayerStore.getState().setSoundVolume(sound.id, Math.round(vol * 100) / 100)
    }

    config.setShowConfig(false)
  }

  return (
    <AnimatePresence>
      {config.showConfig && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => config.setShowConfig(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
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
              maxHeight: '85vh',
              overflowY: 'auto',
              border: '1px solid var(--glass-border)',
              borderBottom: 'none',
            }}
          >
            {/* Handle + Close */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px', position: 'relative' }}>
              <div style={{ width: '48px', height: '5px', borderRadius: '3px', background: 'var(--text-muted)' }} />
              <button
                onClick={() => config.setShowConfig(false)}
                style={{
                  position: 'absolute', right: 0, top: '-4px',
                  width: '32px', height: '32px', minWidth: '32px', minHeight: '32px',
                  borderRadius: '50%', background: 'var(--bg-card)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  border: '1px solid var(--glass-border)',
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2.5" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H20" /><path d="M18 2l4 4-4 4" /><path d="M2 6h1.4c1.3 0 2.5.6 3.3 1.7l6.1 8.6c.7 1.1 2 1.7 3.3 1.7H20" /><path d="M18 14l4 4-4 4" />
              </svg>
              {t('random.title')}
            </h2>

            {/* Presets */}
            <div style={{ marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '10px' }}>{t('random.presets')}</span>
              <div style={{ display: 'flex', gap: '8px' }}>
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => applyPreset(preset)}
                    style={{
                      flex: 1,
                      padding: '10px 6px',
                      borderRadius: '12px',
                      background: 'var(--glass)',
                      border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)',
                      fontSize: '12px',
                      fontWeight: 500,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      minHeight: '44px',
                    }}
                  >
                    <span style={{ fontSize: '24px' }}>{preset.icon}</span>
                    <span>{t(`random.preset.${preset.id}`)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Sound count */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('random.count')}</span>
                <span style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 600 }}>{config.soundCount}</span>
              </div>
              <Slider value={config.soundCount} min={1} max={10} onChange={(v) => config.setSoundCount(Math.round(v))} height={36} />
            </div>

            {/* Volume range */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('random.volumeMin')}</span>
                <span style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 600 }}>{Math.round(config.volumeMin * 100)}%</span>
              </div>
              <Slider value={config.volumeMin} min={0.05} max={0.95} onChange={config.setVolumeMin} height={36} />
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('random.volumeMax')}</span>
                <span style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 600 }}>{Math.round(config.volumeMax * 100)}%</span>
              </div>
              <Slider value={config.volumeMax} min={0.1} max={1} onChange={config.setVolumeMax} height={36} />
            </div>

            {/* Categories */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('random.categories')}</span>
                {config.allowedCategories.length < categories.length && (
                  <button
                    onClick={() => {
                      for (const cat of categories) {
                        if (!config.allowedCategories.includes(cat.id)) config.toggleCategory(cat.id)
                      }
                    }}
                    style={{
                      fontSize: '11px',
                      color: 'var(--accent-light)',
                      background: 'none',
                      border: 'none',
                      padding: '2px 6px',
                      fontWeight: 600,
                    }}
                  >
                    {t('random.enableAll')}
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {categories.map((cat) => {
                  const active = config.allowedCategories.includes(cat.id)
                  return (
                    <button
                      key={cat.id}
                      onClick={() => config.toggleCategory(cat.id)}
                      style={{
                        padding: '6px 10px',
                        borderRadius: '8px',
                        background: active ? 'rgba(124,92,252,0.2)' : 'var(--glass)',
                        border: active ? '1px solid rgba(124,92,252,0.4)' : '1px solid var(--glass-border)',
                        color: active ? 'var(--accent-light)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: active ? 600 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minHeight: '38px',
                        minWidth: '38px',
                      }}
                    >
                      <span>{cat.icon}</span>
                      <span>{cat.name.split(' ')[0]}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Avoid same category toggle */}
            <button
              onClick={() => config.setAvoidSameCategory(!config.avoidSameCategory)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
                padding: '12px',
                borderRadius: '10px',
                background: 'var(--glass)',
                border: '1px solid var(--glass-border)',
                marginBottom: '20px',
                minHeight: '44px',
              }}
            >
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('random.diversify')}</span>
              <div style={{
                width: '46px',
                height: '26px',
                borderRadius: '13px',
                background: config.avoidSameCategory ? 'var(--accent)' : 'var(--glass-border)',
                position: 'relative',
                transition: 'background 0.3s',
              }}>
                <div style={{
                  width: '22px',
                  height: '22px',
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: '2px',
                  left: config.avoidSameCategory ? '22px' : '2px',
                  transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
                }} />
              </div>
            </button>

            {/* Generate button */}
            <button
              onClick={generate}
              style={{
                width: '100%',
                padding: '16px',
                borderRadius: 'var(--radius-lg)',
                background: 'linear-gradient(135deg, var(--accent), var(--accent-light))',
                color: '#fff',
                fontWeight: 600,
                fontSize: '16px',
                boxShadow: '0 4px 20px var(--accent-glow), var(--shadow-md)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H20" /><path d="M18 2l4 4-4 4" /><path d="M2 6h1.4c1.3 0 2.5.6 3.3 1.7l6.1 8.6c.7 1.1 2 1.7 3.3 1.7H20" /><path d="M18 14l4 4-4 4" />
              </svg>
              {t('random.generate')}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/** Quick generate with current config (no modal) */
export function quickRandomMix() {
  const config = useRandomMixStore.getState()
  const { toggleSound, stopAll } = usePlayerStore.getState()

  stopAll()

  const { binauralEnabled } = useSettingsStore.getState()
  const pool = sounds.filter((s) => config.allowedCategories.includes(s.category) && (binauralEnabled || s.category !== 'binaural'))
  if (pool.length === 0) return

  const count = Math.min(config.soundCount, pool.length)
  const picked: typeof pool = []
  const usedCategories = new Set<string>()
  const shuffled = [...pool].sort(() => Math.random() - 0.5)

  for (const sound of shuffled) {
    if (picked.length >= count) break
    if (config.avoidSameCategory && usedCategories.has(sound.category)) continue
    picked.push(sound)
    usedCategories.add(sound.category)
  }

  if (picked.length < count) {
    for (const sound of shuffled) {
      if (picked.length >= count) break
      if (picked.find((p) => p.id === sound.id)) continue
      picked.push(sound)
    }
  }

  // Enforce max 1 melodic sound per mix
  const melodicPicked = picked.filter(s => s.melodic)
  if (melodicPicked.length > 1) {
    const nonMelodicPool = shuffled.filter(s => !s.melodic && !picked.find(p => p.id === s.id))
    for (let i = 1; i < melodicPicked.length; i++) {
      const replacement = nonMelodicPool.shift()
      if (replacement) {
        const idx = picked.indexOf(melodicPicked[i])
        picked[idx] = replacement
      }
    }
  }

  for (const sound of picked) {
    toggleSound(sound.id)
    const vol = config.volumeMin + Math.random() * (config.volumeMax - config.volumeMin)
    usePlayerStore.getState().setSoundVolume(sound.id, Math.round(vol * 100) / 100)
  }
}
