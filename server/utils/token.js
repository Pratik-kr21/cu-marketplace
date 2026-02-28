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
