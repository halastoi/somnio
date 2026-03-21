import { useState, useRef } from 'react'
import { motion } from 'framer-motion'
import { sounds, categories } from '../../audio/sounds'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { SoundCard } from './SoundCard'
import { SoundInfoModal } from './SoundInfoModal'
import type { Sound } from '../../types'

export function SoundGrid() {
  const t = useSettingsStore((s) => s.t)
  const [activeCategory, setActiveCategoryState] = useState<string>(() =>
    sessionStorage.getItem('somnio-category') || 'baby'
  )
  const setActiveCategory = (cat: string) => {
    setActiveCategoryState(cat)
    sessionStorage.setItem('somnio-category', cat)
  }
  const [infoSound, setInfoSound] = useState<Sound | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const filtered = activeCategory === 'all'
    ? sounds
    : sounds.filter((s) => s.category === activeCategory)

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId)
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
        {/* Category title */}
        <div style={{ padding: '4px 4px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '20px' }}>
            {activeCategory === 'all' ? '🎵' : categories.find((c) => c.id === activeCategory)?.icon}
          </span>
          <span style={{ fontSize: '16px', fontWeight: 600 }}>
            {activeCategory === 'all' ? t('sounds.allSounds') : categories.find((c) => c.id === activeCategory)?.name}
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
            gap: '8px',
          }}
        >
          {filtered.map((sound) => (
            <SoundCard key={sound.id} sound={sound} onInfo={setInfoSound} />
          ))}
        </div>
      </div>

      {/* Right sidebar - categories */}
      <div
        style={{
          width: '52px',
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

        {categories.map((cat) => (
          <SidebarItem
            key={cat.id}
            icon={cat.icon}
            label={cat.name.split(' ')[0]}
            active={activeCategory === cat.id}
            onClick={() => handleCategoryChange(cat.id)}
            count={sounds.filter((s) => s.category === cat.id).length}
          />
        ))}
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
}: {
  icon: string
  label: string
  active: boolean
  onClick: () => void
  count?: number
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
        width: '46px',
        height: '46px',
        borderRadius: '12px',
        background: active
          ? 'linear-gradient(135deg, var(--accent), var(--accent-light))'
          : 'transparent',
        border: active ? 'none' : '1px solid transparent',
        position: 'relative',
        transition: 'background 0.2s',
        gap: '1px',
        padding: '2px',
      }}
    >
      <span style={{ fontSize: '18px', lineHeight: 1 }}>{icon}</span>
      <span
        style={{
          fontSize: '7px',
          fontWeight: active ? 700 : 400,
          color: active ? '#fff' : 'var(--text-muted)',
          lineHeight: 1,
          letterSpacing: '-0.2px',
          maxWidth: '42px',
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
