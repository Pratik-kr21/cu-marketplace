import { Router } from 'express'
import Item from '../models/Item.js'
import { authMiddleware } from '../middleware/auth.js'
import { deleteImageFromCloudinary } from '../utils/cloudinary.js'

const router = Router()

// Helper mapper for Frontend compatibility
function itemToResponse(item) {
    const obj = item.toObject ? item.toObject() : item

    // Abstract the exact database schema names back to what the React frontend expects
    const sellerObj = obj.userId || obj.seller_id
    const sellerIdStr = sellerObj?._id?.toString?.() || sellerObj?.toString?.() || sellerObj
    const imageUrlRef = obj.imageUrls || obj.images

    return {
        ...obj,
        id: obj._id.toString(),
        _id: undefined,
        seller_id: sellerIdStr,
        images: imageUrlRef,
        imageUrls: undefined,
        userId: undefined,
        quantity: obj.quantity,
        seller: sellerObj ? {
            id: sellerIdStr,
            full_name: sellerObj.full_name,
            avatar_url: sellerObj.avatar_url,
            department: sellerObj.department,
            hostel: sellerObj.hostel,
        } : undefined,
        created_at: obj.createdAt,
        createdAt: undefined,
    }
}

// List items (public)
router.get('/', async (req, res) => {
    try {
        const items = await Item.find({ is_available: true })
            .populate('userId', 'full_name avatar_url department hostel')
            .sort({ createdAt: -1 })
            .lean()

        return res.json(items.map(itemToResponse))
    } catch (err) {
        console.error('[Items] List error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Create item (auth)
router.post('/', authMiddleware, async (req, res) => {
    try {
        // Build object natively aligning to new schema
        const body = {
            ...req.body,
            userId: req.user._id, // Enforce User ID 
            imageUrls: req.body.images || req.body.imageUrls || [] // Ensure array mapping
        }

        const item = await Item.create(body)
        const populated = await Item.findById(item._id).populate('userId', 'full_name avatar_url department hostel').lean()

        return res.status(201).json(itemToResponse(populated))
    } catch (err) {
        console.error('[Items] Create error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Delete item (auth, own only)
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        // Allow querying by both userId and seller_id for backwards compatibility
        const item = await Item.findOne({
            _id: req.params.id,
            $or: [{ userId: req.user._id }, { seller_id: req.user._id }]
        })

        if (!item) return res.status(404).json({ error: 'Item not found or unauthorized' })

        // 🚨 CLOUDINARY CLEANUP: Extinguish orphaned images explicitly before erasing document
        const imgs = item.imageUrls?.length > 0 ? item.imageUrls : item.images
        if (imgs && imgs.length > 0) {
            for (const imgUrl of imgs) {
                await deleteImageFromCloudinary(imgUrl)
            }
        }

        // Delete Mongo Document
        await Item.deleteOne({ _id: req.params.id })

        return res.status(204).send()
    } catch (err) {
        console.error('[Items] Delete error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// Get my items (auth)
router.get('/my', authMiddleware, async (req, res) => {
    try {
        const items = await Item.find({
            $or: [{ userId: req.user._id }, { seller_id: req.user._id }],
            is_available: true
        })
            .sort({ createdAt: -1 })
            .select('title imageUrls images price is_barter_only is_free userId seller_id quantity')
            .lean()

        return res.json(items.map(itemToResponse))
    } catch (err) {
        console.error('[Items] My items error:', err)
        return res.status(500).json({ error: err.message })
    }
})

export default router
