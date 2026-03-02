self.addEventListener('push', e => {
    const data = e.data ? e.data.json() : {}
    const title = data.title || 'New Notification'
    const options = {
        body: data.message || '',
        icon: '/android-chrome-192x192.png',
        badge: '/favicon-32x32.png',
        data: { url: data.url || '/' }
    }
    e.waitUntil(self.registration.showNotification(title, options))
})

self.addEventListener('notificationclick', e => {
    e.notification.close()
    if (e.notification.data && e.notification.data.url) {
        e.waitUntil(clients.openWindow(e.notification.data.url))
    }
})
