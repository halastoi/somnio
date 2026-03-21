import { motion } from 'framer-motion'
import { useSettingsStore } from '../../stores/useSettingsStore'

export type Tab = 'sounds' | 'mixes' | 'breathing' | 'settings'

interface NavigationProps {
  activeTab: Tab
  onTabChange: (tab: Tab) => void
}

const tabs: { id: Tab; labelKey: string; icon: string }[] = [
  { id: 'sounds', labelKey: 'nav.sounds', icon: 'sounds' },
  { id: 'mixes', labelKey: 'nav.mixes', icon: 'mixes' },
  { id: 'breathing', labelKey: 'nav.breathe', icon: 'breathe' },
  { id: 'settings', labelKey: 'nav.settings', icon: 'settings' },
]

function TabIcon({ type, active }: { type: string; active: boolean }) {
  const color = active ? 'var(--accent-light)' : 'var(--text-muted)'

  switch (type) {
    case 'sounds':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      )
    case 'mixes':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <line x1="4" y1="21" x2="4" y2="14" />
          <line x1="4" y1="10" x2="4" y2="3" />
          <line x1="12" y1="21" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12" y2="3" />
          <line x1="20" y1="21" x2="20" y2="16" />
          <line x1="20" y1="12" x2="20" y2="3" />
          <line x1="1" y1="14" x2="7" y2="14" />
          <line x1="9" y1="8" x2="15" y2="8" />
          <line x1="17" y1="16" x2="23" y2="16" />
        </svg>
      )
    case 'breathe':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round">
          <circle cx="12" cy="12" r="10" />
          <circle cx="12" cy="12" r="4" />
        </svg>
      )
    case 'settings':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
        </svg>
      )
    default:
      return null
  }
}

export function Navigation({ activeTab, onTabChange }: NavigationProps) {
  const t = useSettingsStore((s) => s.t)

  return (
    <nav
      style={{
        display: 'flex',
        justifyContent: 'space-around',
        padding: '8px 0',
        paddingTop: '10px',
        background: 'rgba(0,0,0,0.3)',
        backdropFilter: 'blur(30px)',
        WebkitBackdropFilter: 'blur(30px)',
        borderTop: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {tabs.map((tab) => {
        const active = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 16px',
              position: 'relative',
            }}
          >
            <TabIcon type={tab.icon} active={active} />
            <span
              style={{
                fontSize: '11px',
                color: active ? 'var(--accent-light)' : 'var(--text-muted)',
                fontWeight: active ? 600 : 400,
              }}
            >
              {t(tab.labelKey)}
            </span>
            {active && (
              <motion.div
                layoutId="nav-indicator"
                style={{
                  width: '20px',
                  height: '2px',
                  borderRadius: '1px',
                  background: 'var(--accent)',
                  position: 'absolute',
                  top: 0,
                  alignSelf: 'center',
                  left: 0,
                  right: 0,
                  marginLeft: 'auto',
                  marginRight: 'auto',
                }}
              />
            )}
          </button>
        )
      })}
    </nav>
  )
}
