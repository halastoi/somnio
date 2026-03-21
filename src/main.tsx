import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import App from './App'
import './styles/globals.css'

// Auto-update service worker - reload page when new version available
const updateSW = registerSW({
  onNeedRefresh() {
    // Silently update - next navigation will use new version
    updateSW(true)
  },
  onOfflineReady() {
    console.log('[Somnio] App ready for offline use')
  },
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
