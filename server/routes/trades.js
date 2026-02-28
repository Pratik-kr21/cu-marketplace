import { Router } from 'express'
import Trade from '../models/Trade.js'
import Item from '../models/Item.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

function tradeToResponse(t) {
    const obj = t.toObject ? t.toObject() : t
    return {
        ...obj,
        id: obj._id.toString(),
        _id: undefined,
        item_id: obj.item_id?.toString?.() || obj.item_id,
        buyer_id: obj.buyer_id?.toString?.() || obj.buyer_id,
        seller_id: obj.seller_id?.toString?.() || obj.seller_id,
        item: obj.item ? { id: obj.item._id?.toString(), title: obj.item.title, images: obj.item.images } : undefined,
        buyer: obj.buyer ? { id: obj.buyer._id?.toString(), full_name: obj.buyer.full_name, uid: obj.buyer.uid } : undefined,
        seller: obj.seller ? { id: obj.seller._id?.toString(), full_name: obj.seller.full_name, uid: obj.seller.uid } : undefined,
        created_at: obj.createdAt,
        updated_at: obj.updatedAt,
        createdAt: undefined,
        updatedAt: undefined,
    }
}

// List trades (incoming = seller is me, outgoing = buyer is me)
router.get('/', authMiddleware, async (req, res) => {
    try {
        const tab = req.query.tab || 'incoming'
        const filter = tab === 'incoming' ? { seller_id: req.user._id } : { buyer_id: req.user._id }
        const trades = await Trade.find(filter)
            .populate('item_id', 'title images')
            .populate('buyer_id', 'full_name uid')
            .populate('seller_id', 'full_name uid')
            .sort({ createdAt: -1 })
            .lean()
        const list = trades.map(t => ({
            id: t._id.toString(),
            item_id: t.item_id?._id?.toString(),
            buyer_id: t.buyer_id?._id?.toString(),
            seller_id: t.seller_id?._id?.toString(),
            type: t.type,
            offer_item_desc: t.offer_item_desc,
            message: t.message,
            status: t.status,
            created_at: t.createdAt,
            updated_at: t.updatedAt,
            item: t.item_id ? { id: t.item_id._id.toString(), title: t.item_id.title, images: t.item_id.images } : null,
            buyer: t.buyer_id ? { id: t.buyer_id._id.toString(), full_name: t.buyer_id.full_name, uid: t.buyer_id.uid } : null,
            seller: t.seller_id ? { id: t.seller_id._id.toString(), full_name: t.seller_id.full_name, uid: t.seller_id.uid } : null,
        }))
        return res.json(list)
    } catch (err) {
        console.error('[Trades] List error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Create trade
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { item_id, seller_id, offer_item_desc, message } = req.body
        if (!item_id || !seller_id) return res.status(400).json({ error: 'item_id and seller_id required' })
        const trade = await Trade.create({
            item_id,
            buyer_id: req.user._id,
            seller_id,
            type: 'barter',
            offer_item_desc: offer_item_desc || 'Open trade offer',
            message: message || '',
            status: 'pending',
        })
        const populated = await Trade.findById(trade._id)
            .populate('item_id', 'title images')
            .populate('buyer_id', 'full_name uid')
            .populate('seller_id', 'full_name uid')
            .lean()
        return res.status(201).json(tradeToResponse({ ...populated, _id: trade._id }))
    } catch (err) {
        console.error('[Trades] Create error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Update trade status (accept/decline/cancel)
router.patch('/:id', authMiddleware, async (req, res) => {
    try {
        const { status } = req.body
        if (!['accepted', 'declined', 'cancelled'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' })
        }
        const trade = await Trade.findOne({ _id: req.params.id })
        if (!trade) return res.status(404).json({ error: 'Trade not found' })
        const isSeller = trade.seller_id.toString() === req.user._id.toString()
        const isBuyer = trade.buyer_id.toString() === req.user._id.toString()
        if (status === 'cancelled' && !isBuyer) return res.status(403).json({ error: 'Only buyer can cancel' })
        if (['accepted', 'declined'].includes(status) && !isSeller) return res.status(403).json({ error: 'Only seller can accept/decline' })
        trade.status = status
        trade.updatedAt = new Date()
        await trade.save()
        return res.json(tradeToResponse(trade))
    } catch (err) {
        console.error('[Trades] Update error:', err)
        return res.status(500).json({ error: err.message })
    }
})

export default router
