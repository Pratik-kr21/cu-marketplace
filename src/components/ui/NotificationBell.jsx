import { useState, useEffect } from 'react'
import { Bell, BellOff, Loader2 } from 'lucide-react'
import { subscribeToPush, unsubscribeFromPush, isPushSubscribed } from '../../lib/pushNotifications'
import { useAuthStore } from '../../store/authStore'

export default function NotificationBell() {
    const { user } = useAuthStore()
    const [status, setStatus] = useState('loading') // 'loading' | 'unsupported' | 'subscribed' | 'unsubscribed'
    const [working, setWorking] = useState(false)
    const [tooltip, setTooltip] = useState('')

    useEffect(() => {
        if (!user) return
        if (!('PushManager' in window)) { setStatus('unsupported'); return }
        isPushSubscribed().then(s => setStatus(s ? 'subscribed' : 'unsubscribed'))
    }, [user])

    if (!user || status === 'unsupported') return null

    const toggle = async () => {
        setWorking(true)
        try {
            if (status === 'subscribed') {
                await unsubscribeFromPush(user.id)
                setStatus('unsubscribed')
                setTooltip('Notifications off')
            } else {
                const result = await subscribeToPush(user.id)
                if (result === 'granted') {
                    setStatus('subscribed')
                    setTooltip('Notifications on!')
                } else if (result === 'denied') {
                    setTooltip('Permission denied — enable in browser settings')
                }
            }
        } finally {
            setWorking(false)
            setTimeout(() => setTooltip(''), 2500)
        }
    }

    return (
        <div className="relative">
            <button
                onClick={toggle}
                disabled={working || status === 'loading'}
                title={status === 'subscribed' ? 'Disable push notifications' : 'Enable push notifications'}
                className={`relative p-2 rounded-full transition-colors
                    ${status === 'subscribed'
                        ? 'text-brand-red hover:bg-red-50'
                        : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
            >
                {working || status === 'loading'
                    ? <Loader2 className="w-5 h-5 animate-spin" />
                    : status === 'subscribed'
                        ? <Bell className="w-5 h-5" />
                        : <BellOff className="w-5 h-5" />
                }
                {status === 'subscribed' && (
                    <span className="absolute top-1 right-1 w-2 h-2 bg-brand-red rounded-full" />
                )}
            </button>
            {tooltip && (
                <div className="absolute right-0 top-10 bg-gray-900 text-white text-xs rounded-lg px-3 py-1.5 whitespace-nowrap z-50 shadow-lg">
                    {tooltip}
                </div>
            )}
        </div>
    )
}
