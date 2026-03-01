import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

// Capture the prompt globally as early as possible before React mounts
window.deferredPWAInstallPrompt = null
window.addEventListener('beforeinstallprompt', (e) => {
    // Prevent default mini-infobar
    e.preventDefault()
    // Stash the event
    window.deferredPWAInstallPrompt = e
    // Dispatch a custom event so React can pick it up immediately
    window.dispatchEvent(new Event('pwa-prompt-ready'))
})

ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>,
)

if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').catch(err => {
            console.error('ServiceWorker registration failed: ', err)
        })
    })
}
