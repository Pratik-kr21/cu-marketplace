import { Router } from 'express'
import webpush from 'web-push'
import PushSubscription from '../models/PushSubscription.js'
import { authMiddleware } from '../middleware/auth.js'

webpush.setVapidDetails(
    'mailto:test@example.com',
    process.env.VAPID_PUBLIC_KEY || 'BFc9iO20-dXkAW8HkvFnk8vle1A5W4XVSn5YSRQYGT6_Vw3liXdPgp2WVa3-ryaA7nEuWLxDe05cioc-36l1HkM',
    process.env.VAPID_PRIVATE_KEY || 'NBPZLrAYntkz0YiQq0gMMLUjCbsX8rRlqFkU639K22I'
)

const router = Router()

// Upsert push subscription
router.post('/subscribe', authMiddleware, async (req, res) => {
    try {
        const { endpoint, p256dh, auth } = req.body
        if (!endpoint || !p256dh || !auth) return res.status(400).json({ error: 'endpoint, p256dh, auth required' })
        await PushSubscription.findOneAndUpdate(
            { user_id: req.user._id, endpoint },
            { user_id: req.user._id, endpoint, p256dh, auth },
            { upsert: true, new: true }
        )
        return res.status(204).send()
    } catch (err) {
        console.error('[Push] Subscribe error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Unsubscribe
router.delete('/subscribe', authMiddleware, async (req, res) => {
    try {
        const { endpoint } = req.body
        if (!endpoint) return res.status(400).json({ error: 'endpoint required' })
        await PushSubscription.deleteOne({ user_id: req.user._id, endpoint })
        return res.status(204).send()
    } catch (err) {
        console.error('[Push] Unsubscribe error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Send notification
router.post('/send', authMiddleware, async (req, res) => {
    try {
        const { user_id, title, message, url } = req.body
        if (!user_id || (!title && !message)) return res.status(400).json({ error: 'user_id and title/message required' })

        const subs = await PushSubscription.find({ user_id })

        const payload = JSON.stringify({
            title: title || 'CU Marketplace',
            message: message || '',
            url: url || '/'
        })

        await Promise.all(subs.map(async sub => {
            try {
                await webpush.sendNotification({
                    endpoint: sub.endpoint,
                    keys: { p256dh: sub.p256dh, auth: sub.auth }
                }, payload)
            } catch (err) {
                if (err.statusCode === 410 || err.statusCode === 404) {
                    await PushSubscription.deleteOne({ _id: sub._id })
                } else {
                    console.error('Push send failed for a sub:', err)
                }
            }
        }))

        return res.json({ success: true, count: subs.length })
    } catch (err) {
        console.error('[Push] Send error:', err)
        return res.status(500).json({ error: err.message })
    }
})

export default router
