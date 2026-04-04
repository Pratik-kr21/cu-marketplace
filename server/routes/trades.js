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
        action_required_from: obj.action_required_from?.toString?.() || obj.action_required_from,
        proposed_items: obj.proposed_items?.map(i => ({ id: i._id?.toString() || i, title: i.title, images: i.images, price: i.price, is_free: i.is_free, is_barter_only: i.is_barter_only })) || [],
        proposed_cash: obj.proposed_cash || 0,
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
            .populate('proposed_items', 'title images price is_free is_barter_only')
            .sort({ createdAt: -1 })
            .lean()
        const list = trades.map(t => ({
            id: t._id.toString(),
            item_id: t.item_id?._id?.toString(),
            buyer_id: t.buyer_id?._id?.toString(),
            seller_id: t.seller_id?._id?.toString(),
            action_required_from: t.action_required_from?.toString(),
            desired_quantity: t.desired_quantity || 1,
            type: t.type,
            offer_item_desc: t.offer_item_desc,
            message: t.message,
            status: t.status,
            proposed_cash: t.proposed_cash || 0,
            proposed_items: t.proposed_items?.map(i => ({ id: i._id?.toString() || i, title: i.title, images: i.images, price: i.price, is_free: i.is_free, is_barter_only: i.is_barter_only })) || [],
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
        const { item_id, seller_id, offer_item_desc, message, desired_quantity, proposed_items, proposed_cash } = req.body
        if (!item_id || !seller_id) return res.status(400).json({ error: 'item_id and seller_id required' })
        const trade = await Trade.create({
            item_id,
            buyer_id: req.user._id,
            seller_id,
            desired_quantity: desired_quantity || 1,
            type: req.body.type || 'barter',
            offer_item_desc: offer_item_desc || 'Open trade offer',
            proposed_items: proposed_items || [],
            proposed_cash: proposed_cash || 0,
            action_required_from: seller_id,
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
        const { status, proposed_items, proposed_cash, offer_item_desc } = req.body
        if (!['accepted', 'declined', 'cancelled', 'completed', 'counter_offer'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' })
        }
        const trade = await Trade.findOne({ _id: req.params.id })
        if (!trade) return res.status(404).json({ error: 'Trade not found' })
        const isSeller = trade.seller_id.toString() === req.user._id.toString()
        const isBuyer = trade.buyer_id.toString() === req.user._id.toString()

        // Populate basic Item details to give a better notification title
        const item = await Item.findById(trade.item_id)
        const itemTitle = item ? item.title : 'an item'
        if (status === 'cancelled' && !isBuyer && !isSeller) return res.status(403).json({ error: 'Cannot cancel' })
        if (status === 'completed' && !isBuyer) return res.status(403).json({ error: 'Only buyer can mark as completed' })
        
        if (['accepted', 'declined', 'counter_offer'].includes(status)) {
            if (trade.action_required_from && trade.action_required_from.toString() !== req.user._id.toString()) {
                return res.status(403).json({ error: 'It is not your turn to respond to this trade.' })
            }
        }

        if (status === 'counter_offer') {
            trade.proposed_items = proposed_items || []
            trade.proposed_cash = proposed_cash || 0
            trade.offer_item_desc = offer_item_desc || 'Counter offer proposed'
            trade.action_required_from = isSeller ? trade.buyer_id : trade.seller_id
            trade.status = 'pending' // Keeps it firmly active
        } else {
            trade.status = status
            if (status === 'accepted' || status === 'declined' || status === 'cancelled') {
                trade.action_required_from = null
            }
        }
        
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
                        { $set: { status: 'declined', updatedAt: new Date(), action_required_from: null } }
                    )
                } else {
                    // Update new quantity
                    item.quantity = updatedQty
                    await item.save()
                }
            }

            // Deduct Counter-Offered Items
            if (trade.proposed_items && trade.proposed_items.length > 0) {
                for (const pId of trade.proposed_items) {
                    const pItem = await Item.findById(pId)
                    if (pItem) {
                        let pUpdatedQty = (pItem.quantity || 1) - 1 // Assume 1 unit taken for counter items
                        if (pUpdatedQty <= 0) {
                            const pImgs = pItem.imageUrls?.length > 0 ? pItem.imageUrls : pItem.images
                            if (pImgs && pImgs.length > 0) {
                                for (const imgUrl of pImgs) {
                                    try { await deleteImageFromCloudinary(imgUrl) } catch (e) {} 
                                }
                            }
                            await Item.deleteOne({ _id: pItem._id })
                            await Trade.updateMany(
                                { item_id: pItem._id, _id: { $ne: trade._id }, status: 'pending' },
                                { $set: { status: 'declined', updatedAt: new Date(), action_required_from: null } }
                            )
                        } else {
                            pItem.quantity = pUpdatedQty
                            await pItem.save()
                        }
                    }
                }
            }
        }

        // Send Push Notifications based on action
        try {
            if (status === 'accepted') {
                await sendPushNotification(trade.buyer_id, 'Trade Accepted! 🎉', `The deal for ${itemTitle} was accepted!`, '/trades')
            } else if (status === 'declined') {
                await sendPushNotification(trade.buyer_id, 'Trade Declined', `The offer for ${itemTitle} was respectfully declined.`, '/trades')
            } else if (status === 'cancelled') {
                await sendPushNotification(trade.seller_id, 'Trade Cancelled', `The offer for ${itemTitle} was withdrawn.`, '/trades')
            } else if (status === 'completed') {
                await sendPushNotification(trade.seller_id, 'Trade Completed! ✅', `The buyer has successfully received ${itemTitle}. Deal is done!`, '/trades')
            } else if (status === 'counter_offer') {
                const notifyTarget = isSeller ? trade.buyer_id : trade.seller_id
                await sendPushNotification(notifyTarget, 'New Counter-Offer! 🔄', `A counter-offer was proposed for ${itemTitle}.`, '/trades')
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
