import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import Button from './Button'

export default function InstallPWA() {
    const [deferredPrompt, setDeferredPrompt] = useState(null)
    const [showInstall, setShowInstall] = useState(false)

    useEffect(() => {
        // If already installed, do not show
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return
        }

        // Only show custom popup on mobile browsers
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent || '')
        if (!isMobile) {
            return
        }

        const handleReady = () => {
            if (window.deferredPWAInstallPrompt) {
                setDeferredPrompt(window.deferredPWAInstallPrompt)
                setShowInstall(true)
            }
        }

        const handler = (e) => {
            e.preventDefault()
            window.deferredPWAInstallPrompt = e
            handleReady()
        }

        // Check if it already fired before mount
        if (window.deferredPWAInstallPrompt) {
            handleReady()
        }

        // Listen for standard browser event
        window.addEventListener('beforeinstallprompt', handler)
        // Listen for our custom event from main.jsx
        window.addEventListener('pwa-prompt-ready', handleReady)

        // Clear showInstall if app is installed
        window.addEventListener('appinstalled', () => {
            setShowInstall(false)
            setDeferredPrompt(null)
        })

        return () => {
            window.removeEventListener('beforeinstallprompt', handler)
            window.removeEventListener('pwa-prompt-ready', handleReady)
        }
    }, [])

    const handleInstallClick = async () => {
        if (!deferredPrompt) return

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice
        console.log(`User response to the install prompt: ${outcome}`)

        // We've used the prompt, and can't use it again, throw it away
        setDeferredPrompt(null)
        window.deferredPWAInstallPrompt = null
        setShowInstall(false)
    }

    const handleDismiss = () => {
        setShowInstall(false)
        // Optionally clear the global if user says not now
        // window.deferredPWAInstallPrompt = null
    }

    if (!showInstall) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[60] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex gap-4 items-start animate-fade-in sm:animate-slide-up">
            <div className="w-12 h-12 bg-brand-red rounded-xl shrink-0 flex items-center justify-center text-white shadow-md">
                <Download className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h3 className="text-gray-900 font-bold text-sm mb-1">Install CU Market App</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">Install our application on your home screen for quick and easy access when you're on the go.</p>
                <div className="flex gap-2">
                    <Button size="sm" className="flex-1 py-1.5 text-xs" onClick={handleInstallClick}>Install App</Button>
                    <Button size="sm" variant="secondary" className="flex-1 py-1.5 text-xs" onClick={handleDismiss}>Not Now</Button>
                </div>
            </div>
            <button onClick={handleDismiss} className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-900 shadow-sm transition-colors">
                <X className="w-3 h-3" />
            </button>
        </div>
    )
}
