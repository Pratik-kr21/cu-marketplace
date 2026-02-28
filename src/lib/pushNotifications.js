import { api, isBackendConfigured } from './api'

export const VAPID_PUBLIC_KEY = 'BNwQmGch0JKc_QuApVC7rpZMZwpZOewoKVWCh4UqHCo0nMiBsDWbwEf3sTOK8Jcn0mAIedbEHk4AtnOb0Bj0Ack'

function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

/**
 * Request permission + subscribe the browser + save to backend.
 */
export async function subscribeToPush(userId) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return 'unsupported'
    try {
        const permission = await Notification.requestPermission()
        if (permission !== 'granted') return 'denied'

        const reg = await navigator.serviceWorker.getRegistration()
        if (!reg) {
            console.warn('No active Service Worker found. Please click install app or refresh.')
            return 'denied'
        }

        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })
        const { endpoint } = subscription
        const { p256dh, auth } = subscription.toJSON().keys
        if (isBackendConfigured) {
            await api.post('/api/push/subscribe', { endpoint, p256dh, auth })
        }
        return 'granted'
    } catch (err) {
        console.error('Push subscription failed:', err)
        return 'denied'
    }
}

export async function unsubscribeFromPush(userId) {
    if (!('serviceWorker' in navigator)) return
    try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (!reg) return

        const subscription = await reg.pushManager.getSubscription()
        if (!subscription) return

        if (isBackendConfigured) {
            await api.delete('/api/push/subscribe', { endpoint: subscription.endpoint })
        }
        await subscription.unsubscribe()
    } catch (err) {
        console.error('Unsubscribe failed:', err)
    }
}

export async function isPushSubscribed() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
    try {
        const reg = await navigator.serviceWorker.getRegistration()
        if (!reg) return false
        const sub = await reg.pushManager.getSubscription()
        return !!sub
    } catch {
        return false
    }
}

/**
 * Notify another user via push. Backend would need web-push to send; for now no-op unless you add an endpoint.
 */
export async function sendPushToUser(userId, title, message, url = '/') {
    // Optional: call backend POST /api/push/send with { user_id: userId, title, message, url }
    // Backend would look up subscription and use web-push. Not implemented here.
}
