import crypto from 'crypto'

/**
 * Generates a random secure token and its SHA-256 hash.
 * @returns {Object} Object containing the raw token and the hashed token.
 */
export const generateVerificationToken = () => {
    // Generate a secure 32-byte random token
    const rawToken = crypto.randomBytes(32).toString('hex')

    // Create a SHA-256 hash of the token
    const hashedToken = crypto.createHash('sha256').update(rawToken).digest('hex')

    return { rawToken, hashedToken }
}

/**
 * Hashes a given raw token using SHA-256.
 * @param {string} token - The raw token to hash.
 * @returns {string} The hashed token.
 */
export const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Generates a random 6-digit numeric OTP and its SHA-256 hash.
 * @returns {Object} Object containing the raw OTP and the hashed OTP.
 */
export const generateOTP = () => {
    const rawOTP = Math.floor(100000 + Math.random() * 900000).toString()
    const hashedOTP = crypto.createHash('sha256').update(rawOTP).digest('hex')
    return { rawOTP, hashedOTP }
}
