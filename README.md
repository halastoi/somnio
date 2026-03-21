# Somnio - Sleep & Relaxation PWA

A premium sleep and relaxation app with 210 professional sounds across 10 categories. Built as a Progressive Web App — installable, offline-capable, and works on any device.

**Live:** [somnio-six.vercel.app](https://somnio-six.vercel.app)

## Features

- **210 sounds** across 10 categories: Baby Sleep, Noise Colors, Rain & Storm, Water, Nature, Wind, Fire & Relax, Urban, Cosmos, Binaural Beats
- **101 professional audio samples** (royalty-free, Mixkit licensed)
- **Procedural audio** via Web Audio API — noise colors, binaural beats generated in real-time
- **Sound mixer** — play multiple sounds simultaneously with per-sound volume control
- **Save/load mixes** — custom combinations persisted in localStorage
- **Sleep timer** — 1 to 180 minutes with configurable fade-out
- **Breathing exercises** — 4-7-8, Box, Simple Calm, Coherent
- **Animated background** — canvas-based, responds to active sound category
- **4 themes** — Dark, Midnight, AMOLED, Ocean
- **4 languages** — English, Romanian, Russian, Spanish (fully translated)
- **Sound info** — detailed descriptions with tips, translated in all languages
- **PWA** — installable, offline support, auto-caching audio files
- **177 tests** passing

## Tech Stack

- React 19 + TypeScript
- Vite 8
- Zustand (state management + persistence)
- Framer Motion (animations)
- Web Audio API (procedural sound generation)
- Canvas API (animated background)
- Service Worker (offline + audio caching)

## Getting Started

```bash
npm install
npm run dev
```

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run lint` | Lint code |

## Sound Categories

| Category | Sounds | Source |
|----------|--------|--------|
| Baby Sleep | 21 | Mixkit lullabies + procedural |
| Noise Colors | 21 | Procedural (Web Audio API) |
| Rain & Storm | 21 | Mixkit recordings |
| Water | 21 | Mixkit recordings |
| Nature | 21 | Mixkit recordings |
| Wind | 21 | Mixkit recordings |
| Fire & Relax | 21 | Mixkit recordings + music |
| Urban | 21 | Mixkit recordings + music |
| Cosmos | 21 | Mixkit recordings + procedural |
| Binaural Beats | 21 | Procedural (Web Audio API) |

## Audio License

All audio samples are royalty-free under the [Mixkit License](https://mixkit.co/license/) — free for commercial and personal use, no attribution required.

## Deploy

Deployed on Vercel. Push to `main` and run:

```bash
vercel --prod
```
