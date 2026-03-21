import { useSettingsStore, type Language, type ThemeMode } from '../../stores/useSettingsStore'

const languages: { id: Language; label: string; flag: string }[] = [
  { id: 'en', label: 'English', flag: '🇬🇧' },
  { id: 'ro', label: 'Romana', flag: '🇷🇴' },
  { id: 'ru', label: 'Русский', flag: '🇷🇺' },
  { id: 'es', label: 'Español', flag: '🇪🇸' },
]

const themeOptions: { id: ThemeMode; key: string }[] = [
  { id: 'dark', key: 'settings.theme.dark' },
  { id: 'midnight', key: 'settings.theme.midnight' },
  { id: 'amoled', key: 'settings.theme.amoled' },
  { id: 'ocean', key: 'settings.theme.ocean' },
]

export function SettingsPage() {
  const { language, theme, setLanguage, setTheme, t } = useSettingsStore()

  return (
    <div style={{ padding: '20px 8px', paddingBottom: '16px', overflowY: 'auto', height: '100%' }}>
      <h2 style={{ fontSize: '20px', fontWeight: 600, marginBottom: '24px' }}>
        {t('settings.title')}
      </h2>

      {/* Language */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('settings.language')}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '14px 16px',
                borderRadius: 'var(--radius-md)',
                background: language === lang.id ? 'var(--bg-active)' : 'var(--bg-card)',
                border: language === lang.id ? '2px solid var(--accent)' : '2px solid transparent',
                textAlign: 'left',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '24px' }}>{lang.flag}</span>
              <span style={{ fontSize: '15px', fontWeight: language === lang.id ? 600 : 400 }}>
                {lang.label}
              </span>
              {language === lang.id && (
                <span style={{ marginLeft: 'auto', color: 'var(--accent-light)', fontSize: '18px' }}>
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* Theme */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('settings.theme')}
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
          {themeOptions.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setTheme(opt.id)}
              style={{
                padding: '16px 12px',
                borderRadius: 'var(--radius-md)',
                background: theme === opt.id ? 'var(--bg-active)' : 'var(--bg-card)',
                border: theme === opt.id ? '2px solid var(--accent)' : '2px solid transparent',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                transition: 'all 0.2s',
              }}
            >
              <ThemePreview themeId={opt.id} />
              <span style={{ fontSize: '13px', fontWeight: theme === opt.id ? 600 : 400 }}>
                {t(opt.key)}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* About */}
      <section>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('settings.about')}
        </h3>
        <div style={{ background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', padding: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('settings.version')}</span>
            <span style={{ fontSize: '14px' }}>1.0.0</span>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginTop: '12px' }}>
            {t('settings.donateDesc')}
          </p>
        </div>
      </section>
    </div>
  )
}

function ThemePreview({ themeId }: { themeId: ThemeMode }) {
  const { themes: _unused, ...colors } = { themes: null, ...getPreviewColors(themeId) }
  return (
    <div
      style={{
        width: '48px',
        height: '32px',
        borderRadius: '6px',
        background: colors.bg,
        border: `1px solid ${colors.accent}40`,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          height: '10px',
          background: colors.card,
        }}
      />
      <div
        style={{
          position: 'absolute',
          top: '6px',
          left: '6px',
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: colors.accent,
        }}
      />
    </div>
  )
}

function getPreviewColors(id: ThemeMode) {
  const map: Record<ThemeMode, { bg: string; card: string; accent: string }> = {
    dark: { bg: '#0a0a1a', card: '#181838', accent: '#7c5cfc' },
    midnight: { bg: '#0d1117', card: '#1c2333', accent: '#58a6ff' },
    amoled: { bg: '#000000', card: '#141414', accent: '#bb86fc' },
    ocean: { bg: '#0a1628', card: '#152640', accent: '#00b4d8' },
  }
  return map[id]
}
