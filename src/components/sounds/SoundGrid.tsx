import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { sounds, categories } from '../../audio/sounds'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useRandomMixStore } from '../../stores/useRandomMixStore'
import { SoundCard } from './SoundCard'
import { SoundInfoModal } from './SoundInfoModal'
import type { Sound } from '../../types'

export function SoundGrid() {
  const t = useSettingsStore((s) => s.t)
  const binauralEnabled = useSettingsStore((s) => s.binauralEnabled)
  const favorites = usePlayerStore((s) => s.favorites)

  // Filter out binaural if disabled
  const availableSounds = binauralEnabled ? sounds : sounds.filter((s) => s.category !== 'binaural')
  const availableCategories = binauralEnabled ? categories : categories.filter((c) => c.id !== 'binaural')
  const [activeCategory, setActiveCategoryState] = useState<string>(() =>
    sessionStorage.getItem('somnio-category') || 'baby'
  )
  const setActiveCategory = (cat: string) => {
    setActiveCategoryState(cat)
    sessionStorage.setItem('somnio-category', cat)
  }
  const [infoSound, setInfoSound] = useState<Sound | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = searchQuery.trim()
    ? availableSounds.filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    : activeCategory === 'all'
      ? availableSounds
      : activeCategory === 'favorites'
        ? availableSounds.filter((s) => favorites.includes(s.id))
        : availableSounds.filter((s) => s.category === activeCategory)

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId)
    setSearchQuery('')
    gridRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div style={{ display: 'flex', height: '100%', gap: '0' }}>
      {/* Main content - sound cards */}
      <div
        ref={gridRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          paddingRight: '8px',
          paddingBottom: '16px',
        }}
      >
        {/* Search bar */}
        <div style={{ padding: '4px 4px 0', position: 'relative' }}>
          <span style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-55%)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('sounds.search')}
            style={{
              width: '100%', padding: '10px 12px 10px 38px', borderRadius: '10px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'var(--text-primary)', fontSize: '14px', outline: 'none',
              marginBottom: '8px', fontFamily: 'inherit',
              transition: 'border-color 0.2s, box-shadow 0.2s',
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'rgba(124, 92, 252, 0.5)'
              e.currentTarget.style.boxShadow = '0 0 12px var(--accent-glow)'
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.boxShadow = 'none'
            }}
          />
        </div>

        {/* Category title */}
        <div style={{ padding: '4px 4px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>
            {searchQuery.trim() ? '🔍' : activeCategory === 'all' ? '🎵' : categories.find((c) => c.id === activeCategory)?.icon}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>
            {searchQuery.trim() ? t('sounds.search').replace('...', '') : activeCategory === 'all' ? t('sounds.allSounds') : activeCategory === 'favorites' ? t('sounds.favorites') : categories.find((c) => c.id === activeCategory)?.name}
          </span>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginLeft: 'auto' }}>
            {filtered.length}
          </span>
        </div>

        {/* Cards grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '6px',
          }}
        >
          {filtered.map((sound) => (
            <SoundCard key={sound.id} sound={sound} onInfo={setInfoSound} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px 16px', color: 'var(--text-muted)', fontSize: '14px' }}>
            {t('sounds.noResults')}
          </div>
        )}
      </div>

      {/* Right sidebar - categories */}
      <div
        style={{
          width: '58px',
          flexShrink: 0,
          overflowY: 'auto',
          overflowX: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '2px',
          padding: '4px 0',
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
        }}
      >
        {/* All */}
        <SidebarItem
          icon="🎵"
          label="All"
          active={activeCategory === 'all'}
          onClick={() => handleCategoryChange('all')}
        />

        {/* Divider */}
        <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />

        {availableCategories.map((cat) => (
          <SidebarItem
            key={cat.id}
            icon={cat.icon}
            label={cat.id === 'favorites' ? t('sounds.favorites').slice(0, 6) : cat.name.split(' ')[0]}
            active={activeCategory === cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            count={cat.id === 'favorites' ? favorites.length : availableSounds.filter((s) => s.category === cat.id).length}
          />
        ))}

        {/* Random mix config */}
        <div style={{ width: '24px', height: '1px', background: 'rgba(255,255,255,0.06)', margin: '4px 0' }} />
        <SidebarItem
          icon=""
          label="Mix"
          active={false}
          onClick={() => useRandomMixStore.getState().setShowConfig(true)}
          svgIcon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 18h1.4c1.3 0 2.5-.6 3.3-1.7l6.1-8.6c.7-1.1 2-1.7 3.3-1.7H20" /><path d="M18 2l4 4-4 4" /><path d="M2 6h1.4c1.3 0 2.5.6 3.3 1.7l6.1 8.6c.7 1.1 2 1.7 3.3 1.7H20" /><path d="M18 14l4 4-4 4" />
            </svg>
          }
        />
      </div>

      {/* Info modal */}
      <SoundInfoModal sound={infoSound} onClose={() => setInfoSound(null)} />
    </div>
  )
}

function SidebarItem({
  icon,
  label,
  active,
  onClick,
  count: _count,
  svgIcon,
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
  count?: number
  svgIcon?: React.ReactNode
}) {
  return (
    <motion.button
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: active
          ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
          : 'transparent',
        border: active ? 'none' : '1px solid transparent',
        position: 'relative',
        transition: 'background 0.2s',
        gap: '2px',
        padding: '2px',
        boxShadow: active ? '0 0 12px var(--accent-glow)' : 'none',
      }}
    >
      {svgIcon || <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>}
      <span
        style={{
          fontSize: '9px',
          fontWeight: active ? 700 : 400,
          color: active ? '#fff' : 'var(--text-muted)',
          lineHeight: 1,
          letterSpacing: '-0.2px',
          maxWidth: '46px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {label}
      </span>
      {active && (
        <motion.div
          layoutId="sidebar-indicator"
          style={{
            position: 'absolute',
            left: '-2px',
            top: 0,
            bottom: 0,
            marginTop: 'auto',
            marginBottom: 'auto',
            width: '3px',
            height: '20px',
            borderRadius: '0 2px 2px 0',
            background: 'var(--accent-light)',
          }}
        />
      )}
    </motion.button>
  )
}
