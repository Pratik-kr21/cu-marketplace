import { Router } from 'express'
import Conversation from '../models/Conversation.js'
import Message from '../models/Message.js'
import Item from '../models/Item.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import { sendPushNotification } from './push.js'

const router = Router()

// List conversations for current user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const userFields = req.user?.email === '24bcs10403@cuchd.in'
            ? 'full_name uid email department hostel avatar_url'
            : 'full_name avatar_url'

        const convos = await Conversation.find({
            $or: [{ buyer_id: req.user._id }, { seller_id: req.user._id }],
        })
            .populate('item_id', 'title')
            .populate('buyer_id', userFields)
            .populate('seller_id', userFields)
            .sort({ updatedAt: -1 })
            .lean()

        const withLastMessage = await Promise.all(
            convos.map(async (c) => {
                const lastMsg = await Message.findOne({ conversation_id: c._id }).sort({ createdAt: -1 }).lean()
                const messages = lastMsg ? [{ content: lastMsg.content, created_at: lastMsg.createdAt, sender_id: lastMsg.sender_id?.toString() }] : []
                return {
                    id: c._id.toString(),
                    item_id: c.item_id?._id?.toString(),
                    created_at: c.createdAt,
                    item: c.item_id ? { id: c.item_id._id.toString(), title: c.item_id.title } : null,
                    buyer: c.buyer_id ? { id: c.buyer_id._id.toString(), full_name: c.buyer_id.full_name, uid: c.buyer_id.uid } : null,
                    seller: c.seller_id ? { id: c.seller_id._id.toString(), full_name: c.seller_id.full_name, uid: c.seller_id.uid } : null,
                    messages,
                }
            })
        )
        return res.json(withLastMessage)
    } catch (err) {
        console.error('[Conversations] List error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Upsert conversation (buyer + item) -> get or create
router.post('/upsert', authMiddleware, async (req, res) => {
    try {
        const { item_id, seller_id } = req.body
        if (!item_id || !seller_id) return res.status(400).json({ error: 'item_id and seller_id required' })
        const userFields = req.user?.email === '24bcs10403@cuchd.in'
            ? 'full_name uid email department hostel avatar_url'
            : 'full_name avatar_url'

        let convo = await Conversation.findOne({ item_id, buyer_id: req.user._id })
            .populate('item_id', 'title')
            .populate('buyer_id', userFields)
            .populate('seller_id', userFields)
            .lean()
        if (!convo) {
            const created = await Conversation.create({ item_id, buyer_id: req.user._id, seller_id })
            convo = await Conversation.findById(created._id)
                .populate('item_id', 'title')
                .populate('buyer_id', userFields)
                .populate('seller_id', userFields)
                .lean()
        }
        return res.json({
            id: convo._id.toString(),
            item_id: convo.item_id?._id?.toString(),
            created_at: convo.createdAt,
            item: convo.item_id ? { id: convo.item_id._id.toString(), title: convo.item_id.title } : null,
            buyer: convo.buyer_id ? { id: convo.buyer_id._id.toString(), full_name: convo.buyer_id.full_name, uid: convo.buyer_id.uid } : null,
            seller: convo.seller_id ? { id: convo.seller_id._id.toString(), full_name: convo.seller_id.full_name, uid: convo.seller_id.uid } : null,
        })
    } catch (err) {
        console.error('[Conversations] Upsert error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Get messages for a conversation
router.get('/:id/messages', authMiddleware, async (req, res) => {
    try {
        const convo = await Conversation.findOne({ _id: req.params.id })
        if (!convo) return res.status(404).json({ error: 'Conversation not found' })
        const isParticipant =
            convo.buyer_id.toString() === req.user._id.toString() || convo.seller_id.toString() === req.user._id.toString()
        if (!isParticipant) return res.status(403).json({ error: 'Forbidden' })
        const messages = await Message.find({ conversation_id: req.params.id })
            .sort({ createdAt: 1 })
            .lean()
        return res.json(
            messages.map((m) => ({
                id: m._id.toString(),
                content: m.content,
                sender_id: m.sender_id?.toString(),
                created_at: m.createdAt,
            }))
        )
    } catch (err) {
        console.error('[Messages] List error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Send message
router.post('/:id/messages', authMiddleware, async (req, res) => {
    try {
        const { content } = req.body
        if (!content?.trim()) return res.status(400).json({ error: 'Content required' })
        const convo = await Conversation.findById(req.params.id)
        if (!convo) return res.status(404).json({ error: 'Conversation not found' })
        const isBuyer = convo.buyer_id.toString() === req.user._id.toString()
        const isSeller = convo.seller_id.toString() === req.user._id.toString()
        if (!isBuyer && !isSeller) return res.status(403).json({ error: 'Forbidden' })
        const receiver_id = isBuyer ? convo.seller_id : convo.buyer_id
        const msg = await Message.create({
            conversation_id: convo._id,
            sender_id: req.user._id,
            receiver_id,
            content: content.trim(),
        })
        await Conversation.findByIdAndUpdate(convo._id, { updatedAt: new Date() })

        // Send Push Notification
        try {
            // Find sender name for notification
            const sender = await User.findById(req.user._id).select('full_name').lean()
            const senderName = sender?.full_name || 'Someone'

            // Generate notification content based on message length
            const shortContent = content.trim().length > 40 ? content.trim().substring(0, 40) + '...' : content.trim()

            await sendPushNotification(
                receiver_id,
                `New Message from ${senderName}`,
                `"${shortContent}"`,
                `/chat`
            )
        } catch (e) {
            console.error('Failed to send chat push notification:', e)
        }

        return res.status(201).json({
            id: msg._id.toString(),
            content: msg.content,
            sender_id: msg.sender_id.toString(),
            created_at: msg.createdAt,
        })
    } catch (err) {
        console.error('[Messages] Create error:', err)
        return res.status(500).json({ error: err.message })
    }
})

export default router
