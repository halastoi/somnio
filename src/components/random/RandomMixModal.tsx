import { motion, AnimatePresence } from 'framer-motion'
import { useRandomMixStore } from '../../stores/useRandomMixStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { Slider } from '../ui/Slider'
import { sounds, categories } from '../../audio/sounds'

const presets = [
  { id: 'deepSleep', icon: '💤', categories: ['binaural', 'cosmos', 'baby'], soundCount: 3, volumeMin: 0.15, volumeMax: 0.4 },
  { id: 'natureRelax', icon: '🌿', categories: ['rain', 'water', 'nature', 'wind'], soundCount: 3, volumeMin: 0.3, volumeMax: 0.6 },
  { id: 'focus', icon: '🎯', categories: ['noise', 'binaural'], soundCount: 2, volumeMin: 0.2, volumeMax: 0.5 },
  { id: 'cozy', icon: '🛋', categories: ['fire', 'rain', 'urban'], soundCount: 3, volumeMin: 0.25, volumeMax: 0.55 },
] as const

export function RandomMixModal() {
  const config = useRandomMixStore()
  const { toggleSound, stopAll } = usePlayerStore()
  const t = useSettingsStore((s) => s.t)

  const applyPreset = (preset: typeof presets[number]) => {
    config.setSoundCount(preset.soundCount)
    config.setVolumeMax(preset.volumeMax)
    config.setVolumeMin(preset.volumeMin)
    // Set only preset categories
    const store = useRandomMixStore.getState()
    const allCats = categories.map(c => c.id)
    for (const cat of allCats) {
      const isAllowed = store.allowedCategories.includes(cat)
      const shouldBeAllowed = preset.categories.includes(cat)
      if (isAllowed !== shouldBeAllowed) config.toggleCategory(cat)
    }
    config.setAvoidSameCategory(true)
  }

  const generate = () => {
    // Stop current sounds
    stopAll()

    // Filter sounds by allowed categories
    const pool = sounds.filter((s) => config.allowedCategories.includes(s.category))
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
              border: '1px solid rgba(255,255,255,0.06)',
              borderBottom: 'none',
            }}
          >
            {/* Handle */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.15)' }} />
            </div>

            <h2 style={{ fontSize: '18px', fontWeight: 600, marginBottom: '20px', textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
              🎲 {t('random.title')}
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
                      background: 'rgba(255,255,255,0.04)',
                      border: '1px solid rgba(255,255,255,0.08)',
                      color: 'var(--text-primary)',
                      fontSize: '11px',
                      fontWeight: 500,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      minHeight: '44px',
                    }}
                  >
                    <span style={{ fontSize: '20px' }}>{preset.icon}</span>
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
                        background: active ? 'rgba(124,92,252,0.2)' : 'rgba(255,255,255,0.04)',
                        border: active ? '1px solid rgba(124,92,252,0.4)' : '1px solid rgba(255,255,255,0.08)',
                        color: active ? 'var(--accent-light)' : 'var(--text-muted)',
                        fontSize: '12px',
                        fontWeight: active ? 600 : 400,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        minHeight: '32px',
                        minWidth: '32px',
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
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.06)',
                marginBottom: '20px',
                minHeight: '44px',
              }}
            >
              <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('random.diversify')}</span>
              <div style={{
                width: '40px',
                height: '22px',
                borderRadius: '11px',
                background: config.avoidSameCategory ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
                position: 'relative',
                transition: 'background 0.2s',
              }}>
                <div style={{
                  width: '18px',
                  height: '18px',
                  borderRadius: '50%',
                  background: '#fff',
                  position: 'absolute',
                  top: '2px',
                  left: config.avoidSameCategory ? '20px' : '2px',
                  transition: 'left 0.2s',
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
                boxShadow: '0 4px 20px var(--accent-glow)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
              }}
            >
              🎲 {t('random.generate')}
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

  const pool = sounds.filter((s) => config.allowedCategories.includes(s.category))
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

  for (const sound of picked) {
    toggleSound(sound.id)
    const vol = config.volumeMin + Math.random() * (config.volumeMax - config.volumeMin)
    usePlayerStore.getState().setSoundVolume(sound.id, Math.round(vol * 100) / 100)
  }
}
