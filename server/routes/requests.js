import { Router } from 'express'
import ItemRequest from '../models/ItemRequest.js'
import { authMiddleware } from '../middleware/auth.js'
import { broadcastPushNotification } from './push.js'

const router = Router()

// Get all active requests
router.get('/', async (req, res) => {
    try {
        const requests = await ItemRequest.find({ status: 'active' })
            .populate('userId', 'name email profilePic')
            .sort({ createdAt: -1 })
        res.json(requests)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Create a new request
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, category } = req.body
        const newRequest = new ItemRequest({
            userId: req.user._id,
            title,
            description,
            category
        })
        await newRequest.save()

        // Broadcast notification to all other users
        await broadcastPushNotification(
            `New Item Request: ${title}`,
            `${req.user.name} is looking for a ${category}. Can you help?`,
            '/requests', // Ensure frontend has this route
            req.user._id
        )

        res.status(201).json(newRequest)
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Delete (or fulfill) a request
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const request = await ItemRequest.findById(req.params.id)
        if (!request) return res.status(404).json({ error: 'Request not found' })

        if (request.userId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized' })
        }

        await ItemRequest.findByIdAndDelete(req.params.id)
        res.json({ success: true })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

export default router
