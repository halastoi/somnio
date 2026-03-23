export interface Scene {
  id: string
  nameKey: string
  descKey: string
  icon: string
  sounds: { soundId: string; volume: number }[]
}

export const scenes: Scene[] = [
  {
    id: 'zen-temple',
    nameKey: 'scene.zenTemple',
    descKey: 'scene.zenTemple.desc',
    icon: '\u{1F6D5}',
    sounds: [
      { soundId: 'singing-bowl', volume: 0.35 },
      { soundId: 'wind', volume: 0.2 },
      { soundId: 'temple-bell', volume: 0.15 },
      { soundId: 'om-drone', volume: 0.2 },
    ],
  },
  {
    id: 'rainy-night',
    nameKey: 'scene.rainyNight',
    descKey: 'scene.rainyNight.desc',
    icon: '\u{1F327}\uFE0F',
    sounds: [
      { soundId: 'rain-heavy', volume: 0.45 },
      { soundId: 'thunder-bg', volume: 0.2 },
      { soundId: 'fireplace', volume: 0.25 },
    ],
  },
  {
    id: 'forest-clearing',
    nameKey: 'scene.forestClearing',
    descKey: 'scene.forestClearing.desc',
    icon: '\u{1F332}',
    sounds: [
      { soundId: 'crickets', volume: 0.35 },
      { soundId: 'stream', volume: 0.3 },
      { soundId: 'wind', volume: 0.2 },
      { soundId: 'forest', volume: 0.25 },
    ],
  },
  {
    id: 'cozy-cabin',
    nameKey: 'scene.cozyCabin',
    descKey: 'scene.cozyCabin.desc',
    icon: '\u{1F3E1}',
    sounds: [
      { soundId: 'fireplace', volume: 0.45 },
      { soundId: 'rain-light', volume: 0.3 },
      { soundId: 'wind', volume: 0.15 },
      { soundId: 'campfire-crackle2', volume: 0.2 },
    ],
  },
  {
    id: 'deep-ocean-scene',
    nameKey: 'scene.deepOcean',
    descKey: 'scene.deepOcean.desc',
    icon: '\u{1F30A}',
    sounds: [
      { soundId: 'ocean-waves', volume: 0.45 },
      { soundId: 'brown-noise', volume: 0.2 },
      { soundId: 'sea-humming', volume: 0.25 },
    ],
  },
  {
    id: 'warm-drift',
    nameKey: 'scene.warmDrift',
    descKey: 'scene.warmDrift.desc',
    icon: '\u2728',
    sounds: [
      { soundId: 'pink-noise', volume: 0.35 },
      { soundId: 'ambient-pad', volume: 0.25 },
      { soundId: 'wind-chimes', volume: 0.15 },
    ],
  },
  {
    id: 'tibetan-evening',
    nameKey: 'scene.tibetanEvening',
    descKey: 'scene.tibetanEvening.desc',
    icon: '\u{1F549}\uFE0F',
    sounds: [
      { soundId: 'om-drone', volume: 0.4 },
      { soundId: 'singing-bowl', volume: 0.3 },
      { soundId: 'temple-bell', volume: 0.15 },
      { soundId: 'wind-chimes', volume: 0.15 },
    ],
  },
  {
    id: 'starfield',
    nameKey: 'scene.starfield',
    descKey: 'scene.starfield.desc',
    icon: '\u{1F30C}',
    sounds: [
      { soundId: 'cosmic-drone', volume: 0.4 },
      { soundId: 'brown-noise', volume: 0.2 },
      { soundId: 'ethereal', volume: 0.25 },
      { soundId: 'wind-chimes', volume: 0.12 },
    ],
  },
  {
    id: 'meditation',
    nameKey: 'scene.meditation',
    descKey: 'scene.meditation.desc',
    icon: '\u{1F9D8}',
    sounds: [
      { soundId: 'om-drone', volume: 0.35 },
      { soundId: 'singing-bowl', volume: 0.3 },
      { soundId: 'ambient-pad', volume: 0.2 },
    ],
  },
  {
    id: 'cafe-focus',
    nameKey: 'scene.cafeFocus',
    descKey: 'scene.cafeFocus.desc',
    icon: '\u2615',
    sounds: [
      { soundId: 'coffee-shop', volume: 0.35 },
      { soundId: 'rain-light', volume: 0.25 },
      { soundId: 'brown-noise', volume: 0.15 },
    ],
  },
  {
    id: 'night-train-scene',
    nameKey: 'scene.nightTrain',
    descKey: 'scene.nightTrain.desc',
    icon: '\u{1F682}',
    sounds: [
      { soundId: 'train', volume: 0.4 },
      { soundId: 'rain-atmosphere', volume: 0.25 },
      { soundId: 'brown-noise', volume: 0.15 },
    ],
  },
  {
    id: 'beach-sunset',
    nameKey: 'scene.beachSunset',
    descKey: 'scene.beachSunset.desc',
    icon: '\u{1F3D6}\uFE0F',
    sounds: [
      { soundId: 'ocean-waves', volume: 0.4 },
      { soundId: 'wind', volume: 0.2 },
      { soundId: 'crickets', volume: 0.2 },
    ],
  },
  {
    id: 'candlelight',
    nameKey: 'scene.candlelight',
    descKey: 'scene.candlelight.desc',
    icon: '\u{1F56F}\uFE0F',
    sounds: [
      { soundId: 'fireplace', volume: 0.4 },
      { soundId: 'ambient-pad', volume: 0.2 },
      { soundId: 'wind-chimes', volume: 0.12 },
    ],
  },
  {
    id: 'baby-sleep-scene',
    nameKey: 'scene.babySleep',
    descKey: 'scene.babySleep.desc',
    icon: '\u{1F319}',
    sounds: [
      { soundId: 'womb', volume: 0.4 },
      { soundId: 'heartbeat', volume: 0.3 },
      { soundId: 'baby-pink', volume: 0.2 },
    ],
  },
]
