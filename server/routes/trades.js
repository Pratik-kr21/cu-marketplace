import { Router } from 'express'
import Trade from '../models/Trade.js'
import Item from '../models/Item.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'
import { deleteImageFromCloudinary } from '../utils/cloudinary.js'
import { sendPushNotification } from './push.js'

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
        const userFields = req.user?.email === '24bcs10403@cuchd.in'
            ? 'full_name uid email department hostel avatar_url'
            : 'full_name avatar_url'

        const trades = await Trade.find(filter)
            .populate('item_id', 'title images')
            .populate('buyer_id', userFields)
            .populate('seller_id', userFields)
            .sort({ createdAt: -1 })
            .lean()
        const list = trades.map(t => ({
            id: t._id.toString(),
            item_id: t.item_id?._id?.toString(),
            buyer_id: t.buyer_id?._id?.toString(),
            seller_id: t.seller_id?._id?.toString(),
            desired_quantity: t.desired_quantity || 1,
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
        const { item_id, seller_id, offer_item_desc, message, desired_quantity } = req.body
        if (!item_id || !seller_id) return res.status(400).json({ error: 'item_id and seller_id required' })
        const trade = await Trade.create({
            item_id,
            buyer_id: req.user._id,
            seller_id,
            desired_quantity: desired_quantity || 1,
            type: req.body.type || 'barter',
            offer_item_desc: offer_item_desc || 'Open trade offer',
            message: message || '',
            status: 'pending',
        })
        const userFields = req.user?.email === '24bcs10403@cuchd.in'
            ? 'full_name uid email department hostel avatar_url'
            : 'full_name avatar_url'

        const populated = await Trade.findById(trade._id)
            .populate('item_id', 'title images')
            .populate('buyer_id', userFields)
            .populate('seller_id', userFields)
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
        if (!['accepted', 'declined', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' })
        }
        const trade = await Trade.findOne({ _id: req.params.id })
        if (!trade) return res.status(404).json({ error: 'Trade not found' })
        const isSeller = trade.seller_id.toString() === req.user._id.toString()
        const isBuyer = trade.buyer_id.toString() === req.user._id.toString()

        // Populate basic Item details to give a better notification title
        const item = await Item.findById(trade.item_id)
        const itemTitle = item ? item.title : 'an item'
        if (status === 'cancelled' && !isBuyer) return res.status(403).json({ error: 'Only buyer can cancel' })
        if (status === 'completed' && !isBuyer) return res.status(403).json({ error: 'Only buyer can mark as completed' })
        if (['accepted', 'declined'].includes(status) && !isSeller) return res.status(403).json({ error: 'Only seller can accept/decline' })
        trade.status = status
        trade.updatedAt = new Date()
        await trade.save()

        // 🚨 POST-TRADE DB CLEANUP
        // Only trigger item deletion/decrement when a buyer confirms they got the product ('completed')
        if (status === 'completed') {
            const item = await Item.findById(trade.item_id)
            if (item) {
                // Decrement the quantity for this particular trade completion
                let updatedQty = (item.quantity || 1) - (trade.desired_quantity || 1)

                if (updatedQty <= 0) {
                    // Item runs out of stock, erase from DB and Cloudinary
                    const imgs = item.imageUrls?.length > 0 ? item.imageUrls : item.images
                    if (imgs && imgs.length > 0) {
                        for (const imgUrl of imgs) {
                            try { await deleteImageFromCloudinary(imgUrl) } catch (e) { console.error('Cloudinary cleanup error during trade completion:', e) }
                        }
                    }

                    await Item.deleteOne({ _id: trade.item_id })

                    // Decline all other pending trades targeting this now-deleted item
                    await Trade.updateMany(
                        { item_id: trade.item_id, _id: { $ne: trade._id }, status: 'pending' },
                        { $set: { status: 'declined', updatedAt: new Date() } }
                    )
                } else {
                    // Update new quantity
                    item.quantity = updatedQty
                    await item.save()
                }
            }
        }

        // Send Push Notifications based on action
        try {
            if (status === 'accepted') {
                await sendPushNotification(trade.buyer_id, 'Trade Accepted! 🎉', `The seller accepted your offer for ${itemTitle}. Check your dashboard to proceed.`, '/trades')
            } else if (status === 'declined') {
                await sendPushNotification(trade.buyer_id, 'Trade Declined', `The seller respectfully declined your offer for ${itemTitle}.`, '/trades')
            } else if (status === 'cancelled') {
                await sendPushNotification(trade.seller_id, 'Trade Cancelled', `The buyer withdrew their offer for ${itemTitle}.`, '/trades')
            } else if (status === 'completed') {
                await sendPushNotification(trade.seller_id, 'Trade Completed! ✅', `The buyer has successfully received ${itemTitle}. The trade is now complete!`, '/trades')
            }
        } catch (e) {
            console.error('Failed to send trade status push:', e)
        }

        return res.json(tradeToResponse(trade))
    } catch (err) {
        console.error('[Trades] Update error:', err)
        return res.status(500).json({ error: err.message })
    }
})

export default router
