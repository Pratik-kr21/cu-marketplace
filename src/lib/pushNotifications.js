import { supabase } from './supabase'

export const VAPID_PUBLIC_KEY = 'BNwQmGch0JKc_QuApVC7rpZMZwpZOewoKVWCh4UqHCo0nMiBsDWbwEf3sTOK8Jcn0mAIedbEHk4AtnOb0Bj0Ack'

/**
 * Convert VAPID public key (base64url) → Uint8Array for PushManager.subscribe
 */
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = atob(base64)
    return Uint8Array.from([...rawData].map(c => c.charCodeAt(0)))
}

/**
 * Request permission + subscribe the browser + save to Supabase.
 * Returns 'granted' | 'denied' | 'unsupported'
 */
export async function subscribeToPush(userId) {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
        return 'unsupported'
    }

    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return 'denied'

    try {
        const reg = await navigator.serviceWorker.ready
        const subscription = await reg.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
        })

        const { endpoint } = subscription
        const { p256dh, auth } = subscription.toJSON().keys

        // Upsert into Supabase
        await supabase.from('push_subscriptions').upsert(
            { user_id: userId, endpoint, p256dh, auth },
            { onConflict: 'user_id,endpoint' }
        )

        return 'granted'
    } catch (err) {
        console.error('Push subscription failed:', err)
        return 'denied'
    }
}

/**
 * Unsubscribe the current browser from push + remove from Supabase
 */
export async function unsubscribeFromPush(userId) {
    if (!('serviceWorker' in navigator)) return

    try {
        const reg = await navigator.serviceWorker.ready
        const subscription = await reg.pushManager.getSubscription()
        if (!subscription) return

        await supabase.from('push_subscriptions')
            .delete()
            .eq('user_id', userId)
            .eq('endpoint', subscription.endpoint)

        await subscription.unsubscribe()
    } catch (err) {
        console.error('Unsubscribe failed:', err)
    }
}

/**
 * Check if the current browser is already subscribed
 */
export async function isPushSubscribed() {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.getSubscription()
    return !!sub
}

/**
 * Call the Edge Function to send a push notification to a user
 */
export async function sendPushToUser(userId, title, message, url = '/') {
    try {
        const { data: { session } } = await supabase.auth.getSession()
        if (!session) return

        await fetch(
            `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-push`,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify({ user_id: userId, title, message, url }),
            }
        )
    } catch (err) {
        console.error('sendPushToUser failed:', err)
    }
}
