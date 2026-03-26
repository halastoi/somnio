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
  {
    id: 'fantastic-space',
    nameKey: 'scene.fantasticSpace',
    descKey: 'scene.fantasticSpace.desc',
    icon: '\u{1F6F8}',
    sounds: [
      { soundId: 'cosmic-drone', volume: 0.4 },
      { soundId: 'scifi-ambient', volume: 0.25 },
      { soundId: 'om-drone', volume: 0.2 },
      { soundId: 'wind-chimes', volume: 0.1 },
    ],
  },
  {
    id: 'moonlight',
    nameKey: 'scene.moonlight',
    descKey: 'scene.moonlight.desc',
    icon: '\u{1F311}',
    sounds: [
      { soundId: 'crickets', volume: 0.3 },
      { soundId: 'ambient-pad', volume: 0.25 },
      { soundId: 'wind', volume: 0.15 },
      { soundId: 'singing-bowl', volume: 0.1 },
    ],
  },
  {
    id: 'night-camp',
    nameKey: 'scene.nightCamp',
    descKey: 'scene.nightCamp.desc',
    icon: '\u{26FA}',
    sounds: [
      { soundId: 'campfire-burn', volume: 0.4 },
      { soundId: 'crickets', volume: 0.25 },
      { soundId: 'wind', volume: 0.15 },
      { soundId: 'forest', volume: 0.15 },
    ],
  },
  {
    id: 'buddhist-chant',
    nameKey: 'scene.buddhistChant',
    descKey: 'scene.buddhistChant.desc',
    icon: '\u{1F9D8}',
    sounds: [
      { soundId: 'om-drone', volume: 0.4 },
      { soundId: 'singing-bowl', volume: 0.3 },
      { soundId: 'temple-bell', volume: 0.15 },
      { soundId: 'ambient-pad', volume: 0.15 },
    ],
  },
  {
    id: 'solitude',
    nameKey: 'scene.solitude',
    descKey: 'scene.solitude.desc',
    icon: '\u{1F3DE}\uFE0F',
    sounds: [
      { soundId: 'brown-noise', volume: 0.3 },
      { soundId: 'ambient-pad', volume: 0.2 },
      { soundId: 'wind', volume: 0.15 },
      { soundId: 'wind-chimes', volume: 0.08 },
    ],
  },
  {
    id: 'morning-garden',
    nameKey: 'scene.morningGarden',
    descKey: 'scene.morningGarden.desc',
    icon: '\u{1F33B}',
    sounds: [
      { soundId: 'forest-birds', volume: 0.35 },
      { soundId: 'stream', volume: 0.25 },
      { soundId: 'wind', volume: 0.15 },
    ],
  },
  {
    id: 'thunderstorm',
    nameKey: 'scene.thunderstorm',
    descKey: 'scene.thunderstorm.desc',
    icon: '\u{26C8}\uFE0F',
    sounds: [
      { soundId: 'rain-heavy', volume: 0.5 },
      { soundId: 'storm-heavy', volume: 0.3 },
      { soundId: 'storm-wind', volume: 0.2 },
    ],
  },
  {
    id: 'arctic-night',
    nameKey: 'scene.arcticNight',
    descKey: 'scene.arcticNight.desc',
    icon: '\u{2744}\uFE0F',
    sounds: [
      { soundId: 'blizzard', volume: 0.35 },
      { soundId: 'brown-noise', volume: 0.2 },
      { soundId: 'wind-howl', volume: 0.2 },
      { soundId: 'ethereal', volume: 0.15 },
    ],
  },
  {
    id: 'piano-rain',
    nameKey: 'scene.pianoRain',
    descKey: 'scene.pianoRain.desc',
    icon: '\u{1F3B9}',
    sounds: [
      { soundId: 'rain-light', volume: 0.35 },
      { soundId: 'gentle-piano', volume: 0.3, melodic: true } as { soundId: string; volume: number },
      { soundId: 'ambient-pad', volume: 0.15 },
    ],
  },
  {
    id: 'underwater',
    nameKey: 'scene.underwater',
    descKey: 'scene.underwater.desc',
    icon: '\u{1F42C}',
    sounds: [
      { soundId: 'brown-noise', volume: 0.35 },
      { soundId: 'water-soft', volume: 0.3 },
      { soundId: 'deep-hum', volume: 0.2 },
    ],
  },
]
