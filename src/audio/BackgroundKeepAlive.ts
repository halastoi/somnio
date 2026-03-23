/**
 * iOS Background Audio Keep-Alive
 *
 * iOS Safari suspends Web Audio API when the app goes to background.
 * A looping <audio> element with silence keeps the audio session alive,
 * allowing Web Audio API sounds to continue playing.
 *
 * Also sets up MediaSession API for lock screen controls.
 */

let audioElement: HTMLAudioElement | null = null
let isActive = false

export function startBackgroundKeepAlive(): void {
  if (isActive) return

  if (!audioElement) {
    audioElement = document.createElement('audio')
    audioElement.src = '/sounds/silence.mp3'
    audioElement.loop = true
    audioElement.volume = 0.01 // Nearly silent
    // Required for iOS
    audioElement.setAttribute('playsinline', '')
    audioElement.setAttribute('webkit-playsinline', '')
  }

  audioElement.play().catch(() => {
    // Will retry on next user gesture
  })

  isActive = true

  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = 'playing'
  }
}

export function stopBackgroundKeepAlive(): void {
  if (audioElement) {
    audioElement.pause()
  }
  isActive = false

  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = 'none'
  }
}

export function isKeepAliveActive(): boolean {
  return isActive
}
