import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import Trade from '../models/Trade.js'
import { sendEmail } from '../utils/email.js'
import { generateVerificationToken, generateOTP, hashToken } from '../utils/token.js'

const JWT_SECRET = process.env.JWT_SECRET
if (!JWT_SECRET) throw new Error('FATAL: JWT_SECRET environment variable is not set.')

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
        saved_items: user.saved_items ? user.saved_items.map(id => id.toString()) : [],
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

        const { rawOTP, hashedOTP } = generateOTP()

        const user = new User({
            email: email.toLowerCase(),
            password,
            full_name: full_name || '',
            uid: uid || '',
            department: department || '',
            hostel: hostel || '',
            isVerified: false,
            emailVerificationToken: hashedOTP,
            emailVerificationExpires: Date.now() + 10 * 60 * 1000, // 10 minutes
            verificationRequestCount: 1,
            lastVerificationRequest: Date.now()
        })
        await user.save()

        await sendEmail({
            to: user.email,
            subject: 'Your CU Market Verification Code 🎓',
            text: `Welcome to CU Market!\n\nYour verification code is: ${rawOTP}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\nCU Market Team`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1f2937;border-radius:16px;overflow:hidden;border:1px solid #374151;">
        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #374151;">
            <div>
              <span style="background:#EF4444;color:white;font-weight:800;font-size:20px;padding:7px 16px;border-radius:10px;letter-spacing:-0.5px;">CU</span>
              <span style="color:#f9fafb;font-weight:700;font-size:20px;margin-left:10px;vertical-align:middle;">Marketplace</span>
            </div>
            <p style="color:#6b7280;font-size:12px;margin:10px 0 0;letter-spacing:0.5px;">EXCLUSIVELY FOR CHANDIGARH UNIVERSITY</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <h1 style="color:#f9fafb;font-size:22px;font-weight:700;margin:0 0 10px;">Verify your email address</h1>
            <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 28px;">Enter the code below to activate your <strong style="color:#e5e7eb;">@cuchd.in</strong> account. This code is valid for <strong style="color:#e5e7eb;">10 minutes</strong>.</p>
            <!-- OTP Box -->
            <div style="background:#111827;border:1px solid #374151;border-radius:12px;padding:30px 20px;text-align:center;margin-bottom:28px;">
              <p style="color:#6b7280;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Your Verification Code</p>
              <span style="color:#EF4444;font-size:42px;font-weight:800;letter-spacing:14px;font-family:'Courier New',Courier,monospace;display:block;">${rawOTP}</span>
            </div>
            <div style="background:#374151;border-radius:8px;padding:14px 16px;">
              <p style="color:#9ca3af;font-size:13px;margin:0;line-height:1.5;">⚠️ Never share this code with anyone. CU Market will never ask for your verification code.</p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #374151;padding:20px 40px;text-align:center;">
            <p style="color:#6b7280;font-size:12px;margin:0;">Sent to <strong style="color:#9ca3af;">${user.email}</strong><br>If you didn't create an account, ignore this email.</p>
            <p style="color:#4b5563;font-size:11px;margin:10px 0 0;">&copy; ${new Date().getFullYear()} CU Market &middot; Chandigarh University</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
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
        const { email, otp } = req.body
        if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' })

        // Hash incoming OTP to strictly compare with stored hash
        const hashedIncomingOTP = hashToken(otp)

        const user = await User.findOne({
            email: email.toLowerCase(),
            emailVerificationToken: hashedIncomingOTP,
            emailVerificationExpires: { $gt: Date.now() } // Ensure token is not expired
        })

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired OTP.' })
        }

        // Set as verified and clear verification fields
        user.isVerified = true
        user.emailVerificationToken = null
        user.emailVerificationExpires = null
        await user.save()

        const authToken = signToken(user)
        const profile = profileToJSON(user)

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

        // Rate limit checks (Max 5 attempts per hour, 1 min cooldown)
        const MAX_ATTEMPTS = 5
        const COOLDOWN_MS = 1 * 60 * 1000 // 1 minute
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

        // Generate new OTP & expiry
        const { rawOTP, hashedOTP } = generateOTP()
        user.emailVerificationToken = hashedOTP
        user.emailVerificationExpires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
        user.verificationRequestCount += 1
        user.lastVerificationRequest = new Date()

        await user.save()

        await sendEmail({
            to: user.email,
            subject: 'Your new CU Market Verification Code 🎓',
            text: `Your new verification code is: ${rawOTP}\n\nThis code expires in 10 minutes. Do not share it with anyone.\n\nCU Market Team`,
            html: `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#111827;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#111827;padding:40px 16px;">
    <tr><td align="center">
      <table width="100%" style="max-width:520px;background:#1f2937;border-radius:16px;overflow:hidden;border:1px solid #374151;">
        <!-- Header -->
        <tr>
          <td style="padding:32px 40px 24px;text-align:center;border-bottom:1px solid #374151;">
            <div>
              <span style="background:#EF4444;color:white;font-weight:800;font-size:20px;padding:7px 16px;border-radius:10px;letter-spacing:-0.5px;">CU</span>
              <span style="color:#f9fafb;font-weight:700;font-size:20px;margin-left:10px;vertical-align:middle;">Marketplace</span>
            </div>
            <p style="color:#6b7280;font-size:12px;margin:10px 0 0;letter-spacing:0.5px;">EXCLUSIVELY FOR CHANDIGARH UNIVERSITY</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:36px 40px 28px;">
            <h1 style="color:#f9fafb;font-size:22px;font-weight:700;margin:0 0 10px;">Here's your new verification code</h1>
            <p style="color:#9ca3af;font-size:15px;line-height:1.7;margin:0 0 28px;">You requested a new code. Enter it below to activate your <strong style="color:#e5e7eb;">@cuchd.in</strong> account. This code is valid for <strong style="color:#e5e7eb;">10 minutes</strong>.</p>
            <!-- OTP Box -->
            <div style="background:#111827;border:1px solid #374151;border-radius:12px;padding:30px 20px;text-align:center;margin-bottom:28px;">
              <p style="color:#6b7280;font-size:11px;font-weight:600;letter-spacing:2px;text-transform:uppercase;margin:0 0 16px;">Your Verification Code</p>
              <span style="color:#EF4444;font-size:42px;font-weight:800;letter-spacing:14px;font-family:'Courier New',Courier,monospace;display:block;">${rawOTP}</span>
            </div>
            <div style="background:#374151;border-radius:8px;padding:14px 16px;">
              <p style="color:#9ca3af;font-size:13px;margin:0;line-height:1.5;">⚠️ Never share this code with anyone. CU Market will never ask for your verification code.</p>
            </div>
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="border-top:1px solid #374151;padding:20px 40px;text-align:center;">
            <p style="color:#6b7280;font-size:12px;margin:0;">Sent to <strong style="color:#9ca3af;">${user.email}</strong><br>If you didn't request this, ignore this email.</p>
            <p style="color:#4b5563;font-size:11px;margin:10px 0 0;">&copy; ${new Date().getFullYear()} CU Market &middot; Chandigarh University</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>
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
            subject: 'Password Reset Request - CU Market 🔐',
            text: `Need a new password?\n\nWe received a request to reset your password. Please copy and paste the following link into your browser to choose a new password:\n${resetLink}\n\nThis password reset link will expire in 1 hour.\n\nThank you,\nCU Market Team`,
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
            return res.status(403).json({ error: 'Please verify your email address first. Check your inbox for the OTP code.' })
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
