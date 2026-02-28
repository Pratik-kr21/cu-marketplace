import { Router } from 'express'
import PushSubscription from '../models/PushSubscription.js'
import { authMiddleware } from '../middleware/auth.js'

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

export default router
