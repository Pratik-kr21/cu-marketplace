import { Router } from 'express'
import rateLimit from 'express-rate-limit'
import { authMiddleware } from '../middleware/auth.js'
import {
    register,
    login,
    verifyEmail,
    resendVerification,
    getMe,
    deleteAccount
} from '../controllers/authController.js'

const router = Router()

// Rate Limiters
const registerLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: { error: 'Too many registration attempts from this IP, please try again after 15 minutes.' }
})

const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10,
    message: { error: 'Too many login attempts from this IP, please try again after 15 minutes.' }
})

const resendLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10, // Max 10 attempts to the resend endpoint per IP per hour broadly (Logic inside controller restricts to 3 per user)
    message: { error: 'Too many resend requests from this IP, please try again after an hour.' }
})

// Validation middleware could be added here ideally.

// Public Routes
router.post('/signup', registerLimiter, register)
router.post('/login', loginLimiter, login)

// The prompt asked for GET /api/verify-email
// Supporting both GET request (query param) and POST config (body) for compatibility with frontend if needed, but primarily GET
router.get('/verify-email', verifyEmail)
router.post('/verify-email', verifyEmail)

router.post('/resend-verification', resendLimiter, resendVerification)

// Protected Routes
router.get('/me', authMiddleware, getMe)
router.delete('/me', authMiddleware, deleteAccount)

export default router
