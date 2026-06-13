import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'
import Button from './Button'

export default function InstallPWA() {
    const [showInstall, setShowInstall] = useState(false)

    useEffect(() => {
        // If already installed (standalone mode), do not show
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return
        }

        // Only show if user hasn't dismissed it or downloaded it before
        const hasSeenPopup = localStorage.getItem('hideAppDownloadPopup')
        if (hasSeenPopup) {
            return
        }

        // Only show custom popup on Android browsers
        const isAndroid = /Android/i.test(navigator.userAgent || '')
        if (!isAndroid) {
            return
        }

        // Add a small delay so it doesn't pop up aggressively immediately
        const timer = setTimeout(() => {
            setShowInstall(true)
        }, 2500)

        return () => clearTimeout(timer)
    }, [])

    const handleDismiss = () => {
        setShowInstall(false)
        localStorage.setItem('hideAppDownloadPopup', 'true')
    }

    if (!showInstall) return null

    return (
        <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-[60] bg-white border border-gray-200 rounded-2xl shadow-2xl p-4 flex gap-4 items-start animate-fade-in sm:animate-slide-up">
            <div className="w-12 h-12 bg-brand-red rounded-xl shrink-0 flex items-center justify-center text-white shadow-md">
                <Download className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h3 className="text-gray-900 font-bold text-sm mb-1">Download CU Market App</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">Get our native Android app for a faster, fullscreen experience on the go.</p>
                <div className="flex gap-2">
                    <a href="/cu-market-app.apk" download className="flex-1 block" onClick={handleDismiss}>
                        <Button size="sm" className="w-full py-1.5 text-xs">Download APK</Button>
                    </a>
                    <Button size="sm" variant="secondary" className="flex-1 py-1.5 text-xs" onClick={handleDismiss}>Not Now</Button>
                </div>
            </div>
            <button onClick={handleDismiss} className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-900 shadow-sm transition-colors">
                <X className="w-3 h-3" />
            </button>
        </div>
    )
}
