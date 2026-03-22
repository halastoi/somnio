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
        <div style={{ display: 'flex', gap: '8px' }}>
          {languages.map((lang) => (
            <button
              key={lang.id}
              onClick={() => setLanguage(lang.id)}
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px',
                padding: '10px 4px',
                borderRadius: 'var(--radius-md)',
                background: language === lang.id ? 'var(--bg-active)' : 'var(--bg-card)',
                border: language === lang.id ? '2px solid var(--accent)' : '2px solid transparent',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '22px' }}>{lang.flag}</span>
              <span style={{ fontSize: '11px', fontWeight: language === lang.id ? 600 : 400, color: language === lang.id ? 'var(--accent-light)' : 'var(--text-secondary)' }}>
                {lang.label}
              </span>
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

      {/* How to use */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('settings.howToUse')}
        </h3>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {[
            { icon: '🎵', title: t('howto.mix.title'), desc: t('howto.mix.desc') },
            { icon: '🎚', title: t('howto.volume.title'), desc: t('howto.volume.desc') },
            { icon: '💾', title: t('howto.save.title'), desc: t('howto.save.desc') },
            { icon: '⏱', title: t('howto.timer.title'), desc: t('howto.timer.desc') },
            { icon: '🫁', title: t('howto.breathe.title'), desc: t('howto.breathe.desc') },
            { icon: 'ⓘ', title: t('howto.info.title'), desc: t('howto.info.desc') },
            { icon: '📲', title: t('howto.install.title'), desc: t('howto.install.desc.android') + '\n' + t('howto.install.desc.ios') },
          ].map((item) => (
            <div key={item.icon} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '18px', flexShrink: 0, width: '24px', textAlign: 'center' }}>{item.icon}</span>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 600, marginBottom: '2px' }}>{item.title}</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.4, whiteSpace: 'pre-line' }}>{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* About */}
      <section>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('settings.about')}
        </h3>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
            <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{t('settings.version')}</span>
            <span style={{ fontSize: '14px' }}>1.0.0</span>
          </div>

          <p style={{ fontSize: '13px', color: 'var(--text-muted)', lineHeight: 1.5, marginBottom: '16px' }}>
            {t('settings.donateDesc')}
          </p>

          {/* Tech stack */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px', marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
              Built with
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
              {['React', 'TypeScript', 'Vite', 'Zustand', 'Framer Motion', 'Web Audio API', 'Canvas API'].map((tech) => (
                <span key={tech} style={{
                  fontSize: '11px',
                  color: 'var(--text-secondary)',
                  background: 'rgba(255,255,255,0.06)',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255,255,255,0.08)',
                }}>
                  {tech}
                </span>
              ))}
            </div>
          </div>

          {/* Credits */}
          <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '10px' }}>
              Credits & Thanks
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Mixkit.co</span>
                <span style={{ color: 'var(--text-muted)' }}> — 101 professional royalty-free audio samples. Rain, ocean, forest, birds, fire, urban ambience, cosmic drones, lullabies, piano, guitar, harp, and flute recordings.</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Ahjay Stelino</span>
                <span style={{ color: 'var(--text-muted)' }}> — Lullaby, Piano Reflections, Relaxing Country</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Michael Ramir C.</span>
                <span style={{ color: 'var(--text-muted)' }}> — Baby Harp, Close Your Eyes, My Little Star, Magic Lullaby</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Diego Nava</span>
                <span style={{ color: 'var(--text-muted)' }}> — Gentle Piano, Harp Melody</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Eugenio Mininni</span>
                <span style={{ color: 'var(--text-muted)' }}> — Dreamy Piano, Wind & Leaves, Rest Now</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Grigoriy Nuzhny</span>
                <span style={{ color: 'var(--text-muted)' }}> — Classical Piano pieces</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Arulo</span>
                <span style={{ color: 'var(--text-muted)' }}> — Meditation, City Walk</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Lily J</span>
                <span style={{ color: 'var(--text-muted)' }}> — Flute & Harp Relaxation</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Alejandro Magana</span>
                <span style={{ color: 'var(--text-muted)' }}> — Nebula Drift</span>
              </div>
              <div>
                <span style={{ color: 'var(--accent-light)', fontWeight: 600 }}>Andrew Ev</span>
                <span style={{ color: 'var(--text-muted)' }}> — Soft Piano</span>
              </div>
            </div>
            <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '12px', lineHeight: 1.5, fontStyle: 'italic' }}>
              All audio licensed under the Mixkit License — free for commercial and personal use, no attribution required. We credit these artists because we appreciate their work.
            </p>
          </div>
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
