import { useSettingsStore, type Language, type ThemeMode } from '../../stores/useSettingsStore'
import { useSleepStore } from '../../stores/useSleepStore'

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
  const { language, theme, binauralEnabled, autoStopEnabled, autoStopMinutes, setLanguage, setTheme, setBinauralEnabled, setAutoStop, t, eqBass, eqMid, eqTreble, setEq } = useSettingsStore()
  const { history, streak } = useSleepStore()
  const sleepToday = useSleepStore((s) => s.getToday())
  const sleepWeek = useSleepStore((s) => s.getWeekTotal())

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

      {/* Equalizer */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('settings.equalizer')}
        </h3>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid rgba(255,255,255,0.06)', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {([
            { label: 'eq.bass', value: eqBass, key: 'bass' as const },
            { label: 'eq.mid', value: eqMid, key: 'mid' as const },
            { label: 'eq.treble', value: eqTreble, key: 'treble' as const },
          ]).map((band) => (
            <div key={band.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t(band.label)}</span>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                  {band.value > 0 ? '+' : ''}{band.value} dB
                </span>
              </div>
              <input
                type="range"
                min={-12}
                max={12}
                step={1}
                value={band.value}
                onChange={(e) => {
                  const v = Number(e.target.value)
                  if (band.key === 'bass') setEq(v, eqMid, eqTreble)
                  else if (band.key === 'mid') setEq(eqBass, v, eqTreble)
                  else setEq(eqBass, eqMid, v)
                }}
                style={{ width: '100%', accentColor: 'var(--accent)', cursor: 'pointer' }}
              />
            </div>
          ))}
          <button
            onClick={() => setEq(0, 0, 0)}
            style={{
              alignSelf: 'flex-end',
              fontSize: '12px',
              color: 'var(--accent-light)',
              background: 'rgba(255,255,255,0.06)',
              padding: '4px 12px',
              borderRadius: '6px',
              border: '1px solid rgba(255,255,255,0.1)',
            }}
          >
            {t('eq.reset')}
          </button>
        </div>
      </section>

      {/* Auto Stop on inactivity */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('settings.autoStop')}
        </h3>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          <button
            onClick={() => setAutoStop(!autoStopEnabled)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', marginBottom: autoStopEnabled ? '14px' : '0',
            }}
          >
            <span style={{ fontSize: '14px', fontWeight: 500 }}>{t('settings.autoStop.desc')}</span>
            <div style={{
              width: '44px', height: '24px', borderRadius: '12px',
              background: autoStopEnabled ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
              position: 'relative', transition: 'background 0.2s', flexShrink: 0,
            }}>
              <div style={{
                width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '2px',
                left: autoStopEnabled ? '22px' : '2px',
                transition: 'left 0.2s',
                boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
              }} />
            </div>
          </button>
          {autoStopEnabled && (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{t('settings.autoStop.desc')}</span>
                <span style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 600 }}>
                  {autoStopMinutes} {t('settings.autoStop.minutes')}
                </span>
              </div>
              <input
                type="range"
                min={10}
                max={120}
                step={10}
                value={autoStopMinutes}
                onChange={(e) => setAutoStop(true, Number(e.target.value))}
                style={{ width: '100%' }}
              />
            </div>
          )}
        </div>
      </section>

      {/* Binaural Beats toggle */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('settings.binaural')}
        </h3>
        <button
          onClick={() => setBinauralEnabled(!binauralEnabled)}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            width: '100%', padding: '14px 16px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-card)', border: '1px solid rgba(255,255,255,0.06)',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 500, textAlign: 'left' }}>{t('settings.binaural.desc')}</div>
          </div>
          <div style={{
            width: '44px', height: '24px', borderRadius: '12px',
            background: binauralEnabled ? 'var(--accent)' : 'rgba(255,255,255,0.1)',
            position: 'relative', transition: 'background 0.2s', flexShrink: 0,
          }}>
            <div style={{
              width: '20px', height: '20px', borderRadius: '50%', background: '#fff',
              position: 'absolute', top: '2px',
              left: binauralEnabled ? '22px' : '2px',
              transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.3)',
            }} />
          </div>
        </button>
      </section>

      {/* Sleep Stats */}
      <section style={{ marginBottom: '28px' }}>
        <h3 style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {t('settings.sleepStats')}
        </h3>
        <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 'var(--radius-md)', padding: '16px', border: '1px solid rgba(255,255,255,0.06)' }}>
          {history.length === 0 ? (
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', textAlign: 'center' }}>
              {t('sleep.noData')}
            </p>
          ) : (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-around', marginBottom: '16px', textAlign: 'center' }}>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-light)' }}>
                    {sleepToday?.minutes ?? 0}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {t('sleep.today')} ({t('sleep.minutes')})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-light)' }}>
                    {sleepWeek}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {t('sleep.week')} ({t('sleep.minutes')})
                  </div>
                </div>
                <div>
                  <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--accent-light)' }}>
                    {streak} 🔥
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {t('sleep.streak')}
                  </div>
                </div>
              </div>
              {/* Simple 7-day bar chart */}
              <SleepChart history={history} />
            </>
          )}
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

function SleepChart({ history }: { history: { date: string; minutes: number }[] }) {
  // Get the last 7 days
  const days: { date: string; minutes: number; label: string }[] = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const dateStr = d.toISOString().slice(0, 10)
    const entry = history.find((h) => h.date === dateStr)
    const dayLabel = d.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)
    days.push({ date: dateStr, minutes: entry?.minutes ?? 0, label: dayLabel })
  }

  const maxMin = Math.max(...days.map((d) => d.minutes), 1)

  return (
    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '6px', height: '60px', justifyContent: 'space-between' }}>
      {days.map((day) => (
        <div key={day.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1, gap: '2px', height: '100%', justifyContent: 'flex-end' }}>
          <div
            style={{
              width: '100%',
              maxWidth: '24px',
              height: `${Math.max((day.minutes / maxMin) * 48, 2)}px`,
              background: day.minutes > 0 ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
              borderRadius: '3px',
              transition: 'height 0.3s',
            }}
          />
          <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{day.label}</span>
        </div>
      ))}
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
