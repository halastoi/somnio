import { useEffect, useRef } from 'react'
import { usePlayerStore } from '../../stores/usePlayerStore'
import { useSettingsStore } from '../../stores/useSettingsStore'
import { sounds } from '../../audio/sounds'

const CATEGORY_COLORS: Record<string, [string, string, string]> = {
  noise: ['#2a1a5e', '#1a1a3e', '#0a0a2e'],
  rain: ['#1a2a4e', '#0d1f3d', '#0a1628'],
  water: ['#0a2a3e', '#0d2233', '#081a28'],
  nature: ['#0a2e1a', '#0d2a1f', '#081f15'],
  wind: ['#1a2a3e', '#152535', '#0f1f2a'],
  fire: ['#3e1a0a', '#2d150d', '#1f0f08'],
  urban: ['#2a2a1a', '#222215', '#1a1a0f'],
  cosmos: ['#1a0a3e', '#150d2d', '#0f081f'],
  baby: ['#2e1a3e', '#25152d', '#1a0f1f'],
  binaural: ['#0a1a3e', '#0d152d', '#080f1f'],
}

export function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const activeSounds = usePlayerStore((s) => s.activeSounds)
  const theme = useSettingsStore((s) => s.theme)
  const isLight = theme === 'light' || theme === 'sand'
  const animRef = useRef<number>(0)
  const colorsRef = useRef({ r: 10, g: 10, b: 26 })
  const particlesRef = useRef<Particle[]>([])
  const timeRef = useRef(0)

  // Determine dominant color based on active sounds
  const dominantCategory = activeSounds.length > 0
    ? sounds.find((s) => s.id === activeSounds[0].soundId)?.category ?? 'noise'
    : ''

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const resize = () => {
      canvas.width = window.innerWidth * window.devicePixelRatio
      canvas.height = window.innerHeight * window.devicePixelRatio
      canvas.style.width = '100%'
      canvas.style.height = '100%'
    }
    resize()
    window.addEventListener('resize', resize)

    // Init particles
    if (particlesRef.current.length === 0) {
      for (let i = 0; i < 40; i++) {
        particlesRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.5,
          speedX: (Math.random() - 0.5) * 0.3,
          speedY: (Math.random() - 0.5) * 0.3,
          opacity: Math.random() * 0.4 + 0.1,
          pulse: Math.random() * Math.PI * 2,
        })
      }
    }

    const animate = () => {
      timeRef.current += 0.005
      const t = timeRef.current

      // Target colors based on active category
      const targetColors = dominantCategory && CATEGORY_COLORS[dominantCategory]
        ? hexToRgb(CATEGORY_COLORS[dominantCategory][0])
        : { r: 10, g: 10, b: 26 }

      // Smooth color transition
      const c = colorsRef.current
      c.r += (targetColors.r - c.r) * 0.02
      c.g += (targetColors.g - c.g) * 0.02
      c.b += (targetColors.b - c.b) * 0.02

      const w = canvas.width
      const h = canvas.height

      // Gradient background with slow movement
      const grd = ctx.createRadialGradient(
        w * (0.3 + Math.sin(t) * 0.2),
        h * (0.3 + Math.cos(t * 0.7) * 0.2),
        0,
        w * 0.5,
        h * 0.5,
        w * 0.8,
      )
      grd.addColorStop(0, `rgb(${c.r + 15}, ${c.g + 15}, ${c.b + 15})`)
      grd.addColorStop(0.5, `rgb(${c.r}, ${c.g}, ${c.b})`)
      grd.addColorStop(1, `rgb(${Math.max(c.r - 5, 0)}, ${Math.max(c.g - 5, 0)}, ${Math.max(c.b - 5, 0)})`)

      ctx.fillStyle = grd
      ctx.fillRect(0, 0, w, h)

      // Draw particles only when playing
      if (activeSounds.length > 0) {
        const accentR = c.r + 80
        const accentG = c.g + 60
        const accentB = c.b + 120

        for (const p of particlesRef.current) {
          p.x += p.speedX * (1 + activeSounds.length * 0.3)
          p.y += p.speedY * (1 + activeSounds.length * 0.3)
          p.pulse += 0.02

          // Wrap around
          if (p.x < 0) p.x = w
          if (p.x > w) p.x = 0
          if (p.y < 0) p.y = h
          if (p.y > h) p.y = 0

          const pulsedOpacity = p.opacity * (0.6 + Math.sin(p.pulse) * 0.4)
          const pulsedSize = p.size * (0.8 + Math.sin(p.pulse * 1.3) * 0.2)

          ctx.beginPath()
          ctx.arc(p.x, p.y, pulsedSize * window.devicePixelRatio, 0, Math.PI * 2)
          ctx.fillStyle = `rgba(${accentR}, ${accentG}, ${accentB}, ${pulsedOpacity})`
          ctx.fill()
        }

        // Subtle aurora waves
        ctx.globalCompositeOperation = 'screen'
        for (let i = 0; i < 2; i++) {
          ctx.beginPath()
          ctx.moveTo(0, h * 0.5)
          for (let x = 0; x < w; x += 4) {
            const y = h * (0.4 + i * 0.15) +
              Math.sin(x * 0.003 + t * (1 + i * 0.5)) * h * 0.08 +
              Math.sin(x * 0.007 + t * 0.3) * h * 0.03
            ctx.lineTo(x, y)
          }
          ctx.lineTo(w, h)
          ctx.lineTo(0, h)
          ctx.closePath()
          ctx.fillStyle = `rgba(${accentR}, ${accentG}, ${accentB}, ${0.015 + i * 0.01})`
          ctx.fill()
        }
        ctx.globalCompositeOperation = 'source-over'
      }

      animRef.current = requestAnimationFrame(animate)
    }

    animRef.current = requestAnimationFrame(animate)

    return () => {
      cancelAnimationFrame(animRef.current)
      window.removeEventListener('resize', resize)
    }
  }, [dominantCategory, activeSounds.length])

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 0,
        pointerEvents: 'none',
        opacity: isLight ? 0.15 : 1,
      }}
    />
  )
}

interface Particle {
  x: number
  y: number
  size: number
  speedX: number
  speedY: number
  opacity: number
  pulse: number
}

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) }
    : { r: 10, g: 10, b: 26 }
}
