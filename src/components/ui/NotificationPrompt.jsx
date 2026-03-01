import { useState, useEffect } from 'react'
import { Bell, X } from 'lucide-react'
import { subscribeToPush } from '../../lib/pushNotifications'
import { useAuthStore } from '../../store/authStore'
import Button from './Button'

export default function NotificationPrompt() {
    const { user } = useAuthStore()
    const [show, setShow] = useState(false)
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        // Only show if the user is logged in
        if (!user) return

        // Wait a few seconds before disturbing the user
        const timer = setTimeout(() => {
            // Check if PushManager is supported
            if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
                return
            }

            // Only show if we haven't asked yet
            if (Notification.permission === 'default') {
                setShow(true)
            }
        }, 3000)

        return () => clearTimeout(timer)
    }, [user])

    const handleAllow = async () => {
        setLoading(true)
        try {
            await subscribeToPush(user.id)
            setShow(false)
        } catch (err) {
            console.error('Failed to subscribe:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleDismiss = () => {
        setShow(false)
        // Optionally save to localStorage that they dismissed it so we don't bother them every single time
        localStorage.setItem('pwa-notification-dismissed', 'true')
    }

    // Double check local storage just in case
    useEffect(() => {
        if (localStorage.getItem('pwa-notification-dismissed') === 'true') {
            setShow(false)
        }
    }, [])

    if (!show) return null

    return (
        <div className="fixed top-20 left-4 right-4 sm:left-auto sm:right-4 sm:w-96 z-50 bg-white border border-gray-200 rounded-2xl shadow-xl p-4 flex gap-4 items-start animate-fade-in sm:animate-slide-down">
            <div className="w-12 h-12 bg-blue-100 rounded-xl shrink-0 flex items-center justify-center text-blue-600 shadow-sm border border-blue-200">
                <Bell className="w-6 h-6" />
            </div>
            <div className="flex-1">
                <h3 className="text-gray-900 font-bold text-sm mb-1">Enable Notifications</h3>
                <p className="text-gray-500 text-xs leading-relaxed mb-3">
                    Don't miss out on trade offers! Get instant alerts when someone wants your items or accepts your barter.
                </p>
                <div className="flex gap-2">
                    <Button size="sm" loading={loading} className="flex-1 py-1.5 text-xs bg-blue-600 hover:bg-blue-700 border-none text-white" onClick={handleAllow}>
                        Allow
                    </Button>
                    <Button size="sm" variant="secondary" className="flex-1 py-1.5 text-xs" onClick={handleDismiss} disabled={loading}>
                        Not Now
                    </Button>
                </div>
            </div>
            <button onClick={handleDismiss} className="absolute -top-2 -right-2 bg-white border border-gray-200 rounded-full p-1 text-gray-400 hover:text-gray-900 shadow-sm transition-colors">
                <X className="w-3 h-3" />
            </button>
        </div>
    )
}
