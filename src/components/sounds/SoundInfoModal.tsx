import { motion, AnimatePresence } from 'framer-motion'
import { getSoundInfo } from '../../audio/soundInfo'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { Slider } from '../ui/Slider'
import type { Sound } from '../../types'

interface SoundInfoModalProps {
  sound: Sound | null
  onClose: () => void
}

export function SoundInfoModal({ sound, onClose }: SoundInfoModalProps) {
  const language = useSettingsStore((s) => s.language)
  const { activeSounds, setSoundVolume } = usePlayerStore()

  if (!sound) return null

  const activeSound = activeSounds.find((s) => s.soundId === sound.id)

  const info = getSoundInfo(sound.id, language)

  const labels = {
    bestFor: { en: 'Best for', ro: 'Recomandat pentru', ru: 'Лучше всего для', es: 'Mejor para' },
    tip: { en: 'Tip', ro: 'Sfat', ru: 'Совет', es: 'Consejo' },
    close: { en: 'Close', ro: 'Inchide', ru: 'Закрыть', es: 'Cerrar' },
    volume: { en: 'Volume', ro: 'Volum', ru: 'Громкость', es: 'Volumen' },
    generated: { en: 'Generated', ro: 'Generat', ru: 'Сгенерировано', es: 'Generado' },
    recording: { en: 'Recording', ro: 'Inregistrare', ru: 'Запись', es: 'Grabacion' },
    noInfo: {
      en: 'Professional audio. Royalty-free, licensed from Mixkit.co.',
      ro: 'Audio profesional. Fara drepturi de autor, licenta Mixkit.co.',
      ru: 'Профессиональное аудио. Без лицензионных отчислений, Mixkit.co.',
      es: 'Audio profesional. Libre de regalias, licencia Mixkit.co.',
    },
    noInfoProc: {
      en: 'Generated using Web Audio API. Infinite, non-repeating.',
      ro: 'Generat cu Web Audio API. Infinit, fara repetitii.',
      ru: 'Сгенерировано через Web Audio API. Бесконечный, без повторов.',
      es: 'Generado con Web Audio API. Infinito, sin repeticion.',
    },
  }

  return (
    <AnimatePresence>
      {sound && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.6)',
            backdropFilter: 'blur(8px)',
            WebkitBackdropFilter: 'blur(8px)',
            zIndex: 250,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
          }}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: 'rgba(20,20,40,0.95)',
              backdropFilter: 'blur(30px)',
              WebkitBackdropFilter: 'blur(30px)',
              borderRadius: '20px',
              padding: '24px',
              maxWidth: '360px',
              width: '100%',
              border: '1px solid rgba(255,255,255,0.08)',
              maxHeight: '80vh',
              overflowY: 'auto',
            }}
          >
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{ fontSize: '36px' }}>{sound.icon}</span>
              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 600 }}>{sound.name}</h3>
                <span style={{
                  fontSize: '11px',
                  color: 'var(--accent-light)',
                  background: 'rgba(124,92,252,0.15)',
                  padding: '2px 8px',
                  borderRadius: '4px',
                }}>
                  {sound.sourceType === 'procedural' ? labels.generated[language] : labels.recording[language]}
                </span>
              </div>
            </div>

            {info ? (
              <>
                <p style={{ fontSize: '14px', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: '16px' }}>
                  {info.description}
                </p>

                <div style={{
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: '12px',
                  padding: '12px',
                  marginBottom: info.tip ? '12px' : '0',
                  border: '1px solid rgba(255,255,255,0.06)',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {labels.bestFor[language]}
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                    {info.bestFor}
                  </p>
                </div>

                {info.tip && (
                  <div style={{
                    background: 'rgba(251, 191, 36, 0.08)',
                    borderRadius: '12px',
                    padding: '12px',
                    border: '1px solid rgba(251, 191, 36, 0.15)',
                  }}>
                    <div style={{ fontSize: '11px', color: 'var(--warning)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      {labels.tip[language]}
                    </div>
                    <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                      {info.tip}
                    </p>
                  </div>
                )}
              </>
            ) : (
              <p style={{ fontSize: '14px', color: 'var(--text-muted)', lineHeight: 1.6 }}>
                {sound.sourceType === 'sample' ? labels.noInfo[language] : labels.noInfoProc[language]}
              </p>
            )}

            {/* Volume slider when sound is active */}
            {activeSound && (
              <div style={{
                background: 'rgba(255,255,255,0.04)',
                borderRadius: '12px',
                padding: '12px',
                marginTop: '12px',
                border: '1px solid rgba(255,255,255,0.06)',
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                }}>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {labels.volume[language]}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--accent-light)', fontWeight: 600 }}>
                    {Math.round(activeSound.volume * 100)}%
                  </div>
                </div>
                <Slider
                  value={activeSound.volume}
                  onChange={(v) => setSoundVolume(sound.id, v)}
                  height={36}
                />
              </div>
            )}

            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255,255,255,0.06)',
                color: 'var(--text-secondary)',
                fontSize: '14px',
                fontWeight: 500,
                marginTop: '16px',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              {labels.close[language]}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
