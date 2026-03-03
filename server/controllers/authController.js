import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Trade from '../models/Trade.js'
import { sendEmail } from '../utils/email.js'
import { generateVerificationToken, hashToken } from '../utils/token.js'

const JWT_SECRET = process.env.JWT_SECRET || 'secret'

function signToken(user) {
    return jwt.sign(
        { userId: user._id.toString() },
        JWT_SECRET,
        { expiresIn: '7d' }
    )
}

function profileToJSON(user) {
    return {
        id: user._id.toString(),
        email: user.email,
        full_name: user.full_name,
        uid: user.uid,
        department: user.department,
        hostel: user.hostel,
        avatar_url: user.avatar_url,
    }
}

// @desc    Register new user
// @route   POST /api/auth/signup
// @access  Public
export const register = async (req, res) => {
    try {
        const { email, password, full_name, uid, department, hostel } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }

        let existing = await User.findOne({ email: email.toLowerCase() })
        if (existing) {
            if (!existing.isVerified && existing.emailVerificationExpires && existing.emailVerificationExpires < Date.now()) {
                await User.deleteOne({ _id: existing._id })
                existing = null
            } else {
                return res.status(400).json({ error: 'An account with this email already exists. Please sign in instead.' })
            }
        }

        const { rawToken, hashedToken } = generateVerificationToken()

        const user = new User({
            email: email.toLowerCase(),
            password,
            full_name: full_name || '',
            uid: uid || '',
            department: department || '',
            hostel: hostel || '',
            isVerified: false,
            emailVerificationToken: hashedToken,
            emailVerificationExpires: Date.now() + 60 * 60 * 1000, // 1 hour
            verificationRequestCount: 1,
            lastVerificationRequest: Date.now()
        })
        await user.save()

        // Send Verification Email via Nodemailer
        let frontendUrl = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL || 'http://localhost:5173'
        if (frontendUrl && !frontendUrl.startsWith('http')) {
            frontendUrl = `https://${frontendUrl}`
        }
        const verificationLink = `${frontendUrl}/verify-email?token=${rawToken}`

        await sendEmail({
            to: user.email,
            subject: 'Verify your CU Marketplace Account 🎓',
            text: `Welcome to CU Marketplace!\n\nYou're almost there! We just need to verify your @cuchd.in email address to activate your account.\n\nPlease copy and paste this link into your browser to verify your email:\n${verificationLink}\n\nThis verification link will expire in 1 hour.\n\nThank you,\nCU Marketplace Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #111827; text-align: center;">Welcome to CU Marketplace!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                        You're almost there! We just need to verify your <strong>@cuchd.in</strong> email address to activate your account.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                        This verification link will expire in <strong>1 hour</strong>.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; word-break: break-all;">
                        If the button doesn't work, copy and paste this link into your browser:<br/>
                        <a href="${verificationLink}" style="color: #0b5cff;">${verificationLink}</a>
                    </p>
                </div>
            `
        })

        return res.status(201).json({
            message: 'Verification email sent. Please check your inbox.',
            requiresVerification: true
        })
    } catch (err) {
        console.error('[Auth] Signup error:', err)
        return res.status(500).json({ error: err.message || 'Signup failed' })
    }
}

// @desc    Verify email token
// @route   GET or POST /api/auth/verify-email
// @access  Public
export const verifyEmail = async (req, res) => {
    try {
        const token = req.query.token || req.body.token
        if (!token) return res.status(400).json({ error: 'Verification token is required' })

        // Hash incoming token to strictly compare with stored hash
        const hashedIncomingToken = hashToken(token)

        const user = await User.findOne({
            emailVerificationToken: hashedIncomingToken,
            emailVerificationExpires: { $gt: Date.now() } // Ensure token is not expired
        })

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired verification link.' })
        }

        // Set as verified and clear verification fields
        user.isVerified = true
        user.emailVerificationToken = null
        user.emailVerificationExpires = null
        await user.save()

        const authToken = signToken(user)
        const profile = profileToJSON(user)

        // Redirect if it was a GET request
        if (req.method === 'GET') {
            let frontendUrl = process.env.VITE_FRONTEND_URL || process.env.FRONTEND_URL || 'http://localhost:5173'
            if (frontendUrl && !frontendUrl.startsWith('http')) {
                frontendUrl = `https://${frontendUrl}`
            }
            return res.redirect(`${frontendUrl}/verify-email?token=${token}&success=true`)
        }

        return res.status(200).json({
            message: 'Email verified successfully',
            user: {
                id: profile.id,
                email: profile.email,
                user_metadata: {
                    full_name: profile.full_name,
                    uid: profile.uid,
                    department: profile.department,
                    hostel: profile.hostel
                }
            },
            profile,
            token: authToken
        })
    } catch (err) {
        console.error('[Auth] Verification error:', err)
        return res.status(500).json({ error: 'Failed to verify email' })
    }
}

// @desc    Resend verification email
// @route   POST /api/auth/resend-verification
// @access  Public
export const resendVerification = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' })
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            // Return success even if not found to prevent user enumeration
            return res.status(200).json({ message: 'If that account exists, a verification email has been sent.' })
        }

        if (user.isVerified) {
            return res.status(400).json({ error: 'Account is already verified. Please sign in.' })
        }

        // Rate limit checks (Max 3 attempts per hour, 5 min cooldown)
        const MAX_ATTEMPTS = 3
        const COOLDOWN_MS = 5 * 60 * 1000 // 5 minutes
        const ONE_HOUR_MS = 60 * 60 * 1000 // 1 hour

        const now = Date.now()

        // Reset count if it's been more than an hour since the last request
        if (user.lastVerificationRequest && (now - user.lastVerificationRequest.getTime() > ONE_HOUR_MS)) {
            user.verificationRequestCount = 0
        }

        // Check if under cooldown
        if (user.lastVerificationRequest && (now - user.lastVerificationRequest.getTime() < COOLDOWN_MS)) {
            const waitMinutes = Math.ceil((COOLDOWN_MS - (now - user.lastVerificationRequest.getTime())) / 60000)
            return res.status(429).json({ error: `Please wait ${waitMinutes} minutes before requesting another email.` })
        }

        // Check if exceeded max attempts
        if (user.verificationRequestCount >= MAX_ATTEMPTS) {
            return res.status(429).json({ error: 'You have exceeded the maximum resend attempts for this hour. Try again later.' })
        }

        // Generate new token & expiry
        const { rawToken, hashedToken } = generateVerificationToken()
        user.emailVerificationToken = hashedToken
        user.emailVerificationExpires = new Date(Date.now() + ONE_HOUR_MS) // 1 Hour
        user.verificationRequestCount += 1
        user.lastVerificationRequest = new Date()

        await user.save()

        // Send Verification Email via Nodemailer
        let frontendUrl = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL || 'http://localhost:5173'
        if (frontendUrl && !frontendUrl.startsWith('http')) {
            frontendUrl = `https://${frontendUrl}`
        }
        const verificationLink = `${frontendUrl}/verify-email?token=${rawToken}`

        await sendEmail({
            to: user.email,
            subject: 'Verify your CU Marketplace Account 🎓',
            text: `Welcome to CU Marketplace!\n\nYou're almost there! We just need to verify your @cuchd.in email address to activate your account.\n\nPlease copy and paste this link into your browser to verify your email:\n${verificationLink}\n\nThis verification link will expire in 1 hour.\n\nThank you,\nCU Marketplace Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #111827; text-align: center;">Welcome to CU Marketplace!</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                        You're almost there! We just need to verify your <strong>@cuchd.in</strong> email address to activate your account.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${verificationLink}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Verify Email Address
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                        This verification link will expire in <strong>1 hour</strong>.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; word-break: break-all;">
                        If the button doesn't work, copy and paste this link into your browser:<br/>
                        <a href="${verificationLink}" style="color: #0b5cff;">${verificationLink}</a>
                    </p>
                </div>
            `
        })

        return res.status(200).json({ message: 'A new verification email has been sent.' })
    } catch (err) {
        console.error('[Auth] Resend error:', err)
        return res.status(500).json({ error: 'Failed to resend verification email' })
    }
}

// @desc    Forgot Password Request
// @route   POST /api/auth/forgot-password
// @access  Public
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body
        if (!email) {
            return res.status(400).json({ error: 'Email is required.' })
        }

        const user = await User.findOne({ email: email.toLowerCase() })
        if (!user) {
            // Return success anyway to avoid user enumeration
            return res.status(200).json({ message: 'If an account exists, a reset link has been sent.' })
        }

        const { rawToken, hashedToken } = generateVerificationToken()
        user.resetPasswordToken = hashedToken
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000) // 1 Hour

        await user.save()

        let frontendUrl = process.env.FRONTEND_URL || process.env.VITE_FRONTEND_URL || 'http://localhost:5173'
        if (frontendUrl && !frontendUrl.startsWith('http')) {
            frontendUrl = `https://${frontendUrl}`
        }
        const resetLink = `${frontendUrl}/reset-password?token=${rawToken}`

        await sendEmail({
            to: user.email,
            subject: 'Password Reset Request - CU Marketplace 🔐',
            text: `Need a new password?\n\nWe received a request to reset your password. Please copy and paste the following link into your browser to choose a new password:\n${resetLink}\n\nThis password reset link will expire in 1 hour.\n\nThank you,\nCU Marketplace Team`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px;">
                    <h2 style="color: #111827; text-align: center;">Need a new password?</h2>
                    <p style="color: #4b5563; font-size: 16px; line-height: 1.5;">
                        We received a request to reset your password. Click the button below to choose a new one.
                    </p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background-color: #EF4444; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
                            Reset Password
                        </a>
                    </div>
                    <p style="color: #6b7280; font-size: 14px; margin-top: 20px;">
                        This password reset link will expire in <strong>1 hour</strong>.
                    </p>
                    <p style="color: #9ca3af; font-size: 12px; margin-top: 20px; word-break: break-all;">
                        If the button doesn't work, copy and paste this link into your browser:<br/>
                        <a href="${resetLink}" style="color: #0b5cff;">${resetLink}</a>
                    </p>
                </div>
            `
        })

        return res.status(200).json({ message: 'A reset link has been sent to your email.' })
    } catch (err) {
        console.error('[Auth] Forgot password error:', err)
        return res.status(500).json({ error: 'Failed to process request.' })
    }
}

// @desc    Reset Password
// @route   POST /api/auth/reset-password
// @access  Public
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body
        if (!token || !password) {
            return res.status(400).json({ error: 'Token and new password are required.' })
        }
        if (password.length < 6) {
            return res.status(400).json({ error: 'Password must be at least 6 characters.' })
        }

        const hashedIncomingToken = hashToken(token)

        const user = await User.findOne({
            resetPasswordToken: hashedIncomingToken,
            resetPasswordExpires: { $gt: Date.now() }
        })

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset link.' })
        }

        user.password = password
        user.resetPasswordToken = null
        user.resetPasswordExpires = null
        await user.save()

        return res.status(200).json({ message: 'Password has been reset successfully. You can now login.' })
    } catch (err) {
        console.error('[Auth] Reset password error:', err)
        return res.status(500).json({ error: 'Failed to reset password.' })
    }
}

// @desc    Authenticate User
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res) => {
    try {
        const { email, password } = req.body
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' })
        }
        let user = await User.findOne({ email: email.toLowerCase() })

        if (user && !user.isVerified && user.emailVerificationExpires && user.emailVerificationExpires < Date.now()) {
            await User.deleteOne({ _id: user._id })
            user = null
        }

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ error: 'Incorrect email or password. Please try again.' })
        }

        if (!user.isVerified) {
            return res.status(403).json({ error: 'Please verify your email address first from the link sent to your inbox.' })
        }

        const token = signToken(user)
        const profile = profileToJSON(user)
        return res.json({
            user: {
                id: profile.id,
                email: profile.email,
                user_metadata: {
                    full_name: profile.full_name,
                    uid: profile.uid,
                    department: profile.department,
                    hostel: profile.hostel
                }
            },
            profile,
            token
        })
    } catch (err) {
        console.error('[Auth] Login error:', err)
        return res.status(500).json({ error: err.message || 'Login failed' })
    }
}

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res) => {
    try {
        const userId = req.user._id
        const [soldCount, tradeCount] = await Promise.all([
            // sold_count: completed trades where this user is the seller
            Trade.countDocuments({ seller_id: userId, status: 'completed' }),
            // trade_count: all completed trades where user was buyer or seller
            Trade.countDocuments({ $or: [{ seller_id: userId }, { buyer_id: userId }], status: 'completed' }),
        ])

        const profile = profileToJSON(req.user)
        return res.json({
            user: {
                id: profile.id,
                email: profile.email,
                user_metadata: {
                    full_name: profile.full_name,
                    uid: profile.uid,
                    department: profile.department,
                    hostel: profile.hostel
                }
            },
            profile: {
                ...profile,
                trade_count: tradeCount,
                sold_count: soldCount,
                rating: req.user.rating ?? null,
            },
        })
    } catch (err) {
        console.error('[Auth] getMe error:', err)
        return res.status(500).json({ error: 'Failed to get profile' })
    }
}

// @desc    Delete Current User Account
// @route   DELETE /api/auth/me
// @access  Private
export const deleteAccount = async (req, res) => {
    try {
        await User.deleteOne({ _id: req.user._id })
        // Optional: Can cascade delete user items here
        return res.status(200).json({ message: 'Account deleted successfully' })
    } catch (err) {
        console.error('[Auth] Account deletion error:', err)
        return res.status(500).json({ error: 'Failed to delete account' })
    }
}
