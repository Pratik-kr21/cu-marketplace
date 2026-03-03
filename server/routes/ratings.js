import { Router } from 'express'
import Rating from '../models/Rating.js'
import Trade from '../models/Trade.js'
import User from '../models/User.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// POST /api/ratings — buyer rates seller after a completed trade
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { trade_id, score, comment } = req.body
        if (!trade_id || !score) {
            return res.status(400).json({ error: 'trade_id and score are required.' })
        }
        if (score < 1 || score > 5) {
            return res.status(400).json({ error: 'Score must be between 1 and 5.' })
        }

        // Verify trade exists, is completed, and current user was the buyer
        const trade = await Trade.findById(trade_id)
        if (!trade) return res.status(404).json({ error: 'Trade not found.' })
        if (trade.status !== 'completed') return res.status(400).json({ error: 'Can only rate completed trades.' })
        if (trade.buyer_id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Only the buyer can rate the seller.' })
        }

        // Prevent double-rating the same trade
        const existing = await Rating.findOne({ trade_id })
        if (existing) return res.status(409).json({ error: 'You have already rated this trade.' })

        const rating = await Rating.create({
            trade_id,
            reviewer_id: req.user._id,
            seller_id: trade.seller_id,
            score,
            comment: comment || '',
        })

        // Recompute and update seller's average rating on the User document
        const allRatings = await Rating.find({ seller_id: trade.seller_id })
        const avg = allRatings.reduce((sum, r) => sum + r.score, 0) / allRatings.length
        await User.findByIdAndUpdate(trade.seller_id, { rating: parseFloat(avg.toFixed(2)) })

        return res.status(201).json({ message: 'Rating submitted successfully.', rating })
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ error: 'You have already rated this trade.' })
        }
        console.error('[Ratings] Create error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// GET /api/ratings/trade/:tradeId — check if current user already rated a trade
router.get('/trade/:tradeId', authMiddleware, async (req, res) => {
    try {
        const rating = await Rating.findOne({ trade_id: req.params.tradeId, reviewer_id: req.user._id })
        return res.json({ rated: !!rating, rating: rating || null })
    } catch (err) {
        console.error('[Ratings] Check error:', err)
        return res.status(500).json({ error: err.message })
    }
})

// GET /api/ratings/seller/:sellerId — get all ratings for a seller
router.get('/seller/:sellerId', async (req, res) => {
    try {
        const ratings = await Rating.find({ seller_id: req.params.sellerId })
            .populate('reviewer_id', 'full_name uid avatar_url')
            .sort({ createdAt: -1 })
            .lean()
        return res.json(ratings)
    } catch (err) {
        console.error('[Ratings] Seller ratings error:', err)
        return res.status(500).json({ error: err.message })
    }
})

export default router
