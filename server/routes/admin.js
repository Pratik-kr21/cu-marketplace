import { Router } from 'express'
import User from '../models/User.js'
import Item from '../models/Item.js'
import Trade from '../models/Trade.js'
import { authMiddleware } from '../middleware/auth.js'

const router = Router()

// Admin middleware
const adminMiddleware = (req, res, next) => {
    if (req.user.email !== '24bcs10403@cuchd.in') {
        return res.status(403).json({ error: 'Access denied. Admins only.' })
    }
    next()
}

// Get comprehensive admin stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const totalUsers = await User.countDocuments()
        const totalItems = await Item.countDocuments()
        const totalTrades = await Trade.countDocuments()

        const pendingTrades = await Trade.countDocuments({ status: 'pending' })
        const completedTrades = await Trade.countDocuments({ status: 'completed' })
        const cashTrades = await Trade.countDocuments({ type: 'cash' })
        const activeItems = await Item.countDocuments({ is_available: true })

        res.json({
            users: totalUsers,
            items: totalItems,
            activeItems,
            trades: totalTrades,
            pendingTrades,
            completedTrades,
            cashTrades
        })
    } catch (error) {
        console.error('Admin stats error:', error)
        res.status(500).json({ error: error.message })
    }
})

// Get all users
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const users = await User.find().select('-password').sort({ createdAt: -1 })
        res.json(users)
    } catch (error) {
        console.error('Admin users error:', error)
        res.status(500).json({ error: error.message })
    }
})

// Delete a user
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        if (req.params.id === req.user._id.toString()) {
            return res.status(400).json({ error: 'Cannot delete yourself' })
        }
        await User.findByIdAndDelete(req.params.id)
        await Item.deleteMany({ userId: req.params.id })
        res.json({ success: true, message: 'User deleted' })
    } catch (error) {
        console.error('Admin delete user error:', error)
        res.status(500).json({ error: error.message })
    }
})

// Get all items
router.get('/items', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const items = await Item.find().populate('userId', 'full_name email uid').sort({ createdAt: -1 })
        res.json(items)
    } catch (error) {
        console.error('Admin items error:', error)
        res.status(500).json({ error: error.message })
    }
})

// Delete an item
router.delete('/items/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await Item.findByIdAndDelete(req.params.id)
        res.json({ success: true, message: 'Item deleted' })
    } catch (error) {
        console.error('Admin delete item error:', error)
        res.status(500).json({ error: error.message })
    }
})

export default router
