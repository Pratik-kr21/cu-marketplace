import jwt from 'jsonwebtoken'
import User from '../models/User.js'

export async function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
        return res.status(401).json({ error: 'Unauthorized' })
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret')
        const user = await User.findById(decoded.userId).select('-password')
        if (!user) return res.status(401).json({ error: 'User not found' })
        req.user = user
        next()
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' })
    }
}
